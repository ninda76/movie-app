<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Favorite List
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $favorites = Favorite::orderBy(
            'created_at',
            'desc'
        )->get();

        return Inertia::render(
            'Favorite/Index',
            [
                'favorites' => $favorites,

                'totalFavorites' =>
                    $favorites->count(),
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Add Favorite
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Validate
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'imdb_id' => [
                'required',
                'string',
                'max:20',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'year' => [
                'nullable',
                'string',
                'max:20',
            ],

            'genre' => [
                'nullable',
                'string',
                'max:255',
            ],

            'poster' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'imdb_rating' => [
                'nullable',
                'string',
                'max:20',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Check Existing Favorite
        |--------------------------------------------------------------------------
        */

        $favorite = Favorite::where(
            'imdb_id',
            $validated['imdb_id']
        )->first();


        /*
        |--------------------------------------------------------------------------
        | Already Favorite
        |--------------------------------------------------------------------------
        */

        if ($favorite) {

            /*
            |--------------------------------------------------------------------------
            | Update genre if empty
            |--------------------------------------------------------------------------
            */

            if (
                empty($favorite->genre) &&
                !empty($validated['genre'])
            ) {
                $favorite->genre =
                    $validated['genre'];
            }


            /*
            |--------------------------------------------------------------------------
            | Update rating if empty
            |--------------------------------------------------------------------------
            */

            if (
                empty($favorite->imdb_rating)
            ) {

                $rating =
                    $this->getMovieRating(
                        $validated['imdb_id'],
                        $validated['imdb_rating']
                            ?? null
                    );

                if ($rating !== null) {

                    $favorite->imdb_rating =
                        $rating;
                }
            }


            /*
            |--------------------------------------------------------------------------
            | Save Updated Favorite
            |--------------------------------------------------------------------------
            */

            $favorite->save();


            return response()->json([
                'success' => true,

                'message' =>
                    'Movie sudah ada di favorite.',

                'favorite' => true,

                'imdb_id' =>
                    $favorite->imdb_id,

                'imdb_rating' =>
                    $favorite->imdb_rating,

                'genre' =>
                    $favorite->genre,
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Get Rating
        |--------------------------------------------------------------------------
        */

        $imdbRating =
            $this->getMovieRating(
                $validated['imdb_id'],
                $validated['imdb_rating']
                    ?? null
            );


        /*
        |--------------------------------------------------------------------------
        | Get Genre from OMDb if frontend
        | does not send it
        |--------------------------------------------------------------------------
        */

        $genre =
            $validated['genre'] ?? null;


        if (empty($genre)) {

            $genre =
                $this->getMovieGenre(
                    $validated['imdb_id']
                );
        }


        /*
        |--------------------------------------------------------------------------
        | Create Favorite
        |--------------------------------------------------------------------------
        */

        $favorite = Favorite::create([
            'imdb_id' =>
                $validated['imdb_id'],

            'title' =>
                $validated['title'],

            'year' =>
                $validated['year'] ?? null,

            'genre' =>
                $genre,

            'poster' =>
                $validated['poster'] ?? null,

            'imdb_rating' =>
                $imdbRating,
        ]);


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Movie berhasil ditambahkan ke favorite.',

            'favorite' => true,

            'imdb_id' =>
                $favorite->imdb_id,

            'imdb_rating' =>
                $favorite->imdb_rating,

            'genre' =>
                $favorite->genre,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Get Movie Rating
    |--------------------------------------------------------------------------
    */

    private function getMovieRating(
        string $imdbID,
        ?string $frontendRating = null
    ): ?string {

        /*
        |--------------------------------------------------------------------------
        | Use frontend rating
        |--------------------------------------------------------------------------
        */

        if (
            !empty($frontendRating) &&
            $frontendRating !== 'N/A'
        ) {
            return $frontendRating;
        }


        /*
        |--------------------------------------------------------------------------
        | API Key
        |--------------------------------------------------------------------------
        */

        $apiKey = trim(
            (string) env('OMDB_API_KEY')
        );


        if (empty($apiKey)) {
            return null;
        }


        /*
        |--------------------------------------------------------------------------
        | Rating Cache
        |--------------------------------------------------------------------------
        */

        $cacheKey =
            'favorite_rating_' .
            $imdbID;


        /*
        |--------------------------------------------------------------------------
        | Check Cache
        |--------------------------------------------------------------------------
        */

        $cachedData =
            Cache::get($cacheKey);


        if (
            is_array($cachedData) &&
            isset(
                $cachedData['imdbRating']
            ) &&
            $cachedData['imdbRating'] !==
                'N/A'
        ) {

            return (string)
                $cachedData['imdbRating'];
        }


        /*
        |--------------------------------------------------------------------------
        | OMDb Request
        |--------------------------------------------------------------------------
        */

        try {

            $response =
                Http::connectTimeout(2)
                    ->timeout(5)
                    ->get(
                        'https://www.omdbapi.com/',
                        [
                            'apikey' =>
                                $apiKey,

                            'i' =>
                                $imdbID,

                            'plot' =>
                                'short',
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
                !isset(
                    $data['Response']
                ) ||
                $data['Response'] !== 'True'
            ) {
                return null;
            }


            /*
            |--------------------------------------------------------------------------
            | Cache
            |--------------------------------------------------------------------------
            */

            Cache::put(
                $cacheKey,
                $data,
                now()->addMinutes(2)
            );


            if (
                isset(
                    $data['imdbRating']
                ) &&
                $data['imdbRating'] !==
                    'N/A'
            ) {

                return (string)
                    $data['imdbRating'];
            }

        } catch (\Throwable $e) {

            return null;
        }


        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | Get Movie Genre
    |--------------------------------------------------------------------------
    */

    private function getMovieGenre(
        string $imdbID
    ): ?string {

        $apiKey = trim(
            (string) env('OMDB_API_KEY')
        );


        if (empty($apiKey)) {
            return null;
        }


        /*
        |--------------------------------------------------------------------------
        | Genre Cache
        |--------------------------------------------------------------------------
        */

        $cacheKey =
            'favorite_genre_' .
            $imdbID;


        /*
        |--------------------------------------------------------------------------
        | Check Cache
        |--------------------------------------------------------------------------
        */

        $cachedGenre =
            Cache::get($cacheKey);


        if (
            !empty($cachedGenre)
        ) {
            return $cachedGenre;
        }


        /*
        |--------------------------------------------------------------------------
        | OMDb Request
        |--------------------------------------------------------------------------
        */

        try {

            $response =
                Http::connectTimeout(2)
                    ->timeout(5)
                    ->get(
                        'https://www.omdbapi.com/',
                        [
                            'apikey' =>
                                $apiKey,

                            'i' =>
                                $imdbID,

                            'plot' =>
                                'short',
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
                !isset(
                    $data['Response']
                ) ||
                $data['Response'] !== 'True'
            ) {
                return null;
            }


            $genre =
                $data['Genre']
                ?? null;


            if (
                empty($genre) ||
                $genre === 'N/A'
            ) {
                return null;
            }


            /*
            |--------------------------------------------------------------------------
            | Cache Genre
            |--------------------------------------------------------------------------
            */

            Cache::put(
                $cacheKey,
                $genre,
                now()->addMinutes(30)
            );


            return $genre;

        } catch (\Throwable $e) {

            return null;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Remove Favorite
    |--------------------------------------------------------------------------
    */

    public function destroy(
        $imdb_id
    ) {

        $favorite =
            Favorite::where(
                'imdb_id',
                $imdb_id
            )->first();


        /*
        |--------------------------------------------------------------------------
        | Not Found
        |--------------------------------------------------------------------------
        */

        if (!$favorite) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Movie favorite tidak ditemukan.',

                'favorite' => false,

                'imdb_id' =>
                    $imdb_id,
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Delete
        |--------------------------------------------------------------------------
        */

        $favorite->delete();


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Movie berhasil dihapus dari favorite.',

            'favorite' => false,

            'imdb_id' =>
                $imdb_id,
        ]);
    }
}