import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) throw new Error("MONGODB_URI is required");

const globalForMongo = globalThis as unknown as {
    mongo?: Promise<MongoClient>;
};

const client = globalForMongo.mongo ?? new MongoClient(uri).connect();

if (process.env.NODE_ENV !== "production") globalForMongo.mongo = client;

export async function db(): Promise<Db> {
    return (await client).db(process.env.MONGODB_DB || "apero_cafe");
}
