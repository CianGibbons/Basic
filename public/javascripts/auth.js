const signup = async (
  name,
  username,
  email,
  password,
  passwordConfirm,
  DOB,
  location
) => {
  try {//signup the user with the given data
    const res = await axios({//send the request using axios
      method: "POST",//method type is POST
      url: `http://danu7.it.nuigalway.ie:8611/users/signup`,//send it to the signup endpoint
      data: {//post the data in the body of the request
        name,
        username,
        email,
        password,
        passwordConfirm,
        DOB,
        location,
      },
    });
    if (res.data.status === "success") {
      //show alert on success
      showAlert("success", "Signed up successfully!");
      window.setTimeout(() => {
        //redirect to the home page after a timeout of 1 and a half seconds
        window.location.assign("/");
      }, 1500);
    }
  } catch (err) {
    //show alert on error
    showAlert("error", err.response.data.message);
  }
};

const login = async (username, password) => {
  try {
    const res = await axios({// send request using axios
      method: "POST",//method type is post
      url: `http://danu7.it.nuigalway.ie:8611/users/login`,//send it to the login endpoint
      data: {//send the username and password as the body of the request
        username,
        password,
      },
    });
    if (res.data.status === "success") {
      //on success show alert
      showAlert("success", "Logged in successfully!");
      //redirect to the home page after a timeout of 1 and a half seconds
      window.setTimeout(() => {
        window.location.assign("/");
      }, 1500);
    }
  } catch (err) {
    //if there is an error show alert with the error
    showAlert("error", err.response.data.message);
  }
};

//get the login form by its class
const loginForm = document.querySelector(".login-form");
// if the login form exists
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {// add an eventlistener on submit to the form
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //gets the data to be sent as the body of the request from the form
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    await login(username, password);//calls the method
  });
}

const logout = async () => {
  try {
    const res = await axios({// send the request with axios
      method: "GET",//method type is a get
      url: `http://danu7.it.nuigalway.ie:8611/users/logout`,// send the this endpoit
    });
    if (res.data.status === "success") window.location.assign("/");// if successful redirect to the home page
  } catch (err) {
    //if error then show an error alert
    // this alert shouldnt happen often, might happen if the user tries to logout when they lose wifi connection
    showAlert("error", "Error logging out! Try again.");
  }
};
//get the logout button by its id
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  //if the logout button is there add event listener for on click
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();//if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    await logout(); // call the logout method
  });
}
//gets the signup form by its class
const signupForm = document.querySelector(".register-form");
if (signupForm) {
  // if the signup form exists add event listener on submit to it
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();//if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    // get the data for the signup request body from the form
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    let DOB = document.getElementById("datepicker").value;
    DOB = DOB.split("/")[1] + "/" + DOB.split("/")[0] + "/" + DOB.split("/")[2];
    const country = document.getElementById("country");
    const location = country.options[country.selectedIndex].text;

    if (
      !name ||
      !username ||
      !password ||
      !passwordConfirm ||
      !DOB ||
      !location
    ) {
      return;
    }// if one of the fields dont exist return
    //call the signup method with the data from the form
    await signup(name, username, email, password, passwordConfirm, DOB, location);
  });
}

const sendResetLink = async (email) => {
  try {
    // set the endpoint for the url
    const url = `http://danu7.it.nuigalway.ie:8611/users/forgotPassword`;
    const res = await axios({// use axios for the request
      method: "POST", // method type is post
      url,// use the url defined above
      data: { email },// send the users email as the body for the request
    });
    if (res.data.status === "success") {
      //success, show alert
      showAlert("success", "Reset link has been sent to your email.");
    }
  } catch (err) {
    //error, show alert
    showAlert("error", err.response.data.message);
  }
};
//get forgot password form
const forgotForm = document.querySelector(".forgot-form");
if (forgotForm) {
  //if the forgot form exists add event listener for submit
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();//if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    // set the textcontent for the button
    document.querySelector(".button-send-reset").textContent = "Sending...";

    //get the email from the form to be sent as the request body
    const email = document.getElementById("email").value;
    await sendResetLink(email);// send the reset email by calling the method made above
    document.getElementById("email").value = "";// reset the email field on the form
    // reset the button text content
    document.querySelector(".button-send-reset").textContent =
      "Reset Email Sent";
  });
}

const resetPassword = async (token, password, passwordConfirm) => {
  try {
    // set the url using the token
    const url = `http://danu7.it.nuigalway.ie:8611/users/resetPassword/${token}`;
    const res = await axios({//send the request using axios
      method: "PATCH",//method type is patch
      url,//url is defined above
      data: {//send the password and passwordConfirm as the req.body
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === "success") {
      //success, show alert
      showAlert("success", "Your password has been reset.");
    }
    setTimeout(window.location.assign("/"), 1000);
    // redirect to the home page in one second 
    // no point staying on the page as the reset token is now invalid if they wanted to change password again because it was used
  } catch (err) {
    //error, show alert
    showAlert("error", err.response.data.message);
  }
};
// get the reset form by the class
const resetForm = document.querySelector(".resetpass-form");
if (resetForm) {
  // if the reset form exists add event listener on submit
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();//if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set the buttons text content
    document.querySelector(".button-reset").textContent = "Resetting...";
    // get the data from the form to be passed as the req.body
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    //get the reset token from the url
    let token = window.location.href;
    token = token.replace(
      `http://danu7.it.nuigalway.ie:8611/reset-password/`,
      ""
    );

    await resetPassword(token, password, passwordConfirm);// call the reset password method
    document.querySelector(".button-reset").textContent = "Reset Password";// once the reset password method has completed, reset the buttons text.
  });
}
