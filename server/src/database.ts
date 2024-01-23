import Bcrypt from "bcrypt";
import { Collection, Db, MongoClient } from "mongodb";

/**
 * Represents a user in the database.
 */
export interface UserInfo {
    email: string;
    username: string;
    normalizedUsername?: string;
    password: string;
    [key: string]: string|undefined;
}
export default class Database {
    static readonly mongoUrl = `mongodb://${process.env["MONGO_USER"]}:${process.env["MONGO_PASSWORD"]}@mongo:27017`;
    private readonly client: MongoClient;
    private readonly database: Db;
    private readonly users: Collection<UserInfo>;
    private readonly hashRounds = 12;

    constructor(mongoClient: MongoClient) {
        this.client = mongoClient;
        this.database = mongoClient.db("example");
        this.users = this.database.collection<UserInfo>("users");
    }
    async close(): Promise<void> {
        return await this.client.close();
    }
    async getUserByEmail(email: string): Promise<UserInfo | null> {
        return await this.users.findOne({ email: normalize(email) });
    }
    async getUserByEmailOrUsername(
        email: string,
        username: string
    ): Promise<UserInfo | null> {
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
    ): Promise<UserInfo | null> {
        const result: UserInfo | null = await this.users.findOne({
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
    async insertUser(user: UserInfo): Promise<boolean> {
        if (await this.getUserByEmailOrUsername(user.email, user.username)) {
            return false;
        }
        user.password = await this.hashPassword(user.password);
        user.normalizedUsername = normalize(user.username);
        await this.users.insertOne(user);
        return true;
    }
    async replaceUserByEmail(email: string, user: UserInfo): Promise<boolean> {
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
