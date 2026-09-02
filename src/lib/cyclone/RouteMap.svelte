<script lang="ts">
	import { onMount } from 'svelte';
	import type { Photo, RoutePoint } from './types';

	let {
		segments,
		photos = [],
		token,
		fallback,
		fallbackDark
	}: {
		segments: RoutePoint[][];
		photos?: Photo[];
		token?: string;
		fallback?: string;
		fallbackDark?: string;
	} = $props();
	let container: HTMLDivElement;
	let failed = $state(false);
	const cameraGlyph = { 1: '/cyclone/map-camera.svg?v=2' };
	const checkeredFlagGlyph = { 1: '/cyclone/map-checkered-flag.svg?v=2' };

	function coordinateDistanceMeters(first: RoutePoint, second: RoutePoint) {
		const radians = Math.PI / 180;
		const latitudeDelta = (second.latitude - first.latitude) * radians;
		const longitudeDelta = (second.longitude - first.longitude) * radians;
		const firstLatitude = first.latitude * radians;
		const secondLatitude = second.latitude * radians;
		const haversine =
			Math.sin(latitudeDelta / 2) ** 2 +
			Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
		return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
	}

	onMount(() => {
		if (!token || segments.length === 0) return;
		const callback = `cycloneMapReady${crypto.randomUUID().replaceAll('-', '')}`;
		const script = document.createElement('script');
		const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
		let map: any;
		let mapkit: any;
		let haloOverlays: any[] = [];
		let photoAnnotations: any[] = [];

		const haloColor = () => (darkMode.matches ? '#f8fafc' : '#0f172a');
		const applyTheme = () => {
			if (!map || !mapkit) return;
			map.colorScheme = darkMode.matches ? mapkit.ColorScheme.Dark : mapkit.ColorScheme.Light;
			for (const overlay of haloOverlays) {
				overlay.style = new mapkit.Style({
					lineWidth: 9,
					strokeColor: haloColor(),
					strokeOpacity: 0.88
				});
			}
		};

		const selectGalleryPhoto = (event: Event) => {
			const photoId = (event as CustomEvent<{ photoId?: string }>).detail?.photoId;
			const annotation = photoAnnotations.find((candidate) => candidate.data?.photoId === photoId);
			if (map && annotation) map.selectedAnnotation = annotation;
		};

		script.src = 'https://cdn.apple-mapkit.com/mk/6/mapkit.core.js';
		script.crossOrigin = 'anonymous';
		script.async = true;
		script.dataset.callback = callback;
		script.dataset.token = token;
		script.dataset.libraries = 'full-map';
		(window as any)[callback] = () => {
			try {
				mapkit = (window as any).mapkit;
				const routeCoordinates = segments.map((segment) =>
					segment.map((point) => new mapkit.Coordinate(point.latitude, point.longitude))
				);
				haloOverlays = routeCoordinates.map(
					(coordinates) =>
						new mapkit.PolylineOverlay(coordinates, {
							style: new mapkit.Style({
								lineWidth: 9,
								strokeColor: haloColor(),
								strokeOpacity: 0.88
							})
						})
				);
				const routeOverlays = routeCoordinates.map(
					(coordinates) =>
						new mapkit.PolylineOverlay(coordinates, {
							style: new mapkit.Style({
								lineWidth: 5,
								strokeColor: '#14b8a6',
								strokeOpacity: 1
							})
						})
				);

				const poiCategories = [
					'Park',
					'NationalPark',
					'Hiking',
					'Beach',
					'Campground',
					'Cafe',
					'Bakery',
					'FoodMarket',
					'Restroom',
					'GasStation',
					'Parking'
				]
					.map((name) => mapkit.PointOfInterestCategory[name])
					.filter(Boolean);
				const pointOfInterestFilter = poiCategories.length
					? mapkit.PointOfInterestFilter.including(poiCategories)
					: undefined;

				map = new mapkit.Map(container, {
					colorScheme: darkMode.matches ? mapkit.ColorScheme.Dark : mapkit.ColorScheme.Light,
					mapType: mapkit.MapType.Standard,
					showsMapTypeControl: true,
					showsCompass: mapkit.FeatureVisibility.Adaptive,
					pointOfInterestFilter,
					tintColor: '#0d9488'
				});
				map.addOverlays([...haloOverlays, ...routeOverlays]);

				const firstPoint = segments[0]?.[0];
				const finalSegment = segments[segments.length - 1];
				const lastPoint = finalSegment?.[finalSegment.length - 1];
				const isLoop =
					firstPoint && lastPoint && coordinateDistanceMeters(firstPoint, lastPoint) < 250;
				const endpointAnnotations = isLoop
					? [
							new mapkit.MarkerAnnotation(
								new mapkit.Coordinate(firstPoint.latitude, firstPoint.longitude),
								{
									title: 'Visible route start and finish',
									glyphImage: checkeredFlagGlyph,
									selectedGlyphImage: checkeredFlagGlyph,
									color: '#7c3aed',
									glyphColor: '#ffffff',
									titleVisibility: mapkit.FeatureVisibility.Hidden
								}
							)
						]
					: [
							firstPoint &&
								new mapkit.MarkerAnnotation(
									new mapkit.Coordinate(firstPoint.latitude, firstPoint.longitude),
									{
										title: 'Visible route start',
										glyphImage: checkeredFlagGlyph,
										selectedGlyphImage: checkeredFlagGlyph,
										color: '#16a34a',
										glyphColor: '#ffffff',
										titleVisibility: mapkit.FeatureVisibility.Hidden
									}
								),
							lastPoint &&
								new mapkit.MarkerAnnotation(
									new mapkit.Coordinate(lastPoint.latitude, lastPoint.longitude),
									{
										title: 'Visible route finish',
										glyphImage: checkeredFlagGlyph,
										selectedGlyphImage: checkeredFlagGlyph,
										color: '#db2777',
										glyphColor: '#ffffff',
										titleVisibility: mapkit.FeatureVisibility.Hidden
									}
								)
						].filter(Boolean);

				photoAnnotations = photos.flatMap((photo, index) => {
					if (!photo.location) return [];
					const annotation = new mapkit.MarkerAnnotation(
						new mapkit.Coordinate(photo.location.latitude, photo.location.longitude),
						{
							title: `Photo ${index + 1}`,
							subtitle: 'Along the public route',
							color: '#0d9488',
							glyphColor: '#ffffff',
							glyphImage: cameraGlyph,
							selectedGlyphImage: cameraGlyph,
							titleVisibility: mapkit.FeatureVisibility.Hidden,
							clusteringIdentifier: 'ride-photos',
							data: { photoId: photo.id }
						}
					);
					annotation.addEventListener('select', () => {
						window.dispatchEvent(
							new CustomEvent('cyclone:map-photo-select', {
								detail: { photoId: photo.id }
							})
						);
					});
					return [annotation];
				});

				const annotations = [...endpointAnnotations, ...photoAnnotations];
				map.addAnnotations(annotations);
				map.showItems([...routeOverlays, ...annotations], {
					padding: new mapkit.Padding(42, 42, 42, 42)
				});
			} catch (error) {
				console.error('Unable to initialize the Cyclone route map', error);
				failed = true;
			}
			delete (window as any)[callback];
		};
		script.onerror = () => (failed = true);
		darkMode.addEventListener('change', applyTheme);
		window.addEventListener('cyclone:gallery-photo-select', selectGalleryPhoto);
		if ((window as any).mapkit?.Map) {
			(window as any)[callback]();
		} else {
			document.head.appendChild(script);
		}
		return () => {
			darkMode.removeEventListener('change', applyTheme);
			window.removeEventListener('cyclone:gallery-photo-select', selectGalleryPhoto);
			map?.destroy?.();
			script.remove();
			delete (window as any)[callback];
		};
	});
</script>

<div
	class="relative overflow-hidden border-y border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
>
	{#if fallback || fallbackDark}
		<picture class="absolute inset-0 block h-full w-full">
			{#if fallbackDark}<source media="(prefers-color-scheme: dark)" srcset={fallbackDark} />{/if}
			<img
				src={fallback ?? fallbackDark}
				alt="Map of the approved public route"
				class="h-full w-full object-cover"
			/>
		</picture>
	{/if}
	<div
		bind:this={container}
		class="relative h-[24rem] w-full"
		aria-label="Interactive map of the approved public route"
	></div>
	{#if !token || failed}
		<p
			class="absolute bottom-3 left-3 bg-white/90 px-3 py-2 text-xs text-slate-700 dark:bg-black/90 dark:text-slate-200"
		>
			Interactive map unavailable. Showing the privacy-approved snapshot.
		</p>
	{/if}
</div>
