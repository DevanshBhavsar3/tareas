<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="flex h-screen flex-col justify-between gap-32">
	<nav class="flex items-center justify-between px-4 py-2">
		<a href="/" class="text-xl font-medium tracking-tighter">Tareas</a>
		<div class="flex items-center gap-5">
			<a href="/" class="text-sm tracking-tight text-neutral-600 hover:text-black">Log in</a>
			<a
				href="/"
				class="rounded-full border border-transparent bg-blue-300 px-4 py-1.5 text-sm tracking-tight hover:border-blue-300 hover:bg-white"
				>My Todos</a
			>
		</div>
	</nav>
	<div class="flex flex-col items-center justify-center gap-4">
		<div class="flex max-w-lg flex-col items-center justify-center gap-2">
			<h1 class="max-w-sm text-center text-5xl font-medium tracking-tighter text-balance">
				Manage Your Todos Hassle-free
			</h1>
			<p class="text-md text-center tracking-tight text-balance text-neutral-700">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis, non aspernatur fugiat
			</p>
		</div>
		<a
			href="/"
			class="text-md rounded-full border border-transparent bg-blue-300 px-5 py-2 tracking-tight hover:border-blue-300 hover:bg-white"
		>
			Start for free
		</a>
	</div>
	<div class="flex-1 bg-neutral-200"></div>
</main>
