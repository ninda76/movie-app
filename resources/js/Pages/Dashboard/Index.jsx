import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";
import { useState } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function Index({
    movies = [],
    genres = [],
    totalMovies = 0,
    totalFavorites = 0,
    totalUsers = 0,
    favoriteIds = [],
    apiError = null,
}) {
    const { t, language } = useLanguage();

    /*
    |--------------------------------------------------------------------------
    | DETAIL MODAL
    |--------------------------------------------------------------------------
    */

    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailImageError, setDetailImageError] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | FAVORITE
    |--------------------------------------------------------------------------
    */

    const [currentFavoriteIds, setCurrentFavoriteIds] = useState(
        (favoriteIds || []).map((id) => String(id).trim())
    );

    const [favoriteLoading, setFavoriteLoading] = useState({});

    /*
    |--------------------------------------------------------------------------
    | OPEN DETAIL
    |--------------------------------------------------------------------------
    */

    const openMovieDetail = async (movie) => {
        const imdbID = String(
            movie?.imdbID ||
                movie?.imdb_id ||
                movie?.imdbId ||
                ""
        ).trim();

        if (!imdbID) {
            return;
        }

        const previewMovie = {
            ...movie,

            imdbID,

            title:
                movie?.title ||
                movie?.Title ||
                "Unknown Movie",

            year:
                movie?.year ||
                movie?.Year ||
                "N/A",

            image:
                movie?.image ||
                movie?.poster ||
                movie?.Poster ||
                null,

            genre:
                movie?.genre ||
                movie?.Genre ||
                "N/A",

            type:
                movie?.type ||
                movie?.Type ||
                "movie",

            imdbRating:
                movie?.imdbRating ||
                movie?.imdb_rating ||
                movie?.rating ||
                "N/A",

            rated:
                movie?.rated ||
                movie?.Rated ||
                "N/A",

            released:
                movie?.released ||
                movie?.Released ||
                "N/A",

            runtime:
                movie?.runtime ||
                movie?.Runtime ||
                "N/A",

            plot:
                movie?.plot ||
                movie?.Plot ||
                "N/A",

            director:
                movie?.director ||
                movie?.Director ||
                "N/A",

            writer:
                movie?.writer ||
                movie?.Writer ||
                "N/A",

            actors:
                movie?.actors ||
                movie?.Actors ||
                "N/A",

            language:
                movie?.language ||
                movie?.Language ||
                "N/A",

            country:
                movie?.country ||
                movie?.Country ||
                "N/A",

            awards:
                movie?.awards ||
                movie?.Awards ||
                "N/A",

            imdbVotes:
                movie?.imdbVotes ||
                movie?.imdb_votes ||
                "N/A",

            metascore:
                movie?.metascore ||
                movie?.Metascore ||
                "N/A",

            boxOffice:
                movie?.boxOffice ||
                movie?.BoxOffice ||
                "N/A",

            ratings:
                movie?.ratings ||
                movie?.Ratings ||
                [],
        };

        setDetailImageError(false);
        setSelectedMovie(previewMovie);
        setLoadingDetail(true);

        /*
        |--------------------------------------------------------------------------
        | GET FULL DETAIL
        |--------------------------------------------------------------------------
        */

        try {
            const response = await axios.get(
                `/admin/movies/${encodeURIComponent(imdbID)}`,
                {
                    timeout: 10000,
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            if (
                response?.data?.success &&
                response?.data?.movie
            ) {
                const detail = response.data.movie;

                const getValue = (...keys) => {
                    for (const key of keys) {
                        const value = detail?.[key];

                        if (
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== "" &&
                            String(value).toUpperCase() !== "N/A"
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
                        getValue(
                            "imdbID",
                            "imdb_id",
                            "imdbId"
                        ) !== "N/A"
                            ? getValue(
                                  "imdbID",
                                  "imdb_id",
                                  "imdbId"
                              )
                            : imdbID,

                    title:
                        getValue("title", "Title") !== "N/A"
                            ? getValue("title", "Title")
                            : previewMovie.title,

                    year:
                        getValue("year", "Year") !== "N/A"
                            ? getValue("year", "Year")
                            : previewMovie.year,

                    image:
                        getValue(
                            "image",
                            "poster",
                            "Poster"
                        ) !== "N/A"
                            ? getValue(
                                  "image",
                                  "poster",
                                  "Poster"
                              )
                            : previewMovie.image,

                    genre:
                        getValue("genre", "Genre") !== "N/A"
                            ? getValue("genre", "Genre")
                            : previewMovie.genre,

                    type:
                        getValue("type", "Type") !== "N/A"
                            ? getValue("type", "Type")
                            : previewMovie.type,

                    imdbRating:
                        getValue(
                            "imdbRating",
                            "imdb_rating",
                            "rating"
                        ) !== "N/A"
                            ? getValue(
                                  "imdbRating",
                                  "imdb_rating",
                                  "rating"
                              )
                            : previewMovie.imdbRating,

                    rated: getValue("rated", "Rated"),

                    released:
                        getValue(
                            "released",
                            "Released"
                        ),

                    runtime:
                        getValue(
                            "runtime",
                            "Runtime"
                        ),

                    plot:
                        getValue(
                            "plot",
                            "Plot"
                        ),

                    director:
                        getValue(
                            "director",
                            "Director"
                        ),

                    writer:
                        getValue(
                            "writer",
                            "Writer"
                        ),

                    actors:
                        getValue(
                            "actors",
                            "Actors"
                        ),

                    language:
                        getValue(
                            "language",
                            "Language"
                        ),

                    country:
                        getValue(
                            "country",
                            "Country"
                        ),

                    awards:
                        getValue(
                            "awards",
                            "Awards"
                        ),

                    imdbVotes:
                        getValue(
                            "imdbVotes",
                            "imdb_votes"
                        ),

                    metascore:
                        getValue(
                            "metascore",
                            "Metascore"
                        ),

                    boxOffice:
                        getValue(
                            "boxOffice",
                            "BoxOffice"
                        ),

                    ratings:
                        detail?.ratings ||
                        detail?.Ratings ||
                        [],
                };

                setSelectedMovie(fullMovie);
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

    /*
    |--------------------------------------------------------------------------
    | CLOSE DETAIL
    |--------------------------------------------------------------------------
    */

    const closeMovieDetail = () => {
        setSelectedMovie(null);
        setLoadingDetail(false);
        setDetailImageError(false);
    };

    /*
    |--------------------------------------------------------------------------
    | ADD FAVORITE
    |--------------------------------------------------------------------------
    */

    const addFavorite = async (movie) => {
        const imdbId = String(
            movie?.imdbID ||
                movie?.imdb_id ||
                movie?.imdbId ||
                ""
        ).trim();

        if (!imdbId) {
            return;
        }

        if (favoriteLoading[imdbId]) {
            return;
        }

        setFavoriteLoading((prev) => ({
            ...prev,
            [imdbId]: true,
        }));

        try {
            const response = await axios.post(
                "/favorite",
                {
                    imdb_id: imdbId,

                    title:
                        movie?.title ||
                        movie?.Title ||
                        "N/A",

                    year:
                        movie?.year ||
                        movie?.Year ||
                        null,

                    poster:
                        movie?.image ||
                        movie?.poster ||
                        movie?.Poster ||
                        null,

                    genre:
                        movie?.genre ||
                        movie?.Genre ||
                        null,

                    imdb_rating:
                        movie?.imdbRating ||
                        movie?.imdb_rating ||
                        movie?.rating ||
                        null,
                },
                {
                    withCredentials: true,

                    headers: {
                        Accept:
                            "application/json",

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },
                }
            );

            if (
                response.data?.success ||
                response.status === 200 ||
                response.status === 201
            ) {
                setCurrentFavoriteIds((prev) => {
                    const ids = prev.map((id) =>
                        String(id).trim()
                    );

                    if (ids.includes(imdbId)) {
                        return ids;
                    }

                    return [
                        ...ids,
                        imdbId,
                    ];
                });
            }
        } catch (error) {
            console.error(
                "Gagal menambahkan favorite:",
                error
            );
        } finally {
            setFavoriteLoading((prev) => {
                const updated = {
                    ...prev,
                };

                delete updated[imdbId];

                return updated;
            });
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE FAVORITE
    |--------------------------------------------------------------------------
    */

    const removeFavorite = async (movie) => {
        const imdbId = String(
            movie?.imdbID ||
                movie?.imdb_id ||
                movie?.imdbId ||
                ""
        ).trim();

        if (!imdbId) {
            return;
        }

        if (favoriteLoading[imdbId]) {
            return;
        }

        setFavoriteLoading((prev) => ({
            ...prev,
            [imdbId]: true,
        }));

        try {
            const response = await axios.delete(
                `/favorite/${encodeURIComponent(
                    imdbId
                )}`,
                {
                    withCredentials: true,

                    headers: {
                        Accept:
                            "application/json",

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },
                }
            );

            if (
                response.data?.success ||
                response.status === 200
            ) {
                setCurrentFavoriteIds((prev) =>
                    prev
                        .map((id) =>
                            String(id).trim()
                        )
                        .filter(
                            (id) =>
                                id !== imdbId
                        )
                );
            }
        } catch (error) {
            console.error(
                "Gagal menghapus favorite:",
                error
            );
        } finally {
            setFavoriteLoading((prev) => {
                const updated = {
                    ...prev,
                };

                delete updated[imdbId];

                return updated;
            });
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FAVORITE BUTTON
    |--------------------------------------------------------------------------
    */

    const handleFavoriteClick = (
        event,
        movie
    ) => {
        event.stopPropagation();

        const imdbId = String(
            movie?.imdbID ||
                movie?.imdb_id ||
                movie?.imdbId ||
                ""
        ).trim();

        if (!imdbId) {
            return;
        }

        if (favoriteLoading[imdbId]) {
            return;
        }

        const isFavorite =
            currentFavoriteIds.some(
                (id) =>
                    String(id).trim() ===
                    imdbId
            );

        /*
        |--------------------------------------------------------------------------
        | PENTING
        |--------------------------------------------------------------------------
        | Kalau sudah favorite:
        |     REMOVE
        |
        | Kalau belum favorite:
        |     ADD
        |--------------------------------------------------------------------------
        */

        if (isFavorite) {
            removeFavorite(movie);
        } else {
            addFavorite(movie);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    const stats = [
        {
            title: t(
                "dashboard.totalMovies",
                language === "id"
                    ? "Total Film"
                    : "Total Movies"
            ),

            value:
                Number(
                    totalMovies
                ).toLocaleString(),

            icon: "🎬",
        },

        {
            title: t(
                "common.favorite",
                language === "id"
                    ? "Favorit"
                    : "Favorite"
            ),

            value:
                Number(
                    totalFavorites
                ).toLocaleString(),

            icon: "♥",
        },

        {
            title:
                language === "id"
                    ? "Pengguna"
                    : "Users",

            value:
                Number(
                    totalUsers
                ).toLocaleString(),

            change:
                language === "id"
                    ? "Pengguna terdaftar"
                    : "Registered users",

            icon: "👤",
        },

        {
            title:
                language === "id"
                    ? "Genre"
                    : "Genres",

            value:
                Number(
                    genres.length
                ).toLocaleString(),

            icon: "▦",
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>

            <Head
                title={t(
                    "dashboard.title"
                )}
            />

            <div className="min-h-screen bg-slate-100">

                {/* =====================================================
                    HERO
                ====================================================== */}

                <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 px-6 py-6 lg:px-10">

                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl">

                        <h1 className="text-2xl font-bold tracking-tight text-white">

                            {t(
                                "dashboard.title"
                            )}

                        </h1>

                    </div>

                </div>


                {/* =====================================================
                    CONTENT
                ====================================================== */}

                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

                    {/* =================================================
                        STATISTICS
                    ================================================== */}

                    <div className="-mt-10 relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        {stats.map(
                            (stat) => (
                                <div
                                    key={
                                        stat.title
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl"
                                >

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-sm font-medium text-slate-500">
                                                {
                                                    stat.title
                                                }
                                            </p>

                                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                                {
                                                    stat.value
                                                }
                                            </p>

                                            {stat.change && (
                                                <p className="mt-2 text-xs font-semibold text-emerald-600">
                                                    {
                                                        stat.change
                                                    }
                                                </p>
                                            )}

                                        </div>

                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                                            {
                                                stat.icon
                                            }
                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>


                    {/* =================================================
                        MAIN
                    ================================================== */}

                    <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

                        {/* MOVIE OVERVIEW */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

                            <h2 className="text-lg font-bold text-slate-900">

                                {language ===
                                "id"
                                    ? "Ringkasan Film"
                                    : "Movie Overview"}

                            </h2>

                            <p className="mt-1 text-sm text-slate-500">

                                {language ===
                                "id"
                                    ? "Aktivitas film dalam 6 bulan terakhir"
                                    : "Movie activity in the last 6 months"}

                            </p>


                            <div className="mt-8 flex h-52 items-end justify-between gap-4">

                                {[
                                    45,
                                    62,
                                    52,
                                    78,
                                    65,
                                    88,
                                ].map(
                                    (
                                        height,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                index
                                            }
                                            className="flex h-full flex-1 items-end"
                                        >

                                            <div
                                                className="w-full rounded-t-xl bg-gradient-to-t from-indigo-700 to-indigo-400"
                                                style={{
                                                    height:
                                                        `${height}%`,
                                                }}
                                            />

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="mt-4 grid grid-cols-6 text-center text-xs font-medium text-slate-400">

                                <span>
                                    Jan
                                </span>

                                <span>
                                    Feb
                                </span>

                                <span>
                                    Mar
                                </span>

                                <span>
                                    Apr
                                </span>

                                <span>
                                    {language ===
                                    "id"
                                        ? "Mei"
                                        : "May"}
                                </span>

                                <span>
                                    Jun
                                </span>

                            </div>

                        </div>


                        {/* GENRE */}

                        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">

                            <p className="text-sm font-medium text-indigo-100">

                                {language ===
                                "id"
                                    ? "Genre Film"
                                    : "Movie Genres"}

                            </p>

                            <h2 className="mt-3 text-3xl font-bold">

                                {
                                    genres.length
                                }{" "}

                                {language ===
                                "id"
                                    ? "Genre"
                                    : "Genres"}

                            </h2>


                            <div className="mt-6 flex flex-wrap gap-2">

                                {genres.length >
                                0 ? (

                                    genres.map(
                                        (
                                            genre
                                        ) => (

                                            <span
                                                key={
                                                    genre
                                                }
                                                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur"
                                            >

                                                {
                                                    genre
                                                }

                                            </span>

                                        )
                                    )

                                ) : (

                                    <span className="text-xs text-indigo-200">

                                        {language ===
                                        "id"
                                            ? "Tidak ada data genre"
                                            : "No genre data"}

                                    </span>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        RECENT MOVIES
                    ================================================== */}

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6 flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-bold text-slate-900">

                                    {language ===
                                    "id"
                                        ? "Film Terbaru"
                                        : "Recent Movies"}

                                </h2>

                            </div>

                            <Link
                                href="/admin/movies"
                                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                            >

                                {language ===
                                "id"
                                    ? "Lihat Semua"
                                    : "Show All"}

                                {" →"}

                            </Link>

                        </div>


                        {/* ERROR */}

                        {apiError &&
                            movies.length ===
                                0 && (

                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4">

                                    <p className="text-sm font-semibold text-red-600">

                                        {language ===
                                        "id"
                                            ? "Data film belum tersedia."
                                            : "Movie data is not available."}

                                    </p>

                                    <p className="mt-1 text-sm text-red-500">

                                        {
                                            apiError
                                        }

                                    </p>

                                </div>

                            )}


                        {/* MOVIES */}

                        {movies.length >
                        0 ? (

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                                {movies.map(
                                    (
                                        movie,
                                        index
                                    ) => {

                                        const imdbId =
                                            String(
                                                movie?.imdbID ||
                                                    movie?.imdb_id ||
                                                    movie?.imdbId ||
                                                    ""
                                            ).trim();

                                        const movieTitle =
                                            movie?.title ||
                                            movie?.Title ||
                                            "N/A";

                                        const movieImage =
                                            movie?.image ||
                                            movie?.poster ||
                                            movie?.Poster ||
                                            null;

                                        const movieGenre =
                                            movie?.genre ||
                                            movie?.Genre ||
                                            "N/A";

                                        const movieYear =
                                            movie?.year ||
                                            movie?.Year ||
                                            "-";

                                        const movieRating =
                                            movie?.imdbRating ||
                                            movie?.imdb_rating ||
                                            movie?.rating ||
                                            "N/A";

                                        const isFavorite =
                                            imdbId
                                                ? currentFavoriteIds.some(
                                                      (
                                                          id
                                                      ) =>
                                                          String(
                                                              id
                                                          ).trim() ===
                                                          imdbId
                                                  )
                                                : false;

                                        const isLoading =
                                            imdbId
                                                ? favoriteLoading[
                                                      imdbId
                                                  ]
                                                : false;

                                        return (

                                            <div
                                                key={
                                                    imdbId ||
                                                    `${movieTitle}-${movieYear}-${index}`
                                                }

                                                onClick={() =>
                                                    openMovieDetail(
                                                        movie
                                                    )
                                                }

                                                className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                            >

                                                {/* POSTER */}

                                                <div className="relative h-64 overflow-hidden bg-slate-200">

                                                    {movieImage ? (

                                                        <img
                                                            src={
                                                                movieImage
                                                            }
                                                            alt={
                                                                movieTitle
                                                            }
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                            onError={(
                                                                event
                                                            ) => {

                                                                event.currentTarget.style.display =
                                                                    "none";

                                                                const fallback =
                                                                    event.currentTarget
                                                                        .nextElementSibling;

                                                                if (
                                                                    fallback
                                                                ) {

                                                                    fallback.style.display =
                                                                        "flex";

                                                                }

                                                            }}
                                                        />

                                                    ) : null}


                                                    {/* NO IMAGE */}

                                                    <div
                                                        className="h-full w-full items-center justify-center bg-slate-200 text-center text-sm text-slate-400"
                                                        style={{
                                                            display:
                                                                movieImage
                                                                    ? "none"
                                                                    : "flex",
                                                        }}
                                                    >

                                                        <div>

                                                            <div className="mb-2 text-3xl">
                                                                🎬
                                                            </div>

                                                            <div>
                                                                {language ===
                                                                "id"
                                                                    ? "Tidak Ada Gambar"
                                                                    : "No Image"}
                                                            </div>

                                                        </div>

                                                    </div>


                                                    {/* RATING */}

                                                    <div className="absolute right-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">

                                                        <span className="text-amber-300">
                                                            ★
                                                        </span>{" "}

                                                        {movieRating &&
                                                        movieRating !==
                                                            "N/A"
                                                            ? movieRating
                                                            : "N/A"}

                                                    </div>

                                                </div>


                                                {/* CARD CONTENT */}

                                                <div className="p-4">

                                                    <h3
                                                        className="truncate text-base font-bold text-slate-900"
                                                        title={
                                                            movieTitle
                                                        }
                                                    >

                                                        {
                                                            movieTitle
                                                        }

                                                    </h3>


                                                    <div className="mt-2 flex items-center justify-between gap-2 text-sm text-slate-500">

                                                        <span
                                                            className="truncate"
                                                            title={
                                                                movieGenre
                                                            }
                                                        >

                                                            {
                                                                movieGenre
                                                            }

                                                        </span>

                                                        <span className="shrink-0">

                                                            {
                                                                movieYear
                                                            }

                                                        </span>

                                                    </div>


                                                    {/* FAVORITE */}

                                                    <div className="mt-4 flex justify-end">

                                                        <button
                                                            type="button"

                                                            onClick={(
                                                                event
                                                            ) =>
                                                                handleFavoriteClick(
                                                                    event,
                                                                    movie
                                                                )
                                                            }

                                                            disabled={
                                                                isLoading ||
                                                                !imdbId
                                                            }

                                                            title={
                                                                isFavorite
                                                                    ? language ===
                                                                      "id"
                                                                        ? "Hapus dari favorit"
                                                                        : "Remove from favorites"
                                                                    : language ===
                                                                      "id"
                                                                        ? "Tambah ke favorit"
                                                                        : "Add to favorites"
                                                            }

                                                            className={`
                                                                flex
                                                                h-10
                                                                w-10
                                                                cursor-pointer
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                text-lg
                                                                shadow-sm
                                                                transition-all
                                                                duration-200
                                                                ${
                                                                    isFavorite
                                                                        ? "bg-red-500 text-white hover:bg-red-600"
                                                                        : "border border-red-500 bg-white text-red-500 hover:bg-red-50"
                                                                }
                                                                ${
                                                                    isLoading
                                                                        ? "cursor-wait opacity-60"
                                                                        : "hover:scale-110"
                                                                }
                                                            `}
                                                        >

                                                            {isLoading ? (

                                                                <span className="text-xs">
                                                                    ...
                                                                </span>

                                                            ) : (

                                                                <span>
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

                        ) : (

                            !apiError && (

                                <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">

                                    <p className="text-sm font-semibold text-slate-600">

                                        {language ===
                                        "id"
                                            ? "Data film belum tersedia."
                                            : "Movie data is not available."}

                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">

                                        {language ===
                                        "id"
                                            ? "Menunggu data dari OMDb API."
                                            : "Waiting for data from OMDb API."}

                                    </p>

                                </div>

                            )

                        )}

                    </div>

                </div>

            </div>


            {/* =========================================================
                DETAIL MODAL
            ========================================================== */}

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
                        onClick={(
                            event
                        ) =>
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
                                cursor-pointer
                                items-center
                                justify-center
                                rounded-full
                                bg-red-500
                                text-3xl
                                font-bold
                                text-white
                                shadow-xl
                                transition
                                hover:scale-105
                                hover:bg-red-600
                            "
                        >
                            ×
                        </button>


                        {/* MODAL SCROLL */}

                        <div
                            className="
                                h-full
                                overflow-y-auto
                                rounded-3xl
                                bg-white
                                shadow-2xl
                            "
                        >

                            {/* =================================================
                                DARK HEADER
                            ================================================== */}

                            <div className="relative overflow-hidden bg-slate-950">

                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />


                                <div className="relative flex flex-col gap-8 p-7 md:flex-row md:p-10">

                                    {/* POSTER */}

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
                                                    className="h-full w-full object-cover"
                                                    onError={() =>
                                                        setDetailImageError(
                                                            true
                                                        )
                                                    }
                                                />

                                            ) : (

                                                <div className="
                                                    flex
                                                    h-full
                                                    w-full
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    text-center
                                                    text-slate-400
                                                ">

                                                    <span className="text-6xl">
                                                        🖼️
                                                    </span>

                                                    <span className="mt-3 text-sm">
                                                        {language ===
                                                        "id"
                                                            ? "Tidak Ada Gambar"
                                                            : "No Image"}
                                                    </span>

                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    {/* MOVIE INFO */}

                                    <div className="flex-1 text-white">

                                        {/* TYPE / RATED */}

                                        <div className="flex flex-wrap items-center gap-2">

                                            {selectedMovie.type &&
                                            selectedMovie.type !==
                                                "N/A" && (

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


                                        {/* TITLE */}

                                        <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">

                                            {
                                                selectedMovie.title
                                            }

                                        </h2>


                                        {/* YEAR / RUNTIME / GENRE */}

                                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">

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


                                        {/* RATING */}

                                        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-slate-950 shadow-lg">

                                            <span className="text-xl">
                                                ★
                                            </span>

                                            <span className="text-lg font-black">

                                                {selectedMovie.imdbRating &&
                                                selectedMovie.imdbRating !==
                                                    "N/A"
                                                    ? selectedMovie.imdbRating
                                                    : "N/A"}

                                            </span>

                                            <span className="text-sm font-medium">
                                                IMDb
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                WHITE CONTENT
                            ================================================== */}

                            <div className="p-7 md:p-10">

                                {/* LOADING */}

                                {loadingDetail && (

                                    <div className="mb-6 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-600">

                                        {language ===
                                        "id"
                                            ? "Memuat detail film..."
                                            : "Loading movie details..."}

                                    </div>

                                )}


                                {/* PLOT */}

                                <section>

                                    <h3 className="text-xl font-bold text-slate-900">

                                        Plot

                                    </h3>

                                    <p className="mt-5 text-base leading-8 text-slate-600">

                                        {selectedMovie.plot &&
                                        selectedMovie.plot !==
                                            "N/A"
                                            ? selectedMovie.plot
                                            : language ===
                                              "id"
                                            ? "Tidak ada informasi plot."
                                            : "No plot information available."}

                                    </p>

                                </section>


                                <div className="my-8 h-px bg-slate-200" />


                                {/* PEOPLE */}

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                                    <div className="rounded-2xl bg-slate-50 p-6">

                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Director
                                        </p>

                                        <p className="mt-3 text-base font-semibold leading-7 text-slate-900">

                                            {
                                                selectedMovie.director
                                            }

                                        </p>

                                    </div>


                                    <div className="rounded-2xl bg-slate-50 p-6">

                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Writer
                                        </p>

                                        <p className="mt-3 text-base font-semibold leading-7 text-slate-900">

                                            {
                                                selectedMovie.writer
                                            }

                                        </p>

                                    </div>


                                    <div className="rounded-2xl bg-slate-50 p-6">

                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Actors
                                        </p>

                                        <p className="mt-3 text-base font-semibold leading-7 text-slate-900">

                                            {
                                                selectedMovie.actors
                                            }

                                        </p>

                                    </div>

                                </div>


                                {/* ADDITIONAL */}

                                <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">

                                    {selectedMovie.released &&
                                    selectedMovie.released !==
                                        "N/A" && (

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                {language ===
                                                "id"
                                                    ? "Rilis"
                                                    : "Released"}
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-800">
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
                                                {language ===
                                                "id"
                                                    ? "Durasi"
                                                    : "Runtime"}
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-800">
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
                                                {language ===
                                                "id"
                                                    ? "Bahasa"
                                                    : "Language"}
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-800">
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
                                                {language ===
                                                "id"
                                                    ? "Negara"
                                                    : "Country"}
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-800">
                                                {
                                                    selectedMovie.country
                                                }
                                            </p>

                                        </div>

                                    )}


                                    {selectedMovie.awards &&
                                    selectedMovie.awards !==
                                        "N/A" && (

                                        <div className="sm:col-span-2">

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                {language ===
                                                "id"
                                                    ? "Penghargaan"
                                                    : "Awards"}
                                            </p>

                                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                                                {
                                                    selectedMovie.awards
                                                }
                                            </p>

                                        </div>

                                    )}

                                </div>


                                {/* IMDb */}

                                <div className="mt-8 rounded-2xl bg-slate-50 p-6">

                                    <h3 className="mb-5 text-base font-bold text-slate-900">
                                        IMDb Information
                                    </h3>


                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                                        {selectedMovie.imdbID && (

                                            <div>

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    IMDb ID
                                                </p>

                                                <p className="mt-2 font-mono text-sm font-semibold text-slate-700">

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
                                                    IMDb Votes
                                                </p>

                                                <p className="mt-2 text-sm font-semibold text-slate-700">

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
                                                    Metascore
                                                </p>

                                                <p className="mt-2 text-sm font-semibold text-slate-700">

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
                                                    Box Office
                                                </p>

                                                <p className="mt-2 text-sm font-semibold text-slate-700">

                                                    {
                                                        selectedMovie.boxOffice
                                                    }

                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </div>


                                {/* RATINGS */}

                                {selectedMovie.ratings &&
                                selectedMovie.ratings.length >
                                    0 && (

                                    <div className="mt-8">

                                        <h3 className="text-base font-bold text-slate-900">
                                            Ratings
                                        </h3>

                                        <div className="mt-4 flex flex-wrap gap-3">

                                            {selectedMovie.ratings.map(
                                                (
                                                    rating,
                                                    index
                                                ) => (

                                                    <div
                                                        key={
                                                            index
                                                        }
                                                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                                                    >

                                                        <p className="text-xs font-semibold text-slate-400">
                                                            {
                                                                rating.Source
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                                            {
                                                                rating.Value
                                                            }
                                                        </p>

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

            )}

        </AdminLayout>
    );
}