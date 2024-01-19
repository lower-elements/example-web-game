# Example-web-game

This is a demo to exparement with diffrant aspects of audio game creation with web technologies.

## Build

When running for the first time, make sure to install the dependincies.

`npm install`

`cd server`

`npm install`

This is because `server` has diffrant dependincies

now, `./build.sh`. This will build both the client and server. If you want to serve the project after building, run `./build.sh --run`. This will spin up a web server at port 3000 serving this project.

After building, the compiled server will be at `server/dist`. You can just run `cd server && node dist/index.js`
