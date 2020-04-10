const delComment = async (id) => {
  try {
    //this is the endpoint to delete a comment using the comment id
    const url = `http://danu7.it.nuigalway.ie:8611/comments/${id}`;
    await axios({ //send the request using axios
      method: "DELETE",//method type is delete
      url,//use the url defined above
    });
    //updateComments
    //get the attraction id from the dataset
    const attraction = document.querySelector(".comments-results").dataset.aid;
    await updateComments(attraction);
  } catch (err) {
    //error, show alert
    showAlert("error", err.response.data.message);
  }
};

const updateComments = async (attractionID) => {
  try {
    //define the url for the endpoint
    const url = `http://danu7.it.nuigalway.ie:8611/attractions/${attractionID}/comments?sort=-createdAt`;
    const res = await axios({ method: "GET", url });// call the request using axios and the url

    if (res.data.status === "success") {// if successful
      //update comments section with comments
      if (res.data.results === 0) {//if there are no comments
        // add in 'Be the first to comment.' text
        document.querySelector(".comments-results").innerHTML =
          "<p>Be the first one to comment on this attraction!</p>";
      } else {
        //Some comment(s) found, display them
        const comments = res.data.data.data;
        //get the user id from the dataset
        const currUser = document.querySelector(".comments-results").dataset
          .uid;
          //get the users role from the dataset
        const currUserRole = document.querySelector(".comments-results").dataset
          .urole;
          //rest the comments results div so it doesnt contain any comments
        document.querySelector(".comments-results").innerHTML = "";
        comments.forEach((comment) => {// for each comment
          //User Id is in comment, compare to current user, also compare role
          //document.querySelector(" .comments-results").innerHTML += `<div class='card'><div class ='row'><div class = 'col-md-2 ml-2 mt-2'><img src='/images/users/${comment.user.photo}' class='rounded-circle img-fluid '></div><div class = 'col'><h5 class='comment-username' data-uID='${comment.user._id}'>${comment.user.username}</h5><p>${comment.comment}</p>`;
          if (currUser === comment.user._id || currUserRole === "admin") {// if the user owns the comment or if the user is an admin
            document.querySelector(//display with delete button
              ".comments-results"
            ).innerHTML += `<div class='card'><div class ='row'><div class = 'col-md-2 ml-2 mt-2 mb-2'><img src='/images/users/${comment.user.photo}' class='rounded-circle img-fluid '></div><div class = 'col'><h5 class='comment-username' data-uID='${comment.user._id}'>${comment.user.username}</h5><p alt='Max-width 80%'>${comment.comment}</p><button class='genric-btn primary circle' onclick='delComment("${comment._id}")'><i class='fa fa-trash fa-lg'></i></button></div></div></div><br>`;
          } else {//user doesnt have permission to delete this comment
            document.querySelector(// dont include delete button
              ".comments-results"
            ).innerHTML += `<div class='card'><div class ='row'><div class = 'col-md-2 ml-2 mt-2 mb-2'><img src='/images/users/${comment.user.photo}' class='rounded-circle img-fluid '></div><div class = 'col'><h5 class='comment-username' data-uID='${comment.user._id}'>${comment.user.username}</h5><p alt='Max-width 80%'>${comment.comment}</p></div></div></div><br>`;
          }
        });
      }
    }
  } catch (err) {//error, show alert.
    
    showAlert("error", err.response.data.message);
  }
};

const postComment = async (attraction, comment) => {
  try {
    //se the url
    const url = `http://danu7.it.nuigalway.ie:8611/comments`;
    const res = await axios({// send request with axios
      method: "POST",//method type is post 
      url,//url from above
      data: {// send the attraction id and the comment as the req.body
        attraction,
        comment,
      },
    });
    if (res.data.status === "success") {
      //if comment successfully posted
      //await update comments for this attraction
      //await updateComments(attraction);
      //show alert that the comment was posted
      showAlert("success", "This comment has been posted!");
    }
  } catch (err) {
    // if error, show alert
    showAlert("error", err.response.data.message);
  }
};

//gets the comment form by class
const commentForm = document.querySelector(".form-user-comment");
//if the comment form exists add event listener on submit
if (commentForm) {
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();//if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //change button text
    document.querySelector(".button-post-user-comment").textContent =
      "Submitting...";
      //get req.body data, in this case comment and attraction id
    const attraction = document.querySelector(".comments-results").dataset.aid;
    const comment = document.querySelector(".comment-box").value;
    //post the comment, then update comments
    await postComment(attraction, comment).then(async function() {
      await updateComments(attraction)}
      );

    document.querySelector(".comment-box").value = "";//reset the value of the comment box
    //reset the text of the button
    document.querySelector(".button-post-user-comment").textContent =
      "Submit Comment";
  });
}

$(document).ready(async function () {
  try {// when the page loads get the attraction id from the comments results
    const aID = document.querySelector(".comments-results").dataset.aid;

    if (aID) {// if the attraction id is defined then update comments
      await updateComments(aID);
    }
  } catch (err) {}
});
