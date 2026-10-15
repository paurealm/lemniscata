const fs = require('fs');
const mailUtils = require("../utils/MailUtils")

let notes = []

CRYPTED_LIBRARY_LOG

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

    const now = new Date();
    const date = `[${new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZone: 'Europe/Madrid'
    }).format(now)}]`;

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
            

            fs.appendFileSync(process.env.CRYPTED_LIBRARY_LOG, `${date} ${mailText}\n`);
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

    fs.appendFileSync(process.env.CRYPTED_LIBRARY_LOG, `${date} ${mailText}\n`);
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