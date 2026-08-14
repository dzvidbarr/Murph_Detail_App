# database.py is SQLAlchemy 
import os 

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit = False, 
    autoflush = False, 
    bind = engine
)

# Base is what the python model will inherit from SQLAlchemy knowing they are database models
Base = declarative_base()