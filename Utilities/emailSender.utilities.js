
const transporter = require('../Config/emailSenderConfig');

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: `"Inventory Management System" <${process.env.EMAIL_USER}>`, // process.env.EMAIL_USER,
        to,
        subject: 'Welcome',
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        
    }   
};

module.exports = sendEmail;

// //Domain-Specific Service for a real business event 
// const sendWelcomeEmail = async (employeeEmail, employeeName) => {
//         const mailOptions = {
//             from: `"Inventory System Team" <${process.env.EMAIL_USER}>`,
//             to: employeeEmail,
//             subject: 'Welcome! Your Account is Active', // or 'Welcome to the Team! Your Cashier Terminal Account is Active',
//             html: `
//                 <h1>Hello, ${employeeName}!</h1>
//                 <p>An official profile has been opened for you on the Supermarket Management Engine.</p>
//                 <p>Please connect with your system administrator to claim your initial terminal login pin.</p>
//             `
//         };
//
//     try {
//         // Fire the mail stream out to Gmail's network
//         await transporter.sendMail(mailOptions);
//         console.log(`Automated email successfully dispatched to: ${employeeEmail}`);
//     } catch (error) {
//         // We log the error but don't crash the server, keeping the main endpoint online!
//         console.error('Nodemailer automation pipeline failed:', error.message);
//     }
// };

// module.exports = { sendWelcomeEmail };
