import type { AiTool } from './types';

export const aiTools: AiTool[] = [
	{
		id: 'certification-checker',
		slug: 'certification-checker',
		name: 'Certification Checker',
		description:
			'Reads a certificate document and summarises scope, status, body and expiry into a ledger row.',
		longDescription:
			"Upload or paste a halal certificate document and get a structured verification summary — issuing body, standard, scope, status and expiry — in seconds. Built for buyers who need to check a supplier's claims before committing to a shipment.",
		features: [
			'Extracts certificate number, issuing body and standard',
			'Flags expired, pending and unrecognised certificates',
			'Exports a verification summary you can attach to an order'
		],
		category: 'compliance',
		status: 'active'
	},
	{
		id: 'supplier-match',
		slug: 'supplier-match',
		name: 'Supplier Match',
		description: "Maps a buyer's product requirements to certified suppliers ranked by scope fit.",
		longDescription:
			'Describe the products and certification you need and Supplier Match ranks verified suppliers by how well their certified scope covers your requirement — country, standard and business type included.',
		features: [
			'Matches against certified scope, not just category',
			'Ranking by certification fit and country of origin',
			'Shortlists ready for your sourcing workflow'
		],
		category: 'sourcing',
		status: 'active'
	},
	{
		id: 'halal-assistant',
		slug: 'halal-assistant',
		name: 'Halal Trade Assistant',
		description: 'Answers sourcing and compliance questions from the knowledge base.',
		longDescription:
			'Ask sourcing and compliance questions and get answers grounded in the HalalNeo knowledge base — certification recognition, import rules, logistics and market guides.',
		features: [
			'Answers grounded in the knowledge base',
			'Covers certification, import and logistics questions',
			'Cites the articles it draws from'
		],
		category: 'assistant',
		status: 'disabled'
	},
	{
		id: 'market-report',
		slug: 'market-report',
		name: 'Market Report Generator',
		description: 'Drafts country market guides and regulatory summaries for editorial review.',
		longDescription:
			'Generates a first draft of a country market guide or regulatory summary from the research library, ready for editorial review before publication.',
		features: [
			'Drafts country market guides from research',
			'Summarises regulatory and recognition requirements',
			'Output ready for editorial review'
		],
		category: 'documentation',
		status: 'disabled'
	}
];
