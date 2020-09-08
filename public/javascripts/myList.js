const copyCoordinates = (coordinates) => {
  //pass then coordinates into this function and then set copyCoordinates to be the coordinates in the form [latitude, longitude] rather than the GeoJSON [longitude, latitude]
  const copyCoordinates =
    coordinates.split(",")[1] + "," + coordinates.split(",")[0];
  //add the input to the end of body and set the value of it to be the copy coordinates and then select this input - note this is not a visible input field
  $("<input>").val(copyCoordinates).appendTo("body").select();
  document.execCommand("copy"); //copy the selected value to the clipboard
  //success, show alert
  showAlert(
    "success",
    "The coordinated of this attraction have been copied to your clipboard!"
  );
};

const deleteUA = async (id) => {
  try {
    const userid = document.querySelector(".cityListTitle").dataset.userid;
    //find the User Attraction using the attrID and the userID
    let url = `127.0.0.1:8611/user/attractions?`;
    url += `attraction=${id}`;
    url += `&user=${userid}`;
    const res = await axios({
      //send the request using axios
      method: "GET", //use a get method
      url,
    });
    if (res.data.status === "success") {
      //if a user attraction is successfully searched for
      const uaID = res.data.data.data[0]._id; //get the user attraction id from the result
      url = `127.0.0.1:8611/user/attractions/${uaID}`; //use the user attraction id make the correct url endpoint to delete this user attraction
      await axios({
        //send delete request with axios
        method: "DELETE", //method type is DELETE
        url,
      });
      //set the display of the user attration row and marker to be none
      document.getElementById(`attr-${id}`).style.display = "none";
      document.querySelector(`.attrPin-${id}`).style.display = "none";
    }
  } catch (err) {
    //error, show alert
    showAlert("error", err.response.data.message);
  }
};
const delUserAttr = async (id) => {
  //confirm that the user wants to confirm the user attraction.
  if (window.confirm("Are you sure you want to delete this attraction?")) {
    await deleteUA(id);
  }
};
