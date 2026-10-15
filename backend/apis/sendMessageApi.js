const mailUtils = require("../utils/MailUtils")

const processMessage = async (message) => {
    console.log("Enviando mensaje:", message)

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

    fs.appendFileSync(process.env.INCOMING_MESSAGES_FILE, `${date} ${message}\n`);

    await mailUtils.sendEmail({
        from: `"Páramos de Lemniscata" <${process.env.LEMNISCATA_API_MAIL_USERNAME}>`,
        to: "paurealm@lemniscata.net",
        subject: "[Lemniscata] Has recibido un mensaje nuevo :3",
        html: `<p><strong>Te han dejado un nuevo mensaje en los Páramos de Lemniscata:</strong><p><p>${message}</p>`, // HTML body
    });
}

module.exports = {
    processMessage
}