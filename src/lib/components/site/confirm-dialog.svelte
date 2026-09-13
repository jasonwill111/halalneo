<script lang="ts">
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '#lib/components/ui/alert-dialog/index.js';

	let {
		open = $bindable(false),
		title = 'Are you sure?',
		description,
		confirmLabel = 'Delete',
		onconfirm
	}: {
		open?: boolean;
		title?: string;
		description?: string;
		confirmLabel?: string;
		onconfirm?: () => void | Promise<void>;
	} = $props();
</script>

<AlertDialog bind:open>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>{title}</AlertDialogTitle>
			{#if description}
				<AlertDialogDescription>{description}</AlertDialogDescription>
			{/if}
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30 dark:bg-destructive/20 dark:hover:bg-destructive/30"
				onclick={() => onconfirm?.()}
			>
				{confirmLabel}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
