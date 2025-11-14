"""
Configuración global para pytest
Fixtures compartidos para todos los tests
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch
import httpx


@pytest.fixture
def mock_httpx_response():
    """
    Fixture para mockear respuestas HTTP de httpx
    """
    def _create_response(
        status_code: int = 200,
        json_data: dict = None,
        raise_error: bool = False
    ):
        response = Mock(spec=httpx.Response)
        response.status_code = status_code
        response.json.return_value = json_data or {}
        response.content = b'{"error": "test"}'

        if raise_error:
            response.raise_for_status.side_effect = httpx.HTTPStatusError(
                message="Error",
                request=Mock(),
                response=response
            )
        else:
            response.raise_for_status.return_value = None

        return response

    return _create_response


@pytest.fixture
def mock_httpx_client(mock_httpx_response):
    """
    Fixture para mockear el cliente httpx.AsyncClient
    """
    def _create_client(response_data: dict = None, status_code: int = 200, raise_error: bool = False):
        client = AsyncMock()
        response = mock_httpx_response(
            status_code=status_code,
            json_data=response_data,
            raise_error=raise_error
        )

        client.post = AsyncMock(return_value=response)
        client.get = AsyncMock(return_value=response)

        return client

    return _create_client
