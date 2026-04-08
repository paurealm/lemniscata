
const nodemailer = require("nodemailer")
let transporter = null;

const setupApi = () => {
    transporter = nodemailer.createTransport({
        host: "mail.lemniscata.net",
        port: 587,
        secure: false,
        auth: {
            user: process.env.LEMNISCATA_API_MAIL_USERNAME,
            pass: process.env.LEMNISCATA_API_MAIL_PASSWORD,
        },
        tls: {
            ciphers:'SSLv3'
        }
    });
}

const processMessage = async (message) => {
    console.log("Enviando mensaje:", message)
    await transporter.sendMail({
        from: `"Páramos de Lemniscata" <${process.env.LEMNISCATA_API_MAIL_USERNAME}>`, // sender address
        to: "paurealm@lemniscata.net", // list of recipients
        subject: "[Lemniscata] Has recibido un mensaje nuevo", // subject line
        text: "Te han dejado un nuevo mensaje", // plain text body
        html: `<p><strong>Te han dejado un nuevo mensaje en los Páramos de Lemniscata:</strong><p><p>${message}</p>`, // HTML body
    });
}

module.exports = {
    setupApi,
    processMessage
}