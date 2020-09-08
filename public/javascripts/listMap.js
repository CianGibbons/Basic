const locations = JSON.parse(document.getElementById("map").dataset.locations); // of attractions on the users list
const cityCenter = JSON.parse(document.getElementById("map").dataset.center); //center of the city coordinates
const cityId = document.querySelector(".cityListTitle").dataset.cityid; //city id

//mapbox access token gotten from our account
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2lhbmdpYmJvbnMiLCJhIjoiY2s4N3BtaW9wMDBkdTNucGY5djdqeG5naSJ9.SVN_9cEd0fP98y7iy5INOg"; //mapbox access token

//create the map
var map = new mapboxgl.Map({
  container: "map", //container map refers to the div with the id map
  style: "mapbox://styles/mapbox/streets-v11", // defines the map style
  //scrollZoom: false,//stop the ability to zoom using scroll
  center: cityCenter.coordinates, //set the center to be the city's center
  zoom: 4, //sets the initial zoom to 4
  maxZoom: 12, // sets the max zoom to 12
});
let bounds; //declares bounds
if (locations.length != 0) {
  //if there are locations
  bounds = new mapboxgl.LngLatBounds(); //initialise the bounds

  locations.forEach((loc) => {
    //for each location
    //create marker
    const el = document.createElement("div");
    //add marker by setting the class name marker, attrPin-${loc._id} ensures every pin has a unique id if i want to remove them
    el.className = `marker attrPin-${loc._id}`;

    new mapboxgl.Marker({
      //creates the marker with the div we specified above
      element: el,
      anchor: "bottom", //this mean the bottom of the image will be the part pointing to the coordinates rather than the center of the image
    })
      .setLngLat(loc.location.coordinates) //set the coordinates of this new marker
      .addTo(map); //add the marker to the map

    //   //add popup if wanted
    //   var popup = new mapboxgl.Popup({
    //     offset: 30
    //   })
    //     .setLngLat(loc.location.coordinates)
    //     .setHTML(`<p>${loc.name}</p>`)
    //     .addTo(map);

    map.on("mouseenter", locations, function () {
      map.getCanvas().style.cursor = "pointer"; // change the cursor to a pointer when you hover over a location marker
    });
    map.on("mouseleave", locations, function () {
      //change the cursor back to normal when you stop hovering over the location marker
      map.getCanvas().style.cursor = "";
    });

    bounds.extend(loc.location.coordinates); // extend the bounds to include the new location
  });
  map.fitBounds(bounds, {
    //fit the map to the bounds and add some padding
    padding: {
      top: 20,
      bottom: 5,
      left: 0,
      right: 0,
    },
  });
}

const getDistances = async (coordinates, units, cityId) => {
  try {
    // hits the getDistances endpoint to get the distances from the given coordinates for this city
    const url = `127.0.0.1:8611/attractions/distance/${coordinates[1]},${coordinates[0]}/unit/${units}?cityId=${cityId}`;
    const res = await axios({
      // send request using axios
      method: "GET", //request type is GET
      url, //use the above url
    });
    if (res.data.status === "success") {
      //if the request is successful
      // display the distance title (ie. change the display from none to be block)
      document.getElementById("distanceTitle").style.display = "block";
      //set attractions to be the data.data from the result
      const attractions = res.data.data;
      let distance; //declare distance

      //for each attraction from this city
      attractions.forEach((attraction) => {
        distance = attraction.distance; //set the distance to be attraction.distance
        distance = Math.round(distance * 100) / 100; //round it to two decimal places
        document.getElementById(
          //get the attraction's distance display div by its unique id and set the innerHTML to the distance and set the display to be block rather than none
          `distance-attr-${attraction._id}`
        ).innerHTML = `<p>${distance} km</p>`;

        document.getElementById(
          `distance-attr-${attraction._id}`
        ).style.display = "block";
      });
    }
  } catch (err) {}
};

const addLocation = async (coordinates) => {
  //create div for the marker
  const el = document.createElement("div");
  //add marker
  el.className = `marker1`; //different marker class to the attractions to differentiate
  new mapboxgl.Marker({
    //create the marker using the div and anchor to the bottom
    element: el,
    anchor: "bottom",
  })
    .setLngLat(coordinates) //set the coordinates of the marker
    .addTo(map); //add the marker to the map
  if (bounds) {
    // if bounds exists
    bounds.extend(coordinates); //extend the bounds to include the new marker
    map.fitBounds(bounds, {
      //fit the map to the bounds and give it some padding
      padding: {
        top: 20,
        bottom: 5,
        left: 20,
        right: 20,
      },
    });
  }

  await getDistances(coordinates, "km", cityId); //get the distances from this location in kilometers for this cityId
};

//get the userLocation form by its class
const userLocation = document.querySelector(".userLocation");
if (userLocation) {
  // if userLocation exists add event listener to listen for the submission of the form
  userLocation.addEventListener("submit", async (e) => {
    e.preventDefault(); //if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    //set buttons text
    document.getElementById("button-add-location").textContent =
      "Submitting...";

    //get the inputted coordinates from the user
    const longitude = document.getElementById("longitude").value;
    const latitude = document.getElementById("latitude").value;
    const coordinates = [longitude, latitude];
    //add the new location to the map
    await addLocation(coordinates);
    //reset the buttons text
    document.getElementById("button-add-location").textContent = "Submit";
  });
}
