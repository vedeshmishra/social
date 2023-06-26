import nodemailer from 'nodemailer';
const sendMail = async (Options) => { 
     
   var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "45c7c9b5c17f48",
    pass: "aa83bc4eb78212"
  }
});
    const mailOptions = { 
        from: process.env.SMTP_MAIL,
        to: Options.to,
        subject: Options.subject,
        text: Options.text,
    }

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, msg: error.message });
        }
        res.status(200).json({ success: true, msg: 'Email sent' });
    });
}
 export default sendMail;    
        