import motor.motor_asyncio

class Database:
    def __init__(self, uri, db_name):
        self.client = motor.motor_asyncio.AsyncIOMotorClient(uri)
        self.database = self.client[db_name]

    async def close(self):
        self.client.close()

    async def get_collection(self, collection_name):
        return self.database[collection_name]  

# Sample usage:
if __name__ == '__main__':
    import asyncio
    db = Database('mongodb://localhost:27017', 'mydatabase')

    async def main():
        collection = await db.get_collection('mycollection')
        # do something with the collection

    asyncio.run(main())