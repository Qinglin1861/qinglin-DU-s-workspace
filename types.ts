export enum IELTSModule {
  WRITING = 'Writing',
  SPEAKING = 'Speaking',
  READING = 'Reading',
  LISTENING = 'Listening'
}

export enum WritingTaskType {
  TASK_1 = 'Task 1 (Report/Letter)',
  TASK_2 = 'Task 2 (Essay)'
}

export interface WritingFeedback {
  bandScore: number;
  taskResponse: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  feedback: string;
  improvedVersion: string;
}

export interface SpeakingFeedback {
  bandScore: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  feedback: string;
  transcript: string;
}

export interface StudyDay {
  day: number;
  focus: IELTSModule;
  tasks: string[];
  tips: string;
}

export interface StudyPlan {
  totalDays: number;
  schedule: StudyDay[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
