var locations = [
          {title: 'Water Gardens',
           about:'Built in 1974,designed by Phillip Johnson',
           address:'1502 Commerce St, Fort Worth, TX 76102',
           website:'https://www.fortworth.com/',
           location: {lat: 32.7477, lng: -97.3266}},

          {title: 'Stockyards Station',
           about:'140 E Exchange Ave, Fort Worth, TX 76164',
           address:'140 E Exchange Ave, Fort Worth, TX 76164',
           website:'http://stockyardsstation.com/',
           location: {lat: 32.7886, lng: -97.3462}},

          {title: 'Botanic Garden',
           about:'Home to more than 2,500 species of plants in its 23 specialty gardens',
           address:'3220 Botanic Garden Blvd, Fort Worth, TX 76107',
           website:'http://www.fwbg.org/',
           location: {lat: 32.7402, lng: -97.3639}},

          {title: 'Texas Christian University',
           about:'Established in 1873 by Addison & Randolph Clark as the AddRan Male & Female College',
           address:'2800 S University Dr, Fort Worth, TX 76129',
           website:'http://www.tcu.edu/',
           location: {lat: 32.7095, lng: -97.3628}},

          {title: 'Fort Worth Zoo',
           about:'The zoo now home to 5,000 native and exotic animals ',
           address:'1989 Colonial Pkwy, Fort Worth, TX 76110',
           website:'https://www.fortworthzoo.org/',
           location: {lat: 32.7230, lng: -97.3567}},

          {title: 'Kimbell Art Museum',
           about:'Hosts an art collection as well as traveling art exhibitions, educational programs and an extensive research library.',
           address:'3333 Camp Bowie Blvd, Fort Worth, TX 76107',
           website:'https://www.kimbellart.org/',
           location: {lat: 32.7486, lng: -97.3693}},

          {title: 'Museum of Science and History',
           about:'Provides hundreds of programs aimed at engaging children and families in learning',
           address:'1600 Gendy St, Fort Worth, TX 76107',
           website:'http://www.fwmuseum.org/',
           location: {lat: 32.7442, lng: -97.3693}}
        ];

var Location = function(data){
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.about = ko.observable(data.about);
    this.address = ko.observable(data.address);
}

var ViewModel = function(){
    var self=this;
    // creat a locationList array to loop all the data
    this.locationList = ko.observableArray([]);
    locations.forEach(function(locationItem){
        self.locationList.push(new Location(locationItem));
    })
    this.CurrentLocation = ko.observable(self.locationList()[0]);
// display a cliked landmark
    this.setLandmark=function(index){
        self.CurrentLocation(self.locationList()[index]);
    };
}

ko.applyBindings(new ViewModel());



// Create a global variable for map
var map;
// Create a new blank array for all the markers.
var markers = [];
// Create a styles array to use with the map.
var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#19a0d8' }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -40 }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 }
    ]
  }
];



      function initMap() {
        //creates a new map - only center and zoom are required stayle can be commented-out for defult style.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 32.768799, lng: -97.309341},
          zoom: 10,
          styles: styles
        });


        var largeInfowindow = new google.maps.InfoWindow();
        // Style the marker icon (input a color code).
        var defaultIcon = makeMarkerIcon('00FF00');
        //"highlight marker color for when mousesover the marker (input a color code).
        var highlightedIcon = makeMarkerIcon('0091ff');
        // loop over thelocations array to initialize markers.
        for (var i = 0; i < locations.length; i++) {
          // Get the position, title, adress, and website from the locations array to pop up infowindow.
          var position = locations[i].location;
          var title = locations[i].title;
          var address = locations[i].address;
          var website = locations[i].website;
          // Create a marker per location, and put into markers array.(all variables will show in infowindow)
          var marker = new google.maps.Marker({
            position: position,
            title: title,
            draggable: true,
            address: address,
            website: website,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth of the marker icon.
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
        }

        document.getElementById('show-Landmarks').addEventListener('click', showLandmarks);
        document.getElementById('hide-Landmarks').addEventListener('click', hideLandmarks);

      }


      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 100;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                // html for marker pop up infowindow
                infowindow.setContent('<div>' + marker.title + '</div><a target="_blank" href="' + marker.website + '">' + marker.website + '</a><div>' + marker.address + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 100 meters radius of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }

      // This function will loop through the markers array and display them all.
      function showLandmarks() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
      }

      // This function will loop through the markers and hide them all.
      function hideLandmarks() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      }

      // This function takes in a COLOR, and then creates a new marker
      // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).
      function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }


    //bounce the marker icon when click on its title
   function Bounce(index) {
    var marker = markers[index];
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      //toggleBounce the marker for 5 seconds
      setTimeout(function(){
      marker.setAnimation(null);
      },5000);
    }
  }
