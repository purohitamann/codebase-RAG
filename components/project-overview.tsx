import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Eye, EyeOff as EyeOffIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
const ProjectOverview = () => {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const groq_key = searchParams.get("groq_key") || "z";
  const pineconeKey_key = searchParams.get("pineconeKey_key") || "y";
  const username_db = searchParams.get("username_db") || "test";

  const [url, setUrl] = useState();
  const [username, setUsername] = useState(username_db || "test");


  // const fetchApiKeys = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`http://127.0.0.1:8000/get-api-keys/${username}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setGroq(data.GROQ);
  //       setPineconeKey(data.PINE_CONE_API);
  //     } else {
  //       const errorData = await response.json();
  //       alert(`Error: ${errorData.detail}`);
  //     }
  //   } catch (error) {
  //     alert("Failed to fetch API keys. Please check your backend connection.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <motion.div
      className="w-full max-w-[600px] my-4"
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 5 }}
    >
      <div className="border rounded-lg p-6 flex flex-col gap-4 text-white text-sm dark:text-white dark:border-[#b8d48f] dark:bg-neutral-900">
        <div className="flex flex-row gap-2 items-center text-2xl">
          <span className="flex">Codebase <p className="text-lg text-[#b8d48f]">RAG</p></span>
        </div>

        <p>
          Please make sure the project link is public and you have the following secrets set:
          <div className="h-2"></div>
          <ul className="flex flex-col gap-4 ">
            <li>GROQ_API_KEY
              <div className="flex flex-row gap-2 items-center align-center justify-center">
                <Input
                  className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]"
                  value={groq_key}
                  onChange={(e) => setGroq(e.target.value)}
                  placeholder="GROQ_API_KEY"
                  readOnly

                />
                <Hide isOpen={open} onClick={() => setOpen(!open)} />
              </div>
            </li>
            <li>PINECONE_API_KEY
              <div className="flex flex-row gap-2 items-center align-center justify-center">
                <Input
                  className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]"
                  value={pineconeKey_key}
                  onChange={(e) => setPineconeKey(e.target.value)}
                  placeholder="PINECONE_API_KEY"
                  readOnly
                />
                <Hide isOpen={open} onClick={() => setOpen(!open)} />
              </div>
            </li>
            <li>GITHUB_API_KEY
              <div className="flex flex-row gap-2 items-center align-center justify-center">
                <Input
                  className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="GITHUB_PROJECT_URL"
                />
                <Hide isOpen={open} onClick={() => setOpen(!open)} />
              </div>
            </li>
            <li>

            </li>
          </ul>
        </p>
      </div>
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
