<script lang="ts">
	import { Sparkles, LoaderCircle } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { marked } from 'marked';

	let symbol = $state('');
	let contents = $state('');
	let status = $state(true);

	const analyze = async () => {
		if (!symbol) return;
		status = false;
		const response = await fetch('/', {
			method: 'POST',
			body: JSON.stringify({ symbol }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		status = true;
		const data = await response.json();
		contents = data.contents;
	};
</script>

<main
	class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-6 py-12 text-white"
>
	<!-- Header -->
	<h1 class="text-3xl sm:text-4xl font-semibold mb-6 flex items-center gap-2">
		<Sparkles class="text-yellow-400 h-6 w-6" />
		AI Stock Analyzer
	</h1>

	<!-- Input Section -->
	<div class="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
		<Input
			type="search"
			bind:value={symbol}
			placeholder="🔎 ค้นหาชื่อหุ้นสหรัฐ เช่น NVDA"
			class="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
		/>
		<Button
			type="button"
			disabled={!status}
			onclick={analyze}
			variant="outline"
			class="rounded-xl border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-300 flex items-center justify-center"
		>
			{#if status}
				<Sparkles class="mr-2 h-4 w-4" />
			{:else}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			วิเคราะห์หุ้น
		</Button>
	</div>

	<!-- Output Section -->
	<div
		class="mt-10 w-full max-w-2xl bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-xl p-6 prose prose-invert prose-headings:text-yellow-400 prose-a:text-yellow-300"
	>
		{#if contents}
			{@html marked(contents)}
		{:else}
			<p class="text-slate-400 text-center">ผลการวิเคราะห์จะแสดงที่นี่ 🧠</p>
		{/if}
	</div>
</main>
