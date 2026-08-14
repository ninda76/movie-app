<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class MovieController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Movie List
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        |
        | Kalau user belum melakukan pencarian:
        | DEFAULT = Batman
        |
        | Tetapi nilai textbox di frontend tetap kosong.
        |
        */

        $search = trim(
            (string) $request->input('search', '')
        );

        if ($search === '') {
            $search = 'Batman';
        }


        /*
        |--------------------------------------------------------------------------
        | PAGE
        |--------------------------------------------------------------------------
        */

        $page = (int) $request->input('page', 1);

        if ($page < 1) {
            $page = 1;
        }

        /*
        |--------------------------------------------------------------------------
        | Maksimal page OMDb
        |--------------------------------------------------------------------------
        */

        if ($page > 100) {
            $page = 100;
        }


        /*
        |--------------------------------------------------------------------------
        | API KEY
        |--------------------------------------------------------------------------
        */

        $apiKey = env('OMDB_API_KEY');


        /*
        |--------------------------------------------------------------------------
        | Cek API Key
        |--------------------------------------------------------------------------
        */

        if (!$apiKey) {
            return Inertia::render(
                'Movie/Index',
                [
                    'movies' => [],
                    'search' => $search,
                    'currentPage' => $page,
                    'totalResults' => 0,
                    'totalPages' => 0,
                    'favoriteIds' => Favorite::pluck(
                        'imdb_id'
                    )->toArray(),
                    'apiError' =>
                        'OMDB_API_KEY belum ditemukan di file .env',
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Cache Search
        |--------------------------------------------------------------------------
        |
        | Cache 30 menit supaya halaman tidak selalu request ke OMDb.
        |
        */

        $cacheKey =
            'omdb_search_' .
            md5(
                strtolower($search) .
                '_page_' .
                $page
            );


        try {

            $searchResponse = Cache::remember(
                $cacheKey,
                now()->addMinutes(2),
                function () use (
                    $apiKey,
                    $search,
                    $page
                ) {

                    return Http::timeout(2)
                        ->retry(
                            2,
                            300
                        )
                        ->acceptJson()
                        ->get(
                            'https://www.omdbapi.com/',
                            [
                                'apikey' => $apiKey,
                                's' => $search,
                                'page' => $page,
                                'type' => 'movie',
                            ]
                        )
                        ->json();
                }
            );


            /*
            |--------------------------------------------------------------------------
            | Cek response OMDb
            |--------------------------------------------------------------------------
            */

            if (
                !is_array($searchResponse)
            ) {
                throw new \Exception(
                    'Response OMDb tidak valid.'
                );
            }


            /*
            |--------------------------------------------------------------------------
            | OMDb ERROR
            |--------------------------------------------------------------------------
            */

            if (
                isset(
                    $searchResponse['Response']
                ) &&
                $searchResponse['Response'] === 'False'
            ) {

                return Inertia::render(
                    'Movie/Index',
                    [
                        'movies' => [],
                        'search' => $search,
                        'currentPage' => $page,
                        'totalResults' => 0,
                        'totalPages' => 0,
                        'favoriteIds' =>
                            Favorite::pluck(
                                'imdb_id'
                            )->toArray(),
                        'apiError' =>
                            $searchResponse['Error']
                            ??
                            'Movie tidak ditemukan.',
                    ]
                );
            }


            /*
            |--------------------------------------------------------------------------
            | SEARCH RESULT
            |--------------------------------------------------------------------------
            */

            $searchResults =
                $searchResponse['Search']
                ?? [];


            /*
            |--------------------------------------------------------------------------
            | TOTAL RESULT
            |--------------------------------------------------------------------------
            */

            $totalResults =
                (int) (
                    $searchResponse['totalResults']
                    ?? 0
                );


            /*
            |--------------------------------------------------------------------------
            | Total Pages
            |--------------------------------------------------------------------------
            |
            | OMDb maksimal 10 movie per halaman.
            |
            */

            $totalPages = (int) ceil(
                $totalResults / 10
            );


            /*
            |--------------------------------------------------------------------------
            | Kalau tidak ada hasil
            |--------------------------------------------------------------------------
            */

            if (
                empty($searchResults)
            ) {

                return Inertia::render(
                    'Movie/Index',
                    [
                        'movies' => [],
                        'search' => $search,
                        'currentPage' => $page,
                        'totalResults' => $totalResults,
                        'totalPages' => $totalPages,
                        'favoriteIds' =>
                            Favorite::pluck(
                                'imdb_id'
                            )->toArray(),
                        'apiError' => null,
                    ]
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Ambil IMDb ID
            |--------------------------------------------------------------------------
            */

            $imdbIds = collect(
                $searchResults
            )
                ->pluck('imdbID')
                ->filter()
                ->values()
                ->all();


            /*
            |--------------------------------------------------------------------------
            | Ambil DETAIL secara PARALLEL
            |--------------------------------------------------------------------------
            |
            | Ini penting untuk menghindari loading lama.
            |
            | Kita tidak melakukan:
            |
            | movie 1 -> tunggu
            | movie 2 -> tunggu
            | movie 3 -> tunggu
            |
            | Tetapi request detail dilakukan bersamaan.
            |
            */

            $details = [];

            /*
            |--------------------------------------------------------------------------
            | Ambil dari cache terlebih dahulu
            |--------------------------------------------------------------------------
            */

            $idsNeedRequest = [];

            foreach ($imdbIds as $imdbID) {

                $detailCacheKey =
                    'omdb_detail_' .
                    $imdbID;

                $cachedDetail =
                    Cache::get(
                        $detailCacheKey
                    );

                if (
                    is_array(
                        $cachedDetail
                    )
                ) {

                    $details[$imdbID] =
                        $cachedDetail;

                } else {

                    $idsNeedRequest[] =
                        $imdbID;
                }
            }


            /*
            |--------------------------------------------------------------------------
            | Request detail yang belum ada cache
            |--------------------------------------------------------------------------
            */

            if (
                !empty($idsNeedRequest)
            ) {

                $responses =
                    Http::pool(
                        function ($pool) use (
                            $idsNeedRequest,
                            $apiKey
                        ) {

                            $requests = [];

                            foreach (
                                $idsNeedRequest
                                as $imdbID
                            ) {

                                $requests[$imdbID] =
                                    $pool
                                        ->as($imdbID)
                                        ->timeout(2)
                                        ->retry(
                                            1,
                                            200
                                        )
                                        ->acceptJson()
                                        ->get(
                                            'https://www.omdbapi.com/',
                                            [
                                                'apikey' =>
                                                    $apiKey,

                                                'i' =>
                                                    $imdbID,

                                                'plot' =>
                                                    'full',
                                            ]
                                        );
                            }

                            return $requests;
                        }
                    );


                foreach (
                    $idsNeedRequest
                    as $imdbID
                ) {

                    try {

                        $response =
                            $responses[$imdbID]
                            ?? null;


                        if (
                            $response &&
                            $response->successful()
                        ) {

                            $detail =
                                $response->json();


                            if (
                                is_array(
                                    $detail
                                ) &&
                                (
                                    $detail['Response']
                                    ?? 'False'
                                ) === 'True'
                            ) {

                                $details[
                                    $imdbID
                                ] = $detail;


                                Cache::put(
                                    'omdb_detail_' .
                                    $imdbID,
                                    $detail,
                                    now()->addMinutes(
                                        30
                                    )
                                );
                            }
                        }

                    } catch (
                        \Throwable $e
                    ) {

                        /*
                        |--------------------------------------------------------------------------
                        | Kalau detail gagal,
                        | movie tetap ditampilkan.
                        |--------------------------------------------------------------------------
                        */

                        $details[
                            $imdbID
                        ] = [];
                    }
                }
            }


            /*
            |--------------------------------------------------------------------------
            | FORMAT MOVIES
            |--------------------------------------------------------------------------
            */

            $movies = [];


            foreach (
                $searchResults
                as $movie
            ) {

                $imdbID =
                    $movie['imdbID']
                    ?? null;


                if (!$imdbID) {
                    continue;
                }


                $detail =
                    $details[$imdbID]
                    ?? [];


                /*
                |--------------------------------------------------------------------------
                | Poster
                |--------------------------------------------------------------------------
                */

                $poster =
                    $detail['Poster']
                    ?? $movie['Poster']
                    ?? null;


                if (
                    $poster === 'N/A'
                ) {
                    $poster = null;
                }


                /*
                |--------------------------------------------------------------------------
                | Rating
                |--------------------------------------------------------------------------
                */

                $rating =
                    $detail['imdbRating']
                    ?? null;


                if (
                    !$rating ||
                    $rating === 'N/A'
                ) {

                    $rating = 'N/A';
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
                }


                /*
                |--------------------------------------------------------------------------
                | Movie object
                |--------------------------------------------------------------------------
                */

                $movies[] = [

                    'imdbID' =>
                        $imdbID,

                    'title' =>
                        $detail['Title']
                        ?? $movie['Title']
                        ?? 'Unknown Movie',

                    'year' =>
                        $detail['Year']
                        ?? $movie['Year']
                        ?? 'N/A',

                    'type' =>
                        $detail['Type']
                        ?? $movie['Type']
                        ?? 'movie',

                    'image' =>
                        $poster,

                    'poster' =>
                        $poster,

                    'genre' =>
                        $genre,

                    'imdbRating' =>
                        $rating,

                    'rated' =>
                        $detail['Rated']
                        ?? 'N/A',

                    'released' =>
                        $detail['Released']
                        ?? 'N/A',

                    'runtime' =>
                        $detail['Runtime']
                        ?? 'N/A',

                    'director' =>
                        $detail['Director']
                        ?? 'N/A',

                    'writer' =>
                        $detail['Writer']
                        ?? 'N/A',

                    'actors' =>
                        $detail['Actors']
                        ?? 'N/A',

                    'plot' =>
                        $detail['Plot']
                        ?? 'N/A',

                    'language' =>
                        $detail['Language']
                        ?? 'N/A',

                    'country' =>
                        $detail['Country']
                        ?? 'N/A',

                    'awards' =>
                        $detail['Awards']
                        ?? 'N/A',

                    'imdbVotes' =>
                        $detail['imdbVotes']
                        ?? 'N/A',

                    'metascore' =>
                        $detail['Metascore']
                        ?? 'N/A',

                    'boxOffice' =>
                        $detail['BoxOffice']
                        ?? 'N/A',

                    'ratings' =>
                        $detail['Ratings']
                        ?? [],
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | FAVORITE IDS
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
                ->values()
                ->toArray();


            /*
            |--------------------------------------------------------------------------
            | RETURN INERTIA
            |--------------------------------------------------------------------------
            */

            return Inertia::render(
                'Movie/Index',
                [
                    'movies' =>
                        $movies,

                    'search' =>
                        $search,

                    'currentPage' =>
                        $page,

                    'totalResults' =>
                        $totalResults,

                    'totalPages' =>
                        $totalPages,

                    'favoriteIds' =>
                        $favoriteIds,

                    'apiError' =>
                        null,
                ]
            );

        } catch (
            \Throwable $e
        ) {

            /*
            |--------------------------------------------------------------------------
            | ERROR
            |--------------------------------------------------------------------------
            */

            return Inertia::render(
                'Movie/Index',
                [
                    'movies' => [],

                    'search' =>
                        $search,

                    'currentPage' =>
                        $page,

                    'totalResults' =>
                        0,

                    'totalPages' =>
                        0,

                    'favoriteIds' =>
                        Favorite::pluck(
                            'imdb_id'
                        )->toArray(),

                    'apiError' =>
                        'Gagal mengambil data movie dari OMDb API: ' .
                        $e->getMessage(),
                ]
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | MOVIE DETAIL
    |--------------------------------------------------------------------------
    */

    public function show($imdbID)
    {
        $apiKey =
            env('OMDB_API_KEY');


        if (!$apiKey) {

            return response()->json(
                [
                    'success' => false,
                    'message' =>
                        'OMDB_API_KEY belum ditemukan.',
                ],
                500
            );
        }


        $cacheKey =
            'omdb_detail_' .
            $imdbID;


        try {

            $movie =
                Cache::remember(
                    $cacheKey,
                    now()->addMinutes(2),
                    function () use (
                        $apiKey,
                        $imdbID
                    ) {

                        $response =
                            Http::timeout(2)
                                ->retry(
                                    2,
                                    300
                                )
                                ->acceptJson()
                                ->get(
                                    'https://www.omdbapi.com/',
                                    [
                                        'apikey' =>
                                            $apiKey,

                                        'i' =>
                                            $imdbID,

                                        'plot' =>
                                            'full',
                                    ]
                                );


                        if (
                            !$response->successful()
                        ) {

                            return null;
                        }


                        $data =
                            $response->json();


                        if (
                            !is_array(
                                $data
                            ) ||
                            (
                                $data['Response']
                                ?? 'False'
                            ) !== 'True'
                        ) {

                            return null;
                        }


                        return $data;
                    }
                );


            if (!$movie) {

                return response()->json(
                    [
                        'success' => false,
                        'message' =>
                            'Movie tidak ditemukan.',
                    ],
                    404
                );
            }


            return response()->json(
                [
                    'success' => true,
                    'movie' => [

                        'imdbID' =>
                            $movie['imdbID']
                            ?? $imdbID,

                        'title' =>
                            $movie['Title']
                            ?? 'Unknown Movie',

                        'year' =>
                            $movie['Year']
                            ?? 'N/A',

                        'image' =>
                            (
                                $movie['Poster']
                                ?? null
                            ) !== 'N/A'
                                ? (
                                    $movie['Poster']
                                    ?? null
                                )
                                : null,

                        'poster' =>
                            (
                                $movie['Poster']
                                ?? null
                            ) !== 'N/A'
                                ? (
                                    $movie['Poster']
                                    ?? null
                                )
                                : null,

                        'genre' =>
                            $movie['Genre']
                            ?? 'N/A',

                        'imdbRating' =>
                            $movie['imdbRating']
                            ?? 'N/A',

                        'rated' =>
                            $movie['Rated']
                            ?? 'N/A',

                        'released' =>
                            $movie['Released']
                            ?? 'N/A',

                        'runtime' =>
                            $movie['Runtime']
                            ?? 'N/A',

                        'director' =>
                            $movie['Director']
                            ?? 'N/A',

                        'writer' =>
                            $movie['Writer']
                            ?? 'N/A',

                        'actors' =>
                            $movie['Actors']
                            ?? 'N/A',

                        'plot' =>
                            $movie['Plot']
                            ?? 'N/A',

                        'language' =>
                            $movie['Language']
                            ?? 'N/A',

                        'country' =>
                            $movie['Country']
                            ?? 'N/A',

                        'awards' =>
                            $movie['Awards']
                            ?? 'N/A',

                        'imdbVotes' =>
                            $movie['imdbVotes']
                            ?? 'N/A',

                        'metascore' =>
                            $movie['Metascore']
                            ?? 'N/A',

                        'boxOffice' =>
                            $movie['BoxOffice']
                            ?? 'N/A',

                        'ratings' =>
                            $movie['Ratings']
                            ?? [],
                    ],
                ]
            );

        } catch (
            \Throwable $e
        ) {

            return response()->json(
                [
                    'success' => false,
                    'message' =>
                        'Gagal mengambil detail movie.',
                    'error' =>
                        $e->getMessage(),
                ],
                500
            );
        }
    }
}