$content = [System.IO.File]::ReadAllText("D:\Dev Projects\halalneo\src\routes\market-guides\+page.svelte", [System.Text.Encoding]::UTF8)

$old = @"
  	const guideStats = {
  		totalGuides: data.guides.length,
  		regions: regionOptions.length - 1, // exclude all
  		countries Above: quantityOfCountries(),
  		categories: quantityOfCategories()
  	};

  	function quantityOfCountries(): number {
  		return new Set(data.guides.map((g: any) => g.country)).size;
  	}

  	function quantityOfCategories(): number {
  		return new Set(data.guides.map((g: any) => g.category)).size;
  	}

  	function seoFriendlyDescription(): string {
  		return `Comprehensive halal market entry guides for ${guideStats.regions} regions covering ${guideStats.regions.toLocaleLowerCase()} countries. Regulatory frameworks, import requirements, certification standards, and business insights for entering Asian, European, American, Middle Eastern, and African halal markets. Updated 2026.`;
  	}

  	const StatCard = (title: string, value: number | string, description: string) => ({ title, value, description });
  	const stats = [
"@

$new = @"
  	const guideStats = $derived({
  		totalGuides: data.guides.length,
  		regions: regionOptions.length - 1, // exclude all
  		countries: new Set(data.guides.map((g: any) => g.country)).size,
  		categories: new Set(data.guides.map((g: any) => g.category)).size
  	});

  	function seoFriendlyDescription(): string {
  		return `Comprehensive halal market entry guides for ${guideStats.regions} regions covering ${guideStats.countries} countries. Regulatory frameworks, import requirements, certification standards, and business insights for entering Asian, European, American, Middle Eastern, and African halal markets. Updated 2026.`;
  	}

  	const StatCard = (title: string, value: number | string, description: string) => ({ title, value, description });
  	const stats = $derived([
"@

$content = $content -replace [regex]::Escape($old), $new
[System.IO.File]::WriteAllText("D:\Dev Projects\halalneo\src\routes\market-guides\+page.svelte", $content, [System.Text.Encoding]::UTF8)
