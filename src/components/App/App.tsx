import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { SearchBar } from '../SearchBar/SearchBar';
import { MovieGrid } from '../MovieGrid/MovieGrid';
import { Loader } from '../Loader/Loader';
import Pagination from '../Pagination/Pagination';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { MovieModal } from '../MovieModal/MovieModal';
import { fetchMovies } from '../../services/movieService';
import type { Movie } from '../../types/movie';
import { keepPreviousData, useQuery } from '@tanstack/react-query';


export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['movies', searchQuery, page],
    queryFn: () => fetchMovies(searchQuery, page),
    enabled: searchQuery !== '', 
    placeholderData: keepPreviousData, // Сучасний аналог keepPreviousData у v5
  });
    useEffect(() => {
    if (data && data.results && data.results.length === 0) {
      toast.error('No movies found for your request.');
    }
  }, [data]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setPage(1); 
  };

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;

  return (
    <>
      <SearchBar onSubmit={handleSearch} />
       {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
      {(isLoading || isFetching) && <Loader />}
      {isError && <ErrorMessage />}
      
      {movies.length > 0 && !isLoading && (
        <MovieGrid movies={movies} onSelect={setSelectedMovie} />
      )}

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
      
      <Toaster position="top-right" />
    </>
  );
}