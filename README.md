# Neighborhood Map Search.

Created by Srikanth Sridhara on 6th Oct 2017

This is a front end web app that displays markers of a few interesting locations on a map.
The locations are categorized into 4 groups: Restaurants, Parks, Cafe's and Gas Stations.
To display the map and the markers, [`Google Maps Apis`](https://developers.google.com/maps/) are used. The markers can also be accessed via a list view on the sidebar.

When a marker(or the list item) is clicked, we get 2 tabs: 'Street View' of the location and 'more information' about the location.
The street view uses [`Google Street View`](https://developers.google.com/maps/documentation/javascript/streetview) service to give a 360-degree panoramic view of the location.
The 'More information' section fetches data about the location using [`Yelp`](https://www.yelp.com/fusion) and [`Foursquare`](https://developer.foursquare.com/) APIs.

Since [`Yelp Fusion Api`](https://www.yelp.com/fusion) requires Oauth2 to get access token and does not allow CORS, a proxy server workaround is used. The original Yelp query is passed to a proxy server [`https://github.com/Rob--W/cors-anywhere/`](https://github.com/Rob--W/cors-anywhere/). This validates the request and forwards it to Yelp and relays the response back to the frontend.

[`Knockout.JS`](http://knockoutjs.com/) is used as the MVVM framework. The Model holds the location and category arrays. The ViewModel has the functionality to populate the DOM with the model and to handle filtering of data dynamically.

The filtering is of two types:
1. Text based filter: The user can type in search criteria and only the relevant markers are displayed.
2. Category filter: The user can select a particular category and only the markers in that category are displayed.

The `MapSearch` Logo on the top left doubles as a reset button. If the user has moved the map and wants to reset the view, the logo can be clicked to re-center the map and repopulate the markers as in the initial state. There is an `About` link which briefly describes the website features.

For Third party APIs like Yelp and Foursquare, care has been taken to ensure that before response data is received, there is a loading spinner that spins for upto 15 seconds before displaying a failed error message for that service. Each service is independently handled asynchronously.

## Important folders and files:

1. `index.html`:
    This is the main html file with all the stylesheets and scripts included.

2. `js/app.js`:
    This is the main MVVM file where knockout.js Model and ViewModel are used.

3. `js/google_maps_apis.js`:
    This file contains all the functions pertaining to google maps API including markers, infowindows, panoramas, etc along with ajax functions of third party APIs.

4. `js/sidebar.js`:
    This file is used to handle the sidebar and its responsiveness.

5. `js/lib/`:
    This folder contains libraries: [`knockoutjs`](http://knockoutjs.com/), [`fontawesome`](http://fontawesome.io/), [`modernizr`](https://modernizr.com/), [`loadingoverlay`](https://gasparesganga.com/labs/jquery-loading-overlay/).

6. `css/`:
    This folder contains the styling files reset.css and style.css.

7. `img/`:
    This folder contains the image assets used in the project and has Yelp and Foursquare images.


## Usage:

*  Open `index.html` in a browser.


## Code usage Credits:

1. For the sidebar design, [`responsive-sidebar-navigation`](https://codyhouse.co/gem/responsive-sidebar-navigation/) was used.

2. For the loading spinner,
[`loadingoverlay`](https://gasparesganga.com/labs/jquery-loading-overlay/) was used.

3. For the proxy server, [`CORS Anywhere`](https://github.com/Rob--W/cors-anywhere/) was used.

4. For Box Shadow CSS effect, [`CSS Tricks`](https://css-tricks.com/almanac/properties/b/box-shadow/) was used.
