<script lang="ts">
	import { onMount } from 'svelte';
	import { routePositionAt } from './routeHover';
	import type { Photo, RoutePoint } from './types';

	let {
		segments,
		photos = [],
		token,
		fallback,
		fallbackDark,
		hoverPosition
	}: {
		segments: RoutePoint[][];
		photos?: Photo[];
		token?: string;
		fallback?: string;
		fallbackDark?: string;
		hoverPosition?: number;
	} = $props();
	let container: HTMLDivElement;
	let inlineHost: HTMLDivElement;
	let mapShell: HTMLDivElement;
	let dialog: HTMLDialogElement;
	let sizeButton: HTMLButtonElement;
	const mapId = $props.id();
	let expanded = $state(false);
	let failed = $state(false);
	let updateHoverMarker = $state<((point: RoutePoint | undefined) => void) | undefined>();
	let hoverPoint = $derived(routePositionAt(segments, hoverPosition));
	$effect(() => {
		updateHoverMarker?.(hoverPoint);
	});
	const cameraGlyph = { 1: '/cyclone/map-camera.svg?v=2' };
	const checkeredFlagGlyph = { 1: '/cyclone/map-checkered-flag.svg?v=2' };
	const maximumOverlayPointCount = 500;

	function expandMap() {
		// Move the existing map into the top layer without resetting its camera or annotations.
		dialog.appendChild(mapShell);
		dialog.showModal();
		expanded = true;
		sizeButton.focus({ preventScroll: true });
	}

	function restoreMap() {
		inlineHost.appendChild(mapShell);
		expanded = false;
		sizeButton.focus({ preventScroll: true });
	}

	$effect(() => {
		if (!expanded) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	onMount(() => () => {
		// Restore Svelte's DOM ownership before the component is removed.
		inlineHost.appendChild(mapShell);
		dialog.close();
	});

	function chunkPolyline<T>(points: T[]) {
		if (points.length <= maximumOverlayPointCount) return points.length >= 2 ? [points] : [];
		const chunks: T[][] = [];
		for (let start = 0; start < points.length - 1; start += maximumOverlayPointCount - 1) {
			chunks.push(points.slice(start, start + maximumOverlayPointCount));
		}
		return chunks;
	}

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
				const routeCoordinates = segments.flatMap((segment) =>
					chunkPolyline(
						segment.map((point) => new mapkit.Coordinate(point.latitude, point.longitude))
					)
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
				let hoverAnnotation: any;
				updateHoverMarker = (point) => {
					if (!point) {
						if (hoverAnnotation) {
							map.removeAnnotation(hoverAnnotation);
							hoverAnnotation = undefined;
						}
						return;
					}
					const coordinate = new mapkit.Coordinate(point.latitude, point.longitude);
					if (!hoverAnnotation) {
						hoverAnnotation = new mapkit.Annotation(
							coordinate,
							() => {
								const dot = document.createElement('div');
								dot.setAttribute('aria-label', 'Position at graph cursor');
								dot.style.cssText =
									'width:16px;height:16px;border:3px solid white;border-radius:50%;background:#2563eb;box-shadow:0 0 0 2px #1e3a8a,0 2px 6px #0006;box-sizing:border-box;pointer-events:none';
								return dot;
							},
							{
								// MapKit anchors at the bottom center; center the 16px dot on its coordinate.
								anchorOffset: new DOMPoint(0, -8),
								enabled: false,
								animates: false,
								appearanceAnimation: '',
								displayPriority: 1000
							}
						);
						map.addAnnotation(hoverAnnotation);
					} else {
						hoverAnnotation.coordinate = coordinate;
						hoverAnnotation.visible = true;
					}
				};
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
			updateHoverMarker = undefined;
			map?.destroy?.();
			script.remove();
			delete (window as any)[callback];
		};
	});
</script>

<div bind:this={inlineHost} class="h-[24rem]">
	<div
		bind:this={mapShell}
		id={mapId}
		class="map-shell relative h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
		class:expanded
	>
		{#if fallback || fallbackDark}
			<picture class="absolute inset-0 block h-full w-full">
				{#if fallback}<source media="(prefers-color-scheme: light)" srcset={fallback} />{/if}
				<img
					src={fallbackDark ?? fallback}
					alt="Map of the approved public route"
					class="h-full w-full object-cover"
				/>
			</picture>
		{/if}
		<div
			bind:this={container}
			class="relative h-full w-full"
			aria-label="Interactive map of the approved public route"
		></div>
		<button
			bind:this={sizeButton}
			type="button"
			class="map-size-control"
			aria-label={expanded ? 'Collapse map' : 'Expand map'}
			title={expanded ? 'Collapse map (Escape)' : 'Expand map'}
			aria-expanded={expanded}
			aria-controls={mapId}
			onclick={() => (expanded ? dialog.close() : expandMap())}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				{#if expanded}
					<!-- arrow.down.right.and.arrow.up.left -->
					<path d="M4 4l6 6m-6 0h6V4m10 16l-6-6m6 0h-6v6" />
				{:else}
					<!-- arrow.up.left.and.arrow.down.right -->
					<path d="M10 10L4 4m0 6V4h6m4 10l6 6m0-6v6h-6" />
				{/if}
			</svg>
		</button>
		{#if !token || failed}
			<p
				class="absolute bottom-3 left-3 bg-white/90 px-3 py-2 text-xs text-slate-700 dark:bg-black/90 dark:text-slate-200"
			>
				Interactive map unavailable. Showing the privacy-approved snapshot.
			</p>
		{/if}
	</div>
</div>

<dialog
	bind:this={dialog}
	class="m-0 h-dvh w-dvw max-h-none max-w-none overflow-hidden border-0 bg-slate-100 p-0 dark:bg-slate-900 backdrop:bg-black/80"
	aria-label="Full-screen route map"
	onclose={restoreMap}
></dialog>

<style>
	.map-shell {
		border-block: 1px solid light-dark(#e2e8f0, #1e293b);
		color-scheme: light dark;
	}

	.map-shell.expanded {
		border: 0;
	}

	.map-size-control {
		position: absolute;
		top: max(10px, env(safe-area-inset-top));
		left: max(10px, env(safe-area-inset-left));
		display: grid;
		place-items: center;
		width: 44px;
		height: 24px;
		padding: 0;
		border: 0;
		border-radius: 6px;
		background: light-dark(rgb(255 255 255 / 90%), rgb(30 30 30 / 90%));
		color: light-dark(#0d9488, #a1a1a6);
		box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
		backdrop-filter: blur(20px);
		cursor: pointer;
	}

	/* Keep a 44px touch target around MapKit's compact, 24px-high control face. */
	.map-size-control::before {
		content: '';
		position: absolute;
		inset: -10px 0;
	}

	@media (hover: hover) {
		.map-size-control:hover {
			background: light-dark(#fff, #363636);
		}
	}

	.map-size-control:active {
		background: light-dark(#e8e8ed, #454545);
	}

	.map-size-control:focus-visible {
		outline: 2px solid #0d9488;
		outline-offset: 2px;
	}
</style>
