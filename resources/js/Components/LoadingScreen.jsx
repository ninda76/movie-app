import "./loading.css";

export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-content">

                {/* PERSON */}
                <div className="office-person">
                    <div className="person-head"></div>
                    <div className="person-body"></div>
                    <div className="person-arm"></div>
                    <div className="person-leg person-leg-left"></div>
                    <div className="person-leg person-leg-right"></div>
                </div>

                {/* LAPTOP */}
                <div className="loading-desk">
                    <div className="laptop">

    <div className="laptop-display">
        <div className="laptop-camera"></div>

        <div className="laptop-screen">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>

    <div className="laptop-base">
        <div className="laptop-keyboard"></div>
        <div className="laptop-trackpad"></div>
    </div>

</div>

                    <div className="desk-line"></div>
                </div>

                {/* TITLE */}
                <div className="loading-title">
                    LOGIN
                </div>

                <div className="loading-subtitle">
                    Preparing your movie experience
                </div>

                {/* LOADING */}
                <div className="loading-progress">
                    <div className="loading-progress-bar"></div>
                </div>

                <div className="loading-text">
                    Loading...
                </div>

            </div>
        </div>
    );
}