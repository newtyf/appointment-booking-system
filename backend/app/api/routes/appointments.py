from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.deps import check_user_role, get_appointment_service
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentInDB
from app.services import AppointmentService

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.get("", response_model=list[AppointmentInDB])
async def list_appointments(
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    _: Annotated[bool, Depends(check_user_role("admin"))]
):
    appointments = await appointment_service.list_appointments()
    return appointments

@router.get("", response_model=list[AppointmentInDB])
async def list_user_appointments(
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    _: Annotated[bool, Depends(check_user_role("user"))]
):
    appointments = await appointment_service.list_appointments()
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentInDB)
async def read_appointment(
    appointment_id: int,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "user"))]
):
    appointment = await appointment_service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment


@router.post("/", response_model=AppointmentInDB, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_create: AppointmentCreate,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "user"))]
):
    appointment = await appointment_service.create_appointment(appointment_create)
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentInDB)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    _: Annotated[bool, Depends(check_user_role("admin"))]
):
    appointment = await appointment_service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    updated_appointment = await appointment_service.update_appointment(appointment_id, appointment_update)
    return updated_appointment


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: int,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "user"))]
):
    appointment = await appointment_service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    await appointment_service.delete_appointment(appointment_id)
    return None
