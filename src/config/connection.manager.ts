// utils/mongoConnection.ts
import mongoose, { Connection } from 'mongoose';

const connections: Record<string, Connection> = {};

/**
 * Connect to a tenant (school) database by name and return the mongoose connection.
 * Caches connections to prevent duplicates.
 */
export const connectToSchoolDB = async (dbName: string): Promise<Connection> => {
  const dbKey = dbName.toLowerCase().replace(/\s+/g, '_');

  // Return cached connection if available
  if (connections[dbKey] && connections[dbKey].readyState === 1) {
    console.log(`✅ Reusing existing connection for DB: ${dbKey}`);
    return connections[dbKey];
  }

  const uri = `mongodb://localhost:27017/${dbKey}`; // You can make this an env variable for production

  try {
    const conn = await mongoose.createConnection(uri, {
    
    } as any).asPromise();

    connections[dbKey] = conn;
    console.log(`🚀 Connected to new DB: ${dbKey}`);
    return conn;
  } catch (err) {
    console.error(`❌ Error connecting to DB [${dbKey}]:`, err);
    throw err;
  }
};
