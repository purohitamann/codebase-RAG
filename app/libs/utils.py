from hashlib import sha256

def hash_string(input_string: str) -> str:
    """
    Hashes a string using SHA256.
    """
    return sha256(input_string.encode()).hexdigest()
