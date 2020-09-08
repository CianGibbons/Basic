const delUser = async (id) => {
  try {
    const url = `127.0.0.1:8611/users/${id}`;
    await axios({
      // send axios request to delete the user
      method: "DELETE",
      url,
    });
    //simulate a click to refresh the list of users
    document.querySelector(".button-save-att-data").click();
  } catch (err) {
    //error, show alert.
    showAlert("error", err.response.data.message);
  }
};

const confirmWithAdmin = (id) => {
  //confirm with the admin that when want to delete this user
  if (window.confirm("Are you sure you want to delete this user?")) {
    delUser(id);
  }
};

const getUsers = async (sort, limit, page, username, email) => {
  try {
    let url = `127.0.0.1:8611/users/`;
    url += `?${sort}&${limit}&${page}`; //add in the query fields
    if (username) url += `&${username}`;
    if (email) url += `&${email}`;

    const res = await axios({
      //send request with axios
      method: "GET", //method type is get
      url,
    });

    if (res.data.status === "success") {
      //if the req is successful set the users to be the data returned
      const users = res.data.data.data;
      document.querySelector(".results").innerHTML = ""; //reset the results div to be blank
      showAlert("success", "Successfully searched for users"); //success , show alert
      users.forEach((thisuser) => {
        //for each user add the following into the innerHTML of the div with class results
        document.querySelector(
          ".results"
        ).innerHTML += `<div class="card"><div class="row"><div class="col-md-3 mt-2"><h5>${thisuser.name}</h5></div><div class="col-md-2 mt-2"><p>${thisuser.username}</p></div><div class="col-md-3 mt-2"><p>${thisuser.email}</p></div><div class="col-md-2 mt-2"><p>${thisuser.location}</p></div><div class="col-md-2"><a href='/editUser/${thisuser._id}' class="btn btn-lg"><i class="fa fa-arrow-circle-right fa-sm"></i></a><button onclick='confirmWithAdmin("${thisuser._id}")' class="btn btn-lg"><i class="fa fa-trash fa-sm"></i></button></div></div></div>`;
      });
    }
  } catch (err) {
    //error, show alert
    showAlert("error", err.response.data.message);
  }
};
//get user filter form using the class
const userFilterForm = document.querySelector(".filter-edit-users");
if (userFilterForm) {
  // if the user filter form exists add event listener for the submission of the form
  userFilterForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.

    //get query fields
    let sort = document.getElementById("sortBy").value;
    if (sort === "Alphabetical") sort = `sort=username`;
    else sort = `sort=createdAt`;
    let limit = document.getElementById("limit-form-data").value || 10;
    limit = `limit=${limit}`;
    let page = document.getElementById("page-form-data").value || 1;
    page = `page=${page}`;
    let username = document.getElementById("searchUsername").value || "";
    if (username) username = `username=${username}`;
    let email = document.getElementById("searchEmail").value || "";
    if (email) email = `email=${email}`;
    //get and display the users
    await getUsers(sort, limit, page, username, email);
  });
}

const patchUserInfo = async (
  id,
  name,
  username,
  location,
  photo,
  email,
  role
) => {
  try {
    const url = `127.0.0.1:8611/users/${id}`;
    let res;
    if (photo) {
      //if photo exists
      photo = `user-default.png`; //revert the users photo back to default
      res = await axios({
        //send request with axios
        method: "PATCH", //patch request
        url,
        data: {
          //send the data to be patched
          name,
          username,
          location,
          photo,
          email,
          role,
        },
      });
    } else {
      //send the request without the photo field
      res = await axios({
        method: "PATCH",
        url,
        data: {
          name,
          username,
          location,
          email,
          role,
        },
      });
    }

    if (res.data.status === "success") {
      //success, show alert
      showAlert("success", "The account information has been updated");
      //reset the results inner html  to be blank
      document.getElementById("results").innerHTML = "";
      //stringify the result (new document that was patched) and display it by putting it in the inner html of results
      document.getElementById("results").innerHTML = JSON.stringify(
        res.data.data.doc
      );
    }
  } catch (err) {
    //error, show alert
    showAlert("error", err.response.data.message);
    //show the error message in the results div
    document.getElementById("results").innerHTML = JSON.stringify(
      err.response.data.message
    );
  }
};

//get the user edit form by class
const userEditForm = document.querySelector(".form-edit-user");
//if the user edit form exists add an event listener for the submission of the form
if (userEditForm) {
  userEditForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set the text of the buttom
    document.querySelector(".button-save-data").textContent = "Saving...";
    // get the user id from the url
    let id = window.location.href;
    id = id.replace("127.0.0.1:8611/editUser/", "");
    //get the form date from the form
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const location = document.getElementById("location").value;
    const photo = document.getElementById("photo").checked;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    //send the data into the patch method
    await patchUserInfo(id, name, username, location, photo, email, role);
    //reset the text content of the button
    document.querySelector(".button-save-data").textContent = "Save Changes";
  });
}
