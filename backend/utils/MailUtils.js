const nodemailer = require("nodemailer")
let transporter = null;

const setupMailer = () => {
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

const sendEmail = async (email) => {
    await transporter.sendMail(email);
}

module.exports = {
    setupMailer,
    sendEmail
}