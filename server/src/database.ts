import { Collection, Db, MongoClient } from "mongodb";

/**
 * Represents a user in the database.
 */
interface User {
    email: string;
    username: string;
    password: string;
}
export default class Database {
    static readonly mongoUrl = `mongodb://${process.env["MONGO_USER"]}:${process.env["MONGO_PASSWORD"]}@mongo:27017`;
    private mongoClient: MongoClient;
    private database: Db;
    private users: Collection<User>;
    constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
        this.database = mongoClient.db("example");
        this.users = this.database.collection<User>("users");
        
    }
}
