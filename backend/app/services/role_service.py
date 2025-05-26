from typing import Sequence

from fastapi import Depends, HTTPException, status

from app.models.user import User

class RoleChecker:
    def __init__(self, allowed_roles: Sequence[str]):
        self.allowed_roles = allowed_roles

    def check(self, user: User):
        if user.role in self.allowed_roles:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have enough permissions"
        )