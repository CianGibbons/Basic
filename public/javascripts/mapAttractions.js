/* eslint-disable */
const loc = JSON.parse(document.getElementById('map').dataset.location); //location of the attraction
const locName = document.getElementById('map').dataset.name;//name of the location(attraction)
//mapbox access token
mapboxgl.accessToken =
  'pk.eyJ1IjoiY2lhbmdpYmJvbnMiLCJhIjoiY2s4N3BtaW9wMDBkdTNucGY5djdqeG5naSJ9.SVN_9cEd0fP98y7iy5INOg';

//create the map
var map = new mapboxgl.Map({
  container: 'map',//using the div called map
  style: 'mapbox://styles/mapbox/streets-v11',//using the streets version 11 styling of map
  scrollZoom: false,//dont allow scroll zoom
  center: loc.coordinates, //center on the coordinates of the location
  zoom: 8, // zoom starts at 8
  maxZoom: 13 // max zoom of 13
});

const bounds = new mapboxgl.LngLatBounds(); //create the bounds
//create marker div
const el = document.createElement('div');
//add marker class to the div
el.className = 'marker';
//create marker
new mapboxgl.Marker({
  element: el,//use the div el
  anchor: 'bottom'//this makes it so the bottom of the div is where the coordinates are, rather than the center
})
  .setLngLat(loc.coordinates)// set the location of the marker
  .addTo(map);// add the marker to the map
// //add popup if wanted
// new mapboxgl.Popup({
//   offset: 30
// })
//   .setLngLat(loc.coordinates)
//   .setHTML(`<p>${locName}</p>`)
//   .addTo(map);
bounds.extend(loc.coordinates); // extend the bounds to include the locations coordinates (it should include it anways as the center is the same coordinates)

map.fitBounds(bounds, { //fit the map to the bounds and add some padding
  padding: {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100
  }
});
