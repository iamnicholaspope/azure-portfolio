import { useEffect, useState } from "react";

type ApiStatus = {
    service: string;
    status: string;
    environment: string;
    timestamp: string;
};

function App() {
    const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch("/api/status")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("API request failed");
                }

                return response.json();
            })
            .then((data: ApiStatus) => {
                setApiStatus(data);
            })
            .catch((err) => {
                console.error(err);
                setError(true);
            });
    }, []);

    return (
        <main>
            <h1>Azure Cloud Portfolio</h1>

            {error && <p>API Status: Offline</p>}

            {!error && !apiStatus && <p>Checking API...</p>}

            {apiStatus && (
                <section>
                    <p>API Status: {apiStatus.status}</p>
                    <p>Service: {apiStatus.service}</p>
                    <p>Environment: {apiStatus.environment}</p>
                    <p>
                        Last Check:{" "}
                        {new Date(apiStatus.timestamp).toLocaleString()}
                    </p>
                </section>
            )}
        </main>
    );
}

export default App;
