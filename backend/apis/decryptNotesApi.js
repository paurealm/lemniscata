const fs = require('fs');
const mailUtils = require("../utils/MailUtils")

let notes = []

const setupApi = () => {
    fs.readFile(
        process.env.LEMNISCATA_API_NOTES_FILE,
        'utf-8',
        (error, data) => {
            if (error) {
                console.error("Error leyendo el archivo de notas encriptadas:", error)
            } else {
                const parsedData = JSON.parse(data);
                console.log(parsedData)
                notes = parsedData;
            }
        }
    )
}

const decrypt = (id, key) => {
    let matchingNote = undefined;
    for (const note of notes) {
        if (note.id === id) {
            matchingNote = note;
            break;
        }
    }

    if (matchingNote) {
        if (matchingNote.keys.includes(key.trim().toLowerCase())) {
            const mailText = `Parece que alguien ha desencriptado el mensaje para ${id} con la clave ${key}`
            mailUtils.sendEmail({
                from: `"Páramos de Lemniscata" <${process.env.LEMNISCATA_API_MAIL_USERNAME}>`,
                to: "paurealm@lemniscata.net",
                subject: "[Lemniscata] Alguien ha desencriptado un mensaje",
                text: mailText,
                html: `<p>${mailText}</p>`, // HTML body
            })
            return matchingNote.text;
        }
    }

    const mailText = `Alguien ha fallado al desencriptar el mensaje ${id} con la clave ${key}`
            mailUtils.sendEmail({
                from: `"Páramos de Lemniscata" <${process.env.LEMNISCATA_API_MAIL_USERNAME}>`,
                to: "paurealm@lemniscata.net",
                subject: "[Lemniscata] Alguien ha fallado al desencriptar un mensaje",
                text: mailText,
                html: `<p>${mailText}</p>`, // HTML body
            })
    return null;
}

const getIdList = () => {
    return notes.map(note => note.id)
}

const getHintList = () => {
    return notes.map(note => note.hint)
}

module.exports = {
    setupApi,
    decrypt,
    getIdList,
    getHintList
}