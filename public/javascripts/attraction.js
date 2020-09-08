/*eslint-disable*/
//this is to use the json form to create an attraction
const jsonAttractionAdd = async (data) => {
  try {
    //set the url to which the POST method will be sent
    const url = `127.0.0.1:8611/attractions`;
    const res = await axios({
      //using axios to send the request
      method: "POST", //set the method as post
      url, //set the url to be POSTed to to be the url const
      data, // send the data that was passed into this function
    });

    if (res.data.status === "success") {
      //display the results in the results box, have to stringify the object to for it to display correctly
      document.getElementById("results").innerHTML = JSON.stringify(res.data);
      //show an alert saying that the attraction has been added
      showAlert("success", "This attraction has been added!");
    }
  } catch (err) {
    //show an alert that there was an error adding the attraction
    showAlert("error", err.response.data.message);
    //put the message into the results box
    document.getElementById("results").innerHTML = JSON.stringify(
      err.response.data.message
    );
  }
};
//this is to use the GUI form to create a new attraction
const getAddAttraction = async (
  name,
  city,
  wikiSlug,
  aType,
  photo,
  coordinates,
  address,
  shortDescription,
  longDescription
) => {
  try {
    //set the url for the request
    const url = `127.0.0.1:8611/attractions`;
    //use axios to send the request
    const res = await axios({
      method: "POST", // set the method as post
      url, // set the url as the url defined above
      data: {
        //insert the data to be posted
        name,
        city,
        wikiSlug,
        aType,
        photo,
        location: {
          coordinates,
          address,
          shortDescription,
          longDescription,
        },
      },
    });

    if (res.data.status === "success") {
      //if the post request is successful diplay the results in the results box and show an alert saying that it was a success
      document.getElementById("results").innerHTML = JSON.stringify(res.data);
      showAlert("success", "This attraction has been added!");
    }
  } catch (err) {
    //if the post request was not a success, display the error message in the results box and show an alert saying that there was an error
    document.getElementById("results").innerHTML = JSON.stringify(
      res.response.data.message
    );
    showAlert("error", "This attraction has failed to upload!");
  }
};
//gets the GUI Form for adding attractions
const guiForm = document.querySelector(".GUIattractionForm");

if (guiForm) {
  // if the GUI Form for adding attractions exists
  //add an event listener for when the form is submitted
  guiForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set the text of the button to be saving
    document.querySelector(".button-save-att-data").textContent = "Saving...";
    //get all the data from the form
    const name = document.getElementById("name").value;
    const city = document.getElementById("city").value;
    const wikiSlug = document.getElementById("wikiSlug").value;
    const aType = document.getElementById("aType").value;
    const photo = document.getElementById("photo").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const coordinates = [longitude, latitude];
    const address = document.getElementById("address").value;
    const shortDescription = document.getElementById("shortDescription").value;
    const longDescription = document.getElementById("longDescription").value;
    //call the method which sends the post request, await its completion
    await getAddAttraction(
      name,
      city,
      wikiSlug,
      aType,
      photo,
      coordinates,
      address,
      shortDescription,
      longDescription
    );
    //reset the form fields
    document.getElementById("name").value = "";
    document.getElementById("city").value = "";
    document.getElementById("wikiSlug").value = "";
    document.getElementById("photo").value = "";
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
    document.getElementById("address").value = "";
    document.getElementById("shortDescription").value = "";
    document.getElementById("longDescription").value = "";
    //set the buttons text content back to the original
    document.querySelector(".button-save-att-data").textContent =
      "Save Changes";
  });
}
//gets the jsonForm for adding attractions by its class
const jsonForm = document.querySelector(".form-addJsonAttraction");
if (jsonForm) {
  // if the form exists
  //add an event handler for the submission of the form
  jsonForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set the text content of the button to tell the user whats happening
    document.querySelector(".button-save-att-jsondata").textContent =
      "Saving...";
    try {
      //try to parse the form data to a JSON Object and it is successfully parsed pass it into the jsonAttractionAdd method to create the method with that data, await its completion
      const jsonData = JSON.parse(document.getElementById("json").value);
      await jsonAttractionAdd(jsonData);
    } catch (e) {
      //if there is an error caught display it in the results box and show an alert saying there was an error

      document.getElementById("results").innerHTML = e;
      showAlert("error", "Error parsing JSON data.");
    }
    // set the button text back to the original
    document.querySelector(".button-save-att-jsondata").textContent =
      "Save Changes";
  });
}

const delAttr = async (id) => {
  try {
    //this method is to delete an attraction document from the collection
    //set the endpoint url
    const url = `127.0.0.1:8611/attractions/${id}`;
    await axios({
      //no need to store the response because with a status 204 of deleted there is none
      method: "DELETE", // set the method to delete
      url, // set the url to be the one defined above
    });

    document.querySelector(".button-save-att-data").click(); //simulates a click of the button to refresh the attractions list
  } catch (err) {
    //shows an alert of type error with the error message if an error is caught
    showAlert("error", err.response.data.message);
  }
};

const confirmWithAdmin = async (id) => {
  //makes a popup come up to confirm that the user wants to delete this item
  if (window.confirm("Are you sure you want to delete this item?")) {
    await delAttr(id); //calls the delete attraction method with the attractions id
  }
};

const getFilteredData = async (city, aType, page, limit) => {
  try {
    //builds a query url with the parameters given
    let url = "127.0.0.1:8611/attractions/";
    url += `?page=${page}&limit=${limit}`;
    if (city) url += `&${city}`;
    if (aType) url += `&${aType}`;
    const res = await axios({
      // sends the request with axios
      method: "GET", //sends get request
      url, //sends the method to this endpoint
    });
    if (res.data.status === "success") {
      //if successfull queried for the documents
      const attractions = res.data.data.data; // attractions = the documents found
      showAlert("success", "Searched for Attractions successfully!"); //show alert
      document.querySelector(".results").innerHTML = ""; //set the results box innerHTML to be blank
      attractions.forEach((attraction) => {
        //for each attraction append the following to the innerHTML of the results box
        document.querySelector(
          ".results"
        ).innerHTML += `<div class="card"><div class="row"><div class="col-md-2"><h5>${attraction.name}</h5></div><div class="col-md-2"><p>${attraction.aType}</p></div><div class="col-md-4"><p>${attraction.location.address}</p></div><div class="col-md-2"><p>${attraction.city}</p></div><div class="ml-auto col-md-1"><a href='/editAttraction/${attraction._id}' class="btn btn-lg"><i class="fa fa-arrow-circle-right fa-lg"></i></a></div><div class="ml-auto col-md-1"><button onclick='confirmWithAdmin("${attraction._id}");' class="btn btn-lg"><i class="fa fa-trash fa-lg"></i></button><!--have an onclick "are you sure?"" --></div></div></div>`;
      });
    }
  } catch (err) {
    //if an error is caught show alert
    showAlert("error", err.response.data.message);
  }
};

//get the filter from by the class
const filterForm = document.querySelector(".filter-edit-attractions");
if (filterForm) {
  //if the filter form exists
  //add event listener on submit
  filterForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //gets the city and attraction type from the select menu
    const citySelector = document.querySelector(".city-option");
    let city = citySelector.options[citySelector.selectedIndex].text;
    const aTypeSelector = document.querySelector(".atype-option");
    let aType = aTypeSelector.options[aTypeSelector.selectedIndex].text;
    //adjusts the city and atype so that they will fit the format for querying
    //and if it is 'All' they setting it to a blank string because no need to filter
    if (city === "All") city = "";
    else city = `city=${city}`;
    if (aType === "All") aType = "";
    else aType = `aType=${aType}`;
    //if there is no value for given for limit set it to 10
    // if there is no value for page set it to 1
    let limit = document.getElementById("limit-form-data").value || 10;
    let page = document.getElementById("page-form-data").value || 1;
    //call getFilteredData method using the data gotten above to filter the results
    await getFilteredData(city, aType, page, limit);
  });
}

const patchAttr = async (
  aID,
  name,
  city,
  wikiSlug,
  aType,
  photo,
  coordinates,
  address,
  shortDescription,
  longDescription
) => {
  try {
    //set the url for this endpoint
    const url = `127.0.0.1:8611/attractions/${aID}`;
    const res = await axios({
      //send the PATCH request with axios
      method: "PATCH", //set the method to patch
      url, //set the url to the one defined above
      data: {
        // set the data to be the data passed into our function and ensure it follows the structure of the model ie. type, coordinates,address, shortDescription, longDescription within locations
        name,
        city,
        wikiSlug,
        aType,
        photo,
        location: {
          type: "Point",
          coordinates,
          address,
          shortDescription,
          longDescription,
        },
      },
    });
    if (res.data.status === "success") {
      // if the request is successful
      //show the alert for the success
      showAlert("success", "This attraction has been successfully updated.");
      document.getElementById("results").innerHTML = ""; // reset the innerHTML to be blank for the results div
      document.getElementById(
        "currentAttractionIndicator"
      ).innerHTML = `${name} - ${city}`; //sets what the current attraction and city are
      document.getElementById("results").innerHTML = JSON.stringify(
        res.data.data.doc //sets the results div to contain the stringified object of the data contained
      );
    }
  } catch (err) {
    //show alert with the error
    showAlert("error", err.response.data.message);
    //set the results innerHTML to be blank
    document.getElementById("results").innerHTML = "";
    //set the results innerHTML to be the stringified error message
    document.getElementById("results").innerHTML = JSON.stringify(
      res.response.data.message
    );
  }
};

//get the edit form using its class
const editForm = document.querySelector(".form-edit-attraction");
if (editForm) {
  //if the edit form exists add an event listener for the submission of the form
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //change the button text
    document.querySelector(".button-update-att-data").textContent =
      "Saving Changes...";

    let aID = window.location.href; //get the current url
    //replace the start of the url so I am just left with the attraction ID
    aID = aID.replace(`127.0.0.1:8611/editAttraction/`, "");
    // get the rest of the data from the form
    const name = document.getElementById("name").value;
    const city = document.getElementById("city").value;
    const wikiSlug = document.getElementById("wikiSlug").value;
    const aType = document.getElementById("aType").value;
    const photo = document.getElementById("photo").value;
    const lat = document.getElementById("latitude").value * 1;
    const lng = document.getElementById("longitude").value * 1;
    const coordinates = [lng, lat];
    const address = document.getElementById("address").value;
    const shortDescription = document.getElementById("shortDescription").value;
    const longDescription = document.getElementById("longDescription").value;

    await patchAttr(
      aID,
      name,
      city,
      wikiSlug,
      aType,
      photo,
      coordinates,
      address,
      shortDescription,
      longDescription
    ); //patch the data
    //edit the buttons text
    document.querySelector(".button-update-att-data").textContent =
      "Save Changes";
  });
}
