import OpenAI from 'openai';
import { VitalSigns, Patient, Appointment } from "../shared/schema";

// NaviMED AI - Intelligent Health Analysis System
// Powered by OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export interface HealthRecommendation {
  id: string;
  type: "lifestyle" | "medical" | "preventive" | "risk_alert";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  recommendations: string[];
  reasoning: string;
  followUpRequired: boolean;
  createdAt: Date;
}

export interface HealthAnalysisResult {
  overallHealthScore: number; // 0-100
  riskFactors: string[];
  recommendations: HealthRecommendation[];
  trends: {
    improving: string[];
    concerning: string[];
    stable: string[];
  };
  nextAppointmentSuggestion?: string;
}

export class NaviMEDAI {
  async analyzePatientHealth(
    patient: Patient,
    vitalSigns: VitalSigns[],
    recentAppointments: Appointment[],
    labResults: any[] = []
  ): Promise<HealthAnalysisResult> {
    try {
      console.log("🤖 NaviMED AI: Generating comprehensive health analysis...");
      
      if (!process.env.OPENAI_API_KEY) {
        console.warn("⚠️ NaviMED AI: OpenAI API key not configured, using intelligent fallback");
        return this.generateIntelligentFallback(patient, vitalSigns, recentAppointments, labResults);
      }

      const analysisPrompt = this.buildAnalysisPrompt(patient, vitalSigns, recentAppointments, labResults);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are NaviMED AI, an intelligent healthcare assistant specializing in preventive medicine and comprehensive health analytics.

Your mission is to provide evidence-based, personalized health recommendations that empower patients and healthcare providers.

Focus on:
- Evidence-based preventive care and early intervention
- Personalized health optimization based on individual risk factors
- Age-appropriate screenings and lifestyle modifications
- Risk factor identification and mitigation strategies
- Actionable recommendations patients can implement

Important: Provide general health guidance and risk assessment, but avoid making specific medical diagnoses. Always recommend consulting healthcare providers for concerns.

Respond with valid JSON in this exact format:
{
  "overallHealthScore": <number 0-100>,
  "riskFactors": ["<string>", ...],
  "recommendations": [
    {
      "id": "<unique-id>",
      "type": "<lifestyle|medical|preventive|risk_alert>",
      "priority": "<low|medium|high|urgent>",
      "title": "<string>",
      "description": "<string>",
      "recommendations": ["<actionable-step>", ...],
      "reasoning": "<evidence-based-explanation>",
      "followUpRequired": <boolean>
    }
  ],
  "trends": {
    "improving": ["<positive-trend>", ...],
    "concerning": ["<area-of-concern>", ...],
    "stable": ["<maintained-metric>", ...]
  },
  "nextAppointmentSuggestion": "<timeframe-and-reason>"
}`
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 3000
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || "{}");
      
      // Process recommendations to add proper timestamps and IDs
      if (analysisResult.recommendations) {
        analysisResult.recommendations = analysisResult.recommendations.map((rec: any, index: number) => ({
          ...rec,
          id: rec.id || `navimed-ai-rec-${Date.now()}-${index}`,
          createdAt: new Date()
        }));
      }
      
      console.log(`✅ NaviMED AI: Analysis complete - Health Score: ${analysisResult.overallHealthScore}/100`);
      
      return analysisResult;
    } catch (error) {
      console.error("❌ NaviMED AI Error:", error);
      
      // Fallback to intelligent rule-based analysis if OpenAI is unavailable
      console.log("🔄 NaviMED AI: Switching to intelligent fallback system...");
      return this.generateIntelligentFallback(patient, vitalSigns, recentAppointments, labResults);
    }
  }

  private buildAnalysisPrompt(
    patient: Patient,
    vitalSigns: VitalSigns[],
    recentAppointments: Appointment[],
    labResults: any[] = []
  ): string {
    const age = this.calculateAge(patient.dateOfBirth);
    const latestVitals = vitalSigns[0]; // Most recent vital signs
    
    return `
Analyze this patient's comprehensive health data and provide personalized medical recommendations:

PATIENT PROFILE:
- Age: ${age} years
- Gender: ${patient.gender}
- Medical History: ${patient.medicalHistory && Array.isArray(patient.medicalHistory) ? patient.medicalHistory.join(', ') : (patient.medicalHistory || "No significant history reported")}
- Current Medications: ${patient.medications && Array.isArray(patient.medications) ? patient.medications.join(', ') : (patient.medications || "No current medications")}
- Known Allergies: ${patient.allergies && Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || "No known allergies")}

CURRENT VITAL SIGNS:
${latestVitals ? `
- Blood Pressure: ${latestVitals.systolicBp ?? 'N/A'}/${latestVitals.diastolicBp ?? 'N/A'} mmHg
- Heart Rate: ${latestVitals.heartRate ?? 'N/A'} bpm
- Temperature: ${latestVitals.temperature ?? 'N/A'}°F
- Oxygen Saturation: ${latestVitals.oxygenSaturation ?? 'N/A'}%
- Respiratory Rate: ${latestVitals.respiratoryRate ?? 'N/A'} breaths/min
- Weight: ${latestVitals.weight ?? 'N/A'} kg
- Height: ${latestVitals.height ?? 'N/A'} cm
- BMI: ${this.calculateBMI(parseFloat(latestVitals.weight || '0'), parseFloat(latestVitals.height || '0'))}
` : "No recent vital signs available"}

VITAL SIGNS TRENDS:
${vitalSigns.length > 1 ? this.calculateVitalsTrends(vitalSigns) : "Insufficient data for trend analysis"}

RECENT APPOINTMENTS:
${recentAppointments.length > 0 ? 
  recentAppointments.map(apt => 
    `- ${new Date(apt.appointmentDate).toLocaleDateString()}: ${apt.type} - ${apt.chiefComplaint || 'Routine visit'} (${apt.status})`
  ).join('\n') : "No recent appointments on record"}

LABORATORY RESULTS:
${labResults.length > 0 ? 
  labResults.map(lab => 
    `- ${lab.testName}: ${lab.result} ${lab.unit} (Reference: ${lab.referenceRange}) - ${lab.status}`
  ).join('\n') : "No recent laboratory results available"}

ANALYSIS REQUIREMENTS:
1. Calculate overall health score (0-100) based on all available data
2. Identify specific risk factors requiring attention
3. Provide 4-8 comprehensive recommendations categorized by type
4. Analyze health trends (improving, concerning, stable areas)
5. Suggest appropriate follow-up timeline with reasoning

Focus on evidence-based preventive care, personalized risk reduction, and optimization of current health status.
Provide specific, actionable recommendations that the patient can implement immediately.
`;
  }

  private calculateBMI(weight: number, heightCm: number): string {
    if (!weight || !heightCm) return "N/A";
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    return bmi.toFixed(1);
  }

  private calculateVitalsTrends(vitalSigns: VitalSigns[]): string {
    if (vitalSigns.length < 2) return "Insufficient data for trends";
    
    const latest = vitalSigns[0];
    const previous = vitalSigns[1];
    
    const trends = [];
    
    if (latest.systolicBp != null && previous.systolicBp != null && latest.systolicBp !== previous.systolicBp) {
      const change = latest.systolicBp - previous.systolicBp;
      trends.push(`Systolic BP ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} mmHg`);
    }
    
    if (latest.heartRate != null && previous.heartRate != null && latest.heartRate !== previous.heartRate) {
      const change = latest.heartRate - previous.heartRate;
      trends.push(`Heart rate ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} bpm`);
    }
    
    if (latest.weight != null && previous.weight != null && latest.weight !== previous.weight) {
      const latestWeight = parseFloat(latest.weight);
      const previousWeight = parseFloat(previous.weight);
      const change = latestWeight - previousWeight;
      trends.push(`Weight ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)} kg`);
    }
    
    return trends.length > 0 ? trends.join(', ') : "Vital signs stable";
  }

  private calculateAge(dateOfBirth: string | Date): number {
    const today = new Date();
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private async generateIntelligentFallback(
    patient: Patient,
    vitalSigns: VitalSigns[],
    recentAppointments: Appointment[],
    labResults: any[] = []
  ): Promise<HealthAnalysisResult> {
    
    // Calculate age for age-specific recommendations
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    
    let healthScore = 75; // Base score
    const riskFactors: string[] = [];
    const recommendations: HealthRecommendation[] = [];
    const trends = { improving: [] as string[], concerning: [] as string[], stable: [] as string[] };
    
    // Analyze vital signs if available
    if (vitalSigns.length > 0) {
      const latestVitals = vitalSigns[0];
      
      // Blood pressure analysis
      if ((latestVitals.systolicBp && latestVitals.systolicBp > 140) || (latestVitals.diastolicBp && latestVitals.diastolicBp > 90)) {
        healthScore -= 15;
        riskFactors.push("Elevated blood pressure readings indicating hypertension risk");
        recommendations.push({
          id: `argilette-lab-bp-${Date.now()}`,
          type: "medical",
          priority: "high",
          title: "Blood Pressure Management Required",
          description: "Your blood pressure readings indicate hypertension that requires immediate attention",
          recommendations: [
            "Reduce sodium intake to less than 2,300mg daily",
            "Engage in 150 minutes of moderate aerobic exercise weekly",
            "Monitor blood pressure daily at home",
            "Schedule consultation with cardiologist within 2 weeks",
            "Consider DASH diet implementation"
          ],
          reasoning: "Elevated blood pressure significantly increases risk of cardiovascular disease, stroke, and kidney damage",
          followUpRequired: true,
          createdAt: new Date()
        });
        trends.concerning.push("Blood pressure trending above normal range");
      } else if (latestVitals.systolicBp && latestVitals.systolicBp >= 120 && latestVitals.systolicBp < 130) {
        trends.stable.push("Blood pressure in elevated but manageable range");
      } else {
        trends.improving.push("Blood pressure within optimal range");
        healthScore += 5;
      }

      // Heart rate analysis
      if (latestVitals.heartRate && latestVitals.heartRate > 100) {
        healthScore -= 8;
        riskFactors.push("Elevated resting heart rate suggesting cardiovascular stress");
        trends.concerning.push("Resting heart rate above normal range");
      } else if (latestVitals.heartRate && latestVitals.heartRate >= 60 && latestVitals.heartRate <= 80) {
        trends.stable.push("Heart rate within excellent range");
        healthScore += 3;
      }
    }

    // Universal wellness optimization
    recommendations.push({
      id: `argilette-lab-wellness-${Date.now()}`,
      type: "lifestyle",
      priority: "low",
      title: "Wellness Optimization Program",
      description: "Foundation practices for maintaining and improving overall health",
      recommendations: [
        "Maintain consistent sleep schedule with 7-9 hours nightly",
        "Practice daily stress management (meditation, deep breathing, yoga)",
        "Stay adequately hydrated with 8-10 glasses of water daily",
        "Maintain strong social connections and community involvement",
        "Schedule regular preventive healthcare visits"
      ],
      reasoning: "Consistent healthy lifestyle habits form the foundation for long-term wellness and disease prevention",
      followUpRequired: false,
      createdAt: new Date()
    });

    // Ensure reasonable health score bounds
    healthScore = Math.max(healthScore, 40);
    healthScore = Math.min(healthScore, 95);
    
    // Determine follow-up timing
    let nextAppointmentSuggestion = "Schedule routine preventive care visit in 6-12 months";
    if (riskFactors.length > 3) {
      nextAppointmentSuggestion = "Schedule urgent follow-up within 1-2 weeks to address multiple risk factors";
    } else if (riskFactors.length > 1) {
      nextAppointmentSuggestion = "Schedule follow-up in 1-3 months to monitor and reassess identified risk factors";
    }

    return {
      overallHealthScore: Math.round(healthScore),
      riskFactors,
      recommendations,
      trends,
      nextAppointmentSuggestion
    };
  }
}

// Export singleton instance - NaviMED AI
export const navimedAI = new NaviMEDAI();
