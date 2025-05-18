import pytest
import os
import sys
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock
from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to allow importing the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the functions to test
from auth import (
    get_password_hash, 
    verify_password,
    get_user_by_username,
    get_user_by_email,
    create_user,
    authenticate_user,
    create_access_token,
    verify_token,
    SECRET_KEY,
    ALGORITHM
)
from models import User
from schemas import UserCreate


@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return MagicMock(spec=Session)


@pytest.fixture
def sample_user():
    """Sample user fixture"""
    return User(
        id=1, 
        username="testuser", 
        email="test@example.com", 
        hashed_password=get_password_hash("password123")
    )


class TestPasswordFunctions:
    def test_password_hashing(self):
        """Test that password hashing works and produces different hashes"""
        password = "mysecretpassword"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different even for the same password
        assert hash1 != hash2
        # Hashes should be strings of significant length
        assert isinstance(hash1, str)
        assert len(hash1) > 20
    
    def test_password_verification(self):
        """Test that password verification works correctly"""
        password = "mysecretpassword"
        hashed = get_password_hash(password)
        
        # Correct password should verify
        assert verify_password(password, hashed) is True
        
        # Incorrect password should not verify
        assert verify_password("wrongpassword", hashed) is False


class TestUserOperations:
    def test_get_user_by_username(self, mock_db, sample_user):
        """Test getting a user by username"""
        # Set up the mock
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock(return_value=sample_user)
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = mock_first.return_value
        
        # Call the function
        result = get_user_by_username(mock_db, "testuser")
        
        # Assert the result and that the mock was called correctly
        assert result == sample_user
        mock_db.query.assert_called_once_with(User)
        mock_query.filter.assert_called_once()
    
    def test_get_user_by_email(self, mock_db, sample_user):
        """Test getting a user by email"""
        # Set up the mock
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_first = MagicMock(return_value=sample_user)
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = mock_first.return_value
        
        # Call the function
        result = get_user_by_email(mock_db, "test@example.com")
        
        # Assert the result and that the mock was called correctly
        assert result == sample_user
        mock_db.query.assert_called_once_with(User)
        mock_query.filter.assert_called_once()
    
    def test_create_user(self, mock_db):
        """Test creating a new user"""
        # Create a user schema
        user_create = UserCreate(
            username="newuser",
            email="newuser@example.com",
            password="securepassword"
        )
        
        # Set up the expected return value
        expected_user = User(
            id=1,
            username="newuser",
            email="newuser@example.com",
            hashed_password="hashedpassword"  # This would be the actual hash in reality
        )
        
        # Set up the mock
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Mock the hash function to return a predictable value
        with patch('auth.get_password_hash', return_value="hashedpassword"):
            result = create_user(mock_db, user_create)
            
            # Assert the db operations were called
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()


class TestAuthentication:
    def test_authenticate_user_success(self, mock_db, sample_user):
        """Test successful user authentication"""
        # Set up the mock to return our sample user
        with patch('auth.get_user_by_username', return_value=sample_user):
            with patch('auth.pwd_context.verify', return_value=True):
                result = authenticate_user(mock_db, "testuser", "password123")
                assert result == sample_user
    
    def test_authenticate_user_wrong_password(self, mock_db, sample_user):
        """Test authentication with wrong password"""
        # Set up the mock to return our sample user
        with patch('auth.get_user_by_username', return_value=sample_user):
            with patch('auth.pwd_context.verify', return_value=False):
                result = authenticate_user(mock_db, "testuser", "wrongpassword")
                assert result is False
    
    def test_authenticate_user_nonexistent(self, mock_db):
        """Test authentication with nonexistent user"""
        # Set up the mock to return None (user not found)
        with patch('auth.get_user_by_username', return_value=None):
            result = authenticate_user(mock_db, "nonexistent", "password123")
            assert result is False


class TestTokens:
    def test_create_access_token(self):
        """Test creating an access token"""
        # Data to encode
        data = {"sub": "testuser"}
        
        # Create token with explicit expiry
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)
        
        # Decode and verify the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload.get("sub") == "testuser"
        
        # Check expiry time is set
        assert "exp" in payload
        
        # Create token with default expiry
        token = create_access_token(data)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload
    
    def test_verify_token_success(self):
        """Test successful token verification"""
        # Create a valid token
        token_data = {"sub": "testuser"}
        token = create_access_token(token_data, timedelta(minutes=30))
        
        # Mock the Depends function
        with patch('fastapi.Depends', return_value=token):
            # Verify the token
            payload = verify_token(token)
            assert payload.get("sub") == "testuser"
    
    def test_verify_token_expired(self):
        """Test verification of an expired token"""
        # Create an expired token
        token_data = {"sub": "testuser"}
        expired_delta = timedelta(minutes=-1)  # Token expired 1 minute ago
        
        # We need to manually create the token since create_access_token doesn't support creating expired tokens
        expire = datetime.now(timezone.utc) + expired_delta
        token_data.update({"exp": expire})
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        
        # Mock the Depends function
        with patch('fastapi.Depends', return_value=token):
            # Verify the token should raise an exception
            with pytest.raises(HTTPException) as exc_info:
                verify_token(token)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Could not validate credentials" in exc_info.value.detail
    
    def test_verify_token_invalid(self):
        """Test verification of an invalid token"""
        # Create an invalid token
        invalid_token = "invalid_token_string"
        
        # Mock the Depends function
        with patch('fastapi.Depends', return_value=invalid_token):
            # Verify the token should raise an exception
            with pytest.raises(HTTPException) as exc_info:
                verify_token(invalid_token)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Could not validate credentials" in exc_info.value.detail


@pytest.mark.parametrize(
    "env_vars,expected",
    [
        ({"SECRET_KEY": "iloveiloveiloveilove", "ALGORITHM": "HS256", "ACCESS_TOKEN_EXPIRE_MINUTES": "1440"}, 
         {"secret_key": "iloveiloveiloveilove", "algorithm": "HS256", "expire_minutes": "1440"}),
        ({"SECRET_KEY": "", "ALGORITHM": "", "ACCESS_TOKEN_EXPIRE_MINUTES": ""}, 
         {"secret_key": None, "algorithm": None, "expire_minutes": None}),
    ]
)
def test_environment_variables(env_vars, expected):
    """Test that environment variables are correctly loaded"""
    with patch.dict('os.environ', env_vars):
        with patch('auth.load_dotenv'):
            # We need to import here to make the patched environment variables take effect
            from auth import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
            
            assert SECRET_KEY == expected["secret_key"]
            assert ALGORITHM == expected["algorithm"]
            assert ACCESS_TOKEN_EXPIRE_MINUTES == expected["expire_minutes"]