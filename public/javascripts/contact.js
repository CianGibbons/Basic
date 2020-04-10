const sendEmail = async (subject, message, name, userEmail) => {
  try {//this is for the contact form to send messages
    //use this endpoint
    const url = `http://danu7.it.nuigalway.ie:8611/contact`;
    const res = await axios({//use axios for the request
      method: "POST",// method type is a post
      url,// use the url defined above
      data: { // send the following data as the req.body
        subject,
        message,
        name,
        userEmail,
      },
    });
    if (res.data.status === "success") {
      //success, show alert
      showAlert("success", "Your message has been sent.");
    }
  } catch (err) {
    //error, show alert
    showAlert(err.response.data.message);
  }
};

//get contact form by class
const contactForm = document.querySelector(".form-contact");
if (contactForm) {// if the contact form exists add event listener on submit
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();//if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set the text of the buttom
    document.querySelector(".button-contactForm").textContent = "Sending...";
    //get the data from the form
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    // console.log(subject, message, name, email);
    //await sendEmail -> axios -> router -> controller -> new Email -> template -> transport
    //send the email
    await sendEmail(subject, message, name, email);
    //reset the button text and the form fields
    document.querySelector(".button-contactForm").textContent = "Send";
    document.getElementById("subject").value = "";
    document.getElementById("message").value = "";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
  });
}
