"use strict";

var sliderContainer = document.querySelector(".slider");
var allCards = document.querySelectorAll(".slider-card");
var nope = document.getElementById("nope");
var love = document.getElementById("love");
var i = 0;

function initCards(card, index) { //initialize all cards
  var newCards = document.querySelectorAll(".slider-card:not(.removed)");

  newCards.forEach(function (card, index) {
    card.style.zIndex = allCards.length - index;
    card.style.transform =
      "scale(" + (20 - index) / 20 + ") translateY(-" + 30 * index + "px)";
    card.style.opacity = (10 - index) / 10;
  });

  sliderContainer.classList.add("loaded");
}

initCards();

allCards.forEach(function (el) {
  var hammertime = new Hammer(el);

  hammertime.on("pan", function (event) {
    el.classList.add("moving");
  });

  hammertime.on("pan", function (event) {
    if (event.deltaX === 0) return;
    if (event.center.x === 0 && event.center.y === 0) return;

    sliderContainer.classList.toggle("slider-love", event.deltaX > 0);
    sliderContainer.classList.toggle("slider-nope", event.deltaX < 0);

    var xMulti = event.deltaX * 0.03;
    var yMulti = event.deltaY / 80;
    var rotate = xMulti * yMulti;

    event.target.style.transform =
      "translate(" +
      event.deltaX +
      "px, " +
      event.deltaY +
      "px) rotate(" +
      rotate +
      "deg)";
  });

  document.onkeydown = function (e) {
    switch (e.keyCode) {
      case 37:  //left arrow key
        var moveOutWidth = document.body.clientWidth * 1.5;
        var cards = document.querySelectorAll(".slider-card:not(.removed)");

        if (!cards.length) return false;

        var card = cards[0];

        card.classList.add("removed");
        card.style.transform =
          "translate(-" + moveOutWidth + "px, -100px) rotate(30deg)";
        sliderContainer.classList.toggle("slider-love", event.deltaX > 0);
        initCards();
        //POST handling
        likeAttraction(allCards[i].dataset.aid, 0);

        event.preventDefault();
        break;
      case 39:  //right arrow key
        var moveOutWidth = document.body.clientWidth * 1.5;
        var cards = document.querySelectorAll(".slider-card:not(.removed)");

        if (!cards.length) return false;

        var card = cards[0];

        card.classList.add("removed");
        card.style.transform =
          "translate(" + moveOutWidth + "px, -100px) rotate(-30deg)";
        sliderContainer.classList.toggle("slider-nope", event.deltaX < 0);
        initCards();
        //POST handling
        likeAttraction(allCards[i].dataset.aid, 1);

        event.preventDefault();
        break;
    }
  };

  hammertime.on("panend", function (event) {  //handle swiping by using a touch interface or a cursor
    el.classList.remove("moving");
    sliderContainer.classList.remove("slider-love");
    sliderContainer.classList.remove("slider-nope");

    var moveOutWidth = document.body.clientWidth;
    var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

    event.target.classList.toggle("removed", !keep);

    if (keep) {
      event.target.style.transform = "";  //bring the card back to its initial position
    } else {  //moving the card off the screen
      var endX = Math.max(
        Math.abs(event.velocityX) * moveOutWidth,
        moveOutWidth
      );
      var toX = event.deltaX > 0 ? endX : -endX;
      var endY = Math.abs(event.velocityY) * moveOutWidth;
      var toY = event.deltaY > 0 ? endY : -endY;
      var xMulti = event.deltaX * 0.03;
      var yMulti = event.deltaY / 80;
      var rotate = xMulti * yMulti;

      event.target.style.transform =
        "translate(" +
        toX +
        "px, " +
        (toY + event.deltaY) +
        "px) rotate(" +
        rotate +
        "deg)";
      initCards();
      //POST handling
      likeAttraction(allCards[i].dataset.aid, toX < 0 ? 0 : 1);
    }
  });
});

function createButtonListener(love) { //handling buttons behaviour
  return function (event) {
    var moveOutWidth = document.body.clientWidth * 1.5;
    var cards = document.querySelectorAll(".slider-card:not(.removed)");

    if (!cards.length) return false;

    var card = cards[0];

    card.classList.add("removed");

    if (love) {
      card.style.transform =
        "translate(" + moveOutWidth + "px, -100px) rotate(-30deg)";
      //POST handling
      likeAttraction(allCards[i].dataset.aid, 1);
    } else {
      card.style.transform =
        "translate(-" + moveOutWidth + "px, -100px) rotate(30deg)";
      //POST handling
      likeAttraction(allCards[i].dataset.aid, 0);
    }

    initCards();

    event.preventDefault();
  };
}

const likeAttraction = async (attraction, liked) => { //POST request function
  try {
    const url = `http://danu7.it.nuigalway.ie:8611/user/attractions/`;
    const currUser = document.querySelector(".slider-cards").dataset.uid;
    const res = await axios({
      method: "POST",
      url,
      data: {
        currUser,
        attraction,
        liked,
      },
    });
    i++;
    // if (res.data.status === "success") {

    // }
    if (allCards[i] == null) {
    	var cardsDiv = document.querySelector(".slider-cards");
    	cardsDiv.innerHTML += "<div style=\"position: absolute; bottom: 350px;\"><h1 style=\"font-size: 2rem;\">You swiped through all of our attractions for this city, would you like to take a look at your list?</h1><a class=\"genric-btn primary circle\" href=\"http://danu7.it.nuigalway.ie:8611/list/choose\">Open your list</a></div>";
    }
  } catch (err) {
    showAlert(err.response.data.message);
  }
};

var nopeListener = createButtonListener(false);
var loveListener = createButtonListener(true);

if(nope && love){
  nope.addEventListener("click", nopeListener);
  love.addEventListener("click", loveListener);
}
