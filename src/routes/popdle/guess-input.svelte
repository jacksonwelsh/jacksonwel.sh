<script lang="ts">
	import { run } from 'svelte/legacy';


	import Input from '$lib/input.svelte';
	import { HintState } from '.';
	import popdleState from '../../stores/popdle';
	import Hint from './hint.svelte';
	interface Props {
		disabled?: boolean;
		value?: string;
		hintState?: HintState;
	}

	let { disabled = false, value = $bindable(''), hintState = $bindable(HintState.UNKNOWN) }: Props = $props();

	let inputComponent: Input = $state();

	const getHintState = (value: string, disabled: boolean): HintState => {
		if (disabled && value === '') {
			return HintState.DISABLED;
		}

		if (!disabled) {
			return HintState.UNKNOWN;
		}

		const asInt = parseInt(value);

		const upperBound = $popdleState.population * (1 + $popdleState.tolerance);
		const lowerBound = $popdleState.population * (1 - $popdleState.tolerance);

		if (asInt >= lowerBound && asInt <= upperBound) {
			return HintState.CORRECT;
		}

		const wideUpperBound = $popdleState.population * (1 + $popdleState.wideTolerance);
		const wideLowerBound = $popdleState.population * (1 - $popdleState.wideTolerance);

		if (asInt >= wideLowerBound && asInt < $popdleState.population) {
			return HintState.LOW;
		}

		if (asInt <= wideUpperBound && asInt > $popdleState.population) {
			return HintState.HIGH;
		}

		if (asInt > $popdleState.population) {
			return HintState.VERY_HIGH;
		}

		return HintState.VERY_LOW;
	};

	run(() => {
		hintState = getHintState(value, disabled);
	});

	export const focusInput = () => {
		inputComponent?.focus();
	};
</script>

<div
	class="group ring-red-500 flex h-10 items-center justify-center mx-auto w-full sm:w-[32rem] rounded-md m-2"
>
	<Input
		bind:this={inputComponent}
		type="number"
		className="border-r-0! ring-0! dark:border-gray-700 focus:border-2 focus:border-teal-500 rounded-r-none m-0 w-full h-10 font-mono-thin"
		pattern="[0-9]+"
		bind:value
		{disabled}
	/>
	<Hint on:mousedown={() => focusInput()} state={hintState} />
</div>
