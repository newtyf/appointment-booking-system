# Backend Tests

This directory contains pytest tests for the backend services with mocked dependencies.

## Setup

Install the required dependencies:

```bash
cd backend
pip install -r requirements.txt
```

## Running Tests

Run all tests:
```bash
pytest tests/ -v
```

Run tests for a specific file:
```bash
pytest tests/test_auth_service.py -v
pytest tests/test_user_service.py -v
```

Run tests with coverage:
```bash
pytest tests/ --cov=app --cov-report=html
```

Run only async tests:
```bash
pytest tests/ -m asyncio
```

## Test Structure

- `conftest.py` - Shared fixtures and pytest configuration
- `test_auth_service.py` - Tests for authentication service
- `test_user_service.py` - Tests for user management service

## Key Features

- **Mocked Dependencies**: All tests use `unittest.mock` to mock database and external dependencies
- **No Database Required**: Tests don't need a real database connection
- **Async Support**: Full support for async/await patterns with `pytest-asyncio`
- **Comprehensive Coverage**: Tests cover success cases, error cases, and edge cases

## Writing New Tests

When adding new tests:

1. Create test files with the `test_*.py` naming convention
2. Use `@pytest.mark.asyncio` for async test functions
3. Mock external dependencies (database, APIs, etc.)
4. Follow the Arrange-Act-Assert pattern
5. Add descriptive docstrings to test functions

Example:
```python
@pytest.mark.asyncio
async def test_my_feature(mock_db):
    # Arrange
    # ... setup test data and mocks

    # Act
    result = await my_function()

    # Assert
    assert result == expected_value
```
