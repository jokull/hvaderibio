<script lang="ts">
  import type { CinemaOption } from "$lib/cinemas";

  type Props = {
    cinemaOptions: readonly CinemaOption[];
    selectedChoice: string;
    onSelect: (choice: string) => void;
  };

  const { cinemaOptions, selectedChoice, onSelect }: Props = $props();
</script>

<div class="mb-3 flex flex-nowrap justify-center gap-1.5 overflow-x-auto px-2 md:gap-2">
  {#each cinemaOptions as [label] (label)}
    <button
      type="button"
      onclick={() => onSelect(label)}
      class={`shrink-0 rounded-xl border px-3.5 py-1.5 text-[15px] leading-5 font-medium whitespace-nowrap transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900
                    ${
                      label === selectedChoice
                        ? "border-sky-300/50 bg-neutral-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_1px_rgba(125,211,252,0.28),0_0_18px_rgba(56,189,248,0.14),0_8px_24px_rgba(0,0,0,0.35)]"
                        : "border-transparent bg-neutral-800/60 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                    }
                  `}>
      {label}
    </button>
  {/each}
</div>
