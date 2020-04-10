const mailgun = require("mailgun-js");//mailgun package for emailing
const mg = mailgun({
  apiKey: process.env.MAILGUN_APIKEY, //apiKey for mailgun stored in config.env
  domain: process.env.MAILGUN_DOMAIN, //domain for mailgun stored in config.env
});
module.exports = class EmailContact {//this is class that is used for the contact form
  constructor(subject, message, name, userEmail) {//creates an object EmailContact and passes un the subject message name and userEmail 
    //*** Because we didnt want to pay for an email providing service
    //*** And nodemailer using xoauth2 for gmail doesnt work on danu7 servers.
    //*** I contacted Dr. Barrett with this issue but decided to use mailgun instead in the end.
    //*** We have had to adjust and instead use our sandbox mailgun email
    //*** to send emails from the contact form to our gmail email from which
    //*** we can reply to the message on the contact form. We have to use gmail
    //*** for replying because to reply using our mailgun email we would have to pay,
    //*** or own a domain. Due to this work around we have to append the user's
    //*** email to the bottom of the message and send on the email like that.
    //*** We will then simply have to get the users email from the message and reply to that email.

    //appends the users email and name of the contactee to the bottom of the message
    message += `\n\nPlease reply to ${userEmail}`; 
    message += `\nName: ${name}`;

    //sets 'from' to the mailgun email
    this.from = `Wander Yonder <postmaster@sandbox30ce58ab759d4830b1aaa3cef1e9133e.mailgun.org>`;
    //sets 'to' to our gmail email 
    this.to = "basic.wonder.yonder@gmail.com";
    //sets the message to be the message variable
    this.message = message; 
    //sets the subject to be the subject provided and prepends 'Contact Form: ' to it
    this.subject = `Contact Form: ${subject}`;
  }

  async sendContact() {

    const data = {//combines all the data for sending the email into one object called data
      from: this.from,
      to: this.to,
      subject: this.subject,
      text: this.message, //text is going to be this.message
    };

    mg.messages().send(data, function (error, body) {// sends the email using a mailgun method
      //   console.log(body);
      //   console.log(data);
    });
  }
};
