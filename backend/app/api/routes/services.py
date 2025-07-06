from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.deps import check_user_role, get_service_service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceInDB
from app.services import ServiceService

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=list[ServiceInDB])
async def list_services(
    service_service: Annotated[ServiceService, Depends(get_service_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "user"))]
):
    services = await service_service.list_services()
    return services


@router.get("/{service_id}", response_model=ServiceInDB)
async def get_service(
    service_id: int,
    service_service: Annotated[ServiceService, Depends(get_service_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "user"))]
):
    service = await service_service.get_service(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.post("/", response_model=ServiceInDB, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_create: ServiceCreate,
    service_service: Annotated[ServiceService, Depends(get_service_service)],
    _: Annotated[bool, Depends(check_user_role("admin"))]
):
    return await service_service.create_service(service_create)


@router.put("/{service_id}", response_model=ServiceInDB)
async def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    service_service: Annotated[ServiceService, Depends(get_service_service)],
    _: Annotated[bool, Depends(check_user_role("admin"))]
):
    service = await service_service.update_service(service_id, service_update)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    service_service: Annotated[ServiceService, Depends(get_service_service)],
    _: Annotated[bool, Depends(check_user_role("admin"))]
):
    service = await service_service.delete_service(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return None
