<script lang="ts">
	export let timeRemaining = 30;

	let isFresh = true;

	$: isFresh = timeRemaining > 5;
</script>

<div
	class={`relative ${
		isFresh ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-500'
	} ${$$props.class}`}
>
	<svg class="w-full h-full fill-current" viewBox="0 0 100 100">
		<!-- Background circle -->
		<circle
			class="dark:text-black text-slate-100 stroke-current"
			stroke-width="10"
			cx="50"
			cy="50"
			r="40"
			fill="transparent"
		/>
		<!-- Progress circle -->
		<circle
			class="progress-ring__circle stroke-current transition-colors"
			stroke-width="10"
			stroke-linecap="round"
			cx="50"
			cy="50"
			r="40"
			fill="transparent"
			stroke-dashoffset={(30 - timeRemaining) * -8.33}
		/>

		<!-- Center text -->
		<text
			x="50"
			y="50"
			text-anchor="middle"
			alignment-baseline="middle"
			class="text-center font-mono fill-current text-4xl">{timeRemaining}</text
		>
	</svg>
</div>

<style>
	.progress-ring__circle {
		stroke-dasharray: 400, 400;
		transition: stroke-dashoffset 0.35s;
		transform: rotate(270deg);
		transform-origin: 50% 50%;
	}
</style>
