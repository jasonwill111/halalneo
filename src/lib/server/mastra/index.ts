import { Mastra } from '@mastra/core';
import { halalAgent } from './agents/halal-agent';
import { blogGeneratorTool } from './tools/blog-generator';

export const mastra = new Mastra({
	agents: { halalAgent },
	tools: { blogGeneratorTool }
});
