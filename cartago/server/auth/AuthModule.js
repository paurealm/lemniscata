const express = require("express")
const jwt = require("jsonwebtoken")
const path = require("path")
const URL = require("url")

const authModule = (req, res, next) => {
    const sessionCookie = req.cookies.cartagoSession;

    if (!sessionCookie) {
        if (req.originalUrl === "/login" && req.method === "POST") {
            const token = jwt.sign(
                {
                    sessionId: "123456"
                },
                "claveMuySecreta"
            )

            res.cookie("cartagoSession", token, {
                maxAge: 16 * 60 * 60 * 1000,
                //secure: true,
                httpOnly: true
            })

            res.send("UwU!!")            
        } else {
            requestLogin(req, res)
        }
    } else {
        next();
    }
}

const extractURL = request => {
    return URL.format({
        protocol: request.protocol,
        host: request.get("host"),
        pathname: request.originalUrl
    })
}

const requestLogin = (req, res) => {
    const originalUrl = extractURL(req);

    res.sendFile(path.join(__dirname, '/login.html'))
}

module.exports = {
    authModule
}