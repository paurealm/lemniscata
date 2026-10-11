const { spawn } = require('node:child_process');

const youtubeUrlRegex = /^https?:\/\/(?:(?:www\.|m\.)?youtube\.com|music\.youtube\.com|youtu\.be)\/.+$/i;

const requestMusicDownload = url => {
    if (!youtubeUrlRegex.test(url)) {
        throw new Error('Only YouTube URLs are supported for music downloads.');
    }
    return new Promise(resolve => {
        const errors = [];

        const child = spawn('download-youtube', [
            'audio',
            '-o', '/home/redstone/uwu/',
            url
        ], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        let lastItem = '';

        const processOutput = data => {
            output += data;

            const lines = output.split(/\r?\n/);
            output = lines.pop() ?? '';

            for (const line of lines) {
                const match = line.match(
                    /\[download\] Downloading item (\d+) of (\d+)/
                );

                if (match) {
                    const currentItem = `${match[1]}/${match[2]}`;

                    if (currentItem !== lastItem) {
                        lastItem = currentItem;
                        console.log(
                            `Descargando canción ${match[1]} de ${match[2]}`
                        );
                    }
                }
            }
        };

        child.stdout.on('data', processOutput);

        child.stderr.on('data', data => {
            const text = data.toString();

            processOutput(text);
            errorOutput += text;
        });

        child.on('error', error => {
            errors.push(error.message);
            resolve(errors);
        });

        child.on('close', (code, signal) => {
            if (output.trim()) {
                processOutput('\n');
            }

            if (code !== 0) {
                errors.push({
                    code,
                    signal,
                    message: errorOutput.trim() || `Proceso terminado con código ${code}`
                });
            }

            resolve(errors);
        });
    });
};

module.exports = {
    requestMusicDownload
}