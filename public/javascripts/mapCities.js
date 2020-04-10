const locations = JSON.parse(document.getElementById('map').dataset.locations);//locations of the attractions
const cityCenter = JSON.parse(document.getElementById('map').dataset.center);//city center coordinates
//mapbox accesstoken
mapboxgl.accessToken =
  'pk.eyJ1IjoiY2lhbmdpYmJvbnMiLCJhIjoiY2s4N3BtaW9wMDBkdTNucGY5djdqeG5naSJ9.SVN_9cEd0fP98y7iy5INOg';
//create map
var map = new mapboxgl.Map({
  container: 'map',//use div called map
  style: 'mapbox://styles/mapbox/streets-v11',// use style streets
  //scrollZoom: false,
  center: cityCenter.coordinates, //center on city coords
  zoom: 4, // start at zoom 4
  maxZoom: 12 // max zoom 12
});

const bounds = new mapboxgl.LngLatBounds(); //create bounds

locations.forEach(loc => {//for each location in locations
  //create marker div
  const el = document.createElement('div');
  //add marker class to the div
  el.className = 'marker';

  new mapboxgl.Marker({//create the marker
    element: el,//use the el div
    anchor: 'bottom'//anchor the image to bottom i.e. the coordinates are properly represented at the bottom of the div rather than the center
  })
    .setLngLat(loc.location.coordinates)// set the coordinates of the marker
    .addTo(map);//add the marker to the map

  //   //add popup
  //   var popup = new mapboxgl.Popup({
  //     offset: 30
  //   })
  //     .setLngLat(loc.location.coordinates)
  //     .setHTML(`<p>${loc.name}</p>`)
  //     .addTo(map);

  map.on('mouseenter', locations, function() {//set the cursor to be a pointer when you enter the div of the marker
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', locations, function() {//set the cursor back to normal when you leave the div of the marker
    map.getCanvas().style.cursor = '';
  });

  bounds.extend(loc.location.coordinates);//extend the bounds the include the locations coordinates
});
map.fitBounds(bounds, { //fit the map to the bounds and add padding
  padding: {
    top: 20,
    bottom: 5,
    left: 0,
    right: 0
  }
});
