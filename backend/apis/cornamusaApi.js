const fs = require("fs")
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const nanoid = require("nanoid")
const otplib = require("otplib")

const locateFileByCode = async (code, onError, onNotFound) => {
    return new Promise((resolve, reject) => {
        fs.readdir(process.env.CORNAMUSA_LOCATION, (error, files) => {
            if (error) {
                onError()
                reject;
            }

            const matchingFile = files.find(file => file.startsWith(code))
            if (matchingFile) {
                resolve(matchingFile)
            } else {
                onNotFound()
                reject()
            }
        })
    });

}

const checkTotpCode = async (code) => {
    return await otplib.verify({
        secret: process.env.CORNAMUSA_SECRET,
        token: code,
        epochTolerance: 10
    })
}

const setupEndpoints = app => {

    app.get('/cornamusa/code', (req, res) => {
        const code = req.query.code;
        if (!code) {
            res.sendStatus(400)
            return;
        }

        checkTotpCode(code)
            .then(result => {
                if (result.valid) {
                    res.sendStatus(200)
                } else {
                    res.sendStatus(403)
                }
            }).catch(() => res.sendStatus(500));

    })

    app.post('/cornamusa/file', upload.single("file"), async (req, res) => {

        const result = await checkTotpCode(req.body.code)

        console.log("File:", req.file)

        if (result.valid) {
            const fileCode = nanoid.nanoid()
            const fileName = `${fileCode}_${req.file.originalname}`
            fs.writeFile(
                `${process.env.CORNAMUSA_LOCATION}/${fileName}`,
                req.file.buffer,
                error => {
                    if (error) {
                        res.sendStatus(500)
                    } else {
                        res.send({
                            url: `https://lemniscata.net/cornamusa?file=${fileCode}`
                        })
                    }
                }
            )
        } else {
            res.sendStatus(403)
            return;
        }

    })

    app.get("/cornamusa/file/:fileCode", (req, res) => {
        const fileCode = req.params.fileCode;
        if (!fileCode || (fileCode.length !== 21)) {
            res.sendStatus(400)
            return;
        }

        locateFileByCode(
            fileCode,
            () => res.sendStatus(500),
            () => res.sendStatus(404),
        )
        .then(fileName => {
            if (!fileName) {
                res.sendStatus(500)
            } else {
                res.send({
                    fileName: fileName.replace(`${fileCode}_`, "")
                });
            }
        })
        .catch(() => {})

    })

    app.get("/cornamusa/file/:fileCode/download", (req, res) => {
        const fileCode = req.params.fileCode;
        if (!fileCode || (fileCode.length !== 21)) {
            res.sendStatus(400)
            return;
        }

        locateFileByCode(
            fileCode,
            () => res.sendStatus(500),
            () => res.sendStatus(404),
        )
        .then(fileName => {
            if (!fileName) {
                res.sendStatus(500)
            } else {
                res.sendFile(`${process.env.CORNAMUSA_LOCATION}/${fileName}`)
            }
        })
        .catch(() => {})
        
    })
}

module.exports = {
    setupEndpoints
}