"""
Shared rate limiter instance for the application.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create a single shared limiter instance
limiter = Limiter(key_func=get_remote_address)
