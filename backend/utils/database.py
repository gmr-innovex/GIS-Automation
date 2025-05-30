from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Update MongoDB URL to use Atlas connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://gmrinnovex:oEctBDKgyYAW7X1V@cluster0.x3yj2db.mongodb.net/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "certificate_automation")

logger.info(f"Using MongoDB Atlas connection")
logger.info(f"Database Name: {DATABASE_NAME}")

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_db(cls):
        try:
            logger.info("Attempting to connect to MongoDB Atlas...")
            # Add serverSelectionTimeoutMS to handle connection timeouts
            cls.client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
            
            # Verify the connection
            logger.info("Pinging MongoDB server...")
            await cls.client.admin.command('ping')
            
            # List all databases to verify connection
            logger.info("Listing available databases...")
            database_list = await cls.client.list_database_names()
            logger.info(f"Available databases: {database_list}")
            
            cls.db = cls.client[DATABASE_NAME]
            logger.info(f"Connected to database: {DATABASE_NAME}")
            
            # List collections in the database
            collections = await cls.db.list_collection_names()
            logger.info(f"Available collections in {DATABASE_NAME}: {collections}")
            
            # Create indexes if they don't exist
            logger.info("Creating indexes...")
            await cls.db.certificates.create_index("facility")
            await cls.db.certificates.create_index("created_at")
            logger.info("Indexes created successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {str(e)}")
            raise

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("Closed MongoDB connection!")

    @classmethod
    def get_db(cls):
        if cls.db is None:
            logger.error("Database not connected. Call connect_db first.")
            raise Exception("Database not connected. Call connect_db first.")
        return cls.db 