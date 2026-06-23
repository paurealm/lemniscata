const express = require("express")
const jwt = require("jsonwebtoken")
const path = require("path")
const nanoid = require("nanoid")
const fs = require("fs")
const otplib = require("otplib")
const bcrypt = require("bcrypt")

const CARTAGO_PRIVATE_KEY = fs.readFileSync(process.env.CARTAGO_PRIVATE_KEY)
const CARTAGO_PUBLIC_KEY = fs.readFileSync(process.env.CARTAGO_PUBLIC_KEY)

const SESSION_MANAGER = {}

setInterval(() => {
    const sessionKeys = [...Object.keys(SESSION_MANAGER)];
    for (const sessionKey of sessionKeys) {
        const session = SESSION_MANAGER[sessionKey]
        if (!session) {
            delete SESSION_MANAGER[sessionKey]
            continue;
        }

        if (Date.now() - session.creationTime > 1000 * 60* 60 * 16) {
            delete SESSION_MANAGER[sessionKey]
        }
    }
}, 30 * 60 * 1000)

const authModule = async (req, res, next) => {
    const sessionCookie = req.cookies.cartagoSession;

    if (req.originalUrl === "/logout" && req.method === "GET") {
        res.clearCookie("cartagoSession")
        requestLogin(req, res)
        return;
    }

    if (sessionCookie && isValidCookie(sessionCookie)) {
        next()
        return;
    } else {
        res.clearCookie("cartagoSession")
    }

    if (req.originalUrl === "/login") {
        if (req.method === "GET") {
            res.sendFile(path.join(__dirname, '/login.html'))
            return;
        } else if (req.method === "POST") {
            console.log(req.body.username, req.body.password, req.body.otp)
            if (await checkUser(req.body.username, req.body.password, req.body.otp)) {
                const token = createSession(req.body.username)
                
                res.cookie("cartagoSession", token, {
                    maxAge: 16 * 60 * 60 * 1000,
                    httpOnly: true
                })

                res.sendStatus(200)
                return;
            } else {
                res.sendStatus(403)
                return;
            }
        } else {
            res.sendStatus(405);
            return;
        }
    } else if (req.method ===  "GET") {
        requestLogin(req, res)
        return;
    } else {
        res.sendStatus(404)
        return;
    }
}

const requestLogin = (req, res) => {

    res.redirect(302, '/login')
}

const isValidCookie = (sessionCookie) => {
    const token = jwt.verify(
        sessionCookie,
        CARTAGO_PUBLIC_KEY
    )

    if (token && token.sessionId) {
        return SESSION_MANAGER[token.sessionId]
    } else {
        return undefined
    }
}

const createSession = username => {
    const sessionId = nanoid.nanoid()
    const token = jwt.sign(
        {
            sessionId: sessionId
        },
        CARTAGO_PRIVATE_KEY,
        {algorithm: "RS256"}
    )

    const session = {
        creationTime: Date.now(),
        username: username,
        data: {}
    }

    SESSION_MANAGER[sessionId] = session

    return token
}

const checkUser = async (username, password, otp) => {
    const usersDatabaseFile = fs.readFileSync(process.env.USERS_DATABASE_FILE)
    const usersDatabase = JSON.parse(usersDatabaseFile)

    const selectedUser = usersDatabase.users[username]
    if (!selectedUser) {
        return false;
    }

    const otpCheck = await otplib.verify({
        secret: selectedUser.otpKey,
        token: otp,
        epochTolerance: 10
    })
    if (!otpCheck.valid) {
        return false;
    }

    const passwordCheck = await bcrypt.compare(
        password,
        selectedUser.password
    )

    return passwordCheck
    
}

const generateUserEntry = (username, password) => {
    const passwordHash = bcrypt.hashSync(password, 10)
    const otpSecret = otplib.generateSecret()

    return {
        [username]: {
            otpKey: otpSecret,
            password: passwordHash,
            permissions: []
        }
    }
}

module.exports = {
    authModule,
    generateUserEntry
}