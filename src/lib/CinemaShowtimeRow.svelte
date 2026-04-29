<script lang="ts">
  import { CINEMA_URLS } from "$lib/constants";
  import type { Showtime } from "$lib/schemas";
  import ShowtimeBadges from "$lib/ShowtimeBadges.svelte";

  type Props = {
    cinema: string;
    showtimes: readonly Showtime[];
  };

  const { cinema, showtimes }: Props = $props();
  const cinemaUrl = $derived(CINEMA_URLS[cinema]);
</script>

<div
  class="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl md:p-4">
  <div class="mb-2 min-w-0 md:mb-3">
    {#if cinemaUrl}
      <a
        href={cinemaUrl}
        target="_blank"
        rel="external noopener noreferrer"
        class="text-sm font-semibold text-neutral-200 transition-colors hover:text-white hover:underline hover:decoration-neutral-500 hover:underline-offset-4">
        {cinema}
      </a>
    {:else}
      <span class="text-sm font-semibold text-neutral-200">{cinema}</span>
    {/if}
  </div>

  <div class="flex flex-wrap gap-2">
    {#each showtimes as showtime, i (`${showtime.time}-${i}`)}
      <a
        href={showtime.purchase_url}
        target="_blank"
        rel="external noopener noreferrer"
        class="relative rounded bg-neutral-800 px-2 py-1.5 text-sm text-neutral-400 tabular-nums transition-colors hover:bg-neutral-700 hover:text-white">
        <ShowtimeBadges {showtime} />
        {new Date(showtime.time).toLocaleTimeString("is-IS", { timeStyle: "short", hour12: false })}
      </a>
    {/each}
  </div>
</div>
