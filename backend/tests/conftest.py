"""
Shared pytest fixtures for the backend test suite.

Testing strategy note: this project's models use Postgres-specific column
types (UUID, ARRAY, native ENUM), which SQLite cannot compile DDL for.
So instead of SQLite in-memory, tests run against a real Postgres instance:
- Locally: your existing `docker compose up -d db` service (localhost:5432).
- In CI: a Postgres service container defined in backend-ci.yml.

Each test runs inside an outer transaction + a SAVEPOINT, both rolled back
at the end. Application code (the routes) calls db.commit() freely, exactly
as it does in production — that only closes the SAVEPOINT, which this
fixture immediately reopens, so nothing a test does is ever actually
persisted. This means tests are safe to run against your local dev
database without polluting or depending on its seeded data.
"""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401 - registers every model on Base.metadata
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app as fastapi_app
from app.models.user import User, UserRole

TEST_DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://campusconnect:campusconnect_local_pw@localhost:5432/campusconnect",
)

TEST_PASSWORD = "TestPass123!"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    # create_all uses checkfirst by default, so this is safe to run against
    # a DB that already has these tables (e.g. your seeded local dev DB) —
    # it won't touch existing tables or rows.
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def db():
    connection = engine.connect()
    outer_transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    try:
        yield session
    finally:
        session.close()
        outer_transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db):
    def _override_get_db():
        yield db

    fastapi_app.dependency_overrides[get_db] = _override_get_db
    with TestClient(fastapi_app) as c:
        yield c
    fastapi_app.dependency_overrides.clear()


def _make_user(db, *, email, role, full_name="Test User", password=TEST_PASSWORD):
    user = User(
        email=email,
        password_hash=hash_password(password),
        role=role,
        is_verified=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _auth_headers(user):
    token = create_access_token(subject=user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def test_password():
    return TEST_PASSWORD


@pytest.fixture()
def student_user(db, test_password):
    return _make_user(
        db, email="student@test.campusconnect-test.dev", role=UserRole.student, password=test_password
    )


@pytest.fixture()
def club_admin_user(db, test_password):
    return _make_user(
        db, email="clubadmin@test.campusconnect-test.dev", role=UserRole.club_admin, password=test_password
    )


@pytest.fixture()
def university_admin_user(db, test_password):
    return _make_user(
        db,
        email="admin@test.campusconnect-test.dev",
        role=UserRole.university_admin,
        password=test_password,
    )


@pytest.fixture()
def student_headers(student_user):
    return _auth_headers(student_user)


@pytest.fixture()
def club_admin_headers(club_admin_user):
    return _auth_headers(club_admin_user)


@pytest.fixture()
def admin_headers(university_admin_user):
    return _auth_headers(university_admin_user)
