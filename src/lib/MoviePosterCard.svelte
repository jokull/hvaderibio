<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  import type { Movie } from "$lib/schemas";

  type Props = {
    movie: Movie;
    index: number;
  };

  const { movie, index }: Props = $props();
  const movieHref = $derived(resolve(`/movie/${movie.id}`));

  let touchStartY = 0;

  const handleTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const touchEndY = event.changedTouches[0].clientY;
    if (Math.abs(touchEndY - touchStartY) < 10) {
      event.preventDefault();
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      goto(movieHref);
    }
  };
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
  href={movieHref}
  data-movie-id={movie.id}
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
  class="group block aspect-2/3 w-full touch-manipulation overflow-visible rounded-lg bg-neutral-900 [@media(hover:hover)]:hover:z-50"
  style="-webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; -webkit-user-select: none;">
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
</a>
