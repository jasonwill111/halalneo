<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { compressImageToWebP, formatFileSize } from '#lib/utils/image-compress.js';
	import { toast } from 'svelte-sonner';
	import Upload from '@lucide/svelte/icons/upload';

	let {
		onuploaded,
		alt = '',
		multiple = false,
		label = 'Upload'
	}: {
		onuploaded: (url: string) => void;
		alt?: string;
		multiple?: boolean;
		label?: string;
	} = $props();

	let busy = $state(false);
	let inputEl: HTMLInputElement | undefined = $state();

	const MAX_UPLOADED_BYTES = 10 * 1024 * 1024;

	async function uploadOne(file: File): Promise<void> {
		const compressed = await compressImageToWebP(file);
		if (compressed.size > MAX_UPLOADED_BYTES) {
			throw new Error(`${file.name} is still ${formatFileSize(compressed.size)} after compression`);
		}
		const fd = new FormData();
		fd.append('file', compressed);
		if (alt) fd.append('alt', alt);
		const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
		const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
		if (!res.ok || !body?.url) throw new Error(body?.error ?? `Upload failed (${res.status})`);
		onuploaded(body.url);
	}

	async function onchange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = '';
		if (!files.length || busy) return;
		busy = true;
		try {
			// Sequential keeps R2 Class A writes minimal and failures attributable.
			for (const file of files) await uploadOne(file);
			toast.success(files.length === 1 ? 'Image uploaded.' : `${files.length} images uploaded.`);
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : 'Upload failed.');
		} finally {
			busy = false;
		}
	}
</script>

<input type="file" accept="image/*" {multiple} class="hidden" {onchange} bind:this={inputEl} />
<Button type="button" variant="outline" size="sm" disabled={busy} onclick={() => inputEl?.click()}>
	<Upload class="size-3.5" />
	{busy ? 'Uploading…' : label}
</Button>
