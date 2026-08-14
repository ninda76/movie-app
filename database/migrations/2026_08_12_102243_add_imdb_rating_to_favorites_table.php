<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('favorites', function (Blueprint $table) {
            $table->string('imdb_rating')
                ->nullable()
                ->after('poster');
        });
    }

    public function down(): void
    {
        Schema::table('favorites', function (Blueprint $table) {
            $table->dropColumn('imdb_rating');
        });
    }
};import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";
import { useRef, useState } from "react";

export default function Index({
    favorites = [],
    totalFavorites = 0,
}) {
    const [favoriteList, setFavoriteList] =
        useState(favorites);

    const [loadingFavorite, setLoadingFavorite] =
        useState({});

    const [selectedMovie, setSelectedMovie] =
        useState(null);

    const [loadingDetail, setLoadingDetail] =
        useState(false);

    const [detailImageError, setDetailImageError] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | DETAIL CACHE
    |--------------------------------------------------------------------------
    */

    const detailCache = useRef({});


    /*
    |--------------------------------------------------------------------------
    | GET RATING
    |--------------------------------------------------------------------------
    */

    const getRating = (movie) => {
        const rating =
            movie?.imdb_rating ??
            movie?.imdbRating ??
            null;

        if (
            rating !== null &&
            rating !== undefined &&
            rating !== "" &&
            rating !== "N/A"
        ) {
            return rating;
        }

        return null;
    };


    /*
    |--------------------------------------------------------------------------
    | GET POSTER
    |--------------------------------------------------------------------------
    */

    const getPoster = (movie) => {
        const poster =
            movie?.poster ??
            movie?.image ??
            null;

        if (
            poster &&
            String(poster).trim() !== "" &&
            String(poster).toUpperCase() !== "N/A"
        ) {
            return poster;
        }

        return null;
    };


    /*
    |--------------------------------------------------------------------------
    | CHECK VALUE
    |--------------------------------------------------------------------------
    */

    const hasValue = (value) => {
        return (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== "" &&
            String(value).toUpperCase() !== "N/A"
        );
    };


    /*
    |--------------------------------------------------------------------------
    | REMOVE FAVORITE
    |--------------------------------------------------------------------------
    */

    const removeFavorite = async (movie) => {
        if (!movie?.imdb_id) {
            return;
        }

        const imdbID =
            String(movie.imdb_id);

        try {

            setLoadingFavorite((prev) => ({
                ...prev,
                [imdbID]: true,
            }));

            const response =
                await axios.delete(
                    `/favorite/${encodeURIComponent(
                        imdbID
                    )}`,
                    {
                        timeout: 10000,

                        headers: {
                            Accept:
                                "application/json",

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },
                    }
                );

            if (response.data?.success) {

                setFavoriteList((prev) =>
                    prev.filter(
                        (item) =>
                            String(item.imdb_id) !==
                            imdbID
                    )
                );

                if (
                    selectedMovie?.imdbID ===
                    imdbID
                ) {
                    setSelectedMovie(null);
                }
            }

        } catch (error) {

            console.error(
                "Gagal menghapus favorite:",
                error
            );

        } finally {

            setLoadingFavorite((prev) => ({
                ...prev,
                [imdbID]: false,
            }));
        }
    };


    /*
    |--------------------------------------------------------------------------
    | OPEN MOVIE DETAIL
    |--------------------------------------------------------------------------
    */

    const openMovieDetail = async (movie) => {

        if (!movie?.imdb_id) {
            return;
        }

        const imdbID =
            String(movie.imdb_id);


        /*
        |--------------------------------------------------------------------------
        | USE CACHE
        |--------------------------------------------------------------------------
        */

        if (
            detailCache.current[imdbID]
        ) {

            setDetailImageError(false);

            setSelectedMovie(
                detailCache.current[imdbID]
            );

            setLoadingDetail(false);

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | PREVIEW DATA
        |--------------------------------------------------------------------------
        |
        | Modal langsung terbuka menggunakan data
        | yang sudah tersimpan di Favorite.
        |
        */

        const previewMovie = {

            imdbID:
                imdbID,

            title:
                movie.title ||
                "Unknown Movie",

            year:
                movie.year ||
                "N/A",

            image:
                getPoster(movie),

            genre:
                movie.genre ||
                "N/A",

            imdbRating:
                getRating(movie) ||
                "N/A",

            rated:
                movie.rated ||
                "N/A",

            released:
                movie.released ||
                "N/A",

            runtime:
                movie.runtime ||
                "N/A",

            director:
                movie.director ||
                "N/A",

            writer:
                movie.writer ||
                "N/A",

            actors:
                movie.actors ||
                "N/A",

            plot:
                movie.plot ||
                "N/A",

            language:
                movie.language ||
                "N/A",

            country:
                movie.country ||
                "N/A",

            awards:
                movie.awards ||
                "N/A",

            imdbVotes:
                movie.imdb_votes ??
                movie.imdbVotes ??
                "N/A",

            metascore:
                movie.metascore ||
                "N/A",

            boxOffice:
                movie.box_office ??
                movie.boxOffice ??
                "N/A",

            type:
                movie.type ||
                "movie",

            dvd:
                movie.dvd ||
                "N/A",

            production:
                movie.production ||
                "N/A",

            website:
                movie.website ||
                "N/A",

            ratings:
                movie.ratings ||
                [],
        };


        /*
        |--------------------------------------------------------------------------
        | OPEN MODAL IMMEDIATELY
        |--------------------------------------------------------------------------
        */

        setDetailImageError(false);

        setSelectedMovie(
            previewMovie
        );

        setLoadingDetail(true);


        /*
        |--------------------------------------------------------------------------
        | GET FULL DETAIL FROM MOVIE CONTROLLER
        |--------------------------------------------------------------------------
        */

        try {

            const response =
                await axios.get(
                    `/admin/movies/${encodeURIComponent(
                        imdbID
                    )}`,
                    {
                        timeout: 10000,

                        headers: {
                            Accept:
                                "application/json",

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | FULL DETAIL SUCCESS
            |--------------------------------------------------------------------------
            */

            if (
                response.data?.success &&
                response.data?.movie
            ) {

                const detail =
                    response.data.movie;


                /*
                |--------------------------------------------------------------------------
                | MERGE PREVIEW + OMDB DETAIL
                |--------------------------------------------------------------------------
                */

                const fullMovie = {

                    ...previewMovie,

                    ...detail,


                    /*
                    |--------------------------------------------------------------------------
                    | BASIC
                    |--------------------------------------------------------------------------
                    */

                    imdbID:
                        detail.imdbID ||
                        detail.imdb_id ||
                        imdbID,

                    title:
                        detail.title ||
                        previewMovie.title,

                    year:
                        detail.year ||
                        previewMovie.year,


                    /*
                    |--------------------------------------------------------------------------
                    | POSTER
                    |--------------------------------------------------------------------------
                    */

                    image:
                        detail.image ||
                        detail.poster ||
                        previewMovie.image ||
                        null,


                    /*
                    |--------------------------------------------------------------------------
                    | GENRE
                    |--------------------------------------------------------------------------
                    */

                    genre:
                        detail.genre ||
                        previewMovie.genre,


                    /*
                    |--------------------------------------------------------------------------
                    | RATING
                    |--------------------------------------------------------------------------
                    */

                    imdbRating:
                        detail.imdbRating ||
                        detail.imdb_rating ||
                        previewMovie.imdbRating,


                    /*
                    |--------------------------------------------------------------------------
                    | MOVIE DETAILS
                    |--------------------------------------------------------------------------
                    */

                    rated:
                        detail.rated ||
                        previewMovie.rated,

                    released:
                        detail.released ||
                        previewMovie.released,

                    runtime:
                        detail.runtime ||
                        previewMovie.runtime,

                    director:
                        detail.director ||
                        previewMovie.director,

                    writer:
                        detail.writer ||
                        previewMovie.writer,

                    actors:
                        detail.actors ||
                        previewMovie.actors,

                    plot:
                        detail.plot ||
                        previewMovie.plot,

                    language:
                        detail.language ||
                        previewMovie.language,

                    country:
                        detail.country ||
                        previewMovie.country,

                    awards:
                        detail.awards ||
                        previewMovie.awards,


                    /*
                    |--------------------------------------------------------------------------
                    | IMDb INFORMATION
                    |--------------------------------------------------------------------------
                    */

                    imdbVotes:
                        detail.imdbVotes ||
                        detail.imdb_votes ||
                        previewMovie.imdbVotes,

                    metascore:
                        detail.metascore ||
                        previewMovie.metascore,

                    boxOffice:
                        detail.boxOffice ||
                        detail.box_office ||
                        previewMovie.boxOffice,

                    ratings:
                        detail.ratings ||
                        previewMovie.ratings,

                    type:
                        detail.type ||
                        previewMovie.type,

                    dvd:
                        detail.dvd ||
                        previewMovie.dvd,

                    production:
                        detail.production ||
                        previewMovie.production,

                    website:
                        detail.website ||
                        previewMovie.website,
                };


                /*
                |--------------------------------------------------------------------------
                | SAVE CACHE
                |--------------------------------------------------------------------------
                */

                detailCache.current[imdbID] =
                    fullMovie;


                /*
                |--------------------------------------------------------------------------
                | UPDATE MODAL
                |--------------------------------------------------------------------------
                */

                setSelectedMovie(
                    fullMovie
                );

                setDetailImageError(false);

            } else {

                console.error(
                    "Detail movie tidak ditemukan:",
                    response.data
                );
            }

        } catch (error) {

            /*
            |--------------------------------------------------------------------------
            | JANGAN TUTUP MODAL
            |--------------------------------------------------------------------------
            |
            | Preview tetap ditampilkan walaupun OMDb gagal.
            |
            */

            console.error(
                "Gagal mengambil detail movie:",
                error
            );

        } finally {

            setLoadingDetail(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE MODAL
    |--------------------------------------------------------------------------
    */

    const closeMovieDetail = () => {

        setSelectedMovie(null);

        setDetailImageError(false);

        setLoadingDetail(false);
    };


    /*
    |--------------------------------------------------------------------------
    | CARD IMAGE ERROR
    |--------------------------------------------------------------------------
    */

    const handleCardImageError = (
        event
    ) => {

        event.currentTarget.style.display =
            "none";

        const fallback =
            event.currentTarget
                .nextElementSibling;

        if (fallback) {

            fallback.classList.remove(
                "hidden"
            );

            fallback.classList.add(
                "flex"
            );
        }
    };


    return (
        <AdminLayout>

            <Head title="Favorite Movies" />


            {/* =========================================================
                PAGE
            ========================================================== */}

            <div className="min-h-screen bg-slate-100">


                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="bg-gradient-to-r from-slate-950 to-indigo-900 px-6 py-8 lg:px-10">

                    <div className="mx-auto max-w-7xl">

                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">


                            {/* TITLE */}

                            <div>

                                <h1 className="text-3xl font-bold text-white">
                                    Favorite Movies
                                </h1>

                                <p className="mt-1 text-sm text-indigo-200">
                                    Your favorite movies
                                </p>

                            </div>


                            {/* TOTAL */}

                            <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-center shadow-lg backdrop-blur">

                                <p className="text-xs font-medium uppercase tracking-wide text-indigo-200">
                                    Total Favorite
                                </p>

                                <p className="mt-1 text-3xl font-bold text-white">
                                    {favoriteList.length}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    CONTENT
                ====================================================== */}

                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">


                    {/* =================================================
                        EMPTY
                    ================================================== */}

                    {favoriteList.length === 0 ? (

                        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">

                                <span className="text-4xl">
                                    ♡
                                </span>

                            </div>


                            <h2 className="mt-6 text-2xl font-bold text-slate-800">
                                No Favorite Movies
                            </h2>


                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                You haven't added any
                                movies to your favorites
                                yet.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* =================================================
                                TITLE
                            ================================================== */}

                            <div className="mb-6">

                                <h2 className="text-2xl font-bold text-slate-900">
                                    My Favorites
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    {favoriteList.length}{" "}

                                    movie
                                    {favoriteList.length !== 1
                                        ? "s"
                                        : ""}{" "}

                                    saved

                                </p>

                            </div>


                            {/* =================================================
                                MOVIE GRID
                            ================================================== */}

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                                {favoriteList.map(
                                    (movie) => {

                                        const isLoading =
                                            loadingFavorite[
                                                movie.imdb_id
                                            ];

                                        const rating =
                                            getRating(
                                                movie
                                            );

                                        const poster =
                                            getPoster(
                                                movie
                                            );


                                        return (

                                            <div
                                                key={
                                                    movie.id ||
                                                    movie.imdb_id
                                                }

                                                onClick={() =>
                                                    openMovieDetail(
                                                        movie
                                                    )
                                                }

                                                className="
                                                    group
                                                    cursor-pointer
                                                    overflow-hidden
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-white
                                                    shadow-sm
                                                    transition
                                                    duration-300
                                                    hover:-translate-y-1
                                                    hover:shadow-xl
                                                "
                                            >


                                                {/* =================================
                                                    POSTER
                                                ================================== */}

                                                <div
                                                    className="
                                                        relative
                                                        aspect-[2/3]
                                                        w-full
                                                        overflow-hidden
                                                        bg-slate-100
                                                    "
                                                >

                                                    {poster ? (

                                                        <img
                                                            src={
                                                                poster
                                                            }

                                                            alt={
                                                                movie.title ||
                                                                "Movie Poster"
                                                            }

                                                            loading="lazy"

                                                            decoding="async"

                                                            className="
                                                                h-full
                                                                w-full
                                                                object-contain
                                                            "

                                                            onError={
                                                                handleCardImageError
                                                            }
                                                        />

                                                    ) : null}


                                                    {/* NO IMAGE */}

                                                    <div
                                                        className={`
                                                            absolute
                                                            inset-0
                                                            flex-col
                                                            items-center
                                                            justify-center
                                                            bg-slate-200
                                                            text-slate-400

                                                            ${
                                                                poster
                                                                    ? "hidden"
                                                                    : "flex"
                                                            }
                                                        `}
                                                    >

                                                        <span className="text-5xl">
                                                            🖼️
                                                        </span>

                                                        <span className="mt-3 text-sm font-medium">
                                                            No Image
                                                        </span>

                                                    </div>


                                                    {/* RATING */}

                                                    <div
                                                        className="
                                                            absolute
                                                            right-3
                                                            top-3
                                                            rounded-full
                                                            bg-black/75
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-bold
                                                            text-white
                                                            shadow-lg
                                                            backdrop-blur
                                                        "
                                                    >

                                                        ★{" "}

                                                        {rating ||
                                                            "N/A"}

                                                    </div>

                                                </div>


                                                {/* =================================
                                                    CARD BODY
                                                ================================== */}

                                                <div className="p-5">


                                                    {/* TITLE */}

                                                    <h3
                                                        className="
                                                            truncate
                                                            text-lg
                                                            font-bold
                                                            text-slate-900
                                                        "

                                                        title={
                                                            movie.title
                                                        }
                                                    >

                                                        {
                                                            movie.title
                                                        }

                                                    </h3>


                                                    {/* =================================
                                                        GENRE LEFT / YEAR RIGHT
                                                    ================================== */}

                                                    <div className="mt-2 flex items-center justify-between gap-3">


                                                        {/* GENRE LEFT */}

                                                        <span
                                                            className="
                                                                max-w-[65%]
                                                                truncate
                                                                text-sm
                                                                font-medium
                                                                text-indigo-500
                                                            "

                                                            title={
                                                                movie.genre ||
                                                                ""
                                                            }
                                                        >

                                                            {
                                                                movie.genre ||
                                                                "Movie"
                                                            }

                                                        </span>


                                                        {/* YEAR RIGHT */}

                                                        <span
                                                            className="
                                                                shrink-0
                                                                text-sm
                                                                text-slate-500
                                                            "
                                                        >

                                                            {
                                                                movie.year ||
                                                                "-"
                                                            }

                                                        </span>

                                                    </div>


                                                    {/* FAVORITE BUTTON */}

                                                    <div className="mt-5 flex justify-end">

                                                        <button
                                                            type="button"

                                                            disabled={
                                                                isLoading
                                                            }

                                                            onClick={(
                                                                event
                                                            ) => {

                                                                event.stopPropagation();

                                                                removeFavorite(
                                                                    movie
                                                                );

                                                            }}

                                                            title="Remove from favorites"

                                                            className={`
                                                                flex
                                                                h-11
                                                                w-11
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-red-500
                                                                text-xl
                                                                text-white
                                                                shadow-sm
                                                                transition
                                                                hover:bg-red-600
                                                                hover:shadow-md

                                                                ${
                                                                    isLoading
                                                                        ? "cursor-wait opacity-60"
                                                                        : ""
                                                                }
                                                            `}
                                                        >

                                                            {isLoading ? (

                                                                <span
                                                                    className="
                                                                        h-5
                                                                        w-5
                                                                        animate-spin
                                                                        rounded-full
                                                                        border-2
                                                                        border-white
                                                                        border-t-transparent
                                                                    "
                                                                />

                                                            ) : (

                                                                "♥"

                                                            )}

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        </>

                    )}

                </div>

            </div>


            {/* =============================================================
                DETAIL MODAL
            ============================================================== */}

            {selectedMovie && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        px-3
                        py-3
                        backdrop-blur-sm
                    "

                    onClick={
                        closeMovieDetail
                    }
                >

                    <div
                        className="
                            relative
                            h-[94vh]
                            w-full
                            max-w-6xl
                        "

                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* CLOSE */}

                        <button
                            type="button"

                            onClick={
                                closeMovieDetail
                            }

                            className="
                                absolute
                                -right-1
                                -top-2
                                z-[100]
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-red-500
                                text-2xl
                                font-bold
                                text-white
                                shadow-xl
                                hover:bg-red-600
                            "
                        >
                            ×
                        </button>


                        {/* MODAL CONTAINER */}

                        <div
                            className="
                                h-full
                                w-full
                                overflow-hidden
                                rounded-3xl
                                bg-white
                                shadow-2xl
                            "
                        >

                            <div
                                className="
                                    grid
                                    h-full
                                    grid-cols-1
                                    lg:grid-cols-[440px_minmax(0,1fr)]
                                "
                            >


                                {/* =========================================
                                    POSTER FULL
                                ========================================== */}

                                <div
                                    className="
                                        flex
                                        h-full
                                        min-h-0
                                        items-center
                                        justify-center
                                        overflow-hidden
                                        bg-slate-100
                                        p-5
                                    "
                                >

                                    {selectedMovie.image &&
                                    String(
                                        selectedMovie.image
                                    ).trim() !== "" &&
                                    String(
                                        selectedMovie.image
                                    ).toUpperCase() !==
                                        "N/A" &&
                                    !detailImageError ? (

                                        <img
                                            src={
                                                selectedMovie.image
                                            }

                                            alt={
                                                selectedMovie.title
                                            }

                                            className="
                                                h-full
                                                w-full
                                                rounded-2xl
                                                object-contain
                                                shadow-xl
                                            "

                                            onError={() =>
                                                setDetailImageError(
                                                    true
                                                )
                                            }
                                        />

                                    ) : (

                                        <div
                                            className="
                                                flex
                                                h-full
                                                w-full
                                                flex-col
                                                items-center
                                                justify-center
                                                text-slate-400
                                            "
                                        >

                                            <span className="text-6xl">
                                                🖼️
                                            </span>

                                            <span className="mt-3 text-sm">
                                                No Image
                                            </span>

                                        </div>

                                    )}

                                </div>


                                {/* =========================================
                                    DETAIL CONTENT
                                ========================================== */}

                                <div
                                    className="
                                        relative
                                        h-full
                                        min-h-0
                                        overflow-y-auto
                                        p-7
                                        lg:p-10
                                    "
                                >


                                    {/* LOADING */}

                                    {loadingDetail && (

                                        <div
                                            className="
                                                sticky
                                                top-0
                                                z-20
                                                mb-5
                                                flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                bg-indigo-50
                                                px-4
                                                py-2
                                                text-xs
                                                font-semibold
                                                text-indigo-600
                                            "
                                        >

                                            <span
                                                className="
                                                    h-4
                                                    w-4
                                                    animate-spin
                                                    rounded-full
                                                    border-2
                                                    border-indigo-200
                                                    border-t-indigo-600
                                                "
                                            />

                                            Loading movie detail...

                                        </div>

                                    )}


                                    {/* TITLE */}

                                    <h2
                                        className="
                                            pr-10
                                            text-3xl
                                            font-bold
                                            text-slate-900
                                            lg:text-4xl
                                        "
                                    >

                                        {
                                            selectedMovie.title
                                        }

                                    </h2>


                                    {/* YEAR + RATING + RATED */}

                                    <div
                                        className="
                                            mt-4
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-3
                                        "
                                    >

                                        {hasValue(
                                            selectedMovie.year
                                        ) && (

                                            <span className="text-sm text-slate-500">

                                                {
                                                    selectedMovie.year
                                                }

                                            </span>

                                        )}


                                        {hasValue(
                                            selectedMovie.imdbRating
                                        ) && (

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-yellow-100
                                                    px-3
                                                    py-1.5
                                                    text-sm
                                                    font-bold
                                                    text-yellow-700
                                                "
                                            >

                                                ★{" "}

                                                {
                                                    selectedMovie.imdbRating
                                                }

                                            </span>

                                        )}


                                        {hasValue(
                                            selectedMovie.rated
                                        ) && (

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-slate-100
                                                    px-3
                                                    py-1.5
                                                    text-sm
                                                    font-semibold
                                                    text-slate-600
                                                "
                                            >

                                                {
                                                    selectedMovie.rated
                                                }

                                            </span>

                                        )}

                                    </div>


                                    {/* GENRE */}

                                    {hasValue(
                                        selectedMovie.genre
                                    ) && (

                                        <div
                                            className="
                                                mt-5
                                                flex
                                                flex-wrap
                                                gap-2
                                            "
                                        >

                                            {String(
                                                selectedMovie.genre
                                            )
                                                .split(",")
                                                .map(
                                                    (
                                                        genre,
                                                        index
                                                    ) => (

                                                        <span
                                                            key={
                                                                `${genre}-${index}`
                                                            }

                                                            className="
                                                                rounded-full
                                                                bg-indigo-50
                                                                px-3
                                                                py-1.5
                                                                text-xs
                                                                font-semibold
                                                                text-indigo-700
                                                            "
                                                        >

                                                            {
                                                                genre.trim()
                                                            }

                                                        </span>

                                                    )
                                                )}

                                        </div>

                                    )}


                                    {/* =================================================
                                        PLOT
                                    ================================================== */}

                                    {hasValue(
                                        selectedMovie.plot
                                    ) && (

                                        <div className="mt-7">

                                            <h3 className="text-lg font-bold text-slate-900">
                                                Plot
                                            </h3>

                                            <p className="mt-2 text-sm leading-7 text-slate-600">

                                                {
                                                    selectedMovie.plot
                                                }

                                            </p>

                                        </div>

                                    )}


                                    {/* =================================================
                                        MOVIE INFORMATION
                                    ================================================== */}

                                    <div
                                        className="
                                            mt-7
                                            grid
                                            grid-cols-1
                                            gap-5
                                            border-t
                                            border-slate-100
                                            pt-6
                                            md:grid-cols-2
                                        "
                                    >


                                        {/* DIRECTOR */}

                                        {hasValue(
                                            selectedMovie.director
                                        ) && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Director
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {
                                                        selectedMovie.director
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* WRITER */}

                                        {hasValue(
                                            selectedMovie.writer
                                        ) && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Writer
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {
                                                        selectedMovie.writer
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* ACTORS */}

                                        {hasValue(
                                            selectedMovie.actors
                                        ) && (

                                            <div className="md:col-span-2">

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Actors
                                                </p>

                                                <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">

                                                    {
                                                        selectedMovie.actors
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* RELEASED */}

                                        {hasValue(
                                            selectedMovie.released
                                        ) && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Released
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {
                                                        selectedMovie.released
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* RUNTIME */}

                                        {hasValue(
                                            selectedMovie.runtime
                                        ) && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Runtime
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {
                                                        selectedMovie.runtime
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* LANGUAGE */}

                                        {hasValue(
                                            selectedMovie.language
                                        ) && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Language
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {
                                                        selectedMovie.language
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* COUNTRY */}

                                        {hasValue(
                                            selectedMovie.country
                                        ) && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Country
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">

                                                    {
                                                        selectedMovie.country
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* AWARDS */}

                                        {hasValue(
                                            selectedMovie.awards
                                        ) && (

                                            <div className="md:col-span-2">

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Awards
                                                </p>

                                                <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">

                                                    {
                                                        selectedMovie.awards
                                                    }

                                                </p>

                                            </div>

                                        )}

                                    </div>


                                    {/* =================================================
                                        IMDb INFORMATION
                                    ================================================== */}

                                    <div
                                        className="
                                            mt-7
                                            rounded-2xl
                                            bg-slate-50
                                            p-5
                                        "
                                    >

                                        <h3 className="mb-5 text-sm font-bold text-slate-900">
                                            IMDb Information
                                        </h3>


                                        <div
                                            className="
                                                grid
                                                grid-cols-1
                                                gap-5
                                                sm:grid-cols-2
                                            "
                                        >


                                            {/* IMDb ID */}

                                            {hasValue(
                                                selectedMovie.imdbID
                                            ) && (

                                                <div>

                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                        IMDb ID
                                                    </p>

                                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-700">

                                                        {
                                                            selectedMovie.imdbID
                                                        }

                                                    </p>

                                                </div>

                                            )}


                                            {/* IMDb Votes */}

                                            {hasValue(
                                                selectedMovie.imdbVotes
                                            ) && (

                                                <div>

                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                        IMDb Votes
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-700">

                                                        {
                                                            selectedMovie.imdbVotes
                                                        }

                                                    </p>

                                                </div>

                                            )}


                                            {/* Metascore */}

                                            {hasValue(
                                                selectedMovie.metascore
                                            ) && (

                                                <div>

                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                        Metascore
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-700">

                                                        {
                                                            selectedMovie.metascore
                                                        }

                                                    </p>

                                                </div>

                                            )}


                                            {/* Box Office */}

                                            {hasValue(
                                                selectedMovie.boxOffice
                                            ) && (

                                                <div>

                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                        Box Office
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-700">

                                                        {
                                                            selectedMovie.boxOffice
                                                        }

                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    {/* =================================================
                                        RATINGS
                                    ================================================== */}

                                    {Array.isArray(
                                        selectedMovie.ratings
                                    ) &&
                                    selectedMovie.ratings.length >
                                        0 && (

                                        <div
                                            className="
                                                mt-7
                                                rounded-2xl
                                                border
                                                border-slate-100
                                                bg-white
                                                p-5
                                            "
                                        >

                                            <h3 className="mb-4 text-sm font-bold text-slate-900">
                                                Ratings
                                            </h3>


                                            <div className="space-y-3">

                                                {selectedMovie.ratings.map(
                                                    (
                                                        rating,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={
                                                                index
                                                            }

                                                            className="
                                                                flex
                                                                items-center
                                                                justify-between
                                                                gap-4
                                                                rounded-xl
                                                                bg-slate-50
                                                                px-4
                                                                py-3
                                                            "
                                                        >

                                                            <span className="text-sm font-medium text-slate-600">

                                                                {
                                                                    rating.Source
                                                                }

                                                            </span>

                                                            <span className="text-sm font-bold text-slate-900">

                                                                {
                                                                    rating.Value
                                                                }

                                                            </span>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </AdminLayout>
    );
}