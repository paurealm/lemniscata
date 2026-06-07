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

const setupEndpoints = app => {
    app.post('/cornamusa', upload.single("file"), async (req, res) => {

        const result = await otplib.verify({
            secret: process.env.CORNAMUSA_SECRET,
            token: req.body.code,
            epochTolerance: 10
        })

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
                            url: `https://webapi.lemniscata.net/cornamusa/${fileCode}`
                        })
                    }
                }
            )
        } else {
            res.sendStatus(403)
            return;
        }

    })

    app.get("/cornamusa/:fileCode", (req, res) => {
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

    app.get("/cornamusa/:fileCode/download", (req, res) => {
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