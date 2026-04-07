const express = require('express')
const app = express()
const port = 15001

app.use(express.json())

app.post('/send_message', (req, res) => {
    console.log(req.body)
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})