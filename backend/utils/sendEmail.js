const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter using environment variables
    // If variables are missing, it will likely fail or needs a mock
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or use 'host' and 'port' from env
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't crash the app if email fails
    }
};

module.exports = sendEmail;
