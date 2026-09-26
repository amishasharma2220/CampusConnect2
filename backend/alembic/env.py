"""
Alembic environment for CampusConnect.

- DB URL comes from app.core.config.settings.DATABASE_URL (never hardcoded),
  so the same setup works locally, in Docker, in CI and on Render/Neon.
- target_metadata is Base.metadata with every model imported, so
  `alembic revision --autogenerate` sees all 22 tables.

The real schema was created from database/schema.sql, which is richer than
the SQLAlchemy models (FKs, CITEXT, TEXT columns, hand-named indexes). Three
filters keep autogenerate from proposing harmful or pointless changes:

1. include_object: skip objects that exist ONLY in the database (FKs,
   indexes, constraints the models don't declare) — otherwise autogenerate
   would propose DROPPING them. Trade-off: when you remove a column/table
   from a model, write the drop in the migration by hand.
2. include_object: skip a model `index=True` index when the database already
   has an index whose leading column is that column (e.g. idx_events_slug
   already covers what the model calls ix_events_slug).
3. compare_type: treat Postgres TEXT/CITEXT as equal to a length-less
   String(). Without this, autogenerate would convert users.email from
   case-insensitive CITEXT to VARCHAR and break mixed-case logins.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import ARRAY, String, Text, engine_from_config, inspect, pool

import app.models  # noqa: F401  (registers all models on Base.metadata)
from app.core.config import settings
from app.db.base import Base

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("%", "%%"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# (table, leading_column) pairs already indexed in the live DB; filled in
# run_migrations_online() before autogenerate runs.
_indexed_leading_columns: set[tuple[str, str]] = set()


def _collect_indexed_columns(connection) -> None:
    insp = inspect(connection)
    for table in insp.get_table_names():
        for idx in insp.get_indexes(table):
            cols = idx.get("column_names") or []
            if cols and cols[0]:
                _indexed_leading_columns.add((table, cols[0]))
        for uc in insp.get_unique_constraints(table):
            cols = uc.get("column_names") or []
            if cols:
                _indexed_leading_columns.add((table, cols[0]))


def include_object(obj, name, type_, reflected, compare_to):
    # 1. Exists only in the DB -> never propose dropping it.
    if reflected and compare_to is None:
        return False
    # 2. Model index already covered by an existing DB index.
    if type_ == "index" and not reflected and len(obj.columns) == 1:
        column = next(iter(obj.columns))
        if (obj.table.name, column.name) in _indexed_leading_columns:
            return False
    return True


def _is_text_like(t) -> bool:
    return isinstance(t, Text) or t.__class__.__name__.upper() == "CITEXT"


def compare_type(ctx, inspected_column, metadata_column, inspected_type, metadata_type):
    # 3. TEXT/CITEXT in the DB vs String() (no length) in the model -> same thing.
    is_plain_string = isinstance(metadata_type, String) and not isinstance(metadata_type, Text) and metadata_type.length is None
    if is_plain_string and _is_text_like(inspected_type):
        return False
    if isinstance(inspected_type, ARRAY) and isinstance(metadata_type, ARRAY):
        mi, ii = metadata_type.item_type, inspected_type.item_type
        if isinstance(mi, String) and getattr(mi, "length", None) is None and _is_text_like(ii):
            return False
    return None  # fall back to Alembic's default comparison


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
        compare_type=compare_type,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        _collect_indexed_columns(connection)
        # The inspector auto-began a transaction; end it so Alembic's own
        # transaction below is the one that actually commits the migration.
        connection.commit()
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
            compare_type=compare_type,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
