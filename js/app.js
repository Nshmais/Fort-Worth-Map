// Create a global variable for map
var map;
// Create a new blank array for all the markers.
var markers = [];

// start locations for markers
// create an empty Location function
var Location = function(data, index){
    this.itemIndex = index;
    this.title = data.title;
    this.location = data.location;
    this.about = data.about;
    this.address = data.address;
};

var ViewModel = function(){
    var self=this;
    // creat a locationList array to loop all the data and map Location function
    this.locationList = ko.observableArray([]);
    locations.forEach(function(locationItem, index){
        self.locationList.push(new Location(locationItem, index));
    });
    this.CurrentLocation = ko.observable(self.locationList()[0]);
    // display a cliked landmark
    this.setLandmark=function(index){
        self.CurrentLocation(self.locationList()[index]);
    };

    this.city = ko.observable('');
    this.temp = ko.observable('');
    this.sky = ko.observable('');


    this.getWeather= function() {
    // yahoo api for weather
    var URL= 'https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + self.city() + '")&format=json'
    $.get(URL, function (data) {
        /* Check that a place was found (we'll just grab the first) */
        if (data.query.results === null) {
            console.log("Location not found: " + self.city() + "!");
        } else{
            // get temprature and sky conditions from API results
            self.temp(data.query.results.channel.item.condition.temp);
            self.sky(data.query.results.channel.item.condition.text);
        }
    })
    // error handling method for Ajax request
    .fail(function() {
        alert( "Error, please check your Ajax request (Yahoo Weather API)" );
    });
}


    // Create Search for Sidenav
    this.placeQuery = ko.observable('');

    this.searchResults = ko.computed(function() {
        var q = self.placeQuery();
        hideLandmarks();

        var resultList = self.locationList().filter(function(i) {
            var index = i.title.toLowerCase().indexOf(q);
            return index >= 0;
        });
        resultList.forEach(function(item){
            if (markers[item.itemIndex])
                markers[item.itemIndex].setVisible(true);
        });
        return resultList;
    });
};

ko.applyBindings(new ViewModel());



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
        temp:'',
        sky:'',
        draggable: true,
        address: address,
        website: website,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        // this will display all markers by default as when load the page
        map:map,
        id: i
      });

      // get the weather API for each marker from position(lat, long)
      markerWeather(locations[i].location.lat, locations[i].location.lng, marker);
      // Push the marker to our array of markers.
      markers.push(marker);
    }

    markers.forEach(function(marker){
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
    });
}

function markerWeather(lat, lng, marker) {
    var URL= 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="('+lat+', '+lng+')")&format=json'
    $.get(URL, function (data) {
        /* Check that a place was found (we'll just grab the first) */
        if (data.query.results === null) {
            console.log("no Location was found in this: lat"+lat+" and long"+lng+"!");
        } else{
            marker.temp = data.query.results.channel.item.condition.temp;
            marker.sky = data.query.results.channel.item.condition.text;
        }
    })
    // error handling method for Ajax request
    .fail(function() {
        alert( "Error, please check your Ajax request (Yahoo Weather API)" );
    });
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        //when click on the marker it will start bouncing
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //Bounce the marker 5 bounces
        setTimeout(function(){
            marker.setAnimation(null);
            // multiple the desired number of bounces by 700ms (it take the marker 700ms for each bounce)
        },3*700);

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
       var getStreetView = function(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            // html for marker pop up infowindow
            infowindow.setContent('<div>' + marker.title + '</div><div>Temperature: ' + marker.temp + '°F</div><div>Weather: ' + marker.sky + '</div><a target="_blank" href="https://'+ marker.website + '">' + marker.website + '</a><div>' + marker.address + '</div><div id="pano"></div>');
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
      };
      // Use streetview service to get the closest streetview image within
      // 100 meters radius of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }
}


// This function will loop through the markers array and display them all.
function showLandmarks() {
  for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(true);
    }
}

// This function will loop through the markers and hide them all.
function hideLandmarks() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
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
        //Bounce the marker 5 bounces
        setTimeout(function(){
            marker.setAnimation(null);
            // multiple the desired number of bounces by 700ms (it take the marker 700ms for each bounce)
        },5*700);
    }
}

//In case of error a message is displayed notifying the user that the data can't be loaded from Google API
function ErrorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection or your API link and try again later.");
}


