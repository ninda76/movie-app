import { Head, router } from "@inertiajs/react";
import { useEffect } from "react";

import "./splash.css";

export default function Index() {

    useEffect(() => {

        const timer = setTimeout(() => {
            router.visit("/login");
        }, 3000);

        return () => clearTimeout(timer);

    }, []);

    return (
        <>
            <Head title="Loading" />

            <div className="splash-page">

                {/* Background circles */}
                <div className="splash-shape splash-shape-one"></div>
                <div className="splash-shape splash-shape-two"></div>


                <div className="splash-content">

                    {/* =========================
                        OFFICE ILLUSTRATION
                    ========================== */}

                    <div className="office-animation">

                        {/* PERSON */}

                        <div className="person">

                            <div className="person-head"></div>

                            <div className="person-body"></div>

                            <div className="person-arm person-arm-left"></div>

                            <div className="person-arm person-arm-right"></div>

                        </div>


                        {/* LAPTOP */}

                        <div className="laptop">

                            <div className="laptop-screen">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>

                            <div className="laptop-base"></div>

                        </div>


                        {/* DESK */}

                        <div className="desk"></div>


                        {/* WRITING EFFECT */}

                        <div className="writing-effect">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>

                    </div>


                    {/* =========================
                        TITLE
                    ========================== */}

                    <h1 className="splash-title">
                        LOGIN MOVIE
                    </h1>


                    <p className="splash-subtitle">
                        Your favorite movies in one place
                    </p>


                    {/* =========================
                        LOADING
                    ========================== */}

                    <div className="loading-container">

                        <div className="loading-bar">

                            <div className="loading-progress"></div>

                        </div>

                        <span className="loading-text">
                            Loading...
                        </span>

                    </div>

                </div>

            </div>
        </>
    );
}