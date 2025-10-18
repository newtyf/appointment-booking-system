from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.deps import get_current_user
from app.models.user import User
from app.services.dashboard_service import DashboardService
from app.db.session import get_db_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def get_dashboard_service(db: Annotated[AsyncSession, Depends(get_db_session)]) -> DashboardService:
    """Dependency para obtener DashboardService"""
    return DashboardService(db)


@router.get("")
async def get_dashboard(
    current_user: Annotated[User, Depends(get_current_user)],
    dashboard_service: Annotated[DashboardService, Depends(get_dashboard_service)]
):
    """
    Obtener dashboard según rol del usuario.
    Retorna datos diferentes para cada rol.
    """
    if current_user.role == "admin":
        return await dashboard_service.get_admin_dashboard()
    
    elif current_user.role == "receptionist":
        return await dashboard_service.get_receptionist_dashboard()
    
    elif current_user.role == "stylist":
        return await dashboard_service.get_stylist_dashboard(current_user.id)
    
    elif current_user.role == "client":
        return await dashboard_service.get_client_dashboard(current_user.id)
    
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid role"
        )