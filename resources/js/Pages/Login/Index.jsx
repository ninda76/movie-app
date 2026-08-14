import {
    Head,
    useForm,
} from "@inertiajs/react";

import {
    useEffect,
    useState,
} from "react";

import LoadingScreen
    from "@/Components/LoadingScreen";

import "./login.css";


export default function Index() {

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    const [loading, setLoading] =
        useState(true);


    /*
    |--------------------------------------------------------------------------
    | PASSWORD
    |--------------------------------------------------------------------------
    */

    const [showPassword, setShowPassword] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | LOGIN ERROR
    |--------------------------------------------------------------------------
    */

    const [loginError, setLoginError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        username: "",
        password: "",
    });


    /*
    |--------------------------------------------------------------------------
    | LOADING SCREEN
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const timer = setTimeout(() => {

            setLoading(false);

        }, 3000);


        return () => {
            clearTimeout(timer);
        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e) => {

        e.preventDefault();

        setLoginError("");


        post("/login", {

            preserveScroll: true,

            onError: (errors) => {

                console.log(
                    "LOGIN ERRORS:",
                    errors
                );


                if (errors.login) {

                    setLoginError(
                        errors.login
                    );

                    return;
                }


                if (errors.username) {

                    setLoginError(
                        errors.username
                    );

                    return;
                }


                if (errors.password) {

                    setLoginError(
                        errors.password
                    );

                    return;
                }


                setLoginError(
                    "Username atau password salah."
                );

            },

        });

    };


    /*
    |--------------------------------------------------------------------------
    | LOADING SCREEN
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <LoadingScreen />
        );

    }


    /*
    |--------------------------------------------------------------------------
    | LOGIN PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <>

            <Head title="Login" />


            <div className="login-page">


                {/* =================================================
                    BACKGROUND
                ================================================== */}

                <div
                    className="
                        login-circle
                        login-circle-left
                    "
                />

                <div
                    className="
                        login-circle
                        login-circle-right
                    "
                />


                {/* =================================================
                    LOGIN CARD
                ================================================== */}

                <div className="login-card">


                    {/* =================================================
                        LOGO
                    ================================================== */}

                    <div className="login-logo">

                        <span>
                            🎬
                        </span>

                    </div>


                    {/* =================================================
                        HEADER
                    ================================================== */}

                    <div className="login-header">

                        <h1>
                            Welcome
                        </h1>

                        <p>
                            Sign in to your Movie App account
                        </p>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================== */}

                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            GENERAL ERROR
                        ================================================== */}

                        {loginError && (

                            <div
                                className="
                                    login-error
                                    login-error-general
                                "
                            >
                                {loginError}
                            </div>

                        )}


                        {/* =================================================
                            USERNAME
                        ================================================== */}

                        <div className="form-group">

                            <label htmlFor="username">
                                Username
                            </label>


                            <div className="input-container">

                                <span className="input-icon">
                                    👤
                                </span>


                                <input
                                    id="username"
                                    type="text"
                                    name="username"

                                    value={
                                        data.username
                                    }

                                    onChange={(e) => {

                                        setData(
                                            "username",
                                            e.target.value
                                        );

                                        setLoginError("");

                                    }}

                                    placeholder="Enter your username"

                                    autoComplete="username"

                                    disabled={
                                        processing
                                    }
                                />

                            </div>


                            {errors.username && (

                                <div className="login-error">

                                    {errors.username}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PASSWORD
                        ================================================== */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>


                            <div className="input-container">

                                <span className="input-icon">
                                    🔒
                                </span>


                                <input
                                    id="password"

                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }

                                    name="password"

                                    value={
                                        data.password
                                    }

                                    onChange={(e) => {

                                        setData(
                                            "password",
                                            e.target.value
                                        );

                                        setLoginError("");

                                    }}

                                    placeholder="Enter your password"

                                    autoComplete="current-password"

                                    disabled={
                                        processing
                                    }
                                />


                                {/* SHOW PASSWORD */}

                                <button
                                    type="button"

                                    className="
                                        password-toggle
                                    "

                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }

                                    disabled={
                                        processing
                                    }

                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    👁️
                                </button>

                            </div>


                            {errors.password && (

                                <div className="login-error">

                                    {errors.password}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            LOGIN BUTTON
                        ================================================== */}

                        <button
                            type="submit"

                            className="
                                login-button
                            "

                            disabled={
                                processing
                            }
                        >

                            {processing ? (

                                <>
                                    <span
                                        className="
                                            button-spinner
                                        "
                                    />

                                    <span>
                                        Signing in...
                                    </span>
                                </>

                            ) : (

                                <>
                                    <span>
                                        Login
                                    </span>

                                    <span
                                        className="
                                            login-arrow
                                        "
                                    >
                                        →
                                    </span>
                                </>

                            )}

                        </button>


                    </form>


                    {/* =================================================
                        FOOTER
                    ================================================== */}

                    <div className="login-footer">

                        <span>
                            Powered by Nurida
                        </span>

                        <span>
                            © 2026
                        </span>

                    </div>


                </div>

            </div>

        </>
    );
}