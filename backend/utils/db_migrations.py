import logging
from sqlalchemy import text


_MIGRATIONS = [
    {
        "id": "2024_11_02_add_password_hash_to_users",
        "sql": "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)",
    },
    {
        "id": "2024_11_03_add_gender_to_babies",
        "sql": "ALTER TABLE babies ADD COLUMN IF NOT EXISTS gender VARCHAR(4)",
    },
    {
        "id": "2026_02_10_add_name_to_users",
        "sql": "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(50)",
    },
]


def run_migrations(db):
    """运行轻量级数据库迁移，避免手动执行。"""
    try:
        db.session.execute(text(
            "CREATE TABLE IF NOT EXISTS schema_migrations ("
            "id VARCHAR(200) PRIMARY KEY,"
            "applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            ")"
        ))
        applied_rows = db.session.execute(text("SELECT id FROM schema_migrations")).fetchall()
        applied = {row[0] for row in applied_rows}

        for migration in _MIGRATIONS:
            if migration["id"] in applied:
                continue
            db.session.execute(text(migration["sql"]))
            db.session.execute(
                text("INSERT INTO schema_migrations (id) VALUES (:id)"),
                {"id": migration["id"]},
            )

        db.session.commit()
    except Exception as exc:  # pragma: no cover - 启动时兜底
        db.session.rollback()
        logging.exception("数据库迁移执行失败: %s", exc)
        raise
