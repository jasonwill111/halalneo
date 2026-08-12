import type { Category } from "./types";

export const categories: Category[] = [
	{
		slug: "food-beverages",
		name: "Food & Beverages",
		description:
			"Halal-certified food products for import, retail and food service — ingredients through finished goods.",
		icon: "UtensilsCrossed"
	},
	{
		slug: "meat-poultry",
		name: "Meat & Poultry",
		description:
			"Slaughter-certified meat and poultry with halal slaughter certificates and recognized bodies.",
		icon: "Drumstick"
	},
	{
		slug: "dairy-eggs",
		name: "Dairy & Eggs",
		description:
			"Halal dairy, milk-based ingredients and egg products free of animal-derived rennet and haram additives.",
		icon: "Milk"
	},
	{
		slug: "confectionery-snacks",
		name: "Confectionery & Snacks",
		description:
			"Candies, snacks and biscuits using halal-certified gelatin, lecithin and flavourings.",
		icon: "Candy"
	},
	{
		slug: "beverages",
		name: "Beverages",
		description:
			"Non-alcoholic drinks and concentrates certified free of alcohol and haram processing aids.",
		icon: "CupSoda"
	},
	{
		slug: "nutritional-supplements",
		name: "Nutritional & Supplements",
		description:
			"Vitamins, powders and health supplements with halal-certified gelatine capsules and excipients.",
		icon: "Pill"
	},
	{
		slug: "cosmetics-personal-care",
		name: "Cosmetics & Personal Care",
		description:
			"Cosmetics and personal care certified halal — no porcine derivatives in ingredients or packaging.",
		icon: "Sparkles"
	}
];

export function getCategory(slug: string): Category | undefined {
	return categories.find((c) => c.slug === slug);
}
