/**
 * Represents a user in the database.
 */

import { ObjectId } from "mongodb";

export interface userInDatabase {
    email: string;
    username: string;
    normalizedUsername?: string;
    password: string;
    [key: string]: string | undefined;
}

export interface Permissions {
    type: "everyone" | "everyoneExcept" | "only";
    userList: ObjectId[];
}
