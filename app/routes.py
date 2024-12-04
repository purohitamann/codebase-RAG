from fastapi import APIRouter, HTTPException

from app.libs.database import get_db_connection
from app.libs.queries import get_user_by_username
from app.libs.exceptions import UserNotFound

router = APIRouter()

@router.get("/get-api-keys/{username}")
async def get_api_keys(username: str):
    """
    Fetch API keys for a given username.
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Query the database
        cursor.execute("SELECT  * FROM users WHERE username = %s", (username,))
        row = cursor.fetchone()

        # Close connection
        cursor.close()
        connection.close()

        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "USERNAME": row.get("username", "N/A"),
            "GROQ": row.get("groq", "N/A"),
            "PINE_CONE_API": row.get("pine_cone_api", "N/A")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
@router.post("/add-api-keys")
def add_keys():
    """
    Add API keys for a given hardcoded username.
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Hardcoded username and API keys
        hardcoded_username = "test_user"
        hardcoded_groq = "hardcoded_groq_api_key"
        hardcoded_pinecone = "hardcoded_pinecone_api_key"

        # Insert query
        cursor.execute(
            "INSERT INTO users (username, groq, pine_cone_api) VALUES (%s, %s, %s)",
            (hardcoded_username, hardcoded_groq, hardcoded_pinecone)
        )
        connection.commit()

        # Close connection
        cursor.close()
        connection.close()

        return {"message": f"API keys added for {hardcoded_username} successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")