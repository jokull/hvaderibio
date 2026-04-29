import type { Movie, Showtime } from "$lib/schemas";
import { in_range, to_float } from "$lib/util";

export const get_showtime_window = () => ({
  from: Math.min(21, new Date().getHours()),
  to: 24,
});

export const is_valid_showtime = (showtime: Showtime, selected_day: string, from: number, to: number) => {
  if (selected_day !== "0") return true;
  return Boolean(showtime.time && in_range(to_float(showtime.time), from, to));
};

export const get_valid_showtimes = (showtimes: readonly Showtime[], selected_day: string, from: number, to: number) =>
  showtimes.filter((showtime) => is_valid_showtime(showtime, selected_day, from, to));

export const count_movie_showtimes = (
  movie: Movie,
  selected_day: string,
  selected_cinemas: readonly string[],
  from: number,
  to: number
) => {
  const day_showtimes = movie.showtimes_by_day[selected_day] ?? {};

  return Object.entries(day_showtimes)
    .filter(([cinema]) => selected_cinemas.includes(cinema))
    .reduce((total, [, showtimes]) => total + get_valid_showtimes(showtimes, selected_day, from, to).length, 0);
};
