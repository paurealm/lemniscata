const mailUtils = require("../utils/MailUtils")

const processMessage = async (message) => {
    console.log("Enviando mensaje:", message)
    await mailUtils.sendEmail({
        from: `"Páramos de Lemniscata" <${process.env.LEMNISCATA_API_MAIL_USERNAME}>`,
        to: "paurealm@lemniscata.net",
        subject: "[Lemniscata] Has recibido un mensaje nuevo :3",
        text: "Te han dejado un nuevo mensaje",
        html: `<p><strong>Te han dejado un nuevo mensaje en los Páramos de Lemniscata:</strong><p><p>${message}</p>`, // HTML body
    });
}

module.exports = {
    processMessage
}