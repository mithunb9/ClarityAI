import { MongoClient } from 'mongodb';

const URI = process.env.MONGODB_URI ?? '';

const client = new MongoClient(URI);

const db = client.db();
const filesCollection = db.collection('files');
const usersCollection = db.collection('users');

export { filesCollection, usersCollection };