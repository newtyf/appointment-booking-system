"""
Schemas para el módulo de pagos con Culqi
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime


class ChargeRequest(BaseModel):
    """
    Schema para solicitud de creación de cargo
    """
    token_id: str = Field(..., description="ID del token generado por Culqi Checkout")
    amount: int = Field(..., description="Monto en centavos (ej: 10000 = 100.00 PEN)", gt=0)
    currency: str = Field(default="PEN", description="Código de moneda ISO (PEN, USD, etc.)")
    description: str = Field(..., description="Descripción del cargo")
    email: EmailStr = Field(..., description="Email del cliente")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Metadata adicional")

    class Config:
        json_schema_extra = {
            "example": {
                "token_id": "tkn_test_xxxxxxxxxx",
                "amount": 10000,
                "currency": "PEN",
                "description": "Pago de reserva - Corte de cabello",
                "email": "cliente@example.com",
                "metadata": {
                    "appointment_id": "123",
                    "service_id": "456",
                    "user_id": "789"
                }
            }
        }


class ChargeResponse(BaseModel):
    """
    Schema para respuesta de cargo exitoso
    """
    id: str = Field(..., description="ID del cargo creado")
    object: str = Field(..., description="Tipo de objeto (charge)")
    amount: int = Field(..., description="Monto en centavos")
    currency_code: str = Field(..., description="Código de moneda")
    email: str = Field(..., description="Email del cliente")
    description: str = Field(..., description="Descripción del cargo")
    # source: Dict[str, Any] = Field(..., description="Información de la fuente de pago")
    outcome: Dict[str, Any] = Field(..., description="Resultado del cargo")
    creation_date: int = Field(..., description="Fecha de creación en timestamp")
    reference_code: str = Field(..., description="Código de referencia")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "chr_test_xxxxxxxxxx",
                "object": "charge",
                "amount": 10000,
                "currency_code": "PEN",
                "email": "cliente@example.com",
                "description": "Pago de reserva",
                "source": {
                    "type": "card",
                    "brand": "Visa",
                    "last_four": "1111"
                },
                "outcome": {
                    "type": "venta_exitosa",
                    "code": "AUT0000"
                },
                "creation_date": 1634567890,
                "reference_code": "REF123456",
                "metadata": {}
            }
        }


class ChargeError(BaseModel):
    """
    Schema para error en cargo
    """
    object: str = Field(..., description="Tipo de error")
    type: str = Field(..., description="Categoría del error")
    charge_id: Optional[str] = Field(default=None, description="ID del cargo si existe")
    code: str = Field(..., description="Código del error")
    merchant_message: str = Field(..., description="Mensaje para el comercio")
    user_message: str = Field(..., description="Mensaje para el usuario")

    class Config:
        json_schema_extra = {
            "example": {
                "object": "error",
                "type": "card_error",
                "charge_id": None,
                "code": "card_declined",
                "merchant_message": "La tarjeta fue declinada",
                "user_message": "Tu tarjeta fue declinada"
            }
        }


class PaymentHistoryResponse(BaseModel):
    """
    Schema para historial de pagos
    """
    id: str
    amount: int
    currency_code: str
    email: str
    description: str
    creation_date: int
    reference_code: str
    status: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "chr_test_xxxxxxxxxx",
                "amount": 10000,
                "currency_code": "PEN",
                "email": "cliente@example.com",
                "description": "Pago de reserva",
                "creation_date": 1634567890,
                "reference_code": "REF123456",
                "status": "successful"
            }
        }
