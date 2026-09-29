const fs = require('fs');
const path = require('path')

const ROOT_PATH = path.normalize("/var/www/static")
const METADATA_FILE_NAME = ".metadata"

const readStaticFiles = subpath => {
    return new Promise((resolve, reject) => {
        console.log("Hola :)")
        const searchPath = path.normalize(path.join(ROOT_PATH, subpath))
        console.log("buscando archivos en:", searchPath)

        if (!searchPath.startsWith(ROOT_PATH)) {
            reject("Nos hemos levantado cachondos hoy, ¿eh?")
            return;
        }

        console.log("wala no nos atacan")

        fs.readdir(searchPath, (error, files) => {
            console.log("leyendo archivos")
            if (error) {
                reject("Error al leer el directorio D:");
                return;
            }

            const result = []
            let metadata = undefined

            console.log("iterando archivos")
            for (let element of files) {
                const elementPath = path.join(searchPath, element)
                
                if (element == METADATA_FILE_NAME) {
                    const metadataContent = fs.readFileSync(elementPath, "utf-8")
                    try {
                        metadata = JSON.parse(metadataContent)
                    } catch (_) {}

                    continue
                };

                const stat = fs.statSync(elementPath)

                if (stat.isFile()) {
                    result.push({
                        name: element,
                        type: "file",
                        size: stat.size,
                        modTime: parseInt(stat.mtimeMs)
                    })
                } else if (stat.isDirectory()) {
                    result.push({
                        name: element,
                        type: "directory"
                    })
                }
            }

            console.log("resolviendo")
            resolve({
                contents: result,
                metadata
            });
        })
    })
}

module.exports = {
    readStaticFiles
}