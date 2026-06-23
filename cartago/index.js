const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const cookieParser = require("cookie-parser")
const proxy = require('express-http-proxy')
const path = require("path")
const authModule = require('./auth/AuthModule')
const { setEnvironmentData } = require("worker_threads")

const server = express();
server.use(express.json())
server.use(express.urlencoded())
server.use(cookieParser())

server.post("/generateUser", (req, res) => {
    if (req.body && req.body.username && req.body.password) {
        res.send(authModule.generateUserEntry(req.body.username, req.body.password))
    } else {
        res.statusCode(404)
    }
})

server.use(authModule.authModule)

server.get("/", (req, res) => {
    res.send("Ya estás dentro :)")
})

server.use(express.static(path.join(__dirname, "/web"), {extensions: ['html']}))
server.use(proxy("https://lemniscata.net"))

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Carthago server listening on port ${process.env.SERVER_PORT}`)
})