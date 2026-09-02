import { Agent } from '@mastra/core/agent';
import type { OpenAICompatibleConfig } from '@mastra/core';

export function createHalalAgent(apiKey: string) {
	const config: OpenAICompatibleConfig = {
		id: 'agnes/agnes-2.5-flash',
		url: 'https://apihub.agnes-ai.com/v1',
		apiKey
	};

	return new Agent({
		id: 'halal-agent',
		name: 'HalalNeo AI',
		instructions: `You are HalalNeo AI Assistant — an expert in halal trade, certification, compliance, and market intelligence. You help buyers and suppliers navigate the halal ecosystem. Be concise, professional, and actionable. When discussing certification bodies or standards, always recommend verifying with official sources.`,
		model: config
	});
}
