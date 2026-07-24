const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export interface ChatResponse {
  response: string;
}

export class ChatApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

export async function sendMessage(
  message: string,
  threadId: string
): Promise<string> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: threadId }),
    });
  } catch {
    throw new ChatApiError(
      "Couldn't reach the negotiation agent. Check that the backend server is running."
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail ?? "";
    } catch {
      // response wasn't JSON, ignore
    }
    throw new ChatApiError(
      detail || `The agent returned an error (status ${res.status}).`,
      res.status
    );
  }

  const data: ChatResponse = await res.json();
  return data.response;
}
