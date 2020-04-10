const mailgun = require("mailgun-js");
const htmlToText = require("html-to-text");
const fs = require("fs");
const mg = mailgun({
  apiKey: process.env.MAILGUN_APIKEY,//mailgun apikey and doman stored in config.env
  domain: process.env.MAILGUN_DOMAIN,
});

module.exports = class Email {
  constructor(user, url) { //constructor takes in the user and the url that we wish to send them in this email
    this.to = user.email; //sets the to field to the users email
    this.firstName = user.name.split(" ")[0]; // gets the users firstname for the email greeting
    this.url = url;// sets url field to the url
    //sets the from field to be Wander Yonder and uses the mailgun email
    this.from = `Wander Yonder <postmaster@sandbox30ce58ab759d4830b1aaa3cef1e9133e.mailgun.org>`;
  }
  async send(template, subject) {//used to send the email
    let html = await fs.readFileSync(// this gets the html of this email by reading the hbs file with the filename of the parameter template
      `${__dirname}/../views/emails/${template}.hbs`, //syncronously reads the hbs file so it doesnt block other lines of code from executing
      "utf-8",//uses utf-8
      (err, data) => {
        if (err) throw err;
      }
    );
    //instead of hbs render because we dont want to view the page
    html = html.replace("{{url}}", this.url);//replace the {{url}} with this Email objects url
    html = html.replace("{{firstName}}", this.firstName);//replace the {{firstName}} with this Email objects firstName
    html = html.replace("{{subject}}", subject);//replace the {{subject}} with this Email objects subject

    const data = { //combines the data into a data object
      from: this.from,//sets the email that is the sender
      to: this.to,//sets the receiptient
      subject: subject,//sends the subject
      text: htmlToText.fromString(html), //gets the plain text from the .hbs page
      html,//sends the html
    };

    mg.messages().send(data, function (error, body) {//sends the message
      //console.log(body);
    });
  }

//////My Attempts at getting danu7s demilitarized zone, nodemailer and sendgrid to work./////

  // newTransport() {
  //   if (process.env.NODE_ENV === "production") {
  //     return nodemailer.createTransport("smtp://mailrelay-dmz.it.nuigalway.ie");

  //     //sendgrid
  //     // return nodemailer.createTransport({
  //     //   service: "SendGrid",
  //     //   auth: {
  //     //     user: process.env.SENDGRID_USERNAME,
  //     //     pass: process.env.SENDGRID_PASSWORD,
  //     //   },
  //     // });

  //     // Gmail basic.wonder.yonder@gmail.com
  //     // This is to send emails to real customers.
  //     // console.log(process.env.GMAIL_USERNAME);
  //     // return nodemailer.createTransport({
  //     //   service: '"Gmail"',
  //     //   auth: {
  //     //     type: "OAuth2",
  //     //     user: process.env.GMAIL_USERNAME,
  //     //     clientId: process.env.CLIENT_ID,
  //     //     clientSecret: process.env.CLIENT_SECRET,
  //     //     refreshToken: process.env.REFRESH_TOKEN,
  //     //     accessToken: process.env.ACCESS_TOKEN
  //     //   }
  //     // });
  //   }

  //   // return nodemailer.createTransport({
  //   //     service: '"Gmail"',
  //   //     auth: {
  //   //       user: process.env.GMAIL_USERNAME,
  //   //       pass: process.env.GMAIL_PASSWORD
  //   //     }
  //   //   });

  //   // This is for development, to test email templates
  //   // Emails are captured in mailtrap for review.
  //   var transport = nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });

  //   return transport;
  // }

  // async send(template, subject) {
  //   //send the actual email
  //   //1) Render html based on template

  //   let html = await fs.readFileSync(
  //     `${__dirname}/../views/emails/${template}.hbs`,
  //     "utf-8",
  //     (err, data) => {
  //       if (err) throw err;
  //     }
  //   );
  //   html = html.replace("{{firstName}}", this.firstName);
  //   html = html.replace("{{url}}", this.url);
  //   html = html.replace("{{subject}}", subject);

  //   //2) Define email options

  //   const mailOptions = {
  //     from: this.from,
  //     to: this.to,
  //     subject,
  //     html,
  //     text: htmlToText.fromString(html),
  //   };
  //   //3) Create a transport and send email

  //   const transport = this.newTransport();
  //   await transport.sendMail(mailOptions, function (error, response) {
  //     if (error) {
  //       //console.log(error);
  //     } else {
  //       //console.log(response);
  //     }
  //     transport.close();
  //   });
  // }
  async sendWelcome() {
  // send welcome sends an email with the welcome.hbs as the template and 'Welcome to Wander Yonder!' as the subject
    await this.send("welcome", "Welcome to Wander Yonder!");
  }
  async sendPasswordReset() {
  // send password reset sends an email with the passwordReset.hbs as the template and 'Reset your password: This link is only valid for 10 minutes.' as the subject
    await this.send(
      "passwordReset",
      "Reset your password: This link is only valid for 10 minutes."
    );
  }
};
