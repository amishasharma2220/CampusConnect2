"""
Grant a role to an existing account from the command line.

This is the only way to create a university admin (the API refuses to grant
that role). The account must already exist, so sign up in the app first.

Usage (from backend/, with the venv active):
    python -m app.scripts.make_admin someone@jaipur.manipal.edu
    python -m app.scripts.make_admin someone@muj.manipal.edu --role club_admin
    python -m app.scripts.make_admin someone@muj.manipal.edu --role student

It uses DATABASE_URL, so to change production run it with the Neon URL:
    DATABASE_URL='postgresql://...neon...' python -m app.scripts.make_admin you@...
"""

import argparse
import sys

import app.models  # noqa: F401  (register all models)
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Set the role of an existing CampusConnect account.")
    parser.add_argument("email")
    parser.add_argument("--role", choices=[r.value for r in UserRole], default=UserRole.university_admin.value)
    args = parser.parse_args(argv)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == args.email.strip().lower()).first()
        if not user:
            print(f"No account with email {args.email}. Sign up in the app first.", file=sys.stderr)
            return 1
        old = user.role.value
        user.role = UserRole(args.role)
        db.commit()
        print(f"{user.email}: {old} -> {user.role.value}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
