import Bcrypt from "bcrypt";
import { Collection, ObjectId, WithId } from "mongodb";
import { userInDatabase } from "./types";
import { normalize } from "path";

export default class Users {
    private readonly hashRounds = 12;
    private readonly collection: Collection<userInDatabase>;
    constructor(collection: Collection<userInDatabase>) {
        this.collection = collection;
    }
    async getUserByEmail(
        email: string
    ): Promise<WithId<userInDatabase> | null> {
        return await this.collection.findOne({ email: normalize(email) });
    }
    async getUserByEmailOrUsername(
        email: string,
        username: string
    ): Promise<WithId<userInDatabase> | null> {
        return await this.collection.findOne({
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
        const result: WithId<userInDatabase> | null =
            await this.collection.findOne({
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
            (await this.collection.deleteOne({ email: normalize(email) }))
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
        return (await this.collection.insertOne(user)).insertedId;
    }
    async replaceUserByEmail(
        email: string,
        user: userInDatabase
    ): Promise<boolean> {
        const result = await this.collection.replaceOne(
            { email: normalize(email) },
            user,
            { upsert: false }
        );
        return result.modifiedCount > 0;
    }
}
