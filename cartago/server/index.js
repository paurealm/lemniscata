const express = require("express")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")

const authModule = require('./auth/AuthModule')

dotenv.config()

const server = express();

server.use(cookieParser())
server.use(authModule.authModule)

server.get("/", (req, res) => {
    res.send("Ya estás dentro :)")
})

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Carthago server listening on port ${process.env.SERVER_PORT}`)
})