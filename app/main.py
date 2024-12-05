import os
from git import Repo
from sentence_transformers import SentenceTransformer
from langchain_pinecone import PineconeVectorStore
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from pinecone import Pinecone
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from app.libs.queries import perform_rag
from app.libs.database import get_db_connection
from app.libs.queries import rag
# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not PINECONE_API_KEY or not GROQ_API_KEY:
    raise ValueError("Environment variables PINECONE_API_KEY or GROQ_API_KEY are missing.")

# Initialize Pinecone
pinecone_client = Pinecone(api_key=PINECONE_API_KEY, environment="us-west1-gcp")
pinecone_index = pinecone_client.Index("codebase-rag")
hf_embeddings = HuggingFaceEmbeddings()

# FastAPI app
app = FastAPI()
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class CloneRequest(BaseModel):
    repo_url: str


class RAGRequest(BaseModel):
    query: str
    namespace: str


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


def get_main_files_content(repo_path: str) -> List[dict]:
    """
    Extract supported files and their content from a repository.
    """
    supported_extensions = {".py", ".js", ".tsx", ".jsx", ".ipynb", ".java"}
    ignored_dirs = {"node_modules", "venv", "dist", ".git", "__pycache__"}
    files_content = []

    for root, _, files in os.walk(repo_path):
        if any(ignored in root for ignored in ignored_dirs):
            continue
        for file in files:
            file_path = os.path.join(root, file)
            if os.path.splitext(file)[1] in supported_extensions:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        files_content.append({"name": file, "content": f.read()})
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    return files_content
@app.get("/")
def read_root():
    return {"Hello": "World"}   

@app.post("/clone-repo")
def clone_repo(request: CloneRequest):
    """
    Endpoint to clone a repository and process its contents.
    """
    try:
        repo_path = clone_repository(request.repo_url)
        redirect_url = f"/perform-rag?repo_path={repo_path}"
      
        # Process repository content
        # Example of processing embeddings
        
        return {"message": "Repository cloned successfully", "repo_path": repo_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/perform-rag")
def perform_rag_query(request: RAGRequest):
    """
    Endpoint to perform Retrieval-Augmented Generation.
    """
    print("Performing RAG query...")
    try:
        response = perform_rag(request.query, request.namespace)
        print(response)
        return {"response": response, "namespace": request.namespace}
    
    except Exception as e:
        print(f"Error performing RAG query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
from fastapi import Request

@app.post("/query")
async def query_endpoint(request: Request):
    body = await request.json()
    print("Received request body:", body)  # Log incoming request
    try:
        response = rag(body["query"], body["namespace"])
        print("Generated response:", response)  # Log response
        return {"response": response}
    except Exception as e:
        print("Error:", str(e))  # Log error details
        raise HTTPException(status_code=500, detail=str(e))
