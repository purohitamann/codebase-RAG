"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ProjectOverview from "@/components/project-overview";
const MessageBubble = ({ message }) => (
  <motion.div
    key={message.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`p-4 rounded-md m-2 ${message.role === "user"
      ? "bg-blue-500 text-white"
      : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
      }`}
  >
    <ReactMarkdown>{message.content}</ReactMarkdown>
  </motion.div>
);
export default function Chat() {
  const [messages, setMessages] = useState([]); // Holds all chat messages
  const [input, setInput] = useState(""); // Holds the user input
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [namespace, setNamespace] = useState("");

  const handleNamespaceUpdate = (newNamespace) => {
    console.log("Received namespace from child:", newNamespace);
    setNamespace(newNamespace);
  };
  // Fetch messages from backend and update the state
  const fetchAndAddMessages = async (inputQuery, namespace) => {
    setLoading(true);
    try {
      console.log("Sending POST request with:", { query: inputQuery, namespace });
      const response = await fetch("http://0.0.0.0:8500/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: inputQuery, namespace: namespace }),
      });

      console.log("POST request response:", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Backend Response Data:", data); // Log backend response

        // Extract the messages from the response object
        if (data.response && data.response.messages && data.response.messages.length) {
          setMessages((prevMessages) => [
            ...prevMessages,
            ...data.response.messages.map((msg) => ({
              id: `${Date.now()}-${Math.random()}`, // Ensure unique IDs
              role: msg.role,
              content: msg.content,
            })),
          ]);
        } else {
          console.log("No messages received from backend.");
          toast.error("No messages received from backend.");
        }
      } else {
        const errorData = await response.json();
        console.error("Error Data:", errorData); // Log error data
        toast.error(errorData.detail || "Error fetching messages.");
      }
    } catch (err) {
      console.error("Fetch error:", err); // Log fetch error
      toast.error("Failed to connect to the backend.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle user input submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Append the user's query to messages
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: `${Date.now()}-${Math.random()}`, role: "user", content: input },
    ]);

    // Fetch the assistant's response and update messages
    await fetchAndAddMessages(input.trim(), namespace);
    setInput(""); // Clear the input field
  };

  return (
    <div className="flex justify-center items-start sm:pt-16 min-h-screen w-full dark:bg-neutral-900 px-4 md:px-0 py-4">
      <div className="flex flex-col items-center w-full max-w-[500px]">
        <motion.div
          animate={{
            minHeight: messages.length > 0 ? 200 : 0,
            padding: messages.length > 0 ? 12 : 0,
          }}
          transition={{
            type: "spring",
            bounce: 0.5,
          }}
          className={cn(
            "rounded-lg w-full ",
            messages.length > 0
              ? "bg-neutral-200 dark:bg-neutral-800"
              : "bg-transparent",
          )}
        >
          <div>
            <ProjectOverview onNamespaceUpdate={handleNamespaceUpdate} />
            {namespace && (
              <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded">
                <p>Namespace received: {namespace}</p>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex space-x-2 ">
            <Input
              className="bg-neutral-100 border border-[#b8d48f] text-base w-full text-black dark:bg-neutral-700 dark:placeholder:text-white dark:text-neutral-300"
              minLength={3}
              required
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#b8d48f] text-black px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Send"}
            </button>
          </form>
          <AnimatePresence className="flex flex-col gap-1 mt-4">

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
