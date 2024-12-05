import os
import json
from git import Repo
from sentence_transformers import SentenceTransformer
from langchain_pinecone import PineconeVectorStore
from langchain.embeddings import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from pinecone import Pinecone
from openai import OpenAI
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Set up Pinecone
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY is not set in environment variables")

# pc = Pinecone(api_key=PINECONE_API_KEY)

# index_name = "ragchat"
# if index_name not in pc.list_indexes():
#     raise ValueError(f"Index {index_name} does not exist in Pinecone.")
# # Ensure Pinecone index exists
# pinecone_index = pc.Index(index_name)
from pinecone import Pinecone

pc = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pc.Index("ragchat")
# HuggingFace Embeddings
hf_embeddings = HuggingFaceEmbeddings()

# Constants
SYSTEM_PROMPT = """
You are a Senior Software Engineer. Answer questions about the codebase based on the provided context.
"""
MAX_METADATA_SIZE = 40_960  # 40 KB
MAX_FILE_SIZE_MB = 5  # Maximum file size to process (in MB)
CHUNK_SIZE = 1000  # Maximum chunk size for splitting content


def get_huggingface_embeddings(text: str, model_name: str = "sentence-transformers/all-mpnet-base-v2"):
    """
    Generate embeddings for the given text using HuggingFace.
    """
    model = SentenceTransformer(model_name)
    return model.encode(text)


def truncate_metadata(content: str) -> str:
    """
    Truncate the metadata content to fit within Pinecone's size limit.
    """
    return content[:MAX_METADATA_SIZE]


def split_into_chunks(content: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """
    Split large content into smaller chunks.
    """
    return [content[i:i + chunk_size] for i in range(0, len(content), chunk_size)]


def clone_repository(repo_url: str) -> str:
    """
    Clone a GitHub repository to a temporary directory.
    """
    try:
       
        repo_name = repo_url.split("/")[-1]
        repo_path = f"./repo/{repo_name}"
        Repo.clone_from(repo_url, repo_path)
        return repo_path
    except Exception as e:
        raise Exception(f"Error cloning repository: {str(e)}")


def get_file_content(file_path: str, repo_path: str) -> dict:
    """
    Retrieve the content of a file from the repository.
    """
    try:
        if os.path.getsize(file_path) > MAX_FILE_SIZE_MB * 1_048_576:
            print(f"Skipping large file: {file_path}")
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        rel_path = os.path.relpath(file_path, repo_path)
        return {"name": rel_path, "content": content}
    except Exception as e:
        print(f"Error reading file {file_path}: {str(e)}")
        return None


def get_main_files_content(repo_path: str) -> List[dict]:
    """
    Get content of supported code files from the repository.
    """
    supported_extensions = {".py", ".js", ".tsx", ".jsx", ".ipynb", ".java"}
    ignored_dirs = {"node_modules", "venv", "dist", ".git", "__pycache__"}
    files_content = []

    try:
        for root, _, files in os.walk(repo_path):
            if any(ignored in root for ignored in ignored_dirs):
                continue
            for file in files:
                file_path = os.path.join(root, file)
                if os.path.splitext(file)[1] in supported_extensions:
                    content = get_file_content(file_path, repo_path)
                    if content:
                        chunks = split_into_chunks(content["content"])
                        for idx, chunk in enumerate(chunks):
                            files_content.append({
                                "name": f"{content['name']}_part_{idx + 1}",
                                "content": chunk
                            })
    except Exception as e:
        print(f"Error processing repository: {str(e)}")

    return files_content


def perform_rag(query: str, namespace: str) -> str:
    """
    Perform Retrieval-Augmented Generation using Pinecone and OpenAI.
    """

    repo_path = clone_repository(namespace)
    files_content = get_main_files_content(repo_path)

        # Create documents with truncated metadata
    documents = [
            Document(page_content=file["content"], metadata={"source": file["name"]})
            for file in files_content
        ]

        # Index documents in Pinecone
    PineconeVectorStore.from_documents(
            documents=documents,
            embedding=hf_embeddings,
            index_name="ragchat",
            namespace=namespace,
            batch_size=100
        )

        # Query Pinecone
    raw_query_embedding = get_huggingface_embeddings(query)
    top_matches = pinecone_index.query(
            vector=raw_query_embedding.tolist(),
            top_k=5,
            include_metadata=True,
            namespace=namespace
        )

    contexts = [match["metadata"]["source"] for match in top_matches["matches"]]
    augmented_query = f"<CONTEXT>\n{'-------\n'.join(contexts)}\n</CONTEXT>\n\nMY QUESTION:\n{query}"

        # Generate response using OpenAI
    # client = OpenAI(api_key=GROQ_API_KEY)
    client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=GROQ_API_KEY
)
    llm_response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": augmented_query},
            ]
        )

    # return llm_response.choices[0].message.content
    return llm_response
    
def rag(query, namespace):
    raw_query_embedding = get_huggingface_embeddings(query)

    top_matches = pinecone_index.query(
        vector=raw_query_embedding.tolist(),
        top_k=5,
        include_metadata=True,
        namespace=namespace
    )

    contexts = [item['metadata'].get('source', '') for item in top_matches['matches']]

    augmented_query = (
        f"<CONTEXT>\n{'-------\n'.join(contexts[:10])}\n</CONTEXT>\n\nMY QUESTION:\n{query}"
    )

    system_prompt = """
    You are a Senior Software Engineer. 
    Answer any questions I have about the codebase based on the context provided.
    """

    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=GROQ_API_KEY
    )

    llm_response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": augmented_query}
        ]
    )

    # Prepare response messages array
    messages = [
        {"role": "user", "content": query},
        {"role": "assistant", "content": llm_response.choices[0].message.content}
    ]

    return {"messages": messages}  # Ensure the return value is JSON-serializable
