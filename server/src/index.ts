import { MongoClient } from "mongodb";
import Database from "./database";
import Server from "./server";

const PORT = parseInt(process.env.PORT || "3000");
async function main(): Promise<void> {
    let mongoClient = new MongoClient(Database.mongoUrl);
    const server = new Server(PORT, await mongoClient.connect());
    console.log("Connected to database...");
    await server.start();
    process.on("SIGTERM", () => {
        server.shutDown();
        process.exit(0);
    });
}
main();
