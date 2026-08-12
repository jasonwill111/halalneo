<script lang="ts">
	import ToolPage from '$lib/components/tools/tool-page.svelte';

	let { params } = $props();
</script>

<ToolPage slug={params.slug}></ToolPage>
