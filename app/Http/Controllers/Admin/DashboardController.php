<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\User;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        /*
        |--------------------------------------------------------------------------
        | Basic Variables
        |--------------------------------------------------------------------------
        */

        $apiKey = trim(
            (string) env('OMDB_API_KEY')
        );

        $apiUrl = 'https://www.omdbapi.com/';

        $movies = [];

        $genres = [];

        $totalMovies = 0;

        $apiError = null;


        /*
        |--------------------------------------------------------------------------
        | Get Movie Data From Cache
        |--------------------------------------------------------------------------
        |
        | Dashboard mengambil maksimal 10 film Batman.
        | Data disimpan di cache selama 10 menit.
        |
        */

        if (empty($apiKey)) {

            $apiError =
                'OMDB_API_KEY belum ditemukan di file .env';

        } else {

            try {

                $cachedMovieData = Cache::remember(
                    'dashboard_movies_batman',
                    now()->addMinutes(2),

                    function () use (
                        $apiKey,
                        $apiUrl
                    ) {

                        /*
                        |--------------------------------------------------------------------------
                        | Search OMDb
                        |--------------------------------------------------------------------------
                        */

                        $response = Http::connectTimeout(2)
                            ->timeout(2)
                            ->get(
                                $apiUrl,
                                [
                                    'apikey' => $apiKey,
                                    's' => 'Batman',
                                    'type' => 'movie',
                                    'page' => 1,
                                ]
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | HTTP ERROR
                        |--------------------------------------------------------------------------
                        */

                        if (!$response->successful()) {

                            return [
                                'movies' => [],
                                'genres' => [],
                                'totalMovies' => 0,
                                'error' =>
                                    'OMDb HTTP Error: ' .
                                    $response->status(),
                            ];
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | JSON
                        |--------------------------------------------------------------------------
                        */

                        $data = $response->json();


                        /*
                        |--------------------------------------------------------------------------
                        | OMDb ERROR
                        |--------------------------------------------------------------------------
                        */

                        if (
                            isset($data['Response']) &&
                            $data['Response'] === 'False'
                        ) {

                            return [
                                'movies' => [],
                                'genres' => [],
                                'totalMovies' => 0,
                                'error' =>
                                    $data['Error']
                                    ??
                                    'OMDb mengembalikan error.',
                            ];
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | TOTAL MOVIES
                        |--------------------------------------------------------------------------
                        */

                        $totalMovies =
                            (int) (
                                $data['totalResults']
                                ?? 0
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | SEARCH RESULTS
                        |--------------------------------------------------------------------------
                        */

                        $searchResults =
                            $data['Search']
                            ?? [];


                        /*
                        |--------------------------------------------------------------------------
                        | Maximum 10 Movies
                        |--------------------------------------------------------------------------
                        */

                        $searchResults =
                            array_slice(
                                $searchResults,
                                0,
                                10
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | Build Basic Movie Data
                        |--------------------------------------------------------------------------
                        */

                        $movies = [];


                        foreach (
                            $searchResults as $movie
                        ) {

                            /*
                            |--------------------------------------------------------------------------
                            | Validate IMDb ID
                            |--------------------------------------------------------------------------
                            */

                            $imdbID =
                                $movie['imdbID']
                                ?? null;


                            if (empty($imdbID)) {
                                continue;
                            }


                            /*
                            |--------------------------------------------------------------------------
                            | Poster
                            |--------------------------------------------------------------------------
                            */

                            $poster =
                                $movie['Poster']
                                ?? null;


                            if (
                                !$poster ||
                                $poster === 'N/A'
                            ) {

                                $poster = null;
                            }


                            /*
                            |--------------------------------------------------------------------------
                            | Movie Data
                            |--------------------------------------------------------------------------
                            */

                            $movies[] = [

                                'imdbID' =>
                                    $imdbID,

                                'title' =>
                                    $movie['Title']
                                    ?? null,

                                'year' =>
                                    $movie['Year']
                                    ?? null,

                                'rated' =>
                                    'N/A',

                                'released' =>
                                    'N/A',

                                'runtime' =>
                                    'N/A',

                                'genre' =>
                                    'N/A',

                                'director' =>
                                    'N/A',

                                'writer' =>
                                    'N/A',

                                'actors' =>
                                    'N/A',

                                'plot' =>
                                    'N/A',

                                'language' =>
                                    'N/A',

                                'country' =>
                                    'N/A',

                                'awards' =>
                                    'N/A',

                                'image' =>
                                    $poster,

                                'ratings' =>
                                    [],

                                'metascore' =>
                                    'N/A',

                                'imdbRating' =>
                                    'N/A',

                                'imdbVotes' =>
                                    'N/A',

                                'type' =>
                                    $movie['Type']
                                    ?? 'movie',

                                'dvd' =>
                                    'N/A',

                                'boxOffice' =>
                                    'N/A',

                                'production' =>
                                    'N/A',

                                'website' =>
                                    'N/A',
                            ];
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | Get Detail Movie Data
                        |--------------------------------------------------------------------------
                        |
                        | Endpoint search OMDb tidak memberikan Genre
                        | dan IMDb Rating.
                        |
                        | Karena itu kita mengambil detail masing-masing
                        | film menggunakan IMDb ID.
                        |
                        */

                        if (!empty($movies)) {

                            $detailResponses =
                                Http::pool(
                                    function (Pool $pool) use (
                                        $movies,
                                        $apiKey,
                                        $apiUrl
                                    ) {

                                        $requests = [];

                                        foreach (
                                            $movies as $movie
                                        ) {

                                            $imdbID =
                                                $movie['imdbID'];

                                            $requests[$imdbID] =
                                                $pool
                                                    ->as($imdbID)
                                                    ->connectTimeout(2)
                                                    ->timeout(2)
                                                    ->get(
                                                        $apiUrl,
                                                        [
                                                            'apikey' =>
                                                                $apiKey,

                                                            'i' =>
                                                                $imdbID,

                                                            'plot' =>
                                                                'short',
                                                        ]
                                                    );
                                        }

                                        return $requests;
                                    }
                                );


                            /*
                            |--------------------------------------------------------------------------
                            | Genres Collection
                            |--------------------------------------------------------------------------
                            */

                            $genreCollection = [];


                            /*
                            |--------------------------------------------------------------------------
                            | Merge Detail Data
                            |--------------------------------------------------------------------------
                            */

                            foreach (
                                $movies as &$movie
                            ) {

                                $imdbID =
                                    $movie['imdbID'];


                                $detailResponse =
                                    $detailResponses[$imdbID]
                                    ?? null;


                                if (
                                    !$detailResponse ||
                                    !$detailResponse->successful()
                                ) {

                                    continue;
                                }


                                $detail =
                                    $detailResponse->json();


                                if (
                                    !is_array($detail) ||
                                    ($detail['Response'] ?? 'False') ===
                                        'False'
                                ) {

                                    continue;
                                }


                                /*
                                |--------------------------------------------------------------------------
                                | Genre
                                |--------------------------------------------------------------------------
                                */

                                $genre =
                                    $detail['Genre']
                                    ?? 'N/A';


                                if (
                                    !$genre ||
                                    $genre === 'N/A'
                                ) {

                                    $genre = 'N/A';

                                } else {

                                    $movieGenres =
                                        explode(
                                            ',',
                                            $genre
                                        );


                                    foreach (
                                        $movieGenres
                                        as $movieGenre
                                    ) {

                                        $movieGenre =
                                            trim(
                                                $movieGenre
                                            );


                                        if (
                                            $movieGenre !== ''
                                        ) {

                                            $genreCollection[] =
                                                $movieGenre;
                                        }
                                    }
                                }


                                /*
                                |--------------------------------------------------------------------------
                                | Update Movie Data
                                |--------------------------------------------------------------------------
                                */

                                $movie['rated'] =
                                    $detail['Rated']
                                    ?? 'N/A';

                                $movie['released'] =
                                    $detail['Released']
                                    ?? 'N/A';

                                $movie['runtime'] =
                                    $detail['Runtime']
                                    ?? 'N/A';

                                $movie['genre'] =
                                    $genre;

                                $movie['director'] =
                                    $detail['Director']
                                    ?? 'N/A';

                                $movie['writer'] =
                                    $detail['Writer']
                                    ?? 'N/A';

                                $movie['actors'] =
                                    $detail['Actors']
                                    ?? 'N/A';

                                $movie['plot'] =
                                    $detail['Plot']
                                    ?? 'N/A';

                                $movie['language'] =
                                    $detail['Language']
                                    ?? 'N/A';

                                $movie['country'] =
                                    $detail['Country']
                                    ?? 'N/A';

                                $movie['awards'] =
                                    $detail['Awards']
                                    ?? 'N/A';

                                $movie['metascore'] =
                                    $detail['Metascore']
                                    ?? 'N/A';

                                $movie['imdbRating'] =
                                    $detail['imdbRating']
                                    ?? 'N/A';

                                $movie['imdbVotes'] =
                                    $detail['imdbVotes']
                                    ?? 'N/A';

                                $movie['ratings'] =
                                    $detail['Ratings']
                                    ?? [];

                                $movie['dvd'] =
                                    $detail['DVD']
                                    ?? 'N/A';

                                $movie['boxOffice'] =
                                    $detail['BoxOffice']
                                    ?? 'N/A';

                                $movie['production'] =
                                    $detail['Production']
                                    ?? 'N/A';

                                $movie['website'] =
                                    $detail['Website']
                                    ?? 'N/A';


                                /*
                                |--------------------------------------------------------------------------
                                | Better Poster
                                |--------------------------------------------------------------------------
                                */

                                if (
                                    isset(
                                        $detail['Poster']
                                    ) &&
                                    $detail['Poster'] !==
                                        'N/A'
                                ) {

                                    $movie['image'] =
                                        $detail['Poster'];
                                }
                            }

                            unset($movie);


                            /*
                            |--------------------------------------------------------------------------
                            | Unique Genres
                            |--------------------------------------------------------------------------
                            */

                            $genres =
                                array_values(
                                    array_unique(
                                        $genreCollection
                                    )
                                );


                            /*
                            |--------------------------------------------------------------------------
                            | Sort Genres
                            |--------------------------------------------------------------------------
                            */

                            sort($genres);
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | Return Cached Data
                        |--------------------------------------------------------------------------
                        */

                        return [

                            'movies' =>
                                $movies,

                            'genres' =>
                                $genres,

                            'totalMovies' =>
                                $totalMovies,

                            'error' =>
                                empty($movies)
                                    ? 'OMDb berhasil diakses tetapi tidak ada film yang ditemukan.'
                                    : null,
                        ];
                    }
                );


                /*
                |--------------------------------------------------------------------------
                | Use Cached Data
                |--------------------------------------------------------------------------
                */

                $movies =
                    $cachedMovieData['movies']
                    ?? [];


                $genres =
                    $cachedMovieData['genres']
                    ?? [];


                $totalMovies =
                    $cachedMovieData['totalMovies']
                    ?? 0;


                $apiError =
                    $cachedMovieData['error']
                    ?? null;


            } catch (\Throwable $e) {

                /*
                |--------------------------------------------------------------------------
                | OMDb Exception
                |--------------------------------------------------------------------------
                */

                $apiError =
                    'Gagal menghubungi OMDb: ' .
                    $e->getMessage();


                $movies = [];

                $genres = [];

                $totalMovies = 0;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Favorite Data
        |--------------------------------------------------------------------------
        */

        $favoriteIds = [];

        $totalFavorites = 0;


        try {

            /*
            |--------------------------------------------------------------------------
            | Get Favorite IDs
            |--------------------------------------------------------------------------
            */

            $favoriteIds =
                Favorite::pluck(
                    'imdb_id'
                )
                ->map(
                    fn ($id) =>
                        (string) $id
                )
                ->toArray();


            /*
            |--------------------------------------------------------------------------
            | Total Favorites
            |--------------------------------------------------------------------------
            */

            $totalFavorites =
                Favorite::count();


        } catch (\Throwable $e) {

            $favoriteIds = [];

            $totalFavorites = 0;
        }


        /*
        |--------------------------------------------------------------------------
        | Total Registered Users
        |--------------------------------------------------------------------------
        |
        | Mengambil jumlah user yang benar-benar
        | terdaftar di tabel users.
        |
        */

        try {

            $totalUsers =
                User::count();

        } catch (\Throwable $e) {

            $totalUsers = 0;
        }


        /*
        |--------------------------------------------------------------------------
        | Send Data To Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Dashboard/Index',
            [

                /*
                |--------------------------------------------------------------------------
                | Movie Data
                |--------------------------------------------------------------------------
                */

                'movies' =>
                    $movies,


                /*
                |--------------------------------------------------------------------------
                | Genre Data
                |--------------------------------------------------------------------------
                */

                'genres' =>
                    $genres,


                /*
                |--------------------------------------------------------------------------
                | Total Movies
                |--------------------------------------------------------------------------
                */

                'totalMovies' =>
                    $totalMovies,


                /*
                |--------------------------------------------------------------------------
                | Total Favorites
                |--------------------------------------------------------------------------
                */

                'totalFavorites' =>
                    $totalFavorites,


                /*
                |--------------------------------------------------------------------------
                | Favorite IMDb IDs
                |--------------------------------------------------------------------------
                */

                'favoriteIds' =>
                    $favoriteIds,


                /*
                |--------------------------------------------------------------------------
                | Total Users
                |--------------------------------------------------------------------------
                */

                'totalUsers' =>
                    $totalUsers,


                /*
                |--------------------------------------------------------------------------
                | API Error
                |--------------------------------------------------------------------------
                */

                'apiError' =>
                    $apiError,
            ]
        );
    }
}