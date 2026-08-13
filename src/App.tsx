import { useEffect, useState } from "react";

type ApiStatus = {
    service: string;
    status: string;
    environment: string;
    timestamp: string;
};

type ContactForm = {
    name: string;
    email: string;
    message: string;
};

function App() {
    const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
    const [apiError, setApiError] = useState(false);

    const [form, setForm] = useState<ContactForm>({
        name: "",
        email: "",
        message: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState("");

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
            .catch(() => {
                setApiError(true);
            });
    }, []);

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSubmitting(true);
        setFormMessage("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Submission failed");
            }

            setFormMessage("Message sent successfully.");

            setForm({
                name: "",
                email: "",
                message: ""
            });
        } catch (error) {
            if (error instanceof Error) {
                setFormMessage(error.message);
            } else {
                setFormMessage("Something went wrong.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main>
            <h1>Azure Cloud Portfolio</h1>

            <section>
                <h2>API Status</h2>

                {apiError && <p>API Status: Offline</p>}

                {!apiError && !apiStatus && <p>Checking API...</p>}

                {apiStatus && (
                    <>
                        <p>API Status: {apiStatus.status}</p>
                        <p>Service: {apiStatus.service}</p>
                        <p>Environment: {apiStatus.environment}</p>
                        <p>
                            Last Check:{" "}
                            {new Date(apiStatus.timestamp).toLocaleString()}
                        </p>
                    </>
                )}
            </section>

            <section>
                <h2>Contact API Demo</h2>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Name</label>
                        <br />
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <br />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="message">Message</label>
                        <br />
                        <textarea
                            id="message"
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Message"}
                    </button>
                </form>

                {formMessage && <p>{formMessage}</p>}
            </section>
        </main>
    );
}

export default App;
