export type MessageRole = "user" | "agent" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}
