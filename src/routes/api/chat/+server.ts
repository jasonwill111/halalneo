import { streamText } from 'ai';
import { agnesFlash } from '#lib/server/ai.js';

export const POST = async ({ request }) => {
	const { messages } = await request.json();

	const result = streamText({
		model: agnesFlash,
		system: `You are HalalNeo AI Assistant — an expert in halal trade, certification, compliance, and market intelligence. You help buyers and suppliers navigate the halal ecosystem. Be concise, professional, and actionable. When discussing certification bodies or standards, always recommend verifying with official sources.`,
		messages
	});

	return result.toDataStreamResponse();
};
