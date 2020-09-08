// type is either password or data
const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password" // if the type of form is passord use the update password url else if the type is data or otherwise use the update info url
        ? `127.0.0.1:8611/users/updatePassword`
        : `127.0.0.1:8611/users/updateMyInfo`;
    const res = await axios({
      //send request with axios
      method: "PATCH", //send a patch request
      url,
      data, //send the data in the req.body
    });

    if (res.data.status === "success") {
      //success
      if (type === "password")
        //show alert that password has been updated
        showAlert("success", `Your account ${type} has been updated!`);
      else {
        //type==="data"
        //update data on page
        document.querySelector(".card-name").innerHTML = data.get("name");
        document.getElementById("nav-user-name").textContent = data.get("name");
        document.querySelector(".card-username").innerHTML = data.get(
          "username"
        );
        document.querySelector(".card-email").innerHTML = data.get("email");
        //success, show alert
        showAlert("success", `Your account ${type} has been updated!`);
      }
    }
  } catch (err) {
    //error, show alert
    showAlert("error", err.response.data.message);
  }
};

//get ther userDataForm and the userPasswordForm using their classes
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");

//if the userdata form exists add a submit event listener
if (userDataForm) {
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set the button text
    document.querySelector(".button-save-data").textContent = "Saving...";
    //create a form to hold the data
    const form = new FormData();
    //add each of the pieces of data to the form and give them their appropriate names
    form.append("name", document.getElementById("name").value);
    form.append("username", document.getElementById("username").value);
    form.append("email", document.getElementById("email").value);
    if (document.getElementById("photo").files[0]) {
      form.append("photo", document.getElementById("photo").files[0]);
    }

    //call the update settings method with the formdata and the type of update as "data"
    await updateSettings(form, "data").then(
      setTimeout(function () {
        //then after 1second update the users photo in the card and in the navbar to give the image time to upload
        const id = document.querySelector(".card-username").dataset.userid;

        if (form.has("photo")) {
          console.log("newphoto");
          const photoLink = `/images/users/user-${id}.jpeg`;
          document.querySelector(".card-photo").src = photoLink;

          document.querySelector(".nav-userphoto").src = photoLink;
        }
      }, 1000)
    );
    //set the button text back
    document.querySelector(".button-save-data").textContent = "Save Settings";
  });
}
//if the user password form exists add an event listener for the submission of the form
if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set the button text
    document.querySelector(".button-save-password").textContent = "Saving...";

    //get the current password, the new password and the passwordConfirm values from the form
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    //call the update settings method and send in the data as an object, set the type as "password"
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );
    //set the button text back to what it was before the submission
    document.querySelector(".button-save-password").textContent =
      "Save Password";
    //reset the form fields
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}
