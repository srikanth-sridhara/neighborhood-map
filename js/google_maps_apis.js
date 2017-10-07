markers = [];
var infoWindow;
var map;
var bounds;

// Get fontawesome icon to use as marker image
function getIcon(type) {
    switch(type) {
        case fontawesome.markers.TREE:
            color = 'green';
            break;
        case fontawesome.markers.COFFEE:
            color = 'brown';
            break;
        case fontawesome.markers.CAR:
            color = 'red';
            break;
        default:
            color = '#f8ae5f';
    }
    return {
        path: type,
        scale: 0.3,
        strokeWeight: 1,
        strokeColor: 'black',
        strokeOpacity: 1,
        fillColor: color,
        fillOpacity: 0.9
    };
}

// fontawesome icons used
var icons = {
    food: getIcon(fontawesome.markers.CUTLERY),
    cafe: getIcon(fontawesome.markers.COFFEE),
    park: getIcon(fontawesome.markers.TREE),
    fuel: getIcon(fontawesome.markers.CAR),
};

// Main function to initialize the map
function initMap() {
    var center = {lat: 37.397216, lng: -122.081917};
    var mapId = document.getElementById('map');
    var mapOptions = {
        zoom: 13,
        center: center
    };
    map = new google.maps.Map(mapId, mapOptions);
    bounds = new google.maps.LatLngBounds();
    infoWindow = createNewInfoWindow();
    map.addListener('click', function() {
        closeInfoWindow(infoWindow, map);
        for (var i = markers.length - 1; i >= 0; i--) {
            markers[i].setAnimation();
        };
        $("#yelp").LoadingOverlay("hide");
        $("#fsqr").LoadingOverlay("hide");
    });

    ko.applyBindings(new NeighborhoodMapViewModel(map));
}

// ******* Marker functions *******
function createNewMarker(map, position, type, content, streetview, title) {
    bounds.extend(position);
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: icons[type],
        id: (markers.length+1).toString(),
        markerType: type,
        heading: streetview.heading,
        pitch: streetview.pitch,
        zoom: streetview.zoom,
        title: title,
        optimized: false

    });
    markers.push(marker);
    marker.addListener('click', function() {
        populateInfoWindow(this, infoWindow);
        handleAnimation(this);
    });
    return marker;
}

function showOnlyFilteredMarkers(remainingLocations) {
    for (var i = 0; i < markers.length; i++) {
        clearMarker(markers[i]);
    }
    for (var i = 0; i < remainingLocations.length; i++) {
        markerId = remainingLocations[i].id;
        setMarkerOnMap(map, markers[markerId]);
    }
}

function clearMarker(marker) {
    marker.setMap(null);
}

function setMarkerOnMap(map, marker) {
    marker.setMap(map);
}

function handleAnimation(currentMarker) {
    for (var i = markers.length - 1; i >= 0; i--) {
        markers[i].setAnimation();
        if(markers[i].id === currentMarker.id) {
            currentMarker.setAnimation(google.maps.Animation.BOUNCE);
        }
    };
}
// ******* Marker functions end *******


// ******* InfoWindow functions *******
function populateInfoWindow(marker, infowindow) {
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
    });

    content = '<div id="infoWindow"><div id="buttonHolder">';
    content +='<button id="StreetViewButton">Street View</button>';
    content +='<button id="InformationButton">More Information</button></div>';
    content +='<div id="pano"></div>';
    content +='<div id="fsqr" class="iw-shadow"></div>';
    content +='<div id="yelp" class="iw-shadow"></div></div>';

    infowindow.setContent(content);
    infowindow.open(map, marker);

    // Populate with ajax
    addStreetView(marker);
    populateFourSquareContent(marker);
    populateYelpContent(marker);

    // Add click listeners
    $('#map').on('click', '#InformationButton', showOnlyInfo);
    $('#map').on('click', '#StreetViewButton', showOnlyPano);
    showOnlyPano();
}

function createNewInfoWindow(contentString) {
    return new google.maps.InfoWindow({
        content: contentString,
    });
}

function closeInfoWindow(infoWindow, map, marker) {
    infoWindow.close(map, marker);
}
// ******* InfoWindow functions end *******


// ******* Ajax functions for 3rd party APIs *******
function addStreetView(marker) {
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                    heading: marker.heading,
                    pitch: marker.pitch
                },
                zoom: marker.zoom
            };
            var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
        } else {
            var content = '<h2>Unable to load Street View</h2>';
            $('#pano').html(content);
        }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(
        marker.position,
        radius,
        getStreetView);
}

function populateYelpContent(marker){
    var ACCESS_TOKEN = 'j6EO2Yf4QPevzrtLGDRqlf7-XTUlNCDVnGdGYqdTbwuwYfRMFrR8kybTKDNp61FGFF4mJPkBI3rFGYB3cuemEZmS5t5AzAY5wgjyHhKmiuR7dMqKAvX0kOzBaHnUWXYx';
    var cors_anywhere_url = 'https://cors-anywhere.herokuapp.com/';
    $("#yelp").LoadingOverlay("show", {zIndex: 0});
    $.ajax({
        url: cors_anywhere_url + 'https://api.yelp.com/v3/businesses/search',
        method: "GET",
        data: {
            latitude: marker.position.lat(),
            longitude: marker.position.lng(),
            term: marker.title,
        },
        headers: {"Authorization": "Bearer " + ACCESS_TOKEN},
        success: function(response) {
            var responseObj = response['businesses'][0];
            var name = responseObj['name'];
            var url = responseObj['url'];
            var rating = responseObj['rating'];
            var review_count = responseObj['review_count'];
            var yelpimg = 'img/yelp_assets/Yelp_trademark_RGB_outline.png';
            var content = '<p><a target="_blank" href="' + url + '">';
            content += '<img src="' + yelpimg + '" width="100px"/></a></p>';
            content += '<img src="' + getRatingImage(rating) + '" />';
            content += '<p>Based on ' + review_count + ' Reviews</p>';
            $('#yelp').html(content);
            $("#yelp").LoadingOverlay("hide");
            clearTimeout(yelpRequestTimeout);
        }
    });
    var yelpRequestTimeout = setTimeout(function() {
        $('#yelp').html("<h2>!! Failed to load yelp resources !!</h2>");
        $("#yelp").LoadingOverlay("hide");
    }, 15000);
}

function populateFourSquareContent(marker) {
    var date = getDateInFormat();
    latLong = marker.position.lat() + ',' + marker.position.lng();
    itemName = marker.title;
    $("#fsqr").LoadingOverlay("show", {zIndex: 0});
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        cache: false,
        data: {
            ll: latLong,
            client_id: 'I54UPQWRIQJ3ZJJWOVK5ZK5M2KBZQNUV4GXZ1G1YFOZTLA2V',
            client_secret: 'QQOG2TX0HGAW4X33D0G1EDL0OMKWTLPAD1EL1EC1BURSOU2B',
            v: date,
            query: itemName,
        },
        success: function(response) {
            var data = response['response']['venues'][0];
            var fsqrimg = 'img/foursquare_assets/Foursquare-black-600.png';
            var fsqr = 'https://foursquare.com';
            name = data['name'];
            url = data['url'];
            address = (data['location']['formattedAddress']).join('<br>');
            var content = '<a href="' + fsqr + '" target="_blank">';
            content += '<img id="fsq" src="' + fsqrimg + '" /></a>';
            content += '<p class="iw-title">' + name + '</p>';
            if (typeof url != 'undefined') {
                content += '<p>URL: <a target="_blank" ';
                content += 'href="' + url + '">' + url + '</a></p>';
            } else {
                content += '<p>URL: No URL available</p>';
            }
            content += '<p>Address:</p><address>' + address + '</address>';
            $('#fsqr').html(content);
            $("#fsqr").LoadingOverlay("hide");
            clearTimeout(fsqRequestTimeout);
        }
    });
    var fsqRequestTimeout = setTimeout(function() {
        $('#fsqr').html("<h2>!! Failed to load foursquare resources !!</h2>");
        $("#fsqr").LoadingOverlay("hide");
    }, 15000);
}

function showOnlyPano() {
    $( "#pano" ).show();
    $( "#yelp" ).hide();
    $( "#fsqr" ).hide();
}

function showOnlyInfo() {
    $( "#fsqr" ).show();
    $( "#yelp" ).show();
    $( "#pano" ).hide();
}

// ******* Utility functions *******
// Get the path of the image corresponding to the yelp rating
function getRatingImage(rating){
    var size = 'large';
    var base_url = 'img/yelp_assets/' + size + '_';
    if (rating < '1') {
        return base_url + '0.png';
    } else if (rating < '1.5') {
        return base_url + '1.png';
    } else if (rating < '2') {
        return base_url + '1_half.png';
    } else if (rating < '2.5') {
        return base_url + '2.png';
    } else if (rating < '3') {
        return base_url + '2_half.png';
    } else if (rating < '3.5') {
        return base_url + '3.png';
    } else if (rating < '4') {
        return base_url + '3_half.png';
    } else if (rating < '4.5') {
        return base_url + '4.png';
    } else if (rating < '5') {
        return base_url + '4_half.png';
    } else {
        return base_url + '5.png';
    }
}

// Get a date in format YYYYMMDD
function getDateInFormat() {
    var d = new Date();
    date = '' + d.getFullYear()
        + ('0' + (d.getMonth() + 1)).slice(-2)
        + ('0' + d.getDate()).slice(-2);
    return date;
}

// Callback function in case google maps api fails
function googleMapsError() {
    $(".content-wrapper").html("<h1>Google Maps failed to load! Try to Refresh the page</h1>");
}
