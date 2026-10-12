const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const cookieParser = require("cookie-parser")
const proxy = require('express-http-proxy')
const path = require("path")
const authModule = require('./auth/AuthModule')
const { setEnvironmentData } = require("worker_threads")
const musicDownloadApi = require("./apis/MusicDownloadApi")

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

server.post("/requestMusicDownload", async (req, res) => {

    console.log(`Received music download request for URL: ${req.body.url}`);

    const sendEvent = (event, data) => {
        console.log(`Sending event: ${event} with data: ${JSON.stringify(data)}`);
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    if (req.body && req.body.url) {
        console.log(`Starting music download for URL: ${req.body.url}`);
        res.status(200);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();

        console.log(`Headers set for streaming response. Beginning download process.`);

        musicDownloadApi.requestMusicDownload(
            req.body.url,
            (progress) => sendEvent("progress", progress)
        ).then(errors => {
            console.log("Download completed with errors:", errors)
            sendEvent("complete", {errors: errors})
        }).catch((error) => {
            console.error("Error:", error)
            sendEvent("error", {errors: error.message})
        }).finally(() => {
            console.log("Closing connection.")
            res.end()
        })

    }
})

server.use(express.static(path.join(__dirname, "/web"), {extensions: ['html']}))
server.use(proxy("https://lemniscata.net"))

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Carthago server listening on port ${process.env.SERVER_PORT}`)
})