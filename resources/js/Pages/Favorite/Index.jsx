import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";
import { useRef, useState } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function Index({
    favorites = [],
    totalFavorites = 0,
}) {
    const { t } = useLanguage();

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

    const detailCache = useRef({});


    const getRating = (movie) => {
        if (
            movie?.imdb_rating !== null &&
            movie?.imdb_rating !== undefined &&
            movie?.imdb_rating !== "" &&
            movie?.imdb_rating !== "N/A"
        ) {
            return movie.imdb_rating;
        }

        return null;
    };


    const getPoster = (movie) => {
        if (
            movie?.poster &&
            String(movie.poster).trim() !== "" &&
            String(movie.poster).toUpperCase() !== "N/A"
        ) {
            return movie.poster;
        }

        return null;
    };


    const removeFavorite = async (movie) => {
        if (!movie?.imdb_id) {
            return;
        }

        try {
            setLoadingFavorite((prev) => ({
                ...prev,
                [movie.imdb_id]: true,
            }));

            const response = await axios.delete(
                `/favorite/${encodeURIComponent(
                    movie.imdb_id
                )}`,
                {
                    timeout: 10000,
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With":
                            "XMLHttpRequest",
                    },
                }
            );

            if (response.data?.success) {
                setFavoriteList((prev) =>
                    prev.filter(
                        (item) =>
                            item.imdb_id !==
                            movie.imdb_id
                    )
                );

                if (
                    selectedMovie?.imdbID ===
                    movie.imdb_id
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
                [movie.imdb_id]: false,
            }));
        }
    };


    const openMovieDetail = async (movie) => {
        if (!movie?.imdb_id) {
            return;
        }

        const imdbID = String(
            movie.imdb_id
        );

        const previewMovie = {
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
            rated: "N/A",
            released: "N/A",
            runtime: "N/A",
            director: "N/A",
            writer: "N/A",
            actors: "N/A",
            plot: "N/A",
            language: "N/A",
            country: "N/A",
            awards: "N/A",
            imdbVotes: "N/A",
            metascore: "N/A",
            boxOffice: "N/A",
            type: "movie",
            dvd: "N/A",
            production: "N/A",
            website: "N/A",
            ratings: [],
        };

        setDetailImageError(false);

        if (detailCache.current[imdbID]) {
            setSelectedMovie(
                detailCache.current[imdbID]
            );

            setLoadingDetail(false);

            return;
        }

        setSelectedMovie(previewMovie);
        setLoadingDetail(true);

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

            if (
                response.data?.success &&
                response.data?.movie
            ) {
                const detail =
                    response.data.movie;

                const getDetailValue = (...keys) => {
                    for (const key of keys) {
                        const value =
                            detail?.[key];

                        if (
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== "" &&
                            String(value).toUpperCase() !==
                                "N/A"
                        ) {
                            return value;
                        }
                    }

                    return "N/A";
                };

                const fullMovie = {
                    ...previewMovie,
                    ...detail,

                    imdbID:
                        getDetailValue(
                            "imdbID",
                            "imdb_id",
                            "imdbId"
                        ) !== "N/A"
                            ? getDetailValue(
                                  "imdbID",
                                  "imdb_id",
                                  "imdbId"
                              )
                            : imdbID,

                    title:
                        getDetailValue(
                            "title",
                            "Title"
                        ) !== "N/A"
                            ? getDetailValue(
                                  "title",
                                  "Title"
                              )
                            : previewMovie.title,

                    year:
                        getDetailValue(
                            "year",
                            "Year"
                        ) !== "N/A"
                            ? getDetailValue(
                                  "year",
                                  "Year"
                              )
                            : previewMovie.year,

                    image:
                        getDetailValue(
                            "image",
                            "poster",
                            "Poster"
                        ) !== "N/A"
                            ? getDetailValue(
                                  "image",
                                  "poster",
                                  "Poster"
                              )
                            : previewMovie.image ||
                              null,

                    genre:
                        getDetailValue(
                            "genre",
                            "Genre"
                        ) !== "N/A"
                            ? getDetailValue(
                                  "genre",
                                  "Genre"
                              )
                            : previewMovie.genre,

                    imdbRating:
                        getDetailValue(
                            "imdbRating",
                            "imdb_rating",
                            "imdb_rating_value"
                        ) !== "N/A"
                            ? getDetailValue(
                                  "imdbRating",
                                  "imdb_rating",
                                  "imdb_rating_value"
                              )
                            : previewMovie.imdbRating,

                    rated:
                        getDetailValue(
                            "rated",
                            "Rated"
                        ),

                    released:
                        getDetailValue(
                            "released",
                            "Released"
                        ),

                    runtime:
                        getDetailValue(
                            "runtime",
                            "Runtime"
                        ),

                    plot:
                        getDetailValue(
                            "plot",
                            "Plot"
                        ),

                    director:
                        getDetailValue(
                            "director",
                            "Director"
                        ),

                    writer:
                        getDetailValue(
                            "writer",
                            "Writer"
                        ),

                    actors:
                        getDetailValue(
                            "actors",
                            "Actors"
                        ),

                    language:
                        getDetailValue(
                            "language",
                            "Language"
                        ),

                    country:
                        getDetailValue(
                            "country",
                            "Country"
                        ),

                    awards:
                        getDetailValue(
                            "awards",
                            "Awards"
                        ),

                    imdbVotes:
                        getDetailValue(
                            "imdbVotes",
                            "imdb_votes",
                            "imdbVotesValue"
                        ),

                    metascore:
                        getDetailValue(
                            "metascore",
                            "Metascore"
                        ),

                    boxOffice:
                        getDetailValue(
                            "boxOffice",
                            "BoxOffice",
                            "box_office"
                        ),

                    type:
                        getDetailValue(
                            "type",
                            "Type"
                        ),

                    dvd:
                        getDetailValue(
                            "dvd",
                            "DVD"
                        ),

                    production:
                        getDetailValue(
                            "production",
                            "Production"
                        ),

                    website:
                        getDetailValue(
                            "website",
                            "Website"
                        ),

                    ratings:
                        detail?.ratings ||
                        detail?.Ratings ||
                        [],
                };

                detailCache.current[
                    imdbID
                ] = fullMovie;

                setSelectedMovie(
                    fullMovie
                );

                setDetailImageError(false);
            }
        } catch (error) {
            console.error(
                "Gagal mengambil detail movie:",
                error
            );
        } finally {
            setLoadingDetail(false);
        }
    };


    const closeMovieDetail = () => {
        setSelectedMovie(null);
        setDetailImageError(false);
        setLoadingDetail(false);
    };


    const handleCardImageError = (
        event
    ) => {
        event.currentTarget.style.display =
            "none";

        const fallback =
            event.currentTarget
                .nextElementSibling;

        if (fallback) {
            fallback.style.display =
                "flex";
        }
    };


    const handleDetailImageError = () => {
        setDetailImageError(true);
    };


    return (
        <AdminLayout>

            <Head
                title={t(
                    "favoritePage.title"
                )}
            />

            <div className="min-h-screen bg-slate-100">

                <div className="bg-gradient-to-r from-slate-950 to-indigo-900 px-6 py-4 lg:px-10">

                    <div className="mx-auto max-w-7xl">

                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                            <div>

                                <h1 className="text-3xl font-bold text-white">

                                    {t(
                                        "favoritePage.title"
                                    )}

                                </h1>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-center shadow-lg backdrop-blur">

                                <p className="text-xs font-medium uppercase tracking-wide text-indigo-200">

                                    {t(
                                        "favoritePage.moviesSaved"
                                    )}

                                </p>

                                <p className="mt-1 text-3xl font-bold text-white">

                                    {favoriteList.length}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

                    {favoriteList.length === 0 ? (

                        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">

                                <span className="text-4xl">
                                    ♡
                                </span>

                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-slate-800">

                                {t(
                                    "favoritePage.noFavorites"
                                )}

                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                                {t(
                                    "favoritePage.addFavorite"
                                )}

                            </p>

                        </div>

                    ) : (

                        <>

                            <div className="mb-6">

                                <h2 className="text-2xl font-bold text-slate-900">

                                    {t(
                                        "favoritePage.title"
                                    )}

                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    {favoriteList.length}{" "}

                                    {t(
                                        "favoritePage.moviesSaved"
                                    )}

                                </p>

                            </div>


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

                                                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-200">

                                                    {poster ? (

                                                        <img
                                                            src={
                                                                poster
                                                            }

                                                            alt={
                                                                movie.title
                                                            }

                                                            className="
                                                                h-full
                                                                w-full
                                                                object-cover
                                                                transition
                                                                duration-500
                                                                group-hover:scale-105
                                                            "

                                                            onError={
                                                                handleCardImageError
                                                            }
                                                        />

                                                    ) : null}


                                                    <div
                                                        className={`absolute inset-0 flex-col items-center justify-center bg-slate-200 text-slate-400 ${
                                                            poster
                                                                ? "hidden"
                                                                : "flex"
                                                        }`}
                                                    >

                                                        <span className="text-5xl">
                                                            🖼️
                                                        </span>

                                                        <span className="mt-2 text-xs font-medium">

                                                            {t(
                                                                "movie.unavailable"
                                                            )}

                                                        </span>

                                                    </div>


                                                    {rating && (

                                                        <div className="absolute left-3 top-3 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">

                                                            <span className="text-amber-400">
                                                                ★
                                                            </span>{" "}

                                                            {rating}

                                                        </div>

                                                    )}

                                                </div>


                                                <div className="p-5">

                                                    <h3 className="line-clamp-2 min-h-[56px] text-lg font-bold text-slate-900">

                                                        {
                                                            movie.title
                                                        }

                                                    </h3>


                                                    <div className="mt-3 flex items-center justify-between">

                                                        <span className="text-sm font-medium text-slate-500">

                                                            {movie.year ||
                                                                "N/A"}

                                                        </span>


                                                        {movie.genre && (

                                                            <span className="max-w-[150px] truncate rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">

                                                                {
                                                                    movie.genre
                                                                }

                                                            </span>

                                                        )}

                                                    </div>


                                                    {/* FAVORITE HEART BUTTON */}

                                                    <div className="mt-4 flex justify-end">

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

                                                            aria-label={t(
                                                                "common.delete"
                                                            )}

                                                            title={t(
                                                                "common.delete"
                                                            )}

                                                            className="
                                                                flex
                                                                h-10
                                                                w-10
                                                                cursor-pointer
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-red-500
                                                                text-xl
                                                                text-white
                                                                shadow-sm
                                                                transition
                                                                duration-200
                                                                hover:scale-110
                                                                hover:bg-red-600
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-60
                                                            "
                                                        >

                                                            {isLoading ? (

                                                                <span
                                                                    className="
                                                                        h-5
                                                                        w-5
                                                                        animate-spin
                                                                        rounded-full
                                                                        border-2
                                                                        border-white/40
                                                                        border-t-white
                                                                    "
                                                                />

                                                            ) : (

                                                                <span className="leading-none">
                                                                    ♥
                                                                </span>

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


            {selectedMovie && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[999]
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        p-4
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


                        <div
                            className="
                                h-full
                                overflow-y-auto
                                rounded-3xl
                                bg-white
                                shadow-2xl
                            "
                        >

                            <div className="relative overflow-hidden bg-slate-950">

                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

                                <div className="relative flex flex-col gap-8 p-7 md:flex-row md:p-10">

                                    <div className="mx-auto w-52 shrink-0 md:mx-0">

                                        <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-slate-800 shadow-2xl">

                                            {selectedMovie.image &&
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
                                                        object-cover
                                                    "

                                                    onError={
                                                        handleDetailImageError
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
                                                        text-center
                                                        text-slate-400
                                                    "
                                                >

                                                    <span className="text-6xl">
                                                        🖼️
                                                    </span>

                                                    <span className="mt-3 text-sm">

                                                        {t(
                                                            "movie.unavailable"
                                                        )}

                                                    </span>

                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    <div className="flex-1 text-white">

                                        <div className="flex flex-wrap items-center gap-2">

                                            {selectedMovie.type && (

                                                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase text-indigo-300">

                                                    {
                                                        selectedMovie.type
                                                    }

                                                </span>

                                            )}


                                            {selectedMovie.rated &&
                                            selectedMovie.rated !==
                                                "N/A" && (

                                                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold">

                                                    {
                                                        selectedMovie.rated
                                                    }

                                                </span>

                                            )}

                                        </div>


                                        <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">

                                            {
                                                selectedMovie.title
                                            }

                                        </h2>


                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">

                                            <span>

                                                {
                                                    selectedMovie.year
                                                }

                                            </span>


                                            {selectedMovie.runtime &&
                                            selectedMovie.runtime !==
                                                "N/A" && (

                                                <>

                                                    <span>
                                                        •
                                                    </span>

                                                    <span>

                                                        {
                                                            selectedMovie.runtime
                                                        }

                                                    </span>

                                                </>

                                            )}


                                            {selectedMovie.genre &&
                                            selectedMovie.genre !==
                                                "N/A" && (

                                                <>

                                                    <span>
                                                        •
                                                    </span>

                                                    <span>

                                                        {
                                                            selectedMovie.genre
                                                        }

                                                    </span>

                                                </>

                                            )}

                                        </div>


                                        {selectedMovie.imdbRating &&
                                        selectedMovie.imdbRating !==
                                            "N/A" && (

                                            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950">

                                                <span className="text-lg">
                                                    ★
                                                </span>

                                                {
                                                    selectedMovie.imdbRating
                                                }

                                                <span className="text-xs font-semibold opacity-70">
                                                    IMDb
                                                </span>

                                            </div>

                                        )}


                                        {loadingDetail && (

                                            <div className="mt-5 flex items-center gap-3 text-sm text-slate-300">

                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />

                                                {t(
                                                    "common.loading"
                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>


                            <div className="p-7 md:p-10">

                                {selectedMovie.plot &&
                                selectedMovie.plot !==
                                    "N/A" && (

                                    <div className="mb-8">

                                        <h3 className="text-lg font-bold text-slate-900">

                                            {t(
                                                "movie.plot"
                                            )}

                                        </h3>


                                        <p className="mt-3 text-sm leading-7 text-slate-600">

                                            {
                                                selectedMovie.plot
                                            }

                                        </p>

                                    </div>

                                )}


                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                                    {selectedMovie.director &&
                                    selectedMovie.director !==
                                        "N/A" && (

                                        <div className="rounded-2xl bg-slate-50 p-5">

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.director"
                                                )}

                                            </p>


                                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">

                                                {
                                                    selectedMovie.director
                                                }

                                            </p>

                                        </div>

                                    )}


                                    {selectedMovie.writer &&
                                    selectedMovie.writer !==
                                        "N/A" && (

                                        <div className="rounded-2xl bg-slate-50 p-5">

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.writer"
                                                )}

                                            </p>


                                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">

                                                {
                                                    selectedMovie.writer
                                                }

                                            </p>

                                        </div>

                                    )}


                                    {selectedMovie.actors &&
                                    selectedMovie.actors !==
                                        "N/A" && (

                                        <div className="rounded-2xl bg-slate-50 p-5">

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.actors"
                                                )}

                                            </p>


                                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">

                                                {
                                                    selectedMovie.actors
                                                }

                                            </p>

                                        </div>

                                    )}

                                </div>


                                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">

                                    {selectedMovie.released &&
                                    selectedMovie.released !==
                                        "N/A" && (

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.released"
                                                )}

                                            </p>


                                            <p className="mt-1 text-sm font-semibold text-slate-800">

                                                {
                                                    selectedMovie.released
                                                }

                                            </p>

                                        </div>

                                    )}


                                    {selectedMovie.runtime &&
                                    selectedMovie.runtime !==
                                        "N/A" && (

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.runtime"
                                                )}

                                            </p>


                                            <p className="mt-1 text-sm font-semibold text-slate-800">

                                                {
                                                    selectedMovie.runtime
                                                }

                                            </p>

                                        </div>

                                    )}


                                    {selectedMovie.language &&
                                    selectedMovie.language !==
                                        "N/A" && (

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.language"
                                                )}

                                            </p>


                                            <p className="mt-1 text-sm font-semibold text-slate-800">

                                                {
                                                    selectedMovie.language
                                                }

                                            </p>

                                        </div>

                                    )}


                                    {selectedMovie.country &&
                                    selectedMovie.country !==
                                        "N/A" && (

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.country"
                                                )}

                                            </p>


                                            <p className="mt-1 text-sm font-semibold text-slate-800">

                                                {
                                                    selectedMovie.country
                                                }

                                            </p>

                                        </div>

                                    )}


                                    {selectedMovie.awards &&
                                    selectedMovie.awards !==
                                        "N/A" && (

                                        <div className="md:col-span-2">

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                {t(
                                                    "movie.awards"
                                                )}

                                            </p>


                                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">

                                                {
                                                    selectedMovie.awards
                                                }

                                            </p>

                                        </div>

                                    )}

                                </div>


                                <div
                                    className="
                                        mt-7
                                        rounded-2xl
                                        bg-slate-50
                                        p-5
                                    "
                                >

                                    <h3 className="mb-5 text-sm font-bold text-slate-900">

                                        {t(
                                            "movie.imdbInformation"
                                        )}

                                    </h3>


                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-5
                                            sm:grid-cols-2
                                        "
                                    >

                                        {selectedMovie.imdbID && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                    {t(
                                                        "movie.imdbId"
                                                    )}

                                                </p>


                                                <p className="mt-1 font-mono text-sm font-semibold text-slate-700">

                                                    {
                                                        selectedMovie.imdbID
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {selectedMovie.imdbVotes &&
                                        selectedMovie.imdbVotes !==
                                            "N/A" && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                    {t(
                                                        "modal.votes"
                                                    )}

                                                </p>


                                                <p className="mt-1 text-sm font-semibold text-slate-700">

                                                    {
                                                        selectedMovie.imdbVotes
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {selectedMovie.metascore &&
                                        selectedMovie.metascore !==
                                            "N/A" && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                    {t(
                                                        "modal.metascore"
                                                    )}

                                                </p>


                                                <p className="mt-1 text-sm font-semibold text-slate-700">

                                                    {
                                                        selectedMovie.metascore
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {selectedMovie.boxOffice &&
                                        selectedMovie.boxOffice !==
                                            "N/A" && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                                                    {t(
                                                        "modal.boxOffice"
                                                    )}

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

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </AdminLayout>
    );
}