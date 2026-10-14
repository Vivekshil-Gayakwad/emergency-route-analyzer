import os
import urllib.parse
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqlconnector://root:Vivekshil%40358@localhost:3306/erna_db"
)

# Convert plain mysql:// to mysql+pymysql:// or mysql+mysqlconnector://
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

# Ensure password with @ is properly handled if not already encoded
if "@" in DATABASE_URL.replace("://", ""):
    parts = DATABASE_URL.split("://")
    proto = parts[0]
    rest = parts[1]
    if rest.count("@") > 1 and "%40" not in rest:
        last_at = rest.rfind("@")
        cred_part = rest[:last_at]
        host_part = rest[last_at + 1:]
        if ":" in cred_part:
            user_part, pwd_part = cred_part.split(":", 1)
            DATABASE_URL = f"{proto}://{user_part}:{urllib.parse.quote_plus(pwd_part)}@{host_part}"

connect_args = {}
# Fix SSL on Render/Linux containers
if "mysqlconnector" in DATABASE_URL:
    # use_pure=True uses Python's ssl module instead of C extension which causes SSL_CTX error on Render
    connect_args = {
        "use_pure": True,
        "ssl_verify_cert": False,
        "ssl_disabled": False,
    }
    # Strip URL query params that trigger C-extension SSL verify path failure
    if "?ssl_verify_cert=" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.split("?")[0]
elif "pymysql" in DATABASE_URL:
    if "tidbcloud" in DATABASE_URL or "gateway01" in DATABASE_URL:
        connect_args = {"ssl": {"ssl_mode": "REQUIRED"}}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
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
