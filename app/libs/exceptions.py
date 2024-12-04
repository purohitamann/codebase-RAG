from fastapi import HTTPException

class UserNotFound(HTTPException):
    def __init__(self, username: str):
        super().__init__(status_code=404, detail=f"User '{username}' not found")
