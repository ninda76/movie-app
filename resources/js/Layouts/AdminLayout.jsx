import {
    Link,
    router,
    usePage,
} from "@inertiajs/react";

import {
    useState,
    useEffect,
    useRef,
} from "react";

import {
    useLanguage,
} from "../Contexts/LanguageContext";


export default function AdminLayout({
    children,
}) {

    const { auth } = usePage().props;

    const {
        language,
        changeLanguage,
        t,
    } = useLanguage();


    const [languageOpen, setLanguageOpen] =
        useState(false);

    const [adminOpen, setAdminOpen] =
        useState(false);

    const [settingsOpen, setSettingsOpen] =
        useState(
            window.location.pathname.startsWith(
                "/admin/settings"
            )
        );


    // Responsive mobile sidebar
    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);


    const languageRef = useRef(null);

    const adminRef = useRef(null);


    const currentRoute =
        window.location.pathname;


    /*
    |--------------------------------------------------------------------------
    | ACTIVE ROUTE
    |--------------------------------------------------------------------------
    */

    const isActive = (path) => {

        if (path === "/admin/dashboard") {
            return currentRoute === path;
        }

        return currentRoute.startsWith(path);
    };


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const logout = () => {
        router.post("/logout");
    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                languageRef.current &&
                !languageRef.current.contains(
                    event.target
                )
            ) {
                setLanguageOpen(false);
            }


            if (
                adminRef.current &&
                !adminRef.current.contains(
                    event.target
                )
            ) {
                setAdminOpen(false);
            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | MAIN MENU STYLE
    |--------------------------------------------------------------------------
    */

    const getMenuStyle = (path) => {

        const active = isActive(path);

        return {
            display: "flex",
            alignItems: "center",
            gap: "22px",

            padding: "18px 20px",

            marginBottom: "10px",

            borderRadius: "16px",

            textDecoration: "none",

            color: "white",

            background: active
                ? "#4f46e5"
                : "transparent",

            fontSize: "19px",

            fontWeight: "600",

            transition:
                "background 0.2s ease, color 0.2s ease",

            cursor: "pointer",
        };
    };


    /*
    |--------------------------------------------------------------------------
    | MENU HOVER
    |--------------------------------------------------------------------------
    */

    const handleMenuEnter = (
        event,
        path
    ) => {

        if (!isActive(path)) {

            event.currentTarget.style.background =
                "#ffffff";

            event.currentTarget.style.color =
                "#020617";

        }

    };


    const handleMenuLeave = (
        event,
        path
    ) => {

        if (!isActive(path)) {

            event.currentTarget.style.background =
                "transparent";

            event.currentTarget.style.color =
                "white";

        }

    };


    /*
    |--------------------------------------------------------------------------
    | SETTINGS SUBMENU ITEM STYLE
    |--------------------------------------------------------------------------
    */

    const getSettingsItemStyle = (path) => {

        const active =
            currentRoute === path ||
            currentRoute.startsWith(path + "/");

        return {
            display: "flex",

            alignItems: "center",

            gap: "12px",

            width: "100%",

            padding: "11px 12px",

            marginBottom: "4px",

            borderRadius: "10px",

            textDecoration: "none",

            color: active
                ? "#ffffff"
                : "#cbd5e1",

            background: active
                ? "#4f46e5"
                : "transparent",

            fontSize: "15px",

            fontWeight: active
                ? "600"
                : "500",

            transition:
                "background 0.2s ease, color 0.2s ease",

            boxSizing: "border-box",
        };
    };


    /*
    |--------------------------------------------------------------------------
    | SETTINGS SUBMENU HOVER
    |--------------------------------------------------------------------------
    */

    const handleSettingsEnter = (
        event,
        path
    ) => {

        const active =
            currentRoute === path ||
            currentRoute.startsWith(
                path + "/"
            );


        if (!active) {

            event.currentTarget.style.background =
                "rgba(255,255,255,0.10)";

            event.currentTarget.style.color =
                "#ffffff";

        }

    };


    const handleSettingsLeave = (
        event,
        path
    ) => {

        const active =
            currentRoute === path ||
            currentRoute.startsWith(
                path + "/"
            );


        if (!active) {

            event.currentTarget.style.background =
                "transparent";

            event.currentTarget.style.color =
                "#cbd5e1";

        }

    };


    const responsiveStyles = `
        .movie-admin-sidebar {
            transition: transform 0.3s ease-in-out;
        }

        .movie-admin-mobile-menu,
        .movie-admin-mobile-overlay {
            display: none;
        }

        @media (max-width: 767px) {
            .movie-admin-sidebar {
                width: 86vw !important;
                min-width: 0 !important;
                max-width: 350px !important;
                transform: translateX(-100%);
                box-shadow: 8px 0 30px rgba(0,0,0,0.20);
            }

            .movie-admin-sidebar.mobile-open {
                transform: translateX(0);
            }

            .movie-admin-main {
                margin-left: 0 !important;
                width: 100% !important;
            }

            .movie-admin-header {
                justify-content: space-between !important;
                padding: 0 16px !important;
                gap: 10px !important;
            }

            .movie-admin-mobile-menu {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                width: 42px;
                height: 42px;
                border: 1px solid #dbe3ef;
                border-radius: 12px;
                background: white;
                color: #020617;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            }

            .movie-admin-mobile-menu:hover {
                background: #eef2ff;
            }

            .movie-admin-mobile-overlay {
                display: block;
                position: fixed;
                inset: 0;
                z-index: 45;
                background: rgba(2,6,23,0.55);
            }
        }
    `;


    return (

        <div
            style={{
                minHeight: "100vh",

                background:
                    "#f1f5f9",

                display: "flex",

                overflow: "hidden",
            }}
        >

            <style>{responsiveStyles}</style>


            {/* =========================================================
                SIDEBAR
            ========================================================== */}

            <aside
                className={`movie-admin-sidebar ${
                    mobileSidebarOpen ? "mobile-open" : ""
                }`}
                onClick={(event) => {
                    if (event.target.closest("a")) {
                        setMobileSidebarOpen(false);
                    }
                }}
                style={{
                    width: "350px",

                    minWidth: "350px",

                    height: "100vh",

                    background:
                        "#020617",

                    color: "white",

                    display: "flex",

                    flexDirection:
                        "column",

                    position:
                        "fixed",

                    left: 0,

                    top: 0,

                    bottom: 0,

                    zIndex: 50,

                    overflowY:
                        "auto",

                    overflowX:
                        "hidden",
                }}
            >

                {/* =====================================================
                    LOGO
                ====================================================== */}

                <div
                    style={{
                        padding:
                            "30px",

                        borderBottom:
                            "1px solid rgba(255,255,255,0.1)",

                        flexShrink: 0,
                    }}
                >

                    <div
                        style={{
                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                "20px",
                        }}
                    >

                        <div
                            style={{
                                width:
                                    "76px",

                                height:
                                    "76px",

                                minWidth:
                                    "76px",

                                borderRadius:
                                    "22px",

                                background:
                                    "#4f46e5",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                fontSize:
                                    "38px",

                                flexShrink:
                                    0,
                            }}
                        >
                            🎬
                        </div>


                        <div>

                            <div
                                style={{
                                    fontSize:
                                        "28px",

                                    fontWeight:
                                        "700",
                                }}
                            >
                                {t(
                                    "layout.appName"
                                )}
                            </div>


                            <div
                                style={{
                                    color:
                                        "#94a3b8",

                                    fontSize:
                                        "19px",

                                    marginTop:
                                        "3px",
                                }}
                            >
                                {t(
                                    "layout.adminPanel"
                                )}
                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    MAIN MENU
                ====================================================== */}

                <div
                    style={{
                        padding:
                            "42px 20px",

                        flex: 1,
                    }}
                >

                    <div
                        style={{
                            color:
                                "#94a3b8",

                            fontSize:
                                "17px",

                            letterSpacing:
                                "1.5px",

                            marginBottom:
                                "28px",

                            paddingLeft:
                                "18px",
                        }}
                    >
                        {t(
                            "layout.mainMenu"
                        )}
                    </div>


                    {/* =================================================
                        DASHBOARD
                    ================================================== */}

                    <Link
                        href="/admin/dashboard"

                        style={getMenuStyle(
                            "/admin/dashboard"
                        )}

                        onMouseEnter={(event) =>
                            handleMenuEnter(
                                event,
                                "/admin/dashboard"
                            )
                        }

                        onMouseLeave={(event) =>
                            handleMenuLeave(
                                event,
                                "/admin/dashboard"
                            )
                        }
                    >

                        <span
                            style={{
                                fontSize:
                                    "28px",

                                width:
                                    "30px",

                                minWidth:
                                    "30px",

                                textAlign:
                                    "center",

                                lineHeight:
                                    1,

                                flexShrink:
                                    0,
                            }}
                        >
                            🏠
                        </span>


                        {t(
                            "common.dashboard"
                        )}

                    </Link>


                    {/* =================================================
                        MOVIE LIST
                    ================================================== */}

                    <Link
                        href="/admin/movies"

                        style={getMenuStyle(
                            "/admin/movies"
                        )}

                        onMouseEnter={(event) =>
                            handleMenuEnter(
                                event,
                                "/admin/movies"
                            )
                        }

                        onMouseLeave={(event) =>
                            handleMenuLeave(
                                event,
                                "/admin/movies"
                            )
                        }
                    >

                        <span
                            style={{
                                fontSize:
                                    "28px",

                                width:
                                    "30px",

                                minWidth:
                                    "30px",

                                textAlign:
                                    "center",

                                lineHeight:
                                    1,

                                flexShrink:
                                    0,
                            }}
                        >
                            🎬
                        </span>


                        {t(
                            "common.movieList"
                        )}

                    </Link>


                    {/* =================================================
                        FAVORITE
                    ================================================== */}

                    <Link
                        href="/admin/favorite"

                        style={getMenuStyle(
                            "/admin/favorite"
                        )}

                        onMouseEnter={(event) =>
                            handleMenuEnter(
                                event,
                                "/admin/favorite"
                            )
                        }

                        onMouseLeave={(event) =>
                            handleMenuLeave(
                                event,
                                "/admin/favorite"
                            )
                        }
                    >

                        <span
                            style={{
                                fontSize:
                                    "30px",

                                width:
                                    "30px",

                                minWidth:
                                    "30px",

                                textAlign:
                                    "center",

                                lineHeight:
                                    1,

                                flexShrink:
                                    0,
                            }}
                        >
                            ♡
                        </span>


                        {t(
                            "common.favorite"
                        )}

                    </Link>


                    {/* =================================================
                        SETTINGS
                    ================================================== */}

                    <button
                        type="button"

                        onClick={() =>
                            setSettingsOpen(
                                !settingsOpen
                            )
                        }

                        style={{
                            width:
                                "100%",

                            border:
                                "none",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                "22px",

                            padding:
                                "18px 20px",

                            marginBottom:
                                settingsOpen
                                    ? "6px"
                                    : "10px",

                            borderRadius:
                                "16px",

                            textDecoration:
                                "none",

                            color:
                                "white",

                            background:
                                isActive(
                                    "/admin/settings"
                                )
                                    ? "#4f46e5"
                                    : "transparent",

                            fontSize:
                                "19px",

                            fontWeight:
                                "600",

                            cursor:
                                "pointer",

                            textAlign:
                                "left",

                            transition:
                                "background 0.2s ease, color 0.2s ease",

                            boxSizing:
                                "border-box",
                        }}

                        onMouseEnter={(event) => {

                            if (
                                !isActive(
                                    "/admin/settings"
                                )
                            ) {

                                event.currentTarget.style.background =
                                    "#ffffff";

                                event.currentTarget.style.color =
                                    "#020617";

                            }

                        }}

                        onMouseLeave={(event) => {

                            if (
                                !isActive(
                                    "/admin/settings"
                                )
                            ) {

                                event.currentTarget.style.background =
                                    "transparent";

                                event.currentTarget.style.color =
                                    "white";

                            }

                        }}
                    >

                        <span
                            style={{
                                fontSize:
                                    "28px",

                                width:
                                    "30px",

                                minWidth:
                                    "30px",

                                textAlign:
                                    "center",

                                lineHeight:
                                    1,

                                flexShrink:
                                    0,
                            }}
                        >
                            ⚙️
                        </span>


                        <span
                            style={{
                                flex: 1,
                            }}
                        >
                            {t(
                                "common.settings"
                            )}
                        </span>


                        <span
                            style={{
                                fontSize:
                                    "15px",

                                transition:
                                    "transform 0.2s ease",

                                transform:
                                    settingsOpen
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                            }}
                        >
                            ▼
                        </span>

                    </button>


                    {/* =================================================
                        SETTINGS SUBMENU
                    ================================================== */}

                    {settingsOpen && (

                        <div
                            style={{
                                marginTop:
                                    "4px",

                                marginBottom:
                                    "12px",

                                marginLeft:
                                    "18px",

                                paddingLeft:
                                    "18px",

                                borderLeft:
                                    "1px solid rgba(255,255,255,0.15)",
                            }}
                        >

                            {/* PROFILE */}

                            <Link
                                href="/admin/settings/profile"

                                style={getSettingsItemStyle(
                                    "/admin/settings/profile"
                                )}

                                onMouseEnter={(
                                    event
                                ) =>
                                    handleSettingsEnter(
                                        event,
                                        "/admin/settings/profile"
                                    )
                                }

                                onMouseLeave={(
                                    event
                                ) =>
                                    handleSettingsLeave(
                                        event,
                                        "/admin/settings/profile"
                                    )
                                }
                            >

                                <span>
                                    👤
                                </span>

                                <span>
                                    Profile
                                </span>

                            </Link>


                            {/* MOVIE SETTINGS */}

                            <Link
                                href="/admin/settings/movies"

                                style={getSettingsItemStyle(
                                    "/admin/settings/movies"
                                )}

                                onMouseEnter={(
                                    event
                                ) =>
                                    handleSettingsEnter(
                                        event,
                                        "/admin/settings/movies"
                                    )
                                }

                                onMouseLeave={(
                                    event
                                ) =>
                                    handleSettingsLeave(
                                        event,
                                        "/admin/settings/movies"
                                    )
                                }
                            >

                                <span>
                                    🎬
                                </span>

                                <span>
                                    Movie Settings
                                </span>

                            </Link>


                            {/* OMDB API */}

                            <Link
                                href="/admin/settings/omdb"

                                style={getSettingsItemStyle(
                                    "/admin/settings/omdb"
                                )}

                                onMouseEnter={(
                                    event
                                ) =>
                                    handleSettingsEnter(
                                        event,
                                        "/admin/settings/omdb"
                                    )
                                }

                                onMouseLeave={(
                                    event
                                ) =>
                                    handleSettingsLeave(
                                        event,
                                        "/admin/settings/omdb"
                                    )
                                }
                            >

                                <span>
                                    🔑
                                </span>

                                <span>
                                    OMDb API
                                </span>

                            </Link>


                            {/* LANGUAGE */}

                            <Link
                                href="/admin/settings/language"

                                style={getSettingsItemStyle(
                                    "/admin/settings/language"
                                )}

                                onMouseEnter={(
                                    event
                                ) =>
                                    handleSettingsEnter(
                                        event,
                                        "/admin/settings/language"
                                    )
                                }

                                onMouseLeave={(
                                    event
                                ) =>
                                    handleSettingsLeave(
                                        event,
                                        "/admin/settings/language"
                                    )
                                }
                            >

                                <span>
                                    🌐
                                </span>

                                <span>
                                    Language
                                </span>

                            </Link>


                            {/* SECURITY */}

                            <Link
                                href="/admin/settings/security"

                                style={getSettingsItemStyle(
                                    "/admin/settings/security"
                                )}

                                onMouseEnter={(
                                    event
                                ) =>
                                    handleSettingsEnter(
                                        event,
                                        "/admin/settings/security"
                                    )
                                }

                                onMouseLeave={(
                                    event
                                ) =>
                                    handleSettingsLeave(
                                        event,
                                        "/admin/settings/security"
                                    )
                                }
                            >

                                <span>
                                    🛡️
                                </span>

                                <span>
                                    Security
                                </span>

                            </Link>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    LOGOUT
                ====================================================== */}

                <div
                    style={{
                        padding:
                            "20px",

                        borderTop:
                            "1px solid rgba(255,255,255,0.1)",

                        flexShrink:
                            0,
                    }}
                >

                    <button
                        type="button"

                        onClick={logout}

                        style={{
                            width:
                                "100%",

                            border:
                                "none",

                            background:
                                "transparent",

                            color:
                                "white",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                "22px",

                            padding:
                                "18px 20px",

                            fontSize:
                                "19px",

                            fontWeight:
                                "600",

                            cursor:
                                "pointer",

                            textAlign:
                                "left",

                            borderRadius:
                                "16px",

                            transition:
                                "background 0.2s ease, color 0.2s ease",
                        }}

                        onMouseEnter={(event) => {

                            event.currentTarget.style.background =
                                "#ffffff";

                            event.currentTarget.style.color =
                                "#020617";

                        }}

                        onMouseLeave={(event) => {

                            event.currentTarget.style.background =
                                "transparent";

                            event.currentTarget.style.color =
                                "white";

                        }}
                    >

                        <span
                            style={{
                                fontSize:
                                    "28px",

                                width:
                                    "30px",

                                minWidth:
                                    "30px",

                                textAlign:
                                    "center",

                                lineHeight:
                                    1,

                                flexShrink:
                                    0,
                            }}
                        >
                            🚪
                        </span>


                        {t(
                            "common.logout"
                        )}

                    </button>

                </div>

            </aside>


            {mobileSidebarOpen && (
                <div
                    className="movie-admin-mobile-overlay"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}


            {/* =========================================================
                MAIN CONTENT
            ========================================================== */}

            <main
                className="movie-admin-main"
                style={{
                    marginLeft:
                        "350px",

                    width:
                        "calc(100% - 350px)",

                    height:
                        "100vh",

                    minHeight:
                        0,

                    overflowY:
                        "auto",

                    overflowX:
                        "hidden",

                    background:
                        "#f1f5f9",
                }}
            >

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <header
                    className="movie-admin-header"
                    style={{
                        height:
                            "72px",

                        minHeight:
                            "72px",

                        background:
                            "white",

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "flex-end",

                        padding:
                            "0 35px",

                        gap:
                            "22px",

                        borderBottom:
                            "1px solid #e2e8f0",

                        position:
                            "sticky",

                        top:
                            0,

                        zIndex:
                            40,
                    }}
                >

                    <button
                        type="button"
                        className="movie-admin-mobile-menu"
                        onClick={() => {
                            setMobileSidebarOpen(true);
                            setLanguageOpen(false);
                            setAdminOpen(false);
                        }}
                        aria-label="Open menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>


                    {/* =================================================
                        LANGUAGE
                    ================================================== */}

                    <div
                        ref={languageRef}

                        style={{
                            position:
                                "relative",
                        }}
                    >

                        <button
                            type="button"

                            onClick={() => {

                                setLanguageOpen(
                                    !languageOpen
                                );

                                setAdminOpen(
                                    false
                                );

                            }}

                            style={{
                                background:
                                    "white",

                                border:
                                    "1px solid #dbe3ef",

                                borderRadius:
                                    "12px",

                                padding:
                                    "10px 17px",

                                fontSize:
                                    "15px",

                                cursor:
                                    "pointer",

                                boxShadow:
                                    "0 2px 6px rgba(0,0,0,0.08)",
                            }}
                        >

                            🌐{" "}

                            {language === "en"
                                ? t(
                                      "common.english"
                                  )
                                : t(
                                      "common.indonesia"
                                  )}

                            {" "}▼

                        </button>


                        {languageOpen && (

                            <div
                                style={{
                                    position:
                                        "absolute",

                                    top:
                                        "52px",

                                    right:
                                        0,

                                    background:
                                        "white",

                                    border:
                                        "1px solid #e2e8f0",

                                    borderRadius:
                                        "12px",

                                    boxShadow:
                                        "0 10px 30px rgba(0,0,0,0.15)",

                                    overflow:
                                        "hidden",

                                    minWidth:
                                        "150px",

                                    zIndex:
                                        100,
                                }}
                            >

                                <button
                                    type="button"

                                    onClick={() => {

                                        changeLanguage(
                                            "en"
                                        );

                                        setLanguageOpen(
                                            false
                                        );

                                    }}

                                    style={{
                                        display:
                                            "block",

                                        width:
                                            "100%",

                                        border:
                                            "none",

                                        background:
                                            language ===
                                            "en"
                                                ? "#eef2ff"
                                                : "white",

                                        padding:
                                            "13px 18px",

                                        textAlign:
                                            "left",

                                        cursor:
                                            "pointer",

                                        fontSize:
                                            "15px",

                                        color:
                                            "#0f172a",
                                    }}

                                    onMouseEnter={(
                                        event
                                    ) => {

                                        event.currentTarget.style.background =
                                            "#eef2ff";

                                    }}

                                    onMouseLeave={(
                                        event
                                    ) => {

                                        event.currentTarget.style.background =
                                            language ===
                                            "en"
                                                ? "#eef2ff"
                                                : "white";

                                    }}
                                >
                                    🇬🇧 English
                                </button>


                                <button
                                    type="button"

                                    onClick={() => {

                                        changeLanguage(
                                            "id"
                                        );

                                        setLanguageOpen(
                                            false
                                        );

                                    }}

                                    style={{
                                        display:
                                            "block",

                                        width:
                                            "100%",

                                        border:
                                            "none",

                                        background:
                                            language ===
                                            "id"
                                                ? "#eef2ff"
                                                : "white",

                                        padding:
                                            "13px 18px",

                                        textAlign:
                                            "left",

                                        cursor:
                                            "pointer",

                                        fontSize:
                                            "15px",

                                        color:
                                            "#0f172a",
                                    }}

                                    onMouseEnter={(
                                        event
                                    ) => {

                                        event.currentTarget.style.background =
                                            "#eef2ff";

                                    }}

                                    onMouseLeave={(
                                        event
                                    ) => {

                                        event.currentTarget.style.background =
                                            language ===
                                            "id"
                                                ? "#eef2ff"
                                                : "white";

                                    }}
                                >
                                    🇮🇩 Indonesia
                                </button>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        SEPARATOR
                    ================================================== */}

                    <div
                        style={{
                            width:
                                "1px",

                            height:
                                "38px",

                            background:
                                "#dbe3ef",
                        }}
                    />


                    {/* =================================================
                        ADMIN DROPDOWN
                    ================================================== */}

                    <div
                        ref={adminRef}

                        style={{
                            position:
                                "relative",
                        }}
                    >

                        <button
                            type="button"

                            onClick={() => {

                                setAdminOpen(
                                    !adminOpen
                                );

                                setLanguageOpen(
                                    false
                                );

                            }}

                            style={{
                                border:
                                    "none",

                                background:
                                    "transparent",

                                padding:
                                    0,

                                cursor:
                                    "pointer",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                gap:
                                    "13px",

                                textAlign:
                                    "left",
                            }}
                        >

                            <div
                                style={{
                                    width:
                                        "44px",

                                    height:
                                        "44px",

                                    borderRadius:
                                        "50%",

                                    background:
                                        "#6d3df5",

                                    color:
                                        "white",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    fontSize:
                                        "18px",

                                    fontWeight:
                                        "700",
                                }}
                            >
                                A
                            </div>


                            <div>

                                <div
                                    style={{
                                        fontSize:
                                            "17px",

                                        fontWeight:
                                            "700",

                                        color:
                                            "#020617",
                                    }}
                                >
                                    Admin
                                </div>


                                <div
                                    style={{
                                        color:
                                            "#94a3b8",

                                        fontSize:
                                            "13px",
                                    }}
                                >
                                    {t(
                                        "common.administrator"
                                    )}
                                </div>

                            </div>


                            <span
                                style={{
                                    fontSize:
                                        "17px",

                                    color:
                                        "#020617",

                                    marginLeft:
                                        "3px",

                                    transform:
                                        adminOpen
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",

                                    transition:
                                        "transform 0.2s ease",
                                }}
                            >
                                ▼
                            </span>

                        </button>


                        {/* =================================================
                            ADMIN DROPDOWN
                        ================================================== */}

                        {adminOpen && (

                            <div
                                style={{
                                    position:
                                        "absolute",

                                    top:
                                        "58px",

                                    right:
                                        0,

                                    width:
                                        "210px",

                                    background:
                                        "white",

                                    border:
                                        "1px solid #e2e8f0",

                                    borderRadius:
                                        "14px",

                                    boxShadow:
                                        "0 12px 35px rgba(0,0,0,0.15)",

                                    overflow:
                                        "hidden",

                                    zIndex:
                                        200,
                                }}
                            >

                                {/* PROFILE */}

                                <Link
                                    href="/admin/profile"

                                    onClick={() =>
                                        setAdminOpen(
                                            false
                                        )
                                    }

                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap:
                                            "12px",

                                        padding:
                                            "13px 16px",

                                        textDecoration:
                                            "none",

                                        color:
                                            "#0f172a",

                                        fontSize:
                                            "15px",

                                        fontWeight:
                                            "500",
                                    }}
                                >

                                    <span>
                                        👤
                                    </span>

                                    Profile

                                </Link>


                                {/* SETTINGS */}

                                <Link
                                    href="/admin/settings"

                                    onClick={() =>
                                        setAdminOpen(
                                            false
                                        )
                                    }

                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap:
                                            "12px",

                                        padding:
                                            "13px 16px",

                                        textDecoration:
                                            "none",

                                        color:
                                            "#0f172a",

                                        fontSize:
                                            "15px",

                                        fontWeight:
                                            "500",
                                    }}
                                >

                                    <span>
                                        ⚙️
                                    </span>

                                    {t(
                                        "common.settings"
                                    )}

                                </Link>


                                {/* DIVIDER */}

                                <div
                                    style={{
                                        height:
                                            "1px",

                                        background:
                                            "#e2e8f0",

                                        margin:
                                            "4px 0",
                                    }}
                                />


                                {/* LOGOUT */}

                                <button
                                    type="button"

                                    onClick={() => {

                                        setAdminOpen(
                                            false
                                        );

                                        logout();

                                    }}

                                    style={{
                                        width:
                                            "100%",

                                        border:
                                            "none",

                                        background:
                                            "white",

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap:
                                            "12px",

                                        padding:
                                            "13px 16px",

                                        textAlign:
                                            "left",

                                        color:
                                            "#dc2626",

                                        fontSize:
                                            "15px",

                                        fontWeight:
                                            "500",

                                        cursor:
                                            "pointer",
                                    }}
                                >

                                    <span>
                                        🚪
                                    </span>

                                    {t(
                                        "common.logout"
                                    )}

                                </button>

                            </div>

                        )}

                    </div>

                </header>


                {/* =====================================================
                    CONTENT
                ====================================================== */}

                <div
                    style={{
                        minHeight:
                            "calc(100vh - 72px)",
                    }}
                >
                    {children}
                </div>

            </main>

        </div>
    );
}