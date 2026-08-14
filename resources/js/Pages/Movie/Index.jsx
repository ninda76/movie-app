import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";
import { useRef, useState } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function Index({
    movies = [],
    search = "Batman",
    currentPage = 1,
    totalResults = 0,
    totalPages = 0,
    favoriteIds: initialFavoriteIds = [],
    apiError = null,
}) {
    const { t } = useLanguage();

    const [searchValue, setSearchValue] = useState("");
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [detailImageError, setDetailImageError] = useState(false);

    const [favoriteIds, setFavoriteIds] = useState(
        Array.isArray(initialFavoriteIds)
            ? initialFavoriteIds.map((id) => String(id))
            : []
    );

    const [favoriteLoading, setFavoriteLoading] = useState({});
    const [posterErrors, setPosterErrors] = useState({});

    const detailCache = useRef({});

    /*
    |--------------------------------------------------------------------------
    | POSTER
    |--------------------------------------------------------------------------
    */

    const getPoster = (movie) => {
        const poster =
            movie?.image ||
            movie?.Poster ||
            movie?.poster;

        if (
            !poster ||
            String(poster).trim() === "" ||
            String(poster).toUpperCase() === "N/A"
        ) {
            return null;
        }

        return poster;
    };

    /*
    |--------------------------------------------------------------------------
    | RATING
    |--------------------------------------------------------------------------
    */

    const getRating = (movie) => {
        const rating =
            movie?.imdbRating ||
            movie?.imdb_rating ||
            movie?.rating;

        if (
            !rating ||
            String(rating).trim() === "" ||
            String(rating).toUpperCase() === "N/A"
        ) {
            return "N/A";
        }

        return rating;
    };

    /*
    |--------------------------------------------------------------------------
    | GENRE
    |--------------------------------------------------------------------------
    */

    const getGenre = (movie) => {
        const genre =
            movie?.genre ||
            movie?.Genre;

        if (
            !genre ||
            String(genre).trim() === ""
        ) {
            return "N/A";
        }

        return genre;
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN DETAIL
    |--------------------------------------------------------------------------
    */

    const openMovieDetail = async (movie) => {
        const imdbID = movie?.imdbID;

        if (!imdbID) {
            return;
        }

        const poster = getPoster(movie);

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

            image: poster,

            genre:
                movie?.genre ||
                movie?.Genre ||
                "N/A",

            type:
                movie?.type ||
                movie?.Type ||
                "N/A",

            imdbRating:
                movie?.imdbRating ||
                movie?.imdb_rating ||
                movie?.rating ||
                "N/A",

            rated:
                movie?.rated ||
                movie?.Rated ||
                "N/A",

            plot:
                movie?.plot ||
                movie?.Plot ||
                "",

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

            released:
                movie?.released ||
                movie?.Released ||
                "N/A",

            runtime:
                movie?.runtime ||
                movie?.Runtime ||
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

        setSelectedMovie(previewMovie);
        setDetailImageError(false);

        if (detailCache.current[imdbID]) {
            setSelectedMovie(
                detailCache.current[imdbID]
            );
            return;
        }

        setLoadingDetail(true);

        try {
            const response = await axios.get(
                `/admin/movies/${imdbID}`,
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
                response?.data?.success &&
                response?.data?.movie
            ) {
                const apiMovie =
                    response.data.movie;

                const detail = {
                    ...previewMovie,
                    ...apiMovie,

                    imdbID:
                        apiMovie.imdbID ||
                        imdbID,

                    title:
                        apiMovie.title ||
                        apiMovie.Title ||
                        previewMovie.title,

                    year:
                        apiMovie.year ||
                        apiMovie.Year ||
                        previewMovie.year,

                    image:
                        apiMovie.image ||
                        apiMovie.poster ||
                        apiMovie.Poster ||
                        previewMovie.image,

                    genre:
                        apiMovie.genre ||
                        apiMovie.Genre ||
                        previewMovie.genre,

                    imdbRating:
                        apiMovie.imdbRating ||
                        apiMovie.imdb_rating ||
                        previewMovie.imdbRating,

                    rated:
                        apiMovie.rated ||
                        apiMovie.Rated ||
                        previewMovie.rated,

                    plot:
                        apiMovie.plot ||
                        apiMovie.Plot ||
                        previewMovie.plot,

                    director:
                        apiMovie.director ||
                        apiMovie.Director ||
                        previewMovie.director,

                    writer:
                        apiMovie.writer ||
                        apiMovie.Writer ||
                        previewMovie.writer,

                    actors:
                        apiMovie.actors ||
                        apiMovie.Actors ||
                        previewMovie.actors,

                    released:
                        apiMovie.released ||
                        apiMovie.Released ||
                        previewMovie.released,

                    runtime:
                        apiMovie.runtime ||
                        apiMovie.Runtime ||
                        previewMovie.runtime,

                    language:
                        apiMovie.language ||
                        apiMovie.Language ||
                        previewMovie.language,

                    country:
                        apiMovie.country ||
                        apiMovie.Country ||
                        previewMovie.country,

                    awards:
                        apiMovie.awards ||
                        apiMovie.Awards ||
                        previewMovie.awards,

                    imdbVotes:
                        apiMovie.imdbVotes ||
                        apiMovie.imdb_votes ||
                        previewMovie.imdbVotes,

                    metascore:
                        apiMovie.metascore ||
                        apiMovie.Metascore ||
                        previewMovie.metascore,

                    boxOffice:
                        apiMovie.boxOffice ||
                        apiMovie.BoxOffice ||
                        previewMovie.boxOffice,

                    ratings:
                        apiMovie.ratings ||
                        apiMovie.Ratings ||
                        previewMovie.ratings ||
                        [],
                };

                detailCache.current[imdbID] =
                    detail;

                setSelectedMovie(detail);
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
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const handleSearch = (e) => {
        e.preventDefault();

        const keyword =
            searchValue.trim();

        if (!keyword) {
            return;
        }

        setPageLoading(true);

        router.get(
            "/admin/movies",
            {
                search: keyword,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,

                onFinish: () => {
                    setPageLoading(false);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const goToPage = (page) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage ||
            pageLoading
        ) {
            return;
        }

        setPageLoading(true);

        router.get(
            "/admin/movies",
            {
                search:
                    search || "Batman",
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,

                onFinish: () => {
                    setPageLoading(false);
                },
            }
        );
    };

    const paginationLimit = 4;

    const paginationStart =
        Math.floor(
            (currentPage - 1) /
                paginationLimit
        ) *
            paginationLimit +
        1;

    const paginationEnd = Math.min(
        paginationStart +
            paginationLimit -
            1,
        totalPages
    );

    const paginationPages = [];

    for (
        let page = paginationStart;
        page <= paginationEnd;
        page++
    ) {
        paginationPages.push(page);
    }

    /*
    |--------------------------------------------------------------------------
    | ADD FAVORITE
    |--------------------------------------------------------------------------
    */

    const addFavorite = async (movie) => {
        const movieId = String(
            movie?.imdbID || ""
        ).trim();

        if (!movieId) {
            return false;
        }

        if (favoriteLoading[movieId]) {
            return false;
        }

        try {
            setFavoriteLoading(
                (prev) => ({
                    ...prev,
                    [movieId]: true,
                })
            );

            const response =
                await axios.post(
                    "/favorite",
                    {
                        imdb_id: movieId,

                        title:
                            movie?.title ||
                            movie?.Title ||
                            "",

                        year:
                            movie?.year ||
                            movie?.Year ||
                            null,

                        poster:
                            movie?.image ||
                            movie?.Poster ||
                            movie?.poster ||
                            null,

                        imdb_rating:
                            movie?.imdbRating ||
                            movie?.imdb_rating ||
                            movie?.rating ||
                            null,

                        genre:
                            movie?.genre ||
                            movie?.Genre ||
                            null,
                    },
                    {
                        headers: {
                            Accept:
                                "application/json",
                            "X-Requested-With":
                                "XMLHttpRequest",
                        },
                    }
                );

            if (
                response?.data?.success
            ) {
                setFavoriteIds(
                    (prev) => {
                        const normalized =
                            prev.map(
                                (id) =>
                                    String(id)
                            );

                        if (
                            normalized.includes(
                                movieId
                            )
                        ) {
                            return normalized;
                        }

                        return [
                            ...normalized,
                            movieId,
                        ];
                    }
                );

                return true;
            }

            return false;

        } catch (error) {
            console.error(
                "Gagal menambahkan favorite:",
                error
            );

            return false;

        } finally {
            setFavoriteLoading(
                (prev) => ({
                    ...prev,
                    [movieId]: false,
                })
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE FAVORITE
    |--------------------------------------------------------------------------
    */

    const removeFavorite = async (movie) => {
        const movieId = String(
            movie?.imdbID || ""
        ).trim();

        if (!movieId) {
            return false;
        }

        if (favoriteLoading[movieId]) {
            return false;
        }

        try {
            setFavoriteLoading(
                (prev) => ({
                    ...prev,
                    [movieId]: true,
                })
            );

            const response =
                await axios.delete(
                    `/favorite/${encodeURIComponent(
                        movieId
                    )}`,
                    {
                        headers: {
                            Accept:
                                "application/json",
                            "X-Requested-With":
                                "XMLHttpRequest",
                        },
                    }
                );

            if (
                response?.data?.success
            ) {
                setFavoriteIds(
                    (prev) =>
                        prev
                            .map(
                                (id) =>
                                    String(id)
                            )
                            .filter(
                                (id) =>
                                    id !==
                                    movieId
                            )
                );

                return true;
            }

            return false;

        } catch (error) {
            console.error(
                "Gagal menghapus favorite:",
                error
            );

            return false;

        } finally {
            setFavoriteLoading(
                (prev) => ({
                    ...prev,
                    [movieId]: false,
                })
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | TOGGLE FAVORITE
    |--------------------------------------------------------------------------
    */

    const toggleFavorite = async (
        e,
        movie
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const movieId = String(
            movie?.imdbID || ""
        ).trim();

        if (!movieId) {
            return;
        }

        if (favoriteLoading[movieId]) {
            return;
        }

        const isFavorite =
            favoriteIds.some(
                (id) =>
                    String(id).trim() ===
                    movieId
            );

        if (isFavorite) {
            await removeFavorite(movie);
        } else {
            await addFavorite(movie);
        }
    };

    return (
        <AdminLayout>

            <Head title={t("movie.title")} />

            <div className="min-h-screen bg-slate-100">

                {/* HEADER */}

                <div
                    className="
                        bg-gradient-to-r
                        from-slate-950
                        to-indigo-900
                        px-6
                        py-8
                        lg:px-10
                    "
                >

                    <div className="mx-auto max-w-7xl">

                        <h1
                            className="
                                text-3xl
                                font-bold
                                text-white
                            "
                        >
                            {t("movie.title")}
                        </h1>

                      
                    </div>

                </div>

                <div
                    className="
                        mx-auto
                        max-w-7xl
                        px-6
                        py-8
                        lg:px-10
                    "
                >

                    {/* SEARCH */}

                    <form
                        onSubmit={handleSearch}
                        className="
                            mb-8
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                md:flex-row
                            "
                        >

                            <input
                                type="text"
                                value={
                                    searchValue
                                }
                                onChange={(e) =>
                                    setSearchValue(
                                        e.target.value
                                    )
                                }
                                placeholder={t(
                                    "movie.searchPlaceholder"
                                )}
                                className="
                                    flex-1
                                    rounded-xl
                                    border
                                    border-slate-300
                                    px-5
                                    py-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-100
                                "
                            />

                            <button
                                type="submit"
                                disabled={
                                    pageLoading
                                }
                                className="
                                    rounded-xl
                                    bg-indigo-600
                                    px-8
                                    py-3
                                    text-sm
                                    font-bold
                                    text-white
                                    transition
                                    hover:bg-indigo-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {pageLoading
                                    ? t(
                                          "common.loading"
                                      )
                                    : t(
                                          "common.search"
                                      )}
                            </button>

                        </div>

                    </form>

                    {/* RESULT HEADER */}

                    <div
                        className="
                            mb-6
                            flex
                            flex-col
                            justify-between
                            gap-3
                            md:flex-row
                            md:items-center
                        "
                    >

                        <div>

                            {/* <h2
                                className="
                                    text-2xl
                                    font-bold
                                    text-slate-900
                                "
                            >

                                

                                <span className="text-indigo-600">
                                    "{search || "Batman"}"
                                </span>

                            </h2> */}

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                {totalResults}{" "}
                                {t(
                                    "movie.moviesFound"
                                )}
                            </p>

                        </div>

                        {totalPages > 0 && (

                            <div
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >

                                {t(
                                    "movie.page"
                                )}{" "}

                                <span className="font-bold text-slate-900">
                                    {currentPage}
                                </span>

                                {" "}

                                {t(
                                    "movie.of"
                                )}

                                {" "}

                                <span className="font-bold text-slate-900">
                                    {totalPages}
                                </span>

                            </div>

                        )}

                    </div>

                    {/* ERROR */}

                    {apiError && (

                        <div
                            className="
                                mb-6
                                rounded-2xl
                                border
                                border-red-200
                                bg-red-50
                                px-5
                                py-4
                                text-sm
                                font-semibold
                                text-red-600
                            "
                        >
                            {apiError}
                        </div>

                    )}

                    {/* LOADING */}

                    {pageLoading && (

                        <div
                            className="
                                mb-5
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                border
                                border-indigo-100
                                bg-indigo-50
                                px-4
                                py-3
                                text-sm
                                font-semibold
                                text-indigo-700
                            "
                        >

                            <div
                                className="
                                    h-5
                                    w-5
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-indigo-200
                                    border-t-indigo-600
                                "
                            />

                            {t(
                                "common.loading"
                            )}

                        </div>

                    )}

                    {/* MOVIES */}

                    {movies.length > 0 ? (

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-6
                                sm:grid-cols-2
                                lg:grid-cols-4
                            "
                        >

                            {movies.map(
                                (movie) => {

                                    const poster =
                                        getPoster(
                                            movie
                                        );

                                    const rating =
                                        getRating(
                                            movie
                                        );

                                    const genre =
                                        getGenre(
                                            movie
                                        );

                                    const movieId =
                                        String(
                                            movie?.imdbID ||
                                            ""
                                        ).trim();

                                    const isFavorite =
                                        favoriteIds.some(
                                            (id) =>
                                                String(
                                                    id
                                                ).trim() ===
                                                movieId
                                        );

                                    const isLoadingFavorite =
                                        favoriteLoading[
                                            movieId
                                        ] || false;

                                    return (

                                        <div
                                            key={
                                                movie.imdbID
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

                                            {/* POSTER */}

                                            <div
                                                className="
                                                    relative
                                                    aspect-[2/3]
                                                    w-full
                                                    overflow-hidden
                                                    bg-slate-100
                                                "
                                            >

                                                {poster &&
                                                !posterErrors[
                                                    movie.imdbID
                                                ] ? (

                                                    <img
                                                        src={
                                                            poster
                                                        }
                                                        alt={
                                                            movie.title ||
                                                            movie.Title ||
                                                            "Movie Poster"
                                                        }
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="
                                                            h-full
                                                            w-full
                                                            object-cover
                                                            transition
                                                            duration-500
                                                            group-hover:scale-105
                                                        "
                                                        onError={() => {
                                                            setPosterErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [movie.imdbID]:
                                                                        true,
                                                                })
                                                            );
                                                        }}
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

                                                        <span
                                                            className="
                                                                mt-3
                                                                text-sm
                                                                font-semibold
                                                            "
                                                        >
                                                            {t(
                                                                "common.noImage"
                                                            )}
                                                        </span>

                                                    </div>

                                                )}

                                                {/* RATING */}

                                                <div
                                                    className="
                                                        absolute
                                                        right-3
                                                        top-3
                                                        rounded-full
                                                        bg-black/85
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-bold
                                                        text-white
                                                        shadow-lg
                                                    "
                                                >
                                                    ★ {rating}
                                                </div>

                                            </div>

                                            {/* CARD BODY */}

                                            <div className="p-5">

                                                <h3
                                                    className="
                                                        truncate
                                                        text-lg
                                                        font-bold
                                                        text-slate-900
                                                    "
                                                    title={
                                                        movie.title ||
                                                        movie.Title
                                                    }
                                                >
                                                    {
                                                        movie.title ||
                                                        movie.Title
                                                    }
                                                </h3>

                                                <div
                                                    className="
                                                        mt-2
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                            truncate
                                                            text-sm
                                                            font-medium
                                                            text-indigo-500
                                                        "
                                                        title={
                                                            genre
                                                        }
                                                    >
                                                        {genre}
                                                    </p>

                                                    <span
                                                        className="
                                                            shrink-0
                                                            text-sm
                                                            text-slate-500
                                                        "
                                                    >
                                                        {
                                                            movie.year ||
                                                            movie.Year ||
                                                            "N/A"
                                                        }
                                                    </span>

                                                </div>

                                                {/* FAVORITE */}

                                                <div
                                                    className="
                                                        mt-5
                                                        flex
                                                        justify-end
                                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            toggleFavorite(
                                                                e,
                                                                movie
                                                            )
                                                        }
                                                        disabled={
                                                            isLoadingFavorite ||
                                                            !movieId
                                                        }
                                                        title={
                                                            isFavorite
                                                                ? "Remove favorite"
                                                                : "Add favorite"
                                                        }
                                                        className={`
                                                            flex
                                                            h-11
                                                            w-11
                                                            
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            text-xl
                                                            shadow-sm
                                                            transition
                                                            hover:scale-105
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-60

                                                            ${
                                                                isFavorite
                                                                    ? "bg-red-500 text-white hover:bg-red-600"
                                                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                                                            }
                                                        `}
                                                    >

                                                        {isLoadingFavorite ? (

                                                            <div
                                                                className="
                                                                    h-5
                                                                    w-5
                                                                    animate-spin
                                                                    rounded-full
                                                                    border-2
                                                                    border-current
                                                                    border-t-transparent
                                                                "
                                                            />

                                                        ) : (

                                                            isFavorite
                                                                ? "♥"
                                                                : "♡"

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

                        <div
                            className="
                                rounded-3xl
                                border
                                border-slate-200
                                bg-white
                                px-6
                                py-16
                                text-center
                                shadow-sm
                            "
                        >

                            <div className="text-6xl">
                                🎬
                            </div>

                            <h3
                                className="
                                    mt-5
                                    text-xl
                                    font-bold
                                    text-slate-900
                                "
                            >
                                {t(
                                    "common.noMoviesFound"
                                )}
                            </h3>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-slate-500
                                "
                            >
                                {t(
                                    "movie.tryAnother"
                                )}
                            </p>

                        </div>

                    )}

                    {/* PAGINATION */}

                    {totalPages > 1 && (

                        <div
                            className="
                                mt-10
                                flex
                                flex-wrap
                                items-center
                                justify-center
                                gap-2
                            "
                        >

                            <button
                                type="button"
                                disabled={
                                    currentPage <= 1 ||
                                    pageLoading
                                }
                                onClick={() =>
                                    goToPage(
                                        currentPage - 1
                                    )
                                }
                                title={t(
                                    "common.previous"
                                )}
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    text-slate-600
                                    shadow-sm
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                ←
                            </button>

                            {paginationPages.map(
                                (page) => (

                                    <button
                                        key={page}
                                        type="button"
                                        disabled={
                                            pageLoading
                                        }
                                        onClick={() =>
                                            goToPage(
                                                page
                                            )
                                        }
                                        className={`
                                            flex
                                            h-11
                                            min-w-11
                                            items-center
                                            justify-center
                                            rounded-xl
                                            px-3
                                            text-sm
                                            font-bold
                                            shadow-sm
                                            transition
                                            ${
                                                currentPage ===
                                                page
                                                    ? "bg-indigo-600 text-white"
                                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>

                                )
                            )}

                            <button
                                type="button"
                                disabled={
                                    currentPage >=
                                        totalPages ||
                                    pageLoading
                                }
                                onClick={() =>
                                    goToPage(
                                        currentPage + 1
                                    )
                                }
                                title={t(
                                    "common.next"
                                )}
                                className="
                                    flex
                                    h-11
                                    w-11
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    text-slate-600
                                    shadow-sm
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                →
                            </button>

                        </div>

                    )}

                </div>

            </div>

            {/* DETAIL MODAL */}

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
                        px-4
                        py-6
                        backdrop-blur-sm
                    "
                    onClick={
                        closeMovieDetail
                    }
                >

                    <div
                        className="
                            relative
                            h-[92vh]
                            w-full
                            max-w-6xl
                            overflow-hidden
                            rounded-3xl
                            bg-white
                            shadow-2xl
                        "
                        onClick={(e) =>
                            e.stopPropagation()
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
                                right-4
                                top-4
                                z-50
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
                                grid
                                h-full
                                grid-cols-1
                                lg:grid-cols-[440px_minmax(0,1fr)]
                            "
                        >

                            {/* MODAL POSTER */}

                            <div
                                className="
                                    flex
                                    h-full
                                    min-h-0
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    bg-slate-100
                                    p-4
                                    lg:p-6
                                "
                            >

                                {getPoster(
                                    selectedMovie
                                ) &&
                                !detailImageError ? (

                                    <img
                                        src={getPoster(
                                            selectedMovie
                                        )}
                                        alt={
                                            selectedMovie.title
                                        }
                                        className="
                                            block
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

                                        <span className="text-7xl">
                                            🖼️
                                        </span>

                                        <span className="mt-4 text-sm font-semibold">
                                            {t(
                                                "common.noImage"
                                            )}
                                        </span>

                                    </div>

                                )}

                            </div>

                            {/* MODAL CONTENT */}

                            <div
                                className="
                                    min-h-0
                                    overflow-y-auto
                                    p-7
                                    lg:p-10
                                "
                            >

                                {loadingDetail && (

                                    <div
                                        className="
                                            mb-4
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

                                        <div
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

                                        {t(
                                            "common.loading"
                                        )}

                                    </div>

                                )}

                                <h2
                                    className="
                                        pr-14
                                        text-3xl
                                        font-bold
                                        leading-tight
                                        text-slate-900
                                        lg:text-4xl
                                    "
                                >
                                    {
                                        selectedMovie.title
                                    }
                                </h2>

                                <div
                                    className="
                                        mt-5
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-3
                                    "
                                >

                                    <span className="text-base text-slate-500">
                                        {
                                            selectedMovie.year ||
                                            "N/A"
                                        }
                                    </span>

                                    {selectedMovie.imdbRating &&
                                    selectedMovie.imdbRating !==
                                        "N/A" && (

                                        <span
                                            className="
                                                rounded-full
                                                bg-yellow-100
                                                px-4
                                                py-2
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

                                    {selectedMovie.rated &&
                                    selectedMovie.rated !==
                                        "N/A" && (

                                        <span
                                            className="
                                                rounded-full
                                                bg-slate-100
                                                px-4
                                                py-2
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

                                {selectedMovie.genre &&
                                selectedMovie.genre !==
                                    "N/A" && (

                                    <div
                                        className="
                                            mt-6
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
                                                            index
                                                        }
                                                        className="
                                                            rounded-full
                                                            bg-indigo-50
                                                            px-4
                                                            py-2
                                                            text-sm
                                                            font-semibold
                                                            text-indigo-600
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

                                {selectedMovie.plot &&
                                selectedMovie.plot !==
                                    "N/A" && (

                                    <div className="mt-9">

                                        <h3
                                            className="
                                                text-xl
                                                font-bold
                                                text-slate-900
                                            "
                                        >
                                            {t(
                                                "common.plot"
                                            )}
                                        </h3>

                                        <p
                                            className="
                                                mt-4
                                                text-base
                                                leading-8
                                                text-slate-600
                                            "
                                        >
                                            {
                                                selectedMovie.plot
                                            }
                                        </p>

                                    </div>

                                )}

                                <div
                                    className="
                                        my-8
                                        h-px
                                        bg-slate-200
                                    "
                                />

                                {/* MOVIE INFORMATION */}

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        gap-6
                                        md:grid-cols-2
                                    "
                                >

                                    {[
                                        [
                                            "director",
                                            selectedMovie.director,
                                        ],
                                        [
                                            "writer",
                                            selectedMovie.writer,
                                        ],
                                        [
                                            "actors",
                                            selectedMovie.actors,
                                        ],
                                        [
                                            "released",
                                            selectedMovie.released,
                                        ],
                                        [
                                            "runtime",
                                            selectedMovie.runtime,
                                        ],
                                        [
                                            "language",
                                            selectedMovie.language,
                                        ],
                                        [
                                            "country",
                                            selectedMovie.country,
                                        ],
                                        [
                                            "awards",
                                            selectedMovie.awards,
                                        ],
                                    ].map(
                                        (
                                            [key, value],
                                            index
                                        ) => {

                                            if (
                                                !value ||
                                                value ===
                                                    "N/A"
                                            ) {
                                                return null;
                                            }

                                            const fullWidth =
                                                key ===
                                                    "actors" ||
                                                key ===
                                                    "awards";

                                            return (

                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className={
                                                        fullWidth
                                                            ? "md:col-span-2"
                                                            : ""
                                                    }
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            font-bold
                                                            uppercase
                                                            tracking-wide
                                                            text-slate-400
                                                        "
                                                    >
                                                        {t(
                                                            `modal.${key}`
                                                        )}
                                                    </p>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-sm
                                                            font-semibold
                                                            leading-6
                                                            text-slate-800
                                                        "
                                                    >
                                                        {value}
                                                    </p>

                                                </div>

                                            );
                                        }
                                    )}

                                </div>

                                {/* IMDb INFORMATION */}

                                <div
                                    className="
                                        mt-8
                                        rounded-2xl
                                        bg-slate-50
                                        p-5
                                    "
                                >

                                    <h3
                                        className="
                                            text-sm
                                            font-bold
                                            text-slate-900
                                        "
                                    >
                                        {t(
                                            "modal.imdbInformation"
                                        )}
                                    </h3>

                                    <div
                                        className="
                                            mt-5
                                            grid
                                            grid-cols-1
                                            gap-5
                                            sm:grid-cols-2
                                        "
                                    >

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                {t(
                                                    "modal.imdbId"
                                                )}
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    font-mono
                                                    text-sm
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >
                                                {
                                                    selectedMovie.imdbID
                                                }
                                            </p>

                                        </div>

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

                                {/* RATINGS */}

                                {Array.isArray(
                                    selectedMovie.ratings
                                ) &&
                                selectedMovie.ratings.length >
                                    0 && (

                                    <div
                                        className="
                                            mt-8
                                            rounded-2xl
                                            border
                                            border-slate-100
                                            bg-white
                                            p-5
                                        "
                                    >

                                        <h3
                                            className="
                                                mb-4
                                                text-sm
                                                font-bold
                                                text-slate-900
                                            "
                                        >
                                            {t(
                                                "common.rating"
                                            )}
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

            )}

        </AdminLayout>
    );
}