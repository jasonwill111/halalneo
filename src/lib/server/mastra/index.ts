import { Mastra } from '@mastra/core';
import { createHalalAgent } from './agents/halal-agent';
import { createBlogGeneratorTool } from './tools/blog-generator';

export function createMastra(apiKey: string) {
	const halalAgent = createHalalAgent(apiKey);
	const blogGeneratorTool = createBlogGeneratorTool(apiKey);

	return new Mastra({
		agents: { halalAgent },
		tools: { blogGeneratorTool }
	});
}
