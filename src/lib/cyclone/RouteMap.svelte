<script lang="ts">
	import { onMount } from 'svelte';
	import type { RoutePoint } from './types';

	let {
		segments,
		token,
		fallback
	}: { segments: RoutePoint[][]; token?: string; fallback?: string } = $props();
	let container: HTMLDivElement;
	let failed = $state(false);

	onMount(() => {
		if (!token || segments.length === 0) return;
		const callback = `cycloneMapReady${crypto.randomUUID().replaceAll('-', '')}`;
		const script = document.createElement('script');
		script.src = 'https://cdn.apple-mapkit.com/mk/6/mapkit.core.js';
		script.crossOrigin = 'anonymous';
		script.async = true;
		script.dataset.callback = callback;
		script.dataset.token = token;
		script.dataset.libraries = 'full-map';
		(window as any)[callback] = () => {
			try {
				const kit = (window as any).mapkit;
				const overlays = segments.map(
					(segment) =>
						new kit.PolylineOverlay(
							segment.map((point) => new kit.Coordinate(point.latitude, point.longitude)),
							{ style: new kit.Style({ lineWidth: 4, strokeColor: '#0d9488' }) }
						)
				);
				const map = new kit.Map(container, {
					showsMapTypeControl: false,
					showsCompass: kit.FeatureVisibility.Adaptive,
					showsPointsOfInterest: false
				});
				map.addOverlays(overlays);
				map.showItems(overlays, { padding: new kit.Padding(32, 32, 32, 32) });
			} catch {
				failed = true;
			}
			delete (window as any)[callback];
		};
		script.onerror = () => (failed = true);
		document.head.appendChild(script);
		return () => {
			script.remove();
			delete (window as any)[callback];
		};
	});
</script>

<div
	class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
>
	{#if fallback}
		<img
			src={fallback}
			alt="Map of the approved public route"
			class="absolute inset-0 h-full w-full object-cover"
		/>
	{/if}
	<div
		bind:this={container}
		class="relative h-[24rem] w-full"
		aria-label="Interactive map of the approved public route"
	></div>
	{#if !token || failed}
		<p
			class="absolute bottom-3 left-3 rounded-md bg-white/90 px-3 py-2 text-xs text-slate-700 shadow dark:bg-slate-950/90 dark:text-slate-200"
		>
			Interactive map unavailable. Showing the privacy-approved snapshot.
		</p>
	{/if}
</div>
