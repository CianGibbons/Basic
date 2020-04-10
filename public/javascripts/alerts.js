/* eslint-disable */
const hideAlert = () => {
  const el = document.querySelector(".alert"); //get the element that has the class alert
  if (el) el.parentElement.removeChild(el); //since I cannot directly remove the element I get the parent element and then remove its child element which is this element
};

// type is 'success' or 'error' which either puts the background color of the alert to be green or red respectively
//msg is the mesasage to be shown in the alert
showAlert = (type, msg) => {
  hideAlert();//hide any alert that might be currently showing
  let markup = `<div class="alert alert--${type}">${msg}</div>`;// set the alerts html
  // let markup;
  // if (type === "success") {
    //if we want to edit it so there are diferent alerts for success alerts then for error alerts
  //   markup = `<div class="alert alert--${type}">${msg}</div>`;
  // } else {
  //   markup = `<div class="alert alert--${type}">${msg}</div>`;
  // }
  //insert the alert after the body begins.
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, 5000);// hide this alert after 5 seconds
};

/* Green Tick in Circle Animation */
/* <div class="swal2-icon swal2-success swal2-animate-success-icon" style="display: flex;"><div class="swal2-success-circular-line-left" style="background-color: rgb(255, 255, 255);"></div><span class="swal2-success-line-tip"></span><span class="swal2-success-line-long"></span><div class="swal2-success-ring"></div><div class="swal2-success-fix" style="background-color: rgb(255, 255, 255);"></div><div class="swal2-success-circular-line-right" style="background-color: rgb(255, 255, 255);"></div></div> */

/* Red Cross in Circle Animation */
/*<div class="swal2-icon swal2-error swal2-animate-error-icon" style="display: flex;"><span class="swal2-x-mark"><span class="swal2-x-mark-line-left"></span><span class="swal2-x-mark-line-right"></span></span></div>*/
