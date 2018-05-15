const nodemailer = require('nodemailer');
const config = require('./config');

function sendEmail() {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: config.email.auth
    });

    var mailOptions = {
        from: config.email.auth.user,
        to: config.email.to,
        subject: 'Door Open!',
        text: 'Door Open!'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendEmail: sendEmail
};