"""
Authentication and authorization dependencies.
"""
from app.dependencies.permissions import (
    get_current_user,
    get_current_admin,
    verify_abstract_reviewer,
    verify_abstract_owner,
)

__all__ = [
    "get_current_user",
    "get_current_admin",
    "verify_abstract_reviewer",
    "verify_abstract_owner",
]
