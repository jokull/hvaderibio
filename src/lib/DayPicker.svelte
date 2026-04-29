<script lang="ts">
  import { AVAILABLE_DAYS, get_day_label } from "$lib/day-picker";

  type Props = {
    selected_day: string;
    onSelect: (day: string) => void;
    days?: string[];
    containerClass?: string;
    buttonClass?: string;
  };

  const { selected_day, onSelect, days = AVAILABLE_DAYS, containerClass = "", buttonClass = "py-1.5" }: Props = $props();

  let day_buttons: HTMLButtonElement[] = $state([]);
  let slider_style = $state("width: 0; left: 0; opacity: 0;");
  let slider_animated = $state(false);

  $effect(() => {
    const idx = days.indexOf(selected_day);
    const btn = day_buttons[idx];
    if (btn) {
      slider_style = `width: ${btn.offsetWidth}px; left: ${btn.offsetLeft}px; opacity: 1;`;
      if (!slider_animated) {
        requestAnimationFrame(() => {
          slider_animated = true;
        });
      }
    }
  });
</script>

<div
  class="relative flex items-center overflow-hidden rounded-full border border-white/10 bg-neutral-950/65 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_22px_rgba(0,0,0,0.3)] backdrop-blur-xl {containerClass}">
  <div
    class="absolute h-[calc(100%-6px)] rounded-full border border-sky-200/20 bg-sky-500/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_10px_rgba(14,165,233,0.22)] backdrop-blur-md {slider_animated
      ? 'transition-all duration-300 ease-out'
      : ''}"
    style={slider_style}>
  </div>
  {#each days as day, i (day)}
    <button
      bind:this={day_buttons[i]}
      type="button"
      onclick={() => onSelect(day)}
      class="relative z-10 rounded-full px-2.5 text-[13px] leading-4 font-medium transition-colors duration-200 {buttonClass} {selected_day ===
      day
        ? 'text-white'
        : 'text-neutral-400 hover:text-neutral-200'}">
      {get_day_label(day)}
    </button>
  {/each}
</div>
