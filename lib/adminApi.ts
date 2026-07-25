const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://uzair-rph-assistant.fastapicloud.dev";

export interface ThreadSummary {
  thread_id: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string;
}

export interface ThreadMessage {
  role: string;
  content: string;
}

export class AdminApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

async function adminFetch<T>(path: string, token: string): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AdminApiError("Couldn't reach the backend server.");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail ?? "";
    } catch {
      // response wasn't JSON, ignore
    }
    throw new AdminApiError(detail || `Request failed (status ${res.status}).`, res.status);
  }

  return res.json();
}

export function listThreads(token: string): Promise<ThreadSummary[]> {
  return adminFetch<ThreadSummary[]>("/admin/threads", token);
}

export function getThread(token: string, threadId: string): Promise<ThreadMessage[]> {
  return adminFetch<ThreadMessage[]>(`/admin/threads/${encodeURIComponent(threadId)}`, token);
}
