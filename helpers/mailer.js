import nodemailer from "nodemailer";

// process.env.SMTP_HOST

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: "587",
  secure: false,
  requireTLS: true,
  auth: {
    user: "frontend236@gmail.com",
    pass: "winfxjmqwiypvgut",
  },
});

const sendMail = async (email, subject, content) => {
  try {
    let mailOption = {
      from: "frontend236@gmail.com",
      to: email,
      subject: subject,
      html: content,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      }

      console.log("Mail sent", info.messageId);
    });
  } catch (error) {
    console.log(error.message);
  }
};

export { sendMail };
