<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">
</svelte:head>

<div class="container mx-auto">
    {@render children()}
</div>
