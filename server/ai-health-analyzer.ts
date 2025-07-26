import OpenAI from "openai";
import { VitalSigns, Patient, Appointment } from "../shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export class AIHealthAnalyzer {
  async analyzePatientHealth(
    patient: Patient,
    vitalSigns: VitalSigns[],
    recentAppointments: Appointment[]
  ): Promise<HealthAnalysisResult> {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(patient, vitalSigns, recentAppointments);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an experienced healthcare AI assistant specializing in preventive medicine and health analytics. 
            Analyze patient data and provide comprehensive health recommendations in JSON format.
            Focus on evidence-based medicine, preventive care, and personalized health insights.
            Be thorough but avoid providing specific medical diagnoses - focus on general health optimization and risk factors.`
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || "{}");
      return this.processAnalysisResult(analysisResult);
    } catch (error) {
      console.error("AI Health Analysis Error:", error);
      throw new Error("Failed to generate health recommendations");
    }
  }

  private buildAnalysisPrompt(
    patient: Patient,
    vitalSigns: VitalSigns[],
    recentAppointments: Appointment[]
  ): string {
    const latestVitals = vitalSigns[0]; // Most recent vital signs
    const vitalsTrends = this.calculateVitalsTrends(vitalSigns);
    
    return `
    Analyze this patient's health data and provide personalized recommendations:

    PATIENT PROFILE:
    - Age: ${this.calculateAge(patient.dateOfBirth)}
    - Gender: ${patient.gender}
    - Medical History: ${patient.medicalHistory || "None reported"}
    - Current Medications: ${patient.currentMedications || "None reported"}
    - Allergies: ${patient.allergies || "None reported"}
    - Emergency Contact: Available
    - Insurance: ${patient.insuranceProvider || "Not specified"}

    LATEST VITAL SIGNS:
    ${latestVitals ? `
    - Blood Pressure: ${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic} mmHg
    - Heart Rate: ${latestVitals.heartRate} bpm
    - Temperature: ${latestVitals.temperature}°F
    - Oxygen Saturation: ${latestVitals.oxygenSaturation}%
    - Respiratory Rate: ${latestVitals.respiratoryRate} breaths/min
    - Weight: ${latestVitals.weight} kg
    - Height: ${latestVitals.height} cm
    - BMI: ${this.calculateBMI(latestVitals.weight, latestVitals.height)}
    - Recorded: ${latestVitals.recordedAt}
    ` : "No recent vital signs available"}

    VITAL SIGNS TRENDS (Last ${vitalSigns.length} readings):
    ${vitalsTrends}

    RECENT APPOINTMENTS:
    ${recentAppointments.map(apt => `
    - Date: ${apt.appointmentDate}
    - Type: ${apt.type}
    - Chief Complaint: ${apt.chiefComplaint || "Not specified"}
    - Status: ${apt.status}
    `).join("")}

    Please provide a comprehensive health analysis in this exact JSON format:
    {
      "overallHealthScore": [0-100 score],
      "riskFactors": ["array of identified risk factors"],
      "recommendations": [
        {
          "id": "unique-id",
          "type": "lifestyle|medical|preventive|risk_alert",
          "priority": "low|medium|high|urgent",
          "title": "Brief recommendation title",
          "description": "Detailed explanation",
          "recommendations": ["specific actionable steps"],
          "reasoning": "Medical reasoning behind recommendation",
          "followUpRequired": true|false
        }
      ],
      "trends": {
        "improving": ["aspects showing improvement"],
        "concerning": ["areas needing attention"],
        "stable": ["stable health indicators"]
      },
      "nextAppointmentSuggestion": "Suggested timeframe for next visit"
    }

    Focus on:
    1. Preventive care recommendations
    2. Lifestyle modifications based on current health status
    3. Risk factor identification and mitigation
    4. Health optimization strategies
    5. Early warning signs to monitor

    Avoid:
    - Specific medical diagnoses
    - Prescription medication recommendations
    - Emergency medical advice
    `;
  }

  private calculateAge(dateOfBirth: Date | string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private calculateBMI(weight: string | null, height: string | null): string {
    if (!weight || !height) return "Not available";
    
    const weightKg = parseFloat(weight);
    const heightM = parseFloat(height) / 100;
    const bmi = weightKg / (heightM * heightM);
    
    return Math.round(bmi * 10) / 10 + " kg/m²";
  }

  private calculateVitalsTrends(vitalSigns: VitalSigns[]): string {
    if (vitalSigns.length < 2) return "Insufficient data for trend analysis";
    
    const trends = [];
    const latest = vitalSigns[0];
    const previous = vitalSigns[1];
    
    if (latest.bloodPressureSystolic && previous.bloodPressureSystolic) {
      const bpChange = latest.bloodPressureSystolic - previous.bloodPressureSystolic;
      trends.push(`Blood Pressure: ${bpChange > 0 ? '+' : ''}${bpChange} mmHg systolic`);
    }
    
    if (latest.heartRate && previous.heartRate) {
      const hrChange = latest.heartRate - previous.heartRate;
      trends.push(`Heart Rate: ${hrChange > 0 ? '+' : ''}${hrChange} bpm`);
    }
    
    if (latest.weight && previous.weight) {
      const weightChange = parseFloat(latest.weight) - parseFloat(previous.weight);
      trends.push(`Weight: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`);
    }
    
    return trends.join(", ") || "No significant trends detected";
  }

  private processAnalysisResult(rawResult: any): HealthAnalysisResult {
    return {
      overallHealthScore: Math.max(0, Math.min(100, rawResult.overallHealthScore || 75)),
      riskFactors: rawResult.riskFactors || [],
      recommendations: (rawResult.recommendations || []).map((rec: any, index: number) => ({
        id: rec.id || `rec_${Date.now()}_${index}`,
        type: rec.type || "lifestyle",
        priority: rec.priority || "medium",
        title: rec.title || "Health Recommendation",
        description: rec.description || "",
        recommendations: rec.recommendations || [],
        reasoning: rec.reasoning || "",
        followUpRequired: rec.followUpRequired || false,
        createdAt: new Date()
      })),
      trends: {
        improving: rawResult.trends?.improving || [],
        concerning: rawResult.trends?.concerning || [],
        stable: rawResult.trends?.stable || []
      },
      nextAppointmentSuggestion: rawResult.nextAppointmentSuggestion
    };
  }

  async generateHealthInsights(patientId: string, tenantId: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Generate a brief, encouraging health insight based on patient data. Keep it positive and actionable."
          },
          {
            role: "user",
            content: `Generate a personalized health insight for patient ${patientId} in tenant ${tenantId}. Focus on general wellness and preventive care.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0].message.content || "Stay committed to your health journey!";
    } catch (error) {
      console.error("Health insight generation error:", error);
      return "Focus on maintaining healthy habits for optimal wellness.";
    }
  }
}

export const aiHealthAnalyzer = new AIHealthAnalyzer();