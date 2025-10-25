from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.deps import (
    check_user_role, 
    get_appointment_service, 
    get_current_user
)
from app.schemas.appointment import (
    AppointmentCreate, 
    AppointmentUpdate, 
    AppointmentInDB,
    AppointmentCreateForClient,
    AppointmentCreateWalkIn
)
from app.services import AppointmentService
from app.models.user import User

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentInDB])
async def list_appointments(
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    _: Annotated[bool, Depends(check_user_role("admin", "receptionist"))]
):
    """Listar todas las citas"""
    return await appointment_service.list_appointments()


@router.get("/my-appointments", response_model=list[AppointmentInDB])
async def list_my_appointments(
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Listar citas según rol"""
    if current_user.role in ["admin", "receptionist"]:
        return await appointment_service.list_appointments()
    elif current_user.role == "stylist":
        return await appointment_service.list_stylist_appointments(current_user.id)
    elif current_user.role == "client":
        return await appointment_service.list_user_appointments(current_user.id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid role")



@router.get("/my-appointments/history", response_model=list[AppointmentInDB])
async def get_my_appointment_history(
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Obtener historial de citas (completadas, canceladas, no-show)"""
    if current_user.role == "stylist":
        return await appointment_service.get_stylist_history(current_user.id)
    elif current_user.role == "client":
        return await appointment_service.get_client_history(current_user.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only stylists and clients can view history"
        )


@router.get("/availability", response_model=dict)
async def get_availability(
    date: str,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    service_id: Optional[int] = None,
    stylist_id: Optional[int] = None
):
   
    return await appointment_service.get_availability(
        date_str=date,
        service_id=service_id,
        stylist_id=stylist_id
    )


@router.get("/{appointment_id}", response_model=AppointmentInDB)
async def read_appointment(
    appointment_id: int,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Ver detalles de una cita"""
    appointment = await appointment_service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    if not await appointment_service.can_user_access_appointment(appointment, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return appointment


@router.post("/", response_model=AppointmentInDB, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_create: AppointmentCreate,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[bool, Depends(check_user_role("admin", "receptionist"))]
):
    """Crear cita (registrado o walk-in)"""
    try:
        # Asignar created_by y modified_by del usuario autenticado
        appointment_create.created_by = current_user.id
        appointment_create.modified_by = current_user.id
        
        appointment = await appointment_service.create_appointment(appointment_create)

        return appointment

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/book", response_model=AppointmentInDB, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appointment_data: AppointmentCreateForClient,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Cliente crea su propia cita"""
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only clients can book")
    
    return await appointment_service.create_appointment_for_client( 
        appointment_data=appointment_data,
        client_id=current_user.id,
        created_by=current_user.id
    )


@router.post("/walk-in", response_model=AppointmentInDB, status_code=status.HTTP_201_CREATED)
async def create_walk_in_appointment(
    appointment_data: AppointmentCreateWalkIn,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Crear cita para walk-in"""
    if current_user.role not in ["admin", "receptionist"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return await appointment_service.create_walk_in_appointment(
        appointment_data=appointment_data,
        created_by=current_user.id
    )


@router.put("/{appointment_id}", response_model=AppointmentInDB)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Actualizar cita"""
    appointment = await appointment_service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    if current_user.role not in ["admin", "receptionist"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    appointment_update.modified_by = current_user.id
    return await appointment_service.update_appointment(appointment_id, appointment_update)


@router.patch("/{appointment_id}/status", response_model=AppointmentInDB)
async def update_appointment_status(
    appointment_id: int,
    status_value: str,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Cambiar estado de cita"""
    appointment = await appointment_service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    if current_user.role == "stylist" and appointment.stylist_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment")
    elif current_user.role == "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use DELETE to cancel")
    
    return await appointment_service.update_appointment_status(
        appointment_id=appointment_id,
        status=status_value,
        modified_by=current_user.id
    )


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: int,
    appointment_service: Annotated[AppointmentService, Depends(get_appointment_service)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Cancelar cita"""
    appointment = await appointment_service.get_appointment(appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    if current_user.role == "client" and appointment.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment")
    elif current_user.role == "stylist":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use PATCH /status")
    
    await appointment_service.delete_appointment(appointment_id)
    return None