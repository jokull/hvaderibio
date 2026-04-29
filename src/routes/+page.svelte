<script lang="ts">
  import { resolve } from "$app/paths";
  import { goto } from "$app/navigation";

  import { in_range, to_float } from "$lib/util";
  import type { Movie, Showtime } from "$lib/schemas";
  import { DEFAULT_CINEMA_CHOICE, get_cinemas_for_choice, cinemaState } from "$lib/cinema-state.svelte";
  import { dayState } from "$lib/day-state.svelte";
  import DayPicker from "$lib/DayPicker.svelte";

  const { data } = $props();
  const movies = $derived(data.movies);
  const cinema_options = $derived(data.cinema_options);

  // Handle touch events to bypass iOS Safari tap issues
  let touchStartY = 0;

  const createTouchHandlers = (href: string) => ({
    handleTouchStart: (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    },
    handleTouchEnd: (e: TouchEvent) => {
      // Only navigate if it wasn't a scroll (touch moved less than 10px)
      const touchEndY = e.changedTouches[0].clientY;
      if (Math.abs(touchEndY - touchStartY) < 10) {
        e.preventDefault();
        // @ts-expect-error - Dynamic route navigation
        goto(resolve(href));
      }
    },
    handleClick: () => {
      // Fallback for non-touch devices
      // @ts-expect-error - Dynamic route navigation
      goto(resolve(href));
    },
  });

  const to = $state(24);
  const from = $derived(Math.min(21, new Date().getHours()));

  // Read cinema and day from shared state
  const selected_choice = $derived(cinemaState.value ?? DEFAULT_CINEMA_CHOICE);
  const selected_cinemas = $derived(get_cinemas_for_choice(selected_choice, cinema_options));
  const selected_day = $derived(dayState.value ?? "0");

  const updateCinema = (choiceLabel: string) => {
    cinemaState.set(choiceLabel);
  };

  const updateDay = (day: string) => {
    dayState.set(day);
  };

  const handleSelectChange = (event: Event & { currentTarget: HTMLSelectElement }) => {
    updateCinema(event.currentTarget.value);
  };

  let filtered_cinemas_showtimes = $derived(
    movies
      .filter((movie) => {
        const day_showtimes = movie.showtimes_by_day[selected_day] ?? {};
        const totalValidShowtimes = Object.entries(day_showtimes)
          .filter(([cinema]) => selected_cinemas.includes(cinema))
          .reduce((total, [, times]) => {
            // Only filter by time for today
            if (selected_day === "0") {
              const validTimes = (times as Showtime[]).filter(({ time }) => time && in_range(to_float(time), from, to));
              return total + validTimes.length;
            }
            return total + (times as Showtime[]).length;
          }, 0);
        return totalValidShowtimes > 0;
      })
      .sort((a, b) => {
        const getTotalValidShowtimes = (movie: Movie) => {
          const day_showtimes = movie.showtimes_by_day[selected_day] ?? {};
          return Object.entries(day_showtimes)
            .filter(([cinema]) => selected_cinemas.includes(cinema))
            .reduce((total, [, times]) => {
              if (selected_day === "0") {
                const validTimes = (times as Showtime[]).filter(({ time }) => time && in_range(to_float(time), from, to));
                return total + validTimes.length;
              }
              return total + (times as Showtime[]).length;
            }, 0);
        };
        return getTotalValidShowtimes(b) - getTotalValidShowtimes(a);
      })
  );
</script>

<svelte:head>
  <title>Hvað er í bíó? - Bíódagskrá kvöldsins</title>
  <meta name="description" content="Fljótlegt yfirlit yfir bíódagskrá kvöldsins á öllu landinu. Skoðaðu sýningartíma og bókaðu miða." />
</svelte:head>

<header class="relative hidden sm:mt-8 sm:mb-5 sm:block">
  <h1 class="mb-3 text-center text-5xl tracking-tight text-pretty text-white" style="font-family: 'Space Grotesk', sans-serif;">
    Hvað er í bíó?
  </h1>
  <div class="mx-auto sm:block md:max-w-none">
    <!-- Cinema selection -->
    <div class="mb-3 flex flex-nowrap justify-center gap-1.5 overflow-x-auto px-2 md:gap-2">
      {#each cinema_options as [label] (label)}
        <button
          type="button"
          onclick={() => updateCinema(label)}
          class={`shrink-0 rounded-xl border px-3.5 py-1.5 text-[15px] leading-5 font-medium whitespace-nowrap transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900
                    ${
                      label === selected_choice
                        ? "border-sky-300/50 bg-neutral-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_1px_rgba(125,211,252,0.28),0_0_18px_rgba(56,189,248,0.14),0_8px_24px_rgba(0,0,0,0.35)]"
                        : "border-transparent bg-neutral-800/60 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                    }
                  `}>
          {label}
        </button>
      {/each}
    </div>
    <!-- Day selection -->
    <div class="flex justify-center">
      <DayPicker {selected_day} onSelect={updateDay} />
    </div>
  </div>
</header>

<header class="relative">
  <div class="fixed inset-x-0 bottom-0 z-40 flex w-full justify-center px-4 pb-3 sm:hidden">
    <div class="flex flex-col items-center gap-2">
      <!-- Cinema dropdown -->
      <div class="flex justify-center">
        <div class="relative">
          <select
            value={selected_choice}
            onchange={handleSelectChange}
            id="select-cinemas-mobile"
            name="select cinemas mobile"
            aria-label="Veldu kvikmyndahús"
            class="appearance-none rounded-full border border-white/10 bg-black/70 py-1 pr-8 pl-8 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_14px_rgba(0,0,0,0.26)] focus:border-sky-300/40 focus:ring-2 focus:ring-sky-300/15 focus:outline-none">
            {#each cinema_options as [label] (label)}
              <option
                value={label}
                id={`option-${label}`}
                aria-label={label}
                selected={label === selected_choice}
                class="bg-neutral-800 text-center text-white">
                {label}
              </option>
            {/each}
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              class="h-4 w-4 text-neutral-300/80"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <!-- Day pills -->
      <div class="flex justify-center">
        <DayPicker {selected_day} onSelect={updateDay} buttonClass="py-1.25" />
      </div>
    </div>
  </div>
</header>

{#if filtered_cinemas_showtimes.length === 0}
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <p class="text-lg text-neutral-400">Engar sýningar fundust</p>
    <p class="mt-1 text-sm text-neutral-500">Prófaðu að velja annan dag eða kvikmyndahús</p>
  </div>
{:else}
  <div
    class="md:md-30 -mx-1 mb-24 grid grid-cols-[repeat(auto-fill,minmax(min(9rem,100%),2fr))] gap-4 sm:mx-0 sm:mb-8 sm:grid-cols-[repeat(auto-fill,minmax(min(20rem,100%),2fr))] sm:gap-6 sm:pt-2">
    {#each filtered_cinemas_showtimes as movie, index (movie.id)}
      {@const handlers = createTouchHandlers(`/movie/${movie.id}`)}
      <div
        role="button"
        tabindex="0"
        data-movie-id={movie.id}
        ontouchstart={handlers.handleTouchStart}
        ontouchend={handlers.handleTouchEnd}
        onclick={handlers.handleClick}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && handlers.handleClick()}
        class="group block aspect-2/3 w-full touch-manipulation overflow-visible rounded-lg bg-neutral-900 [@media(hover:hover)]:hover:z-50"
        style="cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; -webkit-user-select: none;">
        <picture>
          <source
            type="image/webp"
            srcset="/{movie.id}-360w.webp 360w, /{movie.id}.webp 720w, /{movie.id}-1080w.webp 1080w"
            sizes="(max-width: 640px) calc(50vw - 2rem), 360px" />
          <img
            src="/{movie.id}.webp"
            alt={movie.title}
            title={movie.title}
            fetchpriority={index < 4 ? "high" : "auto"}
            loading="eager"
            decoding="async"
            width="720"
            height="1080"
            style:view-transition-name="poster-{movie.id}"
            class="shadow-5xl pointer-events-none h-full w-full rounded-lg object-fill [@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-300 [@media(hover:hover)]:ease-out [@media(hover:hover)]:group-hover:scale-[1.02]" />
        </picture>
      </div>
    {/each}
  </div>
{/if}
