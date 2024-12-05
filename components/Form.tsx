import React, { useState } from "react";
import { useRouter } from "next/navigation";
const FetchApiKeysForm = () => {
    const [username, setUsername] = useState(""); // User-provided username
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    async function fetchApiKeys() {
        setLoading(true);
        setError(null);
        alert("Fetching API keys...");

        try {
            // Dynamically insert the username into the URL
            const response = await fetch(`http://0.0.0.0:8500/get-api-keys/${username}`);
            if (response.ok) {

                const data = await response.json();
                alert("API keys fetched successfully!");
                console.log("Fetched Data:", data); // Debugging log

                // Pass data to parent component
                router.push(`/?groq_key=${data.GROQ}&pineconeKey_key=${data.PINE_CONE_API}&username_db=${username}`);
            } else {
                const errorData = await response.json();
                console.error("Error Data:", errorData); // Debugging log
                setError(`Error: ${errorData.detail}`);
            }
        } catch (err) {
            console.error("Fetch Error:", err); // Debugging log
            setError("Failed to fetch API keys. Please check your backend connection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 border rounded-lg bg-neutral-900 text-white">
            <h2 className="text-lg mb-2">Fetch API Keys</h2>
            <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mb-4 p-2 border rounded bg-transparent"
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
                onClick={fetchApiKeys}
                disabled={loading || !username} // Disable if loading or username is empty
                className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
                {loading ? "Loading..." : "Fetch API Keys"}
            </button>
        </div>
    );
};

export default FetchApiKeysForm;
