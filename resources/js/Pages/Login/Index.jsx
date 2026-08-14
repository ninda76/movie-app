import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";

import "./login.css";

export default function Index() {
    const [showPassword, setShowPassword] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm({
        username: "",
        password: "",
    });

    const handleLogin = () => {
        clearErrors();

        post("/login", {
            preserveScroll: true,

            onStart: () => {
                console.log("LOGIN: POST /login");
            },

            onSuccess: () => {
                console.log("LOGIN: SUCCESS");
            },

            onError: (errors) => {
                console.log("LOGIN: ERROR", errors);
            },

            onFinish: () => {
                console.log("LOGIN: FINISHED");
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | LOGIN ERROR SAJA
    |--------------------------------------------------------------------------
    |
    | errors.login hanya digunakan untuk error:
    | "Username atau password salah."
    |
    | errors.username dan errors.password hanya tampil
    | di masing-masing field.
    |
    */

    const errorMessage = errors.login || "";

    return (
        <>
            <Head title="Login" />

            <div className="login-page">

                {/* Background */}
                <div className="login-bg-circle login-bg-circle-1"></div>
                <div className="login-bg-circle login-bg-circle-2"></div>

                <div className="login-card">

                    {/* Logo */}
                    <div className="login-logo">
                        <span>🎬</span>
                    </div>

                    {/* Header */}
                    <div className="login-header">
                        <h1 className="login-title">
                            Welcome
                        </h1>

                        <p className="login-subtitle">
                            Sign in to your Movie App account
                        </p>
                    </div>


                    {/* ERROR NOTIFICATION */}
                    {errorMessage && (
                        <div className="login-error">

                            <span className="login-error-icon">
                                ⚠️
                            </span>

                            <div className="login-error-content">

                                <strong>
                                    Login gagal
                                </strong>

                                <span>
                                    {errorMessage}
                                </span>

                            </div>

                        </div>
                    )}


                    {/* LOGIN FORM */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                    >

                        {/* USERNAME */}
                        <div className="form-group">

                            <label htmlFor="username">
                                Username
                            </label>

                            <div
                                className={`input-wrapper ${
                                    errors.username
                                        ? "input-error"
                                        : ""
                                }`}
                            >

                                <span className="input-icon">
                                    👤
                                </span>

                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => {
                                        setData(
                                            "username",
                                            e.target.value
                                        );

                                        if (errors.username) {
                                            clearErrors("username");
                                        }

                                        if (errors.login) {
                                            clearErrors("login");
                                        }
                                    }}
                                    autoComplete="username"
                                    placeholder="Enter username"
                                />

                            </div>

                            {errors.username && (
                                <div className="field-error">
                                    {errors.username}
                                </div>
                            )}

                        </div>


                        {/* PASSWORD */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div
                                className={`input-wrapper ${
                                    errors.password
                                        ? "input-error"
                                        : ""
                                }`}
                            >

                                <span className="input-icon">
                                    🔐
                                </span>

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={data.password}
                                    onChange={(e) => {
                                        setData(
                                            "password",
                                            e.target.value
                                        );

                                        if (errors.password) {
                                            clearErrors("password");
                                        }

                                        if (errors.login) {
                                            clearErrors("login");
                                        }
                                    }}
                                    autoComplete="current-password"
                                    placeholder="Enter password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    tabIndex="-1"
                                >
                                    {showPassword
                                        ? "🙈"
                                        : "👁️"}
                                </button>

                            </div>

                            {errors.password && (
                                <div className="field-error">
                                    {errors.password}
                                </div>
                            )}

                        </div>


                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={processing}
                        >

                            {processing ? (
                                <>
                                    <span className="login-spinner"></span>

                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login

                                    <span className="login-arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </form>


                    {/* FOOTER */}
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