<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { v4 as uuid } from 'uuid';


  interface Props {
    label?: any;
    hint?: any;
    rows?: number;
    value?: string;
  }

  let {
    label = undefined,
    hint = undefined,
    rows = 6,
    value = $bindable('')
  }: Props = $props();

  const dispatch = createEventDispatcher();
  const onFocus = () => dispatch('focus');

  const labelId = uuid();
</script>

<form class="my-2 w-full">
  <label for={labelId}>
    {label}
    <textarea
      id={labelId}
      bind:value
      onfocus={onFocus}
      class="w-full rounded-md focus:ring-teal-500 focus:ring-2 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 p-2"
      {rows}
></textarea>
  </label>
  {#if hint} <p class="text-sm text-slate-400">{hint}</p>{/if}
</form>
