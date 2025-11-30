import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudyPlan, WritingFeedback, SpeakingFeedback, WritingTaskType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash"; // Fast and capable for text tasks
const highIntellectModelId = "gemini-3-pro-preview"; // For complex reasoning/grading

// Schemas
const studyPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalDays: { type: Type.INTEGER },
    schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          focus: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.STRING }
        }
      }
    }
  }
};

const writingFeedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    bandScore: { type: Type.NUMBER },
    taskResponse: { type: Type.NUMBER },
    coherenceCohesion: { type: Type.NUMBER },
    lexicalResource: { type: Type.NUMBER },
    grammaticalRange: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    improvedVersion: { type: Type.STRING }
  }
};

const speakingFeedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    bandScore: { type: Type.NUMBER },
    fluencyCoherence: { type: Type.NUMBER },
    lexicalResource: { type: Type.NUMBER },
    grammaticalRange: { type: Type.NUMBER },
    pronunciation: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    transcript: { type: Type.STRING }
  }
};

export const generateStudyPlan = async (days: number, weakAreas: string): Promise<StudyPlan> => {
  const prompt = `Create a strict, full-time IELTS study plan for ${days} days. The student has failed once and needs high scores. 
  Focus especially on these weak areas: ${weakAreas}. 
  Return a structured JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyPlanSchema,
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as StudyPlan;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
};

export const evaluateWriting = async (topic: string, content: string, type: WritingTaskType): Promise<WritingFeedback> => {
  const prompt = `Act as a strict IELTS Examiner. Evaluate this ${type}.
  Topic: ${topic}
  Essay: ${content}
  
  Provide a detailed evaluation JSON including band scores (0-9) for each criterion and a rewritten, improved version of the essay that would score Band 9.`;

  try {
    const response = await ai.models.generateContent({
      model: highIntellectModelId, // Use Pro model for better grading accuracy
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: writingFeedbackSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WritingFeedback;
    }
    throw new Error("No evaluation generated");
  } catch (error) {
    console.error("Error evaluating writing:", error);
    throw error;
  }
};

export const evaluateSpeaking = async (audioBase64: string, topic: string): Promise<SpeakingFeedback> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-09-2025", // Optimized for audio
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "audio/webm;codecs=opus", // Assuming webm from MediaRecorder
              data: audioBase64
            }
          },
          {
            text: `This is an IELTS Speaking Part 2 response about the topic: "${topic}". 
            Transcribe the audio and then evaluate it strictly based on IELTS Speaking criteria. 
            Provide a JSON response with band scores and constructive feedback.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: speakingFeedbackSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SpeakingFeedback;
    }
    throw new Error("No speaking evaluation generated");
  } catch (error) {
    console.error("Error evaluating speaking:", error);
    throw error;
  }
};
