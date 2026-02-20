import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  risk_score: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  intent: string;
  manipulation_patterns: string[];
  patterns_found: string[];
  recommendation: string;
  confidence: number;
  verdict: string;
}

export async function analyzeThreat(type: 'URL' | 'Email', content: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following ${type} content for cybersecurity threats:
    
    CONTENT:
    ${content}
    
    You are SentinelMind Shield, a multi-agent cyber intelligence system.
    Act as 5 specialized agents:
    1. Pattern Detection: Find phishing keywords, suspicious URL structures, urgency.
    2. Intent Classification: Classify as Credential harvesting, Financial fraud, Authority impersonation, Social engineering, or Benign.
    3. Manipulation Detection: Detect urgency, authority abuse, fear, reward baiting.
    4. Risk Fusion: Combine all signals into a score 0-100 and severity.
    5. Decision Agent: Provide a SOC-grade recommendation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risk_score: { type: Type.NUMBER },
          severity: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
          intent: { type: Type.STRING },
          manipulation_patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
          patterns_found: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          verdict: { type: Type.STRING }
        },
        required: ["risk_score", "severity", "intent", "manipulation_patterns", "patterns_found", "recommendation", "confidence", "verdict"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
