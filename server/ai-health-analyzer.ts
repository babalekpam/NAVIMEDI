import { VitalSigns, Patient, Appointment } from "../shared/schema";

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
    recentAppointments: Appointment[],
    labResults: any[] = []
  ): Promise<HealthAnalysisResult> {
    try {
      // Generate intelligent analysis based on actual patient data
      console.log("Generating intelligent demo analysis based on patient data...");
      const analysis = await this.generateIntelligentAnalysis(patient, vitalSigns, recentAppointments, labResults);
      return analysis;
      
      // Original OpenAI implementation (uncomment when API credits available)
      // const analysisPrompt = this.buildAnalysisPrompt(patient, vitalSigns, recentAppointments, labResults);
      // const response = await openai.chat.completions.create({
      //   model: "gpt-3.5-turbo",
      //   messages: [
      //     {
      //       role: "system",
      //       content: `You are an experienced healthcare AI assistant specializing in preventive medicine and health analytics. 
      //       Analyze patient data and provide comprehensive health recommendations in JSON format.
      //       Focus on evidence-based medicine, preventive care, and personalized health insights.
      //       Be thorough but avoid providing specific medical diagnoses - focus on general health optimization and risk factors.`
      //     },
      //     {
      //       role: "user",
      //       content: analysisPrompt
      //     }
      //   ],
      //   response_format: { type: "json_object" },
      //   temperature: 0.3,
      //   max_tokens: 2000
      // });
      // const analysisResult = JSON.parse(response.choices[0].message.content || "{}");
      // return this.processAnalysisResult(analysisResult);
    } catch (error) {
      console.error("AI Health Analysis Error:", error);
      throw new Error(`Failed to generate health recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateIntelligentAnalysis(
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
      const latestVitals = vitalSigns[0]; // Most recent
      
      // Blood pressure analysis
      if ((latestVitals.systolicBp && latestVitals.systolicBp > 140) || (latestVitals.diastolicBp && latestVitals.diastolicBp > 90)) {
        healthScore -= 15;
        riskFactors.push("Elevated blood pressure readings indicating hypertension risk");
        recommendations.push({
          id: `rec-bp-${Date.now()}`,
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
        recommendations.push({
          id: `rec-bp-prev-${Date.now()}`,
          type: "preventive",
          priority: "medium",
          title: "Blood Pressure Prevention",
          description: "Prevent progression to hypertension with lifestyle modifications",
          recommendations: [
            "Maintain healthy weight through balanced nutrition",
            "Limit alcohol consumption to recommended guidelines",
            "Practice stress reduction techniques",
            "Regular cardiovascular exercise"
          ],
          reasoning: "Early intervention prevents progression to clinical hypertension",
          followUpRequired: false,
          createdAt: new Date()
        });
      } else {
        trends.improving.push("Blood pressure within optimal range");
        healthScore += 5;
      }

      // Heart rate analysis
      if (latestVitals.heartRate && latestVitals.heartRate > 100) {
        healthScore -= 8;
        riskFactors.push("Elevated resting heart rate suggesting cardiovascular stress");
        trends.concerning.push("Resting heart rate above normal range");
        recommendations.push({
          id: `rec-hr-${Date.now()}`,
          type: "medical",
          priority: "medium",
          title: "Heart Rate Optimization",
          description: "Elevated resting heart rate may indicate cardiovascular inefficiency",
          recommendations: [
            "Improve cardiovascular fitness through regular aerobic exercise",
            "Reduce caffeine intake if excessive",
            "Ensure adequate sleep (7-9 hours nightly)",
            "Manage stress through relaxation techniques"
          ],
          reasoning: "Lower resting heart rate indicates better cardiovascular fitness and efficiency",
          followUpRequired: true,
          createdAt: new Date()
        });
      } else if (latestVitals.heartRate && latestVitals.heartRate >= 60 && latestVitals.heartRate <= 80) {
        trends.stable.push("Heart rate within excellent range");
        healthScore += 3;
      }

      // Temperature analysis
      if (latestVitals.temperature && parseFloat(latestVitals.temperature) > 100.4) {
        healthScore -= 10;
        recommendations.push({
          id: `rec-fever-${Date.now()}`,
          type: "medical",
          priority: "urgent",
          title: "Elevated Temperature Management",
          description: "Current temperature elevation requires immediate attention",
          recommendations: [
            "Monitor temperature every 2-4 hours",
            "Increase fluid intake significantly",
            "Rest and avoid strenuous activities",
            "Seek immediate medical attention if fever persists >24 hours"
          ],
          reasoning: "Elevated temperature may indicate infection or inflammatory process requiring medical evaluation",
          followUpRequired: true,
          createdAt: new Date()
        });
        trends.concerning.push("Temperature elevation detected");
      }

      // Oxygen saturation
      if (latestVitals.oxygenSaturation && latestVitals.oxygenSaturation < 95) {
        healthScore -= 20;
        riskFactors.push("Low oxygen saturation indicating respiratory compromise");
        recommendations.push({
          id: `rec-o2-${Date.now()}`,
          type: "medical",
          priority: "urgent",
          title: "Oxygen Saturation Concern",
          description: "Low oxygen levels require immediate medical evaluation",
          recommendations: [
            "Seek immediate medical attention",
            "Monitor breathing patterns",
            "Avoid strenuous activity",
            "Consider pulmonary function evaluation"
          ],
          reasoning: "Low oxygen saturation may indicate serious respiratory or cardiac issues",
          followUpRequired: true,
          createdAt: new Date()
        });
        trends.concerning.push("Oxygen saturation below normal");
      } else if (latestVitals.oxygenSaturation && latestVitals.oxygenSaturation >= 98) {
        trends.stable.push("Oxygen saturation excellent");
      }
    }

    // Analyze lab results if available
    if (labResults.length > 0) {
      console.log(`Analyzing ${labResults.length} lab results for comprehensive health assessment`);
      
      for (const lab of labResults) {
        const value = parseFloat(lab.result) || 0;
        const testName = lab.testName.toLowerCase();
        
        // Cholesterol analysis
        if (testName.includes('cholesterol') || testName.includes('ldl') || testName.includes('hdl')) {
          if (testName.includes('total') && value > 240) {
            healthScore -= 12;
            riskFactors.push("Significantly elevated total cholesterol levels");
            recommendations.push({
              id: `rec-chol-${Date.now()}`,
              type: "lifestyle",
              priority: "high",
              title: "Comprehensive Cholesterol Management",
              description: "Your cholesterol levels significantly exceed recommended ranges",
              recommendations: [
                "Adopt Mediterranean-style diet rich in omega-3 fatty acids",
                "Increase soluble fiber intake through oats, beans, and fruits",
                "Eliminate trans fats and limit saturated fats to <7% of calories",
                "Engage in 40 minutes of aerobic exercise 3-4 times weekly",
                "Consider consultation with lipid specialist for statin therapy"
              ],
              reasoning: "High cholesterol is a major modifiable risk factor for cardiovascular disease",
              followUpRequired: true,
              createdAt: new Date()
            });
            trends.concerning.push("Total cholesterol significantly elevated");
          } else if (testName.includes('ldl') && value > 160) {
            healthScore -= 10;
            riskFactors.push("Elevated LDL (bad) cholesterol");
            trends.concerning.push("LDL cholesterol above optimal range");
          } else if (testName.includes('hdl') && value < 40) {
            healthScore -= 8;
            riskFactors.push("Low HDL (good) cholesterol");
            trends.concerning.push("HDL cholesterol below protective range");
          } else if (testName.includes('total') && value < 200) {
            trends.improving.push("Total cholesterol within optimal range");
            healthScore += 5;
          }
        }

        // Glucose/Diabetes analysis
        if (testName.includes('glucose') || testName.includes('a1c') || testName.includes('hemoglobin a1c')) {
          if ((testName.includes('glucose') && value > 126) || (testName.includes('a1c') && value > 6.5)) {
            healthScore -= 18;
            riskFactors.push("Elevated blood glucose indicating diabetes or pre-diabetes");
            recommendations.push({
              id: `rec-diabetes-${Date.now()}`,
              type: "medical",
              priority: "high",
              title: "Diabetes Risk Management Protocol",
              description: "Blood glucose levels indicate diabetes requiring comprehensive management",
              recommendations: [
                "Implement comprehensive diabetes management plan",
                "Monitor blood glucose levels 2-4 times daily",
                "Follow carbohydrate-controlled diet with portion management",
                "Engage in post-meal walking for 10-15 minutes",
                "Schedule immediate endocrinologist consultation",
                "Consider continuous glucose monitoring system"
              ],
              reasoning: "Elevated glucose levels require immediate intervention to prevent diabetic complications",
              followUpRequired: true,
              createdAt: new Date()
            });
            trends.concerning.push("Blood glucose levels in diabetic range");
          } else if ((testName.includes('glucose') && value > 100) || (testName.includes('a1c') && value > 5.7)) {
            healthScore -= 10;
            riskFactors.push("Pre-diabetic glucose levels");
            trends.concerning.push("Blood glucose trending toward diabetes");
            recommendations.push({
              id: `rec-prediab-${Date.now()}`,
              type: "preventive",
              priority: "medium",
              title: "Pre-Diabetes Prevention Strategy",
              description: "Early intervention can prevent progression to type 2 diabetes",
              recommendations: [
                "Lose 5-10% of body weight through caloric restriction",
                "Increase physical activity to 150+ minutes weekly",
                "Choose complex carbohydrates over simple sugars",
                "Monitor portion sizes and meal timing"
              ],
              reasoning: "Lifestyle interventions can reduce diabetes risk by up to 58%",
              followUpRequired: true,
              createdAt: new Date()
            });
          } else {
            trends.improving.push("Blood glucose levels within normal range");
            healthScore += 3;
          }
        }

        // Kidney function
        if (testName.includes('creatinine') || testName.includes('bun') || testName.includes('egfr')) {
          if ((testName.includes('creatinine') && value > 1.2) || (testName.includes('bun') && value > 20) || (testName.includes('egfr') && value < 60)) {
            healthScore -= 15;
            riskFactors.push("Declining kidney function requiring monitoring");
            recommendations.push({
              id: `rec-kidney-${Date.now()}`,
              type: "medical",
              priority: "high",
              title: "Kidney Function Protection",
              description: "Lab results suggest declining kidney function requiring immediate attention",
              recommendations: [
                "Limit protein intake as directed by healthcare provider",
                "Maintain optimal blood pressure control",
                "Stay well-hydrated with adequate water intake",
                "Schedule nephrology consultation within 2 weeks",
                "Monitor medications that may affect kidney function"
              ],
              reasoning: "Early intervention can slow progression of chronic kidney disease",
              followUpRequired: true,
              createdAt: new Date()
            });
            trends.concerning.push("Kidney function markers declining");
          }
        }

        // Liver function
        if (testName.includes('alt') || testName.includes('ast') || testName.includes('bilirubin')) {
          if ((testName.includes('alt') && value > 40) || (testName.includes('ast') && value > 40)) {
            healthScore -= 12;
            riskFactors.push("Elevated liver enzymes indicating liver stress");
            trends.concerning.push("Liver function markers elevated");
            recommendations.push({
              id: `rec-liver-${Date.now()}`,
              type: "lifestyle",
              priority: "medium",
              title: "Liver Health Optimization",
              description: "Elevated liver enzymes suggest need for liver health support",
              recommendations: [
                "Limit alcohol consumption significantly",
                "Maintain healthy weight to prevent fatty liver",
                "Avoid hepatotoxic medications when possible",
                "Include liver-supporting foods like leafy greens"
              ],
              reasoning: "Liver health is crucial for metabolism and detoxification",
              followUpRequired: true,
              createdAt: new Date()
            });
          }
        }
      }
      
      // Positive reinforcement for comprehensive lab monitoring
      recommendations.push({
        id: `rec-lab-monitoring-${Date.now()}`,
        type: "preventive",
        priority: "low",
        title: "Excellent Health Monitoring Approach",
        description: "Regular comprehensive lab work demonstrates proactive health management",
        recommendations: [
          "Continue annual comprehensive metabolic panel",
          "Track trends in key biomarkers over time",
          "Discuss all results thoroughly with primary care physician",
          "Maintain consistent timing for lab draws for accurate trending"
        ],
        reasoning: "Consistent monitoring allows early detection and prevention of health issues",
        followUpRequired: false,
        createdAt: new Date()
      });
    }

    // Age-specific preventive recommendations
    if (age >= 40) {
      recommendations.push({
        id: `rec-screening-${Date.now()}`,
        type: "preventive",
        priority: "medium",
        title: "Age-Appropriate Preventive Screenings",
        description: "Essential health screenings become increasingly important with age",
        recommendations: [
          age >= 50 ? "Annual mammogram (women) or prostate screening (men)" : "Baseline cancer screenings as appropriate",
          age >= 45 ? "Colonoscopy every 10 years or as recommended by physician" : "Discuss colonoscopy timing with doctor",
          "Comprehensive eye examination annually",
          age >= 50 ? "Bone density screening every 2 years" : "Baseline bone density assessment",
          "Annual dermatological skin cancer screening"
        ],
        reasoning: "Early detection through regular screening significantly improves treatment outcomes and survival rates",
        followUpRequired: false,
        createdAt: new Date()
      });
    }

    // Universal wellness optimization
    recommendations.push({
      id: `rec-wellness-${Date.now()}`,
      type: "lifestyle",
      priority: "low",
      title: "Comprehensive Wellness Optimization",
      description: "Foundation practices for maintaining and improving overall health",
      recommendations: [
        "Maintain consistent sleep schedule with 7-9 hours nightly",
        "Practice daily stress management (meditation, deep breathing, yoga)",
        "Stay adequately hydrated with 8-10 glasses of water daily",
        "Maintain strong social connections and community involvement",
        "Schedule regular preventive healthcare visits",
        "Keep emergency medical information and contacts updated"
      ],
      reasoning: "Consistent healthy lifestyle habits form the foundation for long-term wellness and disease prevention",
      followUpRequired: false,
      createdAt: new Date()
    });

    // Ensure reasonable health score bounds
    healthScore = Math.max(healthScore, 40);
    healthScore = Math.min(healthScore, 95);
    
    // Determine follow-up timing based on risk factors
    let nextAppointmentSuggestion = "Schedule routine preventive care visit in 6-12 months";
    if (riskFactors.length > 3) {
      nextAppointmentSuggestion = "Schedule urgent follow-up within 1-2 weeks to address multiple risk factors";
    } else if (riskFactors.length > 1) {
      nextAppointmentSuggestion = "Schedule follow-up in 1-3 months to monitor and reassess identified risk factors";
    } else if (riskFactors.length === 1) {
      nextAppointmentSuggestion = "Schedule follow-up in 3-6 months to reassess single identified risk factor";
    }

    return {
      overallHealthScore: Math.round(healthScore),
      riskFactors,
      recommendations,
      trends,
      nextAppointmentSuggestion
    };
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

// Export singleton instance for use throughout the application
export const aiHealthAnalyzer = new AIHealthAnalyzer();