import Bcrypt from "bcrypt";
import { Collection, Db, MongoClient, ObjectId, WithId } from "mongodb";
import { userInDatabase } from "./types";

export default class Database {
    static readonly mongoUrl = `mongodb://${process.env["MONGO_USER"]}:${process.env["MONGO_PASSWORD"]}@mongo:27017`;
    private readonly client: MongoClient;
    private readonly database: Db;
    private readonly users: Collection<userInDatabase>;
    private readonly hashRounds = 12;

    constructor(mongoClient: MongoClient) {
        this.client = mongoClient;
        this.database = mongoClient.db("example");
        this.users = this.database.collection<userInDatabase>("users");
    }
    async close(): Promise<void> {
        return await this.client.close();
    }
    async getUserByEmail(
        email: string
    ): Promise<WithId<userInDatabase> | null> {
        return await this.users.findOne({ email: normalize(email) });
    }
    async getUserByEmailOrUsername(
        email: string,
        username: string
    ): Promise<WithId<userInDatabase> | null> {
        return await this.users.findOne({
            $or: [
                { email: normalize(email) },
                { normalizedUsername: normalize(username) },
            ],
        });
    }
    /**
     * This function will handle hashing the password. Please do not pass a hashed password.
     */
    async getUserByEmailAndPassword(
        email: string,
        password: string
    ): Promise<WithId<userInDatabase> | null> {
        const result: WithId<userInDatabase> | null = await this.users.findOne({
            email: normalize(email),
        });
        if (result && (await Bcrypt.compare(password, result.password))) {
            return result;
        }
        return null;
    }
    private hashPassword(password: string): Promise<string> {
        return Bcrypt.hash(password, this.hashRounds);
    }
    async deleteUserByEmail(email: string): Promise<boolean> {
        return (
            (await this.users.deleteOne({ email: normalize(email) }))
                .deletedCount > 0
        );
    }
    /**
     * This function will handle hashing the password. Please do not pass a hashed password.
     */
    async insertUser(user: userInDatabase): Promise<ObjectId | null> {
        if (await this.getUserByEmailOrUsername(user.email, user.username)) {
            return null;
        }
        user.password = await this.hashPassword(user.password);
        user.normalizedUsername = normalize(user.username);
        return (await this.users.insertOne(user)).insertedId;
    }
    async replaceUserByEmail(
        email: string,
        user: userInDatabase
    ): Promise<boolean> {
        const result = await this.users.replaceOne(
            { email: normalize(email) },
            user,
            { upsert: false }
        );
        return result.modifiedCount > 0;
    }
}
function normalize(what: string): string {
    return what.toLowerCase();
}
