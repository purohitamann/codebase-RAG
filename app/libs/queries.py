def get_user_by_username(cursor, username: str):
    """
    Fetches user details by username.
    """
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    return cursor.fetchone()
