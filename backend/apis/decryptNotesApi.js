const fs = require('fs');

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
            return matchingNote.text;
        }
    }

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