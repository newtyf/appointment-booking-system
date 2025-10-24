"""
Servicio para manejar pagos con Culqi
"""
import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class CulqiPaymentService:
    """
    Servicio para interactuar con la API de Culqi
    """
    
    def __init__(self):
        self.api_url = settings.CULQI_API_URL
        self.secret_key = settings.CULQI_SECRET_KEY
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
    
    async def create_charge(
        self,
        token_id: str,
        amount: int,
        currency: str,
        description: str,
        email: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Crea un cargo en Culqi usando el token generado por Culqi Checkout
        
        Args:
            token_id: ID del token generado por Culqi Checkout
            amount: Monto en centavos (ej: 10000 = 100.00 PEN)
            currency: Código de moneda (PEN, USD, etc.)
            description: Descripción del cargo
            email: Email del cliente
            metadata: Metadata adicional (opcional)
        
        Returns:
            Dict con la respuesta de Culqi
        
        Raises:
            httpx.HTTPStatusError: Si la API de Culqi devuelve un error
        """
        endpoint = f"{self.api_url}/charges"
        
        payload = {
            "amount": amount,
            "currency_code": currency,
            "email": email,
            "source_id": token_id,
            "description": description,
        }
        
        # Agregar metadata si existe
        if metadata:
            payload["metadata"] = metadata
        
        logger.info(f"Creando cargo en Culqi: {description} - Monto: {amount/100} {currency}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    endpoint,
                    json=payload,
                    headers=self.headers,
                    timeout=30.0
                )
                
                # Verificar si la respuesta fue exitosa
                response.raise_for_status()
                
                charge_data = response.json()
                logger.info(f"Cargo creado exitosamente: {charge_data.get('id')}")
                
                return charge_data
                
        except httpx.HTTPStatusError as e:
            error_data = e.response.json() if e.response.content else {}
            logger.error(f"Error al crear cargo en Culqi: {error_data}")
            
            # Re-lanzar el error con la información de Culqi
            raise ValueError(
                error_data.get("user_message", "Error al procesar el pago")
            ) from e
        
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con Culqi: {str(e)}")
            raise ValueError("Error de conexión con el procesador de pagos") from e
    
    async def get_charge(self, charge_id: str) -> Dict[str, Any]:
        """
        Obtiene información de un cargo específico
        
        Args:
            charge_id: ID del cargo
        
        Returns:
            Dict con la información del cargo
        """
        endpoint = f"{self.api_url}/charges/{charge_id}"
        
        logger.info(f"Obteniendo información del cargo: {charge_id}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    endpoint,
                    headers=self.headers,
                    timeout=30.0
                )
                
                response.raise_for_status()
                charge_data = response.json()
                
                return charge_data
                
        except httpx.HTTPStatusError as e:
            error_data = e.response.json() if e.response.content else {}
            logger.error(f"Error al obtener cargo: {error_data}")
            raise ValueError("No se pudo obtener la información del cargo") from e
        
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con Culqi: {str(e)}")
            raise ValueError("Error de conexión con el procesador de pagos") from e
    
    async def list_charges(
        self,
        email: Optional[str] = None,
        limit: int = 10,
        before: Optional[str] = None,
        after: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Lista los cargos realizados
        
        Args:
            email: Filtrar por email del cliente (opcional)
            limit: Número máximo de resultados (default: 10)
            before: ID del cargo para paginación (opcional)
            after: ID del cargo para paginación (opcional)
        
        Returns:
            Dict con la lista de cargos
        """
        endpoint = f"{self.api_url}/charges"
        
        params: Dict[str, Any] = {"limit": limit}
        
        if email:
            params["email"] = email
        if before:
            params["before"] = before
        if after:
            params["after"] = after
        
        logger.info(f"Listando cargos con filtros: {params}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    endpoint,
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                
                response.raise_for_status()
                charges_data = response.json()
                
                return charges_data
                
        except httpx.HTTPStatusError as e:
            error_data = e.response.json() if e.response.content else {}
            logger.error(f"Error al listar cargos: {error_data}")
            raise ValueError("No se pudo obtener el historial de pagos") from e
        
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con Culqi: {str(e)}")
            raise ValueError("Error de conexión con el procesador de pagos") from e


# Instancia global del servicio
payment_service = CulqiPaymentService()
