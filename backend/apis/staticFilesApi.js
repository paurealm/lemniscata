const fs = require('fs');

const readStaticFiles = () => {
    return new Promise((resolve, reject) => {
        fs.readdir('/var/www/static', (error, files) => {
            if (error) {
                reject();
                return;
            }
            resolve(files);
        })
    })
}

module.exports = {
    readStaticFiles
}