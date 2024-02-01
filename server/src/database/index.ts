import { Collection, Db, MongoClient } from "mongodb";
import { userInDatabase } from "./types";
import Users from "./users";

export default class Database {
    static readonly mongoUrl = `mongodb://${process.env["MONGO_USER"]}:${process.env["MONGO_PASSWORD"]}@mongo:27017`;
    private readonly client: MongoClient;
    private readonly database: Db;
    readonly users: Users;

    constructor(mongoClient: MongoClient) {
        this.client = mongoClient;
        this.database = mongoClient.db("example");
        this.users = new Users(
            this.database.collection<userInDatabase>("users")
        );
    }
    async close(): Promise<void> {
        return await this.client.close();
    }
}
