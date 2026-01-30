import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Validate URI format (MongoDB driver requires hostname + domain/tld)
if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
  throw new Error(
    'Invalid MONGODB_URI in .env.local. Use mongodb://localhost:27017 for local MongoDB, or a mongodb+srv://... string for Atlas.'
  );
}
if (uri.includes('your-mongodb-connection-string')) {
  throw new Error(
    'Replace MONGODB_URI in .env.local with your real connection string (e.g. mongodb://localhost:27017 or your Atlas URI).'
  );
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDB() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'happenix';
  return client.db(dbName);
}
