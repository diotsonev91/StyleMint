import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="notfound-container">
            <div className="notfound-content">
                <h1 className="notfound-title">404</h1>
                <h2 className="notfound-subtitle">Page Not Found</h2>

                <p className="notfound-text">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="notfound-actions">
                    <button
                        onClick={() => navigate("/")}
                        className="notfound-btn primary"
                    >
                        Go Home
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="notfound-btn secondary"
                    >
                        Go Back
                    </button>
                </div>
            </div>

            <div className="notfound-bg-decor"></div>
        </div>
    );
}

export default NotFoundPage;
