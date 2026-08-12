import type { CertifyingBody } from "./types";

export const certifyingBodies: CertifyingBody[] = [
	{
		id: "jakim",
		name: "JAKIM",
		country: "Malaysia",
		standard: "MS 1500:2019"
	},
	{
		id: "bpjph",
		name: "BPJPH / MUI",
		country: "Indonesia",
		standard: "HAS 23000"
	},
	{
		id: "muis",
		name: "MUIS",
		country: "Singapore",
		standard: "MUIS-HC-S001"
	},
	{
		id: "sfda",
		name: "SFDA",
		country: "Saudi Arabia",
		standard: "GSO 2055-1"
	},
	{
		id: "moiat",
		name: "MOIAT",
		country: "UAE",
		standard: "UAE.S 2055-1"
	},
	{
		id: "ifanca",
		name: "IFANCA",
		country: "United States",
		standard: "OIC/SMIIC 1:2019"
	},
	{
		id: "gimdes",
		name: "GIMDES",
		country: "Turkey",
		standard: "OIC/SMIIC 1:2019"
	},
	{
		id: "sanha",
		name: "SANHA",
		country: "South Africa",
		standard: "OIC/SMIIC 1:2019"
	},
	{
		id: "saber",
		name: "SABER / SASO",
		country: "Saudi Arabia",
		standard: "GSO 2055-1 (SASO technical regulations)"
	},
	{
		id: "cicot",
		name: "CICOT",
		country: "Thailand",
		standard: "Thai national halal standard (GSO 2055-based)"
	},
	{
		id: "pha",
		name: "PHA",
		country: "Pakistan",
		standard: "PS OIC/SMIIC 3:2021 / PS OIC/SMIIC 9:2022"
	},
	{
		id: "hfa",
		name: "HFA",
		country: "United Kingdom",
		standard: "HFA certification scheme / OIC/SMIIC 1:2019"
	},
	{
		id: "hak",
		name: "HAK",
		country: "Turkey",
		standard: "OIC/SMIIC 1:2019"
	},
	{
		id: "nhasa",
		name: "NHASA",
		country: "Australia",
		standard: "Australian halal standard (GSO-aligned)"
	}
];

export function getBody(id: string): CertifyingBody {
	const body = certifyingBodies.find((b) => b.id === id);
	if (!body) throw new Error(`Unknown certifying body: ${id}`);
	return body;
}
