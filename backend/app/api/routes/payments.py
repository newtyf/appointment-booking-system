"""
Rutas para el módulo de pagos con Culqi
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging

from app.schemas.payment import (
    ChargeRequest,
    ChargeResponse,
    PaymentHistoryResponse
)
from app.services.payment_service import payment_service
from app.api.dependencies.deps import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/charge",
    response_model=ChargeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un cargo",
    description="Crea un cargo en Culqi usando el token generado por Culqi Checkout"
)
async def create_charge(
    charge_data: ChargeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Crea un cargo en Culqi
    
    - **token_id**: ID del token generado por Culqi Checkout
    - **amount**: Monto en centavos (ej: 10000 = 100.00 PEN)
    - **currency**: Código de moneda (PEN, USD, etc.)
    - **description**: Descripción del cargo
    - **email**: Email del cliente
    - **metadata**: Metadata adicional (opcional)
    """
    try:
        logger.info(
            f"Usuario {current_user.id} creando cargo: "
            f"{charge_data.description} - {charge_data.amount/100} {charge_data.currency}"
        )
        
        # Crear el cargo en Culqi
        result = await payment_service.create_charge(
            token_id=charge_data.token_id,
            amount=charge_data.amount,
            currency=charge_data.currency,
            description=charge_data.description,
            email=charge_data.email,
            metadata=charge_data.metadata or {}
        )
        
        logger.info(f"Cargo creado exitosamente: {result.get('id')}")
        
        return result
        
    except ValueError as e:
        logger.error(f"Error al crear cargo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error inesperado al crear cargo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al procesar el pago"
        )


@router.get(
    "/{charge_id}",
    response_model=ChargeResponse,
    summary="Obtener información de un cargo",
    description="Obtiene información detallada de un cargo específico"
)
async def get_charge(
    charge_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene información de un cargo específico
    
    - **charge_id**: ID del cargo
    """
    try:
        logger.info(f"Usuario {current_user.id} obteniendo cargo: {charge_id}")
        
        result = await payment_service.get_charge(charge_id)
        
        return result
        
    except ValueError as e:
        logger.error(f"Error al obtener cargo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error inesperado al obtener cargo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al obtener información del pago"
        )


@router.get(
    "/history",
    response_model=List[PaymentHistoryResponse],
    summary="Obtener historial de pagos",
    description="Obtiene el historial de pagos del usuario actual"
)
async def get_payment_history(
    limit: int = 10,
    email: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene el historial de pagos
    
    - **limit**: Número máximo de resultados (default: 10)
    - **email**: Filtrar por email (opcional)
    """
    try:
        # Si el usuario no es admin, solo puede ver sus propios pagos
        filter_email = email
        if current_user.role != "admin" and email != current_user.email:
            filter_email = current_user.email
        
        logger.info(
            f"Usuario {current_user.id} obteniendo historial de pagos "
            f"(email: {filter_email}, limit: {limit})"
        )
        
        result = await payment_service.list_charges(
            email=filter_email,
            limit=limit
        )
        
        # Extraer solo los datos necesarios
        charges = result.get("data", [])
        
        return charges
        
    except ValueError as e:
        logger.error(f"Error al obtener historial: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error inesperado al obtener historial: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al obtener el historial de pagos"
        )
