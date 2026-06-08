const express = require('express')
const app = express()
const port = 15001
const dotenv = require('dotenv');
dotenv.config();

const sendMessageApi = require('./apis/sendMessageApi')
const decryptNotesApi = require('./apis/decryptNotesApi')
const staticFilesApi = require("./apis/staticFilesApi")
const cornamusaApi = require("./apis/cornamusaApi")
const mailUtils = require("./utils/MailUtils")

app.use(express.json())

app.post('/send_message', async (req, res) => {
    const message = req.body.message;

    if (message && message.length > 0) {
        sendMessageApi.processMessage(message)
    }

    res.sendStatus(200)
})

app.get('/decrypt_list', (req, res) => {
    res.send({
        keys: decryptNotesApi.getIdList(),
        hints: decryptNotesApi.getHintList()
    })
})

app.post('/decrypt', (req, res) => {
    res.send({result: decryptNotesApi.decrypt(req.body.id, req.body.key)})
})

app.get('/static_lookup', (req, res) => {
    staticFilesApi.readStaticFiles()
        .then(files => res.send({files: files}))
        .catch(() => res.sendStatus(500));
})

cornamusaApi.setupEndpoints(app)

app.listen(port, () => {
    mailUtils.setupMailer()
    decryptNotesApi.setupApi()
    console.log(`Lemniscata WebApi listening on port ${port}`)
})