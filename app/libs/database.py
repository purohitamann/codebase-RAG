import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """
    Creates and returns a new database connection.
    """
    try:
        connection = psycopg2.connect(
            dbname="rag_users",
            user="myuser",
            password="0212",
            host="localhost",
            port="5432",
            cursor_factory=RealDictCursor  # Return query results as dictionaries
        )
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        raise
