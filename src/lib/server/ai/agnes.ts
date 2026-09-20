import { createOpenAI } from '@ai-sdk/openai';

/** Agnes AIHub (OpenAI-compatible). Single source for every LLM call site. */
export const AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1';

/** Model id exactly as listed by GET https://apihub.agnes-ai.com/v1/models */
export const AGNES_MODEL_ID = 'agnes-3.0-flash';

export function createAgnes(apiKey: string) {
	return createOpenAI({ baseURL: AGNES_BASE_URL, apiKey });
}

export type AgnesProvider = ReturnType<typeof createAgnes>;
