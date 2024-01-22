import Bcrypt from "bcrypt";
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
    private readonly client: MongoClient;
    private readonly database: Db;
    private readonly users: Collection<User>;
    private readonly hashRounds = 12;

    constructor(mongoClient: MongoClient) {
        this.client = mongoClient;
        this.database = mongoClient.db("example");
        this.users = this.database.collection<User>("users");
    }
    async close(): Promise<void> {
        return await this.client.close();
    }
    async getUserByEmail(email: string): Promise<User | null> {
        return await this.users.findOne({ email: normaliseEmail(email) });
    }
    /**
     * This function will handle hashing the password. Please do not pass a hashed password.
     */
    async getUserByEmailAndPassword(
        email: string,
        password: string
    ): Promise<User | null> {
        const hashedPassword: string = await this.hashPassword(password);
        const result: User | null = await this.users.findOne({
            email: email,
            password: hashedPassword,
        });
        return result;
    }
    private hashPassword(password: string): Promise<string> {
        return Bcrypt.hash(password, this.hashRounds);
    }
    async deleteUserByEmail(email: string): Promise<boolean> {
        return (
            (await this.users.deleteOne({ email: normaliseEmail(email) }))
                .deletedCount > 0
        );
    }
    /**
     * This function will handle hashing the password. Please do not pass a hashed password.
     */
    async insertUser(user: User): Promise<boolean> {
        if (await this.getUserByEmail(user.email)) {
            return false;
        }
        user.password = await this.hashPassword(user.password);
        await this.users.insertOne(user);
        return true;
    }
    async replaceUserByEmail(email: string, user: User): Promise<boolean> {
        const result = await this.users.replaceOne(
            { email: normaliseEmail(email) },
            user,
            { upsert: false }
        );
        return result.modifiedCount > 0;
    }
}
function normaliseEmail(email: string): string {
    return email.toLowerCase();
}
