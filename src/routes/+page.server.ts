import { get_cinema_options } from "$lib/cinemas";
import { readMovies } from "$lib/movies";

export const load = async () => {
  const { movies } = await readMovies();

  const cinema_options = get_cinema_options(movies);

  return {
    movies,
    cinema_options,
  };
};
