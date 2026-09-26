"""
Tests for POST /auth/register, POST /auth/login, GET /auth/me.

Status codes asserted here (201 register, 409 duplicate, 200 login,
401 wrong password / no token) are taken from what services/auth.py and
security.py were shown to do:
- create_user + duplicate email -> HTTPException 409 (seen directly in
  the ruff CI logs: status.HTTP_409_CONFLICT for an existing email)
- authenticate_user with wrong password -> HTTPException 401
- routes/auth.py's register endpoint decorator:
  status_code=status.HTTP_201_CREATED
"""


def test_register_student_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newstudent@test.campusconnect-test.dev",
            "password": "SecurePass123!",
            "full_name": "New Student",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["role"] == "student"
    assert body["full_name"] == "New Student"


def test_register_duplicate_email_fails(client, student_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": student_user.email,
            "password": "AnotherPass123!",
            "full_name": "Duplicate Attempt",
        },
    )
    assert response.status_code == 409


def test_login_valid_credentials(client, student_user, test_password):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": student_user.email, "password": test_password},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["role"] == "student"
    assert body["user_id"] == str(student_user.id)


def test_login_wrong_password(client, student_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": student_user.email, "password": "DefinitelyWrongPassword!"},
    )
    assert response.status_code == 401


def test_me_endpoint_with_valid_token(client, student_user, student_headers):
    response = client.get("/api/v1/auth/me", headers=student_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == student_user.email
    assert body["role"] == "student"


def test_me_endpoint_without_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
