export interface UploadedFile {
  url: string;
  key: string;
  filename: string;
}

export interface ProcessResult {
  threadId: string;
  runId: string;
}

export interface Question {
  type: "multiple_choice" | "open_ended";
  question: string;
  options?: string[];
  answer?: string;
} 