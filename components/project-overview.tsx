'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Eye, EyeOff as EyeOffIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

const ProjectOverview = ({ onNamespaceUpdate }) => {
  const searchParams = useSearchParams();
  const [namespace, setNamespace] = useState("");

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [embedResponse, setEmbedResponse] = useState(null);

  const groq_key = searchParams.get("groq_key") || "z";
  const pineconeKey_key = searchParams.get("pineconeKey_key") || "y";
  const username_db = searchParams.get("username_db") || "test";

  const [url, setUrl] = useState(namespace || "");
  const [error, setError] = useState("");

  const handleEmbedProject = async () => {
    if (!url) {
      setError("Please provide a valid GitHub repository URL.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const ragResponse = await fetch("http://0.0.0.0:8500/perform-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "Explain RAG process.", namespace: url }),
      });

      if (ragResponse.ok) {
        const ragData = await ragResponse.json();
        setNamespace(ragData.namespace); // Update local namespace state
        onNamespaceUpdate(url); // Pass namespace to parent
        setEmbedResponse(ragData.response);
      } else {
        const ragError = await ragResponse.json();
        setError(ragError.detail || "Failed to perform RAG.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while connecting to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-[600px] my-4"
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 5 }}
    >
      <div className="border rounded-lg p-6 flex flex-col gap-4 text-white text-sm dark:text-white dark:border-[#b8d48f] dark:bg-neutral-900">
        <div className="flex flex-row gap-2 items-center text-2xl">
          <span className="flex">
            Codebase <p className="text-lg text-[#b8d48f]">RAG</p>
          </span>
        </div>

        <p>
          Please make sure the project link is public and you have the following secrets set:
          <div className="h-2"></div>
          <ul className="flex flex-col gap-4 ">
            <li>
              GROQ_API_KEY
              <div className="flex flex-row gap-2 items-center align-center justify-center">
                <Input
                  className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]"
                  value={groq_key}
                  readOnly
                />
                <Hide isOpen={open} onClick={() => setOpen(!open)} />
              </div>
            </li>
            <li>
              PINECONE_API_KEY
              <div className="flex flex-row gap-2 items-center align-center justify-center">
                <Input
                  className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]"
                  value={pineconeKey_key}
                  readOnly
                />
                <Hide isOpen={open} onClick={() => setOpen(!open)} />
              </div>
            </li>
            <li>
              GITHUB_PROJECT_URL
              <div className="flex flex-row gap-2 items-center align-center justify-center">
                <Input
                  className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}

                  placeholder="Enter GitHub Repo URL"
                />
                <Hide isOpen={open} onClick={() => setOpen(!open)} />
              </div>
            </li>
            {error && <p className="text-red-500">{error}</p>}
            <li>
              <button
                className="bg-[#b8d48f] text-[#000000] px-4 py-2 rounded-md"
                onClick={handleEmbedProject}
                disabled={loading}
              >
                {loading ? "Embedding..." : "Embed Project"}
              </button>
            </li>
          </ul>
        </p>
      </div>
      {embedResponse && (
        <div className="text-green-500 mt-4">
          <p>Embedding Successful! Response: {embedResponse}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectOverview;

function Hide({ isOpen, onClick }) {
  return (
    <div className="text-[#b8d48f]">
      {isOpen ? <EyeOffIcon onClick={onClick} /> : <Eye onClick={onClick} />}
    </div>
  );
}
