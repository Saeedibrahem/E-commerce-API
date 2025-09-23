const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, html) {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to, subject, html
    });
    return info;
}

module.exports = { sendEmail };
