import { createOpenAI } from '@ai-sdk/openai';

const apiKey = 'sk-aesHuvnGrNb7FjBbIFqHoz6tt2LZzuGPk5ENzlNec9tB6gMu';

export const agnes = createOpenAI({
	baseURL: 'https://apihub.agnes-ai.com/v1',
	apiKey
});

export const agnesFlash = agnes('agnes-2.5-flash');
