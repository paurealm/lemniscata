const { spawn } = require('node:child_process');
const nanoid = require('nanoid');
const path = require('path');
const fs = require('fs');

const youtubeUrlRegex = /^https?:\/\/(?:(?:www\.|m\.)?youtube\.com|music\.youtube\.com|youtu\.be)\/.+$/i;

const requestMusicDownload = (url, progressCallback) => {
    if (!youtubeUrlRegex.test(url)) {
        throw new Error('Only YouTube URLs are supported for music downloads.');
    }

    const savePath = path.join(process.env.MUSIC_LIBRARY_PATH, nanoid.nanoid(10));

    return new Promise(async (resolve) => {
        await fs.mkdir(savePath, { recursive: true });

        const errors = [];

        const child = spawn('download-youtube', [
            'audio',
            '-o', savePath,
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

                        progressCallback?.({
                            progress: parseInt(match[1], 10),
                            total: parseInt(match[2], 10)
                        })

                        console.log(`Downloading item ${currentItem}`);
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
                    message: errorOutput.trim() || `Process terminated with code ${code}`
                });
            }

            resolve(errors);
        });
    });
};

module.exports = {
    requestMusicDownload
}