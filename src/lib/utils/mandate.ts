export type MandateStatus = 'mandatory' | 'phasing-in' | 'voluntary';

export const MANDATE_STATUSES: Record<MandateStatus, { label: string; description: string; tone: string }> = {
	mandatory: {
		label: 'Mandatory',
		description: 'Halal certification is required by law for sale in this market.',
		tone: 'bg-success/10 text-success'
	},
	'phasing-in': {
		label: 'Phasing in',
		description: 'Mandatory halal labelling is being rolled out on a defined schedule.',
		tone: 'bg-warn/10 text-warn'
	},
	voluntary: {
		label: 'Voluntary',
		description: 'No nationwide mandate; halal is opt-in for the market.',
		tone: 'bg-info/10 text-info'
	}
};
