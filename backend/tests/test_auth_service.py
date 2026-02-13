"""
Tests for AuthService
"""
import pytest
from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch, MagicMock

from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import Login, Token


@pytest.fixture
def mock_db():
    """Mock AsyncSession database"""
    db = AsyncMock()
    db.add = Mock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.fixture
def mock_user_service():
    """Mock UserService"""
    return Mock(spec=UserService)


@pytest.fixture
def auth_service(mock_db, mock_user_service):
    """Create AuthService instance with mocked dependencies"""
    return AuthService(db=mock_db, user_service=mock_user_service)


@pytest.fixture
def sample_user():
    """Sample user for testing"""
    user = User(
        id=1,
        name="Test User",
        email="test@example.com",
        phone="1234567890",
        hashed_password="$2b$12$hashed_password_here",
        role="client",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    return user


@pytest.fixture
def sample_user_create():
    """Sample UserCreate schema"""
    return UserCreate(
        name="New User",
        email="newuser@example.com",
        phone="9876543210",
        password="securepassword123"
    )


@pytest.mark.asyncio
class TestAuthServiceRegister:
    """Tests for register_user method"""

    async def test_register_user_success(
        self, auth_service, mock_db, mock_user_service, sample_user_create
    ):
        """Test successful user registration"""
        # Arrange
        mock_user_service.get_user_by_email = AsyncMock(return_value=None)

        with patch('app.services.auth_service.get_password_hash') as mock_hash:
            mock_hash.return_value = "hashed_password"

            # Act
            result = await auth_service.register_user(sample_user_create)

            # Assert
            assert result is not None
            assert result.email == sample_user_create.email
            assert result.name == sample_user_create.name
            assert result.phone == sample_user_create.phone
            assert result.hashed_password == "hashed_password"

            mock_user_service.get_user_by_email.assert_called_once_with(sample_user_create.email)
            mock_hash.assert_called_once_with(sample_user_create.password)
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    async def test_register_user_duplicate_email(
        self, auth_service, mock_user_service, sample_user_create, sample_user
    ):
        """Test registration with existing email returns None"""
        # Arrange
        mock_user_service.get_user_by_email = AsyncMock(return_value=sample_user)

        # Act
        result = await auth_service.register_user(sample_user_create)

        # Assert
        assert result is None
        mock_user_service.get_user_by_email.assert_called_once_with(sample_user_create.email)


@pytest.mark.asyncio
class TestAuthServiceAuthenticate:
    """Tests for authenticate_user method"""

    async def test_authenticate_user_success(
        self, auth_service, mock_user_service, sample_user
    ):
        """Test successful authentication"""
        # Arrange
        login_data = Login(email="test@example.com", password="correct_password")
        mock_user_service.get_user_by_email = AsyncMock(return_value=sample_user)

        with patch('app.services.auth_service.verify_password') as mock_verify:
            mock_verify.return_value = True

            # Act
            result = await auth_service.authenticate_user(login_data)

            # Assert
            assert result == sample_user
            mock_user_service.get_user_by_email.assert_called_once_with(login_data.email)
            mock_verify.assert_called_once_with(login_data.password, sample_user.hashed_password)

    async def test_authenticate_user_wrong_password(
        self, auth_service, mock_user_service, sample_user
    ):
        """Test authentication with wrong password"""
        # Arrange
        login_data = Login(email="test@example.com", password="wrong_password")
        mock_user_service.get_user_by_email = AsyncMock(return_value=sample_user)

        with patch('app.services.auth_service.verify_password') as mock_verify:
            mock_verify.return_value = False

            # Act
            result = await auth_service.authenticate_user(login_data)

            # Assert
            assert result is None
            mock_verify.assert_called_once()

    async def test_authenticate_user_not_found(
        self, auth_service, mock_user_service
    ):
        """Test authentication with non-existent user"""
        # Arrange
        login_data = Login(email="nonexistent@example.com", password="password")
        mock_user_service.get_user_by_email = AsyncMock(return_value=None)

        # Act
        result = await auth_service.authenticate_user(login_data)

        # Assert
        assert result is None
        mock_user_service.get_user_by_email.assert_called_once()


class TestAuthServiceToken:
    """Tests for token creation and validation"""

    def test_create_token_for_user(self, auth_service, sample_user):
        """Test creating access token for user"""
        # Arrange
        with patch('app.services.auth_service.create_access_token') as mock_create_token:
            mock_create_token.return_value = "mock_jwt_token"

            with patch('app.services.auth_service.settings') as mock_settings:
                mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 30

                # Act
                result = auth_service.create_token_for_user(sample_user)

                # Assert
                assert isinstance(result, Token)
                assert result.access_token == "mock_jwt_token"
                assert result.token_type == "bearer"
                mock_create_token.assert_called_once()
                call_args = mock_create_token.call_args
                assert call_args[1]["data"]["sub"] == sample_user.email

    @pytest.mark.asyncio
    async def test_get_user_from_token_success(
        self, auth_service, mock_user_service, sample_user
    ):
        """Test getting user from valid token"""
        # Arrange
        token = "valid_jwt_token"
        mock_payload = {"sub": "test@example.com"}
        mock_user_service.get_user_by_email = AsyncMock(return_value=sample_user)

        with patch('app.services.auth_service.decode_access_token') as mock_decode:
            mock_decode.return_value = mock_payload

            # Act
            result = await auth_service.get_user_from_token(token)

            # Assert
            assert result == sample_user
            mock_decode.assert_called_once_with(token)
            mock_user_service.get_user_by_email.assert_called_once_with("test@example.com")

    @pytest.mark.asyncio
    async def test_get_user_from_token_invalid_token(
        self, auth_service
    ):
        """Test getting user from invalid token"""
        # Arrange
        token = "invalid_jwt_token"

        with patch('app.services.auth_service.decode_access_token') as mock_decode:
            mock_decode.return_value = None

            # Act
            result = await auth_service.get_user_from_token(token)

            # Assert
            assert result is None
            mock_decode.assert_called_once_with(token)

    @pytest.mark.asyncio
    async def test_get_user_from_token_missing_subject(
        self, auth_service
    ):
        """Test getting user from token with missing subject"""
        # Arrange
        token = "token_without_subject"
        mock_payload = {"exp": 1234567890}  # No 'sub' field

        with patch('app.services.auth_service.decode_access_token') as mock_decode:
            mock_decode.return_value = mock_payload

            # Act
            result = await auth_service.get_user_from_token(token)

            # Assert
            assert result is None

    @pytest.mark.asyncio
    async def test_get_user_from_token_user_not_found(
        self, auth_service, mock_user_service
    ):
        """Test getting user from token when user doesn't exist"""
        # Arrange
        token = "valid_token_deleted_user"
        mock_payload = {"sub": "deleted@example.com"}
        mock_user_service.get_user_by_email = AsyncMock(return_value=None)

        with patch('app.services.auth_service.decode_access_token') as mock_decode:
            mock_decode.return_value = mock_payload

            # Act
            result = await auth_service.get_user_from_token(token)

            # Assert
            assert result is None
            mock_user_service.get_user_by_email.assert_called_once_with("deleted@example.com")
