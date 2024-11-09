import { MongoClient } from 'mongodb';

const URI = process.env.MONGODB_URI ?? '';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(URI);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(URI);
  clientPromise = client.connect();
}
    
export const getClient = async () => await clientPromise;

export const getCollections = async () => {
  const client = await clientPromise;
  const db = client.db();
  return {
    filesCollection: db.collection('files'),
    usersCollection: db.collection('users')
  };
};

