import { API_URL } from '../config/api';

export type ChatMessage = { role: 'user' | 'model'; text: string };

type ApiResponse = {
  success: boolean;
  data: string;
  message?: string;
  error?: string;
};

const parseError = async (res: Response) => {
  let message = `Request failed (${res.status})`;
  try {
    const data = (await res.json()) as Partial<ApiResponse>;
    if (data?.message) message = data.message;
    if (data?.error) message = data.error;
  } catch {
    // ignore
  }
  throw new Error(message);
};

export const sendMessageToGemini = async (
  message: string,
  history: ChatMessage[],
  catalog?: string
) => {
  const res = await fetch(`${API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      messages: history,
      catalog
    })
  });

  if (!res.ok) {
    await parseError(res);
  }

  const data = (await res.json()) as ApiResponse;
  return data.data || "I'm having trouble connecting to the brain. Please try again later.";
};
