import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { InformationIcon, VercelIcon } from "./icons";
import { MessageSquareCode, Eye } from "lucide-react";
import { EyeOffIcon } from "lucide-react";
import { Input } from "./ui/input";
const ProjectOverview = () => {
  return (
    <motion.div
      className="w-full max-w-[600px] my-4"
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 5 }}
    >
      <div className="border rounded-lg p-6 flex flex-col gap-4 text-white text-sm dark:text-white dark:border-[#b8d48f] dark:bg-neutral-900">
        <p className="flex flex-row justify-center gap-4 items-center text-neutral-900 dark:text-neutral-50">

          <div className="flex flex-row gap-2 items-center text-2xl">
            <MessageSquareCode className="text-[#b8d48f]" size={36} />

            <span className="flex ">Codebase <p className="text-lg text-[#b8d48f]">RAG</p></span>

          </div>
        </p>
        {/* <p>
          The{" "}
          <Link
            href="https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat"
            className="text-blue-500"
          >
            useChat
          </Link>{" "}
          hook along with the{" "}
          <Link
            href="https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text"
            className="text-blue-500"
          >
            streamText
          </Link>{" "}
          function allows you to build applications with retrieval augmented
          generation (RAG) capabilities. Data is stored as vector embeddings
          using DrizzleORM and PostgreSQL.
        </p> */}

        <p>

          Please make sure the project link is public and you have the following secrets set:
          <div className="h-2"></div>
          <ul className="flex flex-col gap-4 ">
            <li >GROQ_API_KEY {" "}
              <div className="flex flex-row gap-2 items-center align-center justify-center" >
                <Input className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]" placeholder="GROQ_API_KEY" />
                <Hide isOpen={true} />
              </div>
            </li>
            <li >PINECONE_API_KEY{" "}
              <div className="flex flex-row gap-2 items-center align-center justify-center" >
                <Input className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]" placeholder="PINECONE_API_KEY" />
                <Hide isOpen={true} />
              </div>
            </li>
            <li >GITHUB_API_KEY {" "}
              <div className="flex flex-row gap-2 items-center align-center justify-center" >
                <Input className="w-full bg-transparent border border-[#b8d48f] text-[#f8f8f8] placeholder:text-[#b8d48f]" placeholder="GITHUB_PROJECT URL" />
                <Hide isOpen={true} />
              </div>
            </li>


          </ul>
        </p>
      </div>
    </motion.div>
  );
};

export default ProjectOverview;

function Hide({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="text-[#b8d48f]">
      {isOpen ? <EyeOffIcon /> : <Eye />}

    </div>
  )
}