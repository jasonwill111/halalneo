$content = Get-Content "D:\Dev Projects\halalneo\src\lib\components\admin\quality-dashboard.svelte"
$oldScript = @'
<script lang="ts">
	import { createRoot } from 'svelte';
	import '../styles/admin.css';

	export let dataCounts: any;
	export let qualityMetrics: any;

'@
$newScript = @'
<script lang="ts">
	import { createRoot } from 'svelte';
	import '../styles/admin.css';

	let { dataCounts, qualityMetrics } = $props();

'@
$content = $content -replace [regex]::Escape($oldScript), $newScript
[System.IO.File]::WriteAllText("D:\Dev Projects\halalneo\src\lib\components\admin\quality-dashboard.svelte", $content, [System.Text.Encoding]::UTF8)
