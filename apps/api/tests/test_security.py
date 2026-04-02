"""
Unit tests for security stub (Mock JWT).
Bảo vệ AC-5: create_access_token + decode_token hoạt động đúng format.
Không test real JWT signature — đó là scope Phase 2+.
"""
import pytest

from app.core.security import create_access_token, decode_token


def test_create_access_token_returns_non_empty_string():
    """create_access_token phải trả về non-empty string."""
    token = create_access_token({"sub": "test@example.com"})
    assert isinstance(token, str)
    assert len(token) > 0


def test_create_access_token_different_data_returns_same_mock():
    """Phase 5 stub: tất cả input đều trả về cùng mock token."""
    token1 = create_access_token({"sub": "user1@example.com"})
    token2 = create_access_token({"sub": "user2@example.com", "role": "admin"})
    # Cả hai đều là valid non-empty strings (mock không phân biệt input)
    assert isinstance(token1, str) and len(token1) > 0
    assert isinstance(token2, str) and len(token2) > 0


def test_decode_token_valid_returns_dict_with_sub():
    """decode_token với token hợp lệ → trả về dict có key 'sub'."""
    token = create_access_token({"sub": "test@example.com"})
    payload = decode_token(token)
    assert isinstance(payload, dict)
    assert "sub" in payload


def test_decode_token_empty_string_raises_value_error():
    """decode_token('') → ValueError (không chấp nhận empty token)."""
    with pytest.raises(ValueError):
        decode_token("")


def test_decode_token_any_non_empty_string_accepted():
    """Phase 5 stub: bất kỳ non-empty string đều được chấp nhận (chỉ check format)."""
    payload = decode_token("any.non.empty.token")
    assert isinstance(payload, dict)
    assert "sub" in payload
