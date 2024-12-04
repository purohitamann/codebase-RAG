from fastapi import FastAPI
from .routes import router
from fastapi.middleware.cors import CORSMiddleware
from codebase_rag import clone_repository 
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Register routes
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}

@app.post("/clone-repo")
async def clone_repo():
    print(clone_repository())
