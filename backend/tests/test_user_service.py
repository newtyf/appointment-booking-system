"""
Tests for UserService
"""
import pytest
from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch, MagicMock

from app.services.user_service import UserService
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserInDB


@pytest.fixture
def mock_db():
    """Mock AsyncSession database"""
    db = AsyncMock()
    db.add = Mock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.delete = AsyncMock()
    return db


@pytest.fixture
def user_service(mock_db):
    """Create UserService instance with mocked database"""
    return UserService(db=mock_db)


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
        created_at=datetime(2024, 1, 1, 12, 0, 0),
        updated_at=datetime(2024, 1, 1, 12, 0, 0)
    )
    return user


@pytest.fixture
def sample_user_create():
    """Sample UserCreate schema"""
    return UserCreate(
        name="New User",
        email="newuser@example.com",
        phone="9876543210",
        password="securepassword123",
        role="client"
    )


@pytest.fixture
def sample_user_update():
    """Sample UserUpdate schema"""
    return UserUpdate(
        name="Updated Name",
        phone="5555555555"
    )


@pytest.mark.asyncio
class TestUserServiceGet:
    """Tests for user retrieval methods"""

    async def test_get_user_by_email_found(self, user_service, mock_db, sample_user):
        """Test getting user by email when user exists"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = sample_user
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.get_user_by_email("test@example.com")

        # Assert
        assert result == sample_user
        mock_db.execute.assert_called_once()
        mock_scalars.first.assert_called_once()

    async def test_get_user_by_email_not_found(self, user_service, mock_db):
        """Test getting user by email when user doesn't exist"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = None
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.get_user_by_email("nonexistent@example.com")

        # Assert
        assert result is None
        mock_db.execute.assert_called_once()

    async def test_get_user_found(self, user_service, mock_db, sample_user):
        """Test getting user by ID when user exists"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = sample_user
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.get_user(1)

        # Assert
        assert result == sample_user
        mock_db.execute.assert_called_once()

    async def test_get_user_not_found(self, user_service, mock_db):
        """Test getting user by ID when user doesn't exist"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = None
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.get_user(999)

        # Assert
        assert result is None

    async def test_get_all_users(self, user_service, mock_db, sample_user):
        """Test getting all users"""
        # Arrange
        user2 = User(
            id=2,
            name="User Two",
            email="user2@example.com",
            phone="1111111111",
            hashed_password="hashed",
            role="admin",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.all.return_value = [sample_user, user2]
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.get_all_users()

        # Assert
        assert len(result) == 2
        assert sample_user in result
        assert user2 in result
        mock_db.execute.assert_called_once()

    async def test_get_all_users_empty(self, user_service, mock_db):
        """Test getting all users when no users exist"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.all.return_value = []
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.get_all_users()

        # Assert
        assert result == []


@pytest.mark.asyncio
class TestUserServiceCreate:
    """Tests for user creation"""

    async def test_create_user_success(self, user_service, mock_db, sample_user_create):
        """Test creating a new user"""
        # Arrange
        with patch('app.services.user_service.get_password_hash') as mock_hash:
            mock_hash.return_value = "hashed_password_123"

            # Act
            result = await user_service.create_user(sample_user_create)

            # Assert
            assert result is not None
            assert result.email == sample_user_create.email
            assert result.name == sample_user_create.name
            assert result.phone == sample_user_create.phone
            assert result.role == sample_user_create.role
            assert result.hashed_password == "hashed_password_123"

            mock_hash.assert_called_once_with(sample_user_create.password)
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    async def test_create_user_default_role(self, user_service, mock_db):
        """Test creating user with default role"""
        # Arrange
        user_create = UserCreate(
            name="Default Role User",
            email="default@example.com",
            phone="0000000000",
            password="password"
            # role not specified
        )

        with patch('app.services.user_service.get_password_hash') as mock_hash:
            mock_hash.return_value = "hashed"

            # Act
            result = await user_service.create_user(user_create)

            # Assert
            assert result is not None
            # role should be None in create, but defaults to 'client' in the model
            mock_db.add.assert_called_once()


@pytest.mark.asyncio
class TestUserServiceUpdate:
    """Tests for user update"""

    async def test_update_user_success(
        self, user_service, mock_db, sample_user, sample_user_update
    ):
        """Test updating user successfully"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = sample_user
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.update_user(1, sample_user_update)

        # Assert
        assert result is not None
        assert result.name == "Updated Name"
        assert result.phone == "5555555555"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    async def test_update_user_not_found(
        self, user_service, mock_db, sample_user_update
    ):
        """Test updating non-existent user"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = None
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.update_user(999, sample_user_update)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()

    async def test_update_user_password(self, user_service, mock_db, sample_user):
        """Test updating user password"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = sample_user
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        user_update = UserUpdate(password="new_secure_password")

        with patch('app.services.user_service.get_password_hash') as mock_hash:
            mock_hash.return_value = "new_hashed_password"

            # Act
            result = await user_service.update_user(1, user_update)

            # Assert
            assert result is not None
            assert result.hashed_password == "new_hashed_password"
            mock_hash.assert_called_once_with("new_secure_password")
            mock_db.commit.assert_called_once()

    async def test_update_user_partial_update(self, user_service, mock_db, sample_user):
        """Test partial update (only some fields)"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = sample_user
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Only update name
        user_update = UserUpdate(name="Only Name Changed")

        # Act
        result = await user_service.update_user(1, user_update)

        # Assert
        assert result is not None
        assert result.name == "Only Name Changed"
        # Other fields should remain unchanged
        assert result.email == sample_user.email
        assert result.phone == sample_user.phone


@pytest.mark.asyncio
class TestUserServiceDelete:
    """Tests for user deletion"""

    async def test_delete_user_success(self, user_service, mock_db, sample_user):
        """Test deleting user successfully"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = sample_user
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.delete_user(1)

        # Assert
        assert result == sample_user
        mock_db.delete.assert_called_once_with(sample_user)
        mock_db.commit.assert_called_once()

    async def test_delete_user_not_found(self, user_service, mock_db):
        """Test deleting non-existent user"""
        # Arrange
        mock_result = AsyncMock()
        mock_scalars = Mock()
        mock_scalars.first.return_value = None
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Act
        result = await user_service.delete_user(999)

        # Assert
        assert result is None
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()


class TestUserServiceSchema:
    """Tests for schema conversion"""

    def test_user_to_user_in_db_schema(self, user_service, sample_user):
        """Test converting User model to UserInDB schema"""
        # Act
        result = user_service.user_to_user_in_db_schema(sample_user)

        # Assert
        assert isinstance(result, UserInDB)
        assert result.id == sample_user.id
        assert result.name == sample_user.name
        assert result.email == sample_user.email
        assert result.phone == sample_user.phone
        assert result.role == sample_user.role
        assert result.created_at == sample_user.created_at
        assert result.updated_at == sample_user.updated_at
