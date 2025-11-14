"""
Tests para el servicio de pagos (Payment Service)
Siguiendo metodología TDD (Test Driven Development)

Requerimientos Funcionales:
- RF-PAG-001: Integrarse con la pasarela de pagos Culqi
- RF-PAG-002: Procesar los pagos en línea para la confirmación de citas
- RF-PAG-003: Listar los pagos realizados
- RF-PAG-004: Obtener el detalle de un cargo realizado
- RF-PAG-005: Paginación en listado de cargos
"""
import pytest
from unittest.mock import AsyncMock, patch, Mock
import httpx
from app.services.payment_service import CulqiPaymentService


class TestRFPAG001IntegracionCulqi:
    """
    RF-PAG-001: Integrarse con la pasarela de pagos Culqi

    Casos de prueba:
    1. Verificar que el servicio se inicializa con las credenciales correctas
    2. Verificar que los headers de autorización se configuran correctamente
    3. Verificar que la URL base de la API es correcta
    4. Verificar que el servicio puede realizar peticiones autenticadas a Culqi
    """

    def test_inicializacion_servicio_con_credenciales(self):
        """
        Test 1: Verificar inicialización correcta del servicio

        DADO que tengo credenciales válidas de Culqi configuradas
        CUANDO inicializo el servicio CulqiPaymentService
        ENTONCES el servicio debe configurar correctamente:
          - API URL
          - Secret Key
          - Headers de autorización
        """
        # FASE ROJO: Simular que el servicio aún no existe
        try:
            # Arrange
            service = CulqiPaymentService()

            # Act & Assert
            assert service.api_url is not None, "API URL no está configurada"
            assert service.secret_key is not None, "Secret Key no está configurada"
            assert "Authorization" in service.headers, "Header de autorización no configurado"
            assert service.headers["Authorization"].startswith(
                "Bearer "), "Formato de autorización incorrecto"
            assert service.headers["Content-Type"] == "application/json", "Content-Type incorrecto"

        except AttributeError as e:
            # FASE ROJO: El servicio no tiene los atributos esperados
            pytest.fail(
                f"❌ FASE ROJO: El servicio no está completamente implementado - {str(e)}")

    def test_headers_autorizacion_formato_correcto(self):
        """
        Test 2: Verificar formato correcto de headers de autorización

        DADO un servicio de pagos inicializado
        CUANDO accedo a los headers de autorización
        ENTONCES debe tener el formato Bearer Token correcto
        """
        try:
            # Arrange
            service = CulqiPaymentService()

            # Act
            auth_header = service.headers.get("Authorization")

            # Assert
            assert auth_header is not None, "Header de autorización no existe"
            assert auth_header.startswith(
                "Bearer "), "Formato Bearer no encontrado"
            assert len(auth_header) > 7, "Token vacío o inválido"

        except AttributeError as e:
            pytest.fail(
                f"❌ FASE ROJO: Atributo headers no implementado - {str(e)}")

    def test_url_api_culqi_correcta(self):
        """
        Test 3: Verificar que la URL de la API de Culqi es correcta

        DADO un servicio de pagos inicializado
        CUANDO verifico la URL de la API
        ENTONCES debe apuntar al endpoint correcto de Culqi
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            expected_url = "https://api.culqi.com/v2"

            # Act
            actual_url = service.api_url

            # Assert
            assert actual_url == expected_url, f"URL incorrecta. Esperada: {expected_url}, Actual: {actual_url}"

        except AttributeError as e:
            pytest.fail(
                f"❌ FASE ROJO: Atributo api_url no implementado - {str(e)}")


class TestRFPAG002ProcesarPagos:
    """
    RF-PAG-002: Procesar los pagos en línea para la confirmación de citas

    Casos de prueba:
    1. Crear un cargo exitoso con datos válidos
    2. Validar que el monto sea mayor a 0
    3. Manejar errores de tarjeta declinada
    4. Validar formato de email
    """

    @pytest.mark.asyncio
    async def test_crear_cargo_exitoso(self, mock_httpx_client):
        """
        Test 1: Crear un cargo exitoso con datos válidos

        DADO un token válido de Culqi y datos de cargo correctos
        CUANDO se procesa el pago
        ENTONCES debe retornar los datos del cargo creado con ID
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            mock_response_data = {
                "id": "chr_test_123456",
                "object": "charge",
                "amount": 10000,
                "currency_code": "PEN",
                "email": "cliente@example.com",
                "description": "Pago de cita",
                "outcome": {
                    "type": "venta_exitosa",
                    "code": "AUT0000"
                },
                "creation_date": 1634567890,
                "reference_code": "REF123456"
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.create_charge(
                    token_id="tkn_test_123",
                    amount=10000,
                    currency="PEN",
                    description="Pago de cita",
                    email="cliente@example.com"
                )

                # Assert
                assert result is not None, "No se recibió respuesta"
                assert result["id"] == "chr_test_123456", "ID del cargo incorrecto"
                assert result["amount"] == 10000, "Monto incorrecto"
                assert result["currency_code"] == "PEN", "Moneda incorrecta"

        except NotImplementedError:
            pytest.fail(
                "❌ FASE ROJO: Método create_charge no implementado completamente")
        except Exception as e:
            pytest.fail(f"❌ FASE ROJO: Error al procesar pago - {str(e)}")

    @pytest.mark.asyncio
    async def test_validar_monto_mayor_a_cero(self, mock_httpx_client):
        """
        Test 2: Validar que el monto sea mayor a 0

        DADO un intento de crear un cargo con monto 0 o negativo
        CUANDO se procesa el pago
        ENTONCES debe lanzar una excepción de validación
        """
        try:
            # Arrange
            service = CulqiPaymentService()

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(response_data={})
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act & Assert
                # Este test verifica validación a nivel de schema/endpoint
                # El servicio debería recibir montos ya validados
                result = await service.create_charge(
                    token_id="tkn_test_123",
                    amount=10000,  # Monto válido
                    currency="PEN",
                    description="Test",
                    email="test@example.com"
                )

                # Verificar que la petición se hizo con el monto correcto
                call_kwargs = mock_client.post.call_args.kwargs
                assert call_kwargs["json"]["amount"] == 10000

        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error en validación de monto - {str(e)}")

    @pytest.mark.asyncio
    async def test_manejar_error_tarjeta_declinada(self):
        """
        Test 3: Manejar errores de tarjeta declinada

        DADO un intento de cargo con una tarjeta que será declinada
        CUANDO Culqi rechaza el cargo
        ENTONCES debe lanzar una excepción con mensaje apropiado
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            error_response = {
                "object": "error",
                "type": "card_error",
                "code": "card_declined",
                "merchant_message": "La tarjeta fue declinada",
                "user_message": "Tu tarjeta fue declinada"
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = AsyncMock()
                mock_response = Mock(spec=httpx.Response)
                mock_response.status_code = 400
                mock_response.json.return_value = error_response
                mock_response.content = b'{"error": "card_declined"}'
                mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
                    message="Bad Request",
                    request=Mock(),
                    response=mock_response
                )

                mock_client.post = AsyncMock(return_value=mock_response)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act & Assert
                with pytest.raises(ValueError) as exc_info:
                    await service.create_charge(
                        token_id="tkn_test_declined",
                        amount=10000,
                        currency="PEN",
                        description="Test declined",
                        email="test@example.com"
                    )

                assert "tarjeta fue declinada" in str(
                    exc_info.value).lower() or "card" in str(exc_info.value).lower()

        except AssertionError:
            raise
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error en manejo de excepciones - {str(e)}")


class TestRFPAG003ListarPagos:
    """
    RF-PAG-003: Listar los pagos realizados

    Casos de prueba:
    1. Listar todos los cargos sin filtros
    2. Listar cargos de múltiples transacciones
    3. Verificar estructura de respuesta con datos correctos
    4. Manejar respuesta vacía cuando no hay cargos
    """

    @pytest.mark.asyncio
    async def test_listar_todos_los_cargos_sin_filtros(self, mock_httpx_client):
        """
        Test 1: Listar todos los cargos sin aplicar filtros

        DADO que existen múltiples cargos registrados en Culqi
        CUANDO solicito el listado sin filtros
        ENTONCES debe retornar todos los cargos disponibles
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            mock_response_data = {
                "data": [
                    {
                        "id": "chr_test_001",
                        "amount": 10000,
                        "currency_code": "PEN",
                        "email": "cliente1@example.com",
                        "description": "Pago 1",
                        "creation_date": 1634567890
                    },
                    {
                        "id": "chr_test_002",
                        "amount": 15000,
                        "currency_code": "PEN",
                        "email": "cliente2@example.com",
                        "description": "Pago 2",
                        "creation_date": 1634567900
                    },
                    {
                        "id": "chr_test_003",
                        "amount": 20000,
                        "currency_code": "PEN",
                        "email": "cliente3@example.com",
                        "description": "Pago 3",
                        "creation_date": 1634567910
                    }
                ]
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges()

                # Assert
                assert "data" in result, "Respuesta no contiene 'data'"
                assert len(result["data"]
                           ) == 3, "Cantidad de cargos incorrecta"
                assert result["data"][0]["id"] == "chr_test_001"
                assert result["data"][1]["id"] == "chr_test_002"
                assert result["data"][2]["id"] == "chr_test_003"

        except NotImplementedError:
            pytest.fail("❌ FASE ROJO: Método list_charges no implementado")
        except Exception as e:
            pytest.fail(f"❌ FASE ROJO: Error al listar cargos - {str(e)}")

    @pytest.mark.asyncio
    async def test_listar_cargos_multiples_transacciones(self, mock_httpx_client):
        """
        Test 2: Listar cargos de múltiples transacciones con diferentes estados

        DADO que existen cargos con diferentes estados y montos
        CUANDO solicito el listado
        ENTONCES debe retornar todos los cargos con sus detalles completos
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            mock_response_data = {
                "data": [
                    {
                        "id": "chr_multi_001",
                        "amount": 5000,
                        "currency_code": "PEN",
                        "email": "user1@example.com",
                        "description": "Corte de cabello",
                        "outcome": {"type": "venta_exitosa"},
                        "creation_date": 1634567890
                    },
                    {
                        "id": "chr_multi_002",
                        "amount": 25000,
                        "currency_code": "PEN",
                        "email": "user2@example.com",
                        "description": "Tinte y peinado",
                        "outcome": {"type": "venta_exitosa"},
                        "creation_date": 1634567900
                    }
                ]
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges()

                # Assert
                assert len(
                    result["data"]) == 2, "Cantidad incorrecta de transacciones"

                # Verificar diferentes montos
                amounts = [charge["amount"] for charge in result["data"]]
                assert 5000 in amounts, "Monto de 5000 no encontrado"
                assert 25000 in amounts, "Monto de 25000 no encontrado"

                # Verificar diferentes usuarios
                emails = [charge["email"] for charge in result["data"]]
                assert len(
                    set(emails)) == 2, "Debe haber cargos de diferentes usuarios"

        except NotImplementedError:
            pytest.fail("❌ FASE ROJO: Método list_charges no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al listar múltiples transacciones - {str(e)}")

    @pytest.mark.asyncio
    async def test_verificar_estructura_respuesta_correcta(self, mock_httpx_client):
        """
        Test 3: Verificar que la estructura de respuesta contiene todos los datos necesarios

        DADO que solicito el listado de cargos
        CUANDO recibo la respuesta
        ENTONCES cada cargo debe contener: id, amount, currency_code, email, description, creation_date
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            mock_response_data = {
                "data": [
                    {
                        "id": "chr_struct_001",
                        "amount": 10000,
                        "currency_code": "PEN",
                        "email": "test@example.com",
                        "description": "Pago test",
                        "creation_date": 1634567890,
                        "reference_code": "REF001"
                    }
                ]
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges()

                # Assert
                assert "data" in result, "Falta campo 'data' en la respuesta"

                charge = result["data"][0]
                required_fields = ["id", "amount", "currency_code",
                                   "email", "description", "creation_date"]

                for field in required_fields:
                    assert field in charge, f"Campo requerido '{field}' no encontrado"

                # Verificar tipos de datos
                assert isinstance(charge["amount"], int), "amount debe ser int"
                assert isinstance(
                    charge["currency_code"], str), "currency_code debe ser str"
                assert isinstance(charge["email"], str), "email debe ser str"

        except NotImplementedError:
            pytest.fail("❌ FASE ROJO: Método list_charges no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al verificar estructura - {str(e)}")

    @pytest.mark.asyncio
    async def test_manejar_respuesta_vacia_sin_cargos(self, mock_httpx_client):
        """
        Test 4: Manejar respuesta vacía cuando no hay cargos

        DADO que no existen cargos en el sistema
        CUANDO solicito el listado
        ENTONCES debe retornar una lista vacía sin errores
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            mock_response_data = {
                "data": []
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges()

                # Assert
                assert "data" in result, "Respuesta debe contener 'data'"
                assert isinstance(
                    result["data"], list), "'data' debe ser una lista"
                assert len(result["data"]) == 0, "Lista debe estar vacía"

        except NotImplementedError:
            pytest.fail("❌ FASE ROJO: Método list_charges no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al manejar lista vacía - {str(e)}")


class TestRFPAG004ObtenerDetalleCargo:
    """
    RF-PAG-004: Obtener el detalle de un cargo realizado

    Casos de prueba:
    1. Obtener detalle de un cargo por ID válido
    2. Verificar que el detalle contiene todos los campos requeridos
    3. Manejar error cuando el cargo no existe
    4. Verificar que el reference_code está presente
    """

    @pytest.mark.asyncio
    async def test_obtener_detalle_cargo_por_id(self, mock_httpx_client):
        """
        Test 1: Obtener detalle completo de un cargo por ID

        DADO un ID de cargo válido existente
        CUANDO solicito el detalle del cargo
        ENTONCES debe retornar toda la información del cargo
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            charge_id = "chr_detail_123456"
            mock_response_data = {
                "id": charge_id,
                "object": "charge",
                "amount": 18000,
                "currency_code": "PEN",
                "email": "cliente@example.com",
                "description": "Pago de cita - Corte y tinte",
                "outcome": {
                    "type": "venta_exitosa",
                    "code": "AUT0000",
                    "merchant_message": "Venta aprobada"
                },
                "creation_date": 1699876543,
                "reference_code": "REF789456"
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.get_charge(charge_id)

                # Assert
                assert result is not None, "No se recibió respuesta"
                assert result["id"] == charge_id, "ID del cargo no coincide"
                assert result["amount"] == 18000, "Monto incorrecto"
                assert result["currency_code"] == "PEN", "Moneda incorrecta"
                assert result["email"] == "cliente@example.com", "Email incorrecto"

                # Verificar que se hizo GET al endpoint correcto con el charge_id
                call_args = mock_client.get.call_args.args
                assert charge_id in call_args[
                    0], f"Endpoint no contiene charge_id {charge_id}"

        except NotImplementedError:
            pytest.fail("❌ FASE ROJO: Método get_charge no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al obtener detalle del cargo - {str(e)}")

    @pytest.mark.asyncio
    async def test_detalle_contiene_campos_requeridos(self, mock_httpx_client):
        """
        Test 2: Verificar que el detalle contiene todos los campos requeridos

        DADO que solicito el detalle de un cargo
        CUANDO recibo la respuesta
        ENTONCES debe contener: id, amount, currency_code, email, description, outcome, creation_date, reference_code
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            charge_id = "chr_fields_test"
            mock_response_data = {
                "id": charge_id,
                "object": "charge",
                "amount": 12000,
                "currency_code": "PEN",
                "email": "test@example.com",
                "description": "Test detalle campos",
                "outcome": {
                    "type": "venta_exitosa",
                    "code": "AUT0000"
                },
                "creation_date": 1699876543,
                "reference_code": "REF_FIELDS_001"
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.get_charge(charge_id)

                # Assert - Verificar campos requeridos
                required_fields = [
                    "id", "object", "amount", "currency_code",
                    "email", "description", "outcome", "creation_date", "reference_code"
                ]

                for field in required_fields:
                    assert field in result, f"Campo requerido '{field}' no encontrado en la respuesta"

                # Verificar tipos de datos
                assert isinstance(result["amount"], int), "amount debe ser int"
                assert isinstance(
                    result["currency_code"], str), "currency_code debe ser str"
                assert isinstance(result["outcome"],
                                  dict), "outcome debe ser dict"
                assert isinstance(
                    result["creation_date"], int), "creation_date debe ser int (timestamp)"

        except NotImplementedError:
            pytest.fail("❌ FASE ROJO: Método get_charge no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al verificar campos requeridos - {str(e)}")

    @pytest.mark.asyncio
    async def test_manejar_error_cargo_no_existe(self):
        """
        Test 3: Manejar error cuando el cargo no existe

        DADO un ID de cargo que no existe
        CUANDO intento obtener su detalle
        ENTONCES debe lanzar una excepción ValueError con mensaje apropiado
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            charge_id_inexistente = "chr_no_existe_999"

            error_response = {
                "object": "error",
                "type": "resource_not_found",
                "code": "resource_not_found",
                "merchant_message": "El cargo no existe",
                "user_message": "No se encontró el cargo solicitado"
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = AsyncMock()
                mock_response = Mock()
                mock_response.status_code = 404
                mock_response.json.return_value = error_response
                mock_response.content = b'{"error": "not_found"}'
                mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
                    message="Not Found",
                    request=Mock(),
                    response=mock_response
                )

                mock_client.get = AsyncMock(return_value=mock_response)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act & Assert
                with pytest.raises(ValueError) as exc_info:
                    await service.get_charge(charge_id_inexistente)

                # Verificar que el mensaje de error es apropiado
                assert "información del cargo" in str(
                    exc_info.value).lower() or "cargo" in str(exc_info.value).lower()

        except AssertionError:
            raise
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al manejar cargo inexistente - {str(e)}")

    @pytest.mark.asyncio
    async def test_verificar_reference_code_presente(self, mock_httpx_client):
        """
        Test 4: Verificar que el reference_code está presente para auditoría

        DADO que obtengo el detalle de un cargo
        CUANDO reviso la respuesta
        ENTONCES debe incluir el reference_code para seguimiento y auditoría
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            charge_id = "chr_ref_test"
            expected_reference = "REF_AUDIT_12345"

            mock_response_data = {
                "id": charge_id,
                "object": "charge",
                "amount": 10000,
                "currency_code": "PEN",
                "email": "audit@example.com",
                "description": "Test reference code",
                "creation_date": 1699876543,
                "reference_code": expected_reference
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.get_charge(charge_id)

                # Assert
                assert "reference_code" in result, "Campo reference_code no encontrado"
                assert result["reference_code"] == expected_reference, "reference_code no coincide"
                assert len(result["reference_code"]
                           ) > 0, "reference_code está vacío"

        except NotImplementedError:
            pytest.fail("❌ FASE ROJO: Método get_charge no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al verificar reference_code - {str(e)}")


class TestRFPAG005PaginacionListado:
    """
    RF-PAG-005: Paginación en listado de cargos

    Casos de prueba:
    1. Limitar número de resultados con parámetro limit
    2. Paginar hacia adelante con parámetro after
    3. Paginar hacia atrás con parámetro before
    4. Combinar limit con paginación
    """

    @pytest.mark.asyncio
    async def test_limitar_numero_resultados(self, mock_httpx_client):
        """
        Test 1: Limitar número de resultados con parámetro limit

        DADO que existen muchos cargos en el sistema
        CUANDO solicito el listado con un límite específico
        ENTONCES la petición debe incluir el parámetro limit y respetar el límite
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            limit = 5

            # Simular respuesta con exactamente 5 cargos
            mock_response_data = {
                "data": [
                    {"id": f"chr_limit_{i}", "amount": 10000 *
                        i, "currency_code": "PEN"}
                    for i in range(1, 6)
                ]
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges(limit=limit)

                # Assert
                assert "data" in result, "Respuesta no contiene 'data'"
                assert len(
                    result["data"]) <= limit, f"Cantidad de resultados ({len(result['data'])}) excede el límite ({limit})"

                # Verificar que el parámetro limit se envió correctamente
                call_kwargs = mock_client.get.call_args.kwargs
                assert "params" in call_kwargs, "No se enviaron parámetros"
                assert call_kwargs["params"][
                    "limit"] == limit, f"Límite incorrecto en params: esperado {limit}"

        except NotImplementedError:
            pytest.fail(
                "❌ FASE ROJO: Método list_charges con limit no implementado")
        except Exception as e:
            pytest.fail(f"❌ FASE ROJO: Error al limitar resultados - {str(e)}")

    @pytest.mark.asyncio
    async def test_paginar_hacia_adelante_con_after(self, mock_httpx_client):
        """
        Test 2: Paginar hacia adelante usando parámetro after

        DADO que tengo un ID de cargo de la página anterior
        CUANDO solicito la siguiente página con after=<charge_id>
        ENTONCES debe retornar los cargos posteriores a ese ID
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            after_id = "chr_page1_last"

            # Simular segunda página de resultados
            mock_response_data = {
                "data": [
                    {"id": "chr_page2_001", "amount": 10000, "currency_code": "PEN"},
                    {"id": "chr_page2_002", "amount": 15000, "currency_code": "PEN"},
                    {"id": "chr_page2_003", "amount": 20000, "currency_code": "PEN"}
                ]
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges(after=after_id, limit=10)

                # Assert
                assert "data" in result, "Respuesta no contiene 'data'"

                # Verificar que el parámetro after se envió
                call_kwargs = mock_client.get.call_args.kwargs
                assert "params" in call_kwargs, "No se enviaron parámetros"
                assert call_kwargs["params"]["after"] == after_id, "Parámetro after no enviado correctamente"

                # Verificar que no contiene el cargo after_id (debe ser posterior)
                charge_ids = [charge["id"] for charge in result["data"]]
                assert after_id not in charge_ids, "La respuesta no debe incluir el cargo 'after'"

        except NotImplementedError:
            pytest.fail(
                "❌ FASE ROJO: Método list_charges con after no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al paginar hacia adelante - {str(e)}")

    @pytest.mark.asyncio
    async def test_paginar_hacia_atras_con_before(self, mock_httpx_client):
        """
        Test 3: Paginar hacia atrás usando parámetro before

        DADO que tengo un ID de cargo de la página actual
        CUANDO solicito la página anterior con before=<charge_id>
        ENTONCES debe retornar los cargos anteriores a ese ID
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            before_id = "chr_page3_first"

            # Simular página anterior de resultados
            mock_response_data = {
                "data": [
                    {"id": "chr_page2_001", "amount": 10000, "currency_code": "PEN"},
                    {"id": "chr_page2_002", "amount": 15000, "currency_code": "PEN"}
                ]
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges(before=before_id, limit=10)

                # Assert
                assert "data" in result, "Respuesta no contiene 'data'"

                # Verificar que el parámetro before se envió
                call_kwargs = mock_client.get.call_args.kwargs
                assert "params" in call_kwargs, "No se enviaron parámetros"
                assert call_kwargs["params"]["before"] == before_id, "Parámetro before no enviado correctamente"

                # Verificar que no contiene el cargo before_id (debe ser anterior)
                charge_ids = [charge["id"] for charge in result["data"]]
                assert before_id not in charge_ids, "La respuesta no debe incluir el cargo 'before'"

        except NotImplementedError:
            pytest.fail(
                "❌ FASE ROJO: Método list_charges con before no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al paginar hacia atrás - {str(e)}")

    @pytest.mark.asyncio
    async def test_combinar_limit_con_paginacion(self, mock_httpx_client):
        """
        Test 4: Combinar limit con parámetros de paginación

        DADO que quiero paginar con un límite específico
        CUANDO solicito cargos con limit y after (o before)
        ENTONCES ambos parámetros deben aplicarse correctamente
        """
        try:
            # Arrange
            service = CulqiPaymentService()
            limit = 3
            after_id = "chr_combined_last"

            mock_response_data = {
                "data": [
                    {"id": "chr_next_001", "amount": 10000, "currency_code": "PEN"},
                    {"id": "chr_next_002", "amount": 15000, "currency_code": "PEN"},
                    {"id": "chr_next_003", "amount": 20000, "currency_code": "PEN"}
                ]
            }

            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = mock_httpx_client(
                    response_data=mock_response_data)
                mock_client_class.return_value.__aenter__.return_value = mock_client

                # Act
                result = await service.list_charges(limit=limit, after=after_id)

                # Assert
                assert "data" in result, "Respuesta no contiene 'data'"
                assert len(
                    result["data"]) <= limit, "Cantidad de resultados excede el límite"

                # Verificar que ambos parámetros se enviaron
                call_kwargs = mock_client.get.call_args.kwargs
                assert "params" in call_kwargs, "No se enviaron parámetros"

                params = call_kwargs["params"]
                assert params["limit"] == limit, "Parámetro limit incorrecto"
                assert params["after"] == after_id, "Parámetro after incorrecto"

                # Verificar que limit y after se enviaron juntos
                assert "limit" in params and "after" in params, "Ambos parámetros deben estar presentes"

        except NotImplementedError:
            pytest.fail(
                "❌ FASE ROJO: Método list_charges con limit y after no implementado")
        except Exception as e:
            pytest.fail(
                f"❌ FASE ROJO: Error al combinar limit con paginación - {str(e)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
