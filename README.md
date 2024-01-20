# Example-web-game

This is a demo to exparement with diffrant aspects of audio game creation with web technologies.

## Build

When running for the first time, make sure to install the dependincies.

`npm install`

`cd server`

`npm install`

This is because `server` has diffrant dependincies

now, `./build.sh`. This will build both the client and server. If you want to serve the project after building, run `./build.sh --run`. This will spin up a web server at port 3000 serving this project.

## run the server.

We use docker and docker-compose. `cd server`, create a .env file (look at `docker-compose.yml for the variables you need to define`), and then `docker-compose up --build` or whatever command you would like to start
