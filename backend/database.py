import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqlconnector://root:Vivekshil%40358@localhost:3306/erna_db"
)

# Ensure password with @ is properly handled if not already encoded
if "@" in DATABASE_URL.replace("://", ""):
    parts = DATABASE_URL.split("://")
    proto = parts[0]
    rest = parts[1]
    if rest.count("@") > 1 and "%40" not in rest:
        # User specified raw @ in password
        last_at = rest.rfind("@")
        cred_part = rest[:last_at]
        host_part = rest[last_at + 1:]
        if ":" in cred_part:
            user_part, pwd_part = cred_part.split(":", 1)
            import urllib.parse
            DATABASE_URL = f"{proto}://{user_part}:{urllib.parse.quote_plus(pwd_part)}@{host_part}"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
