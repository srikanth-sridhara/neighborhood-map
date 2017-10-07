// Model with the locations and categories
var NeighborhoodMapModel = function() {
    var self = this;
    self.locations = ko.observableArray([
        {
            id: 0,
            latLong: {lat: 37.3989711, lng: -122.1089404},
            streetview: {heading: 55, pitch: 0, zoom: 2},
            locationType: 'food',
            category: 'food',
            locationContent: '',
            title: 'Veggie Garden',
        },
        {
            id: 1,
            latLong: {lat: 37.4165213, lng: -122.0790464},
            streetview: {heading: 216.35, pitch: 0, zoom: 3},
            locationType: 'food',
            category: 'food',
            locationContent: '',
            title: 'Zareen\'s Restaurant',
        },
        {
            id: 2,
            latLong: {lat: 37.399480, lng: -122.074415},
            streetview: {heading: 70, pitch: -2.5, zoom: 2},
            locationType: 'food',
            category: 'food',
            locationContent: '',
            title: 'Los Portales Restaurant',
        },
        {
            id: 3,
            latLong: {lat: 37.3712426, lng: -122.0442309},
            streetview: {heading: 15.84, pitch: 12.63, zoom: 1},
            locationType: 'food',
            category: 'food',
            locationContent: '',
            title: 'Thai Spoons Restaurant',
        },
        {
            id: 4,
            latLong: {lat: 37.4220028, lng: -122.0962444},
            streetview: {heading: 284.48, pitch: 0.48, zoom: 2},
            locationType: 'food',
            category: 'food',
            locationContent: '',
            title: 'Eric\'s DeliCafe',
        },
        {
            id: 5,
            latLong: {lat: 37.3816682, lng: -122.0636779},
            streetview: {heading: 47.41, pitch: 0, zoom: 0},
            locationType: 'park',
            category: 'park',
            locationContent: '',
            title: 'Sylvan Park',
        },
        {
            id: 6,
            latLong: {lat: 37.4334504, lng: -122.0885192},
            streetview: {heading: 87.51, pitch: 8.51, zoom: 0},
            locationType: 'park',
            category: 'park',
            locationContent: '',
            title: 'Shoreline Park',
        },
        {
            id: 7,
            latLong: {lat: 37.3722028, lng: -122.0811167},
            streetview: {heading: 52.89, pitch: 16, zoom: 0},
            locationType: 'park',
            category: 'park',
            locationContent: '',
            title: 'Cuesta Park',
        },
        {
            id: 8,
            latLong: {lat: 37.4216495, lng: -122.115109},
            streetview: {heading: 326.62, pitch: -6.75, zoom: 0},
            locationType: 'park',
            category: 'park',
            locationContent: '',
            title: 'Mitchell Park',
        },
        {
            id: 9,
            latLong: {lat: 37.389965, lng: -122.095290},
            streetview: {heading: 160, pitch: 0, zoom: 1.5},
            locationType: 'cafe',
            category: 'cafe',
            locationContent: '',
            title: 'Bagel Street Cafe',
        },
        {
            id: 10,
            latLong: {lat: 37.3936127, lng: -122.0788495},
            streetview: {heading: 236.07, pitch: 15.06, zoom: 0},
            locationType: 'cafe',
            category: 'cafe',
            locationContent: '',
            title: 'Red Rock Coffee',
        },
        {
            id: 11,
            latLong: {lat: 37.403563, lng: -122.0972871},
            streetview: {heading: 265.48, pitch: 1.46, zoom: 0},
            locationType: 'fuel',
            category: 'fuel',
            locationContent: '',
            title: 'Shell',
        },
        {
            id: 12,
            latLong: {lat: 37.406517, lng: -122.0783256},
            streetview: {heading: 358.51, pitch: 4.65, zoom: 1.8},
            locationType: 'fuel',
            category: 'fuel',
            locationContent: '',
            title: 'Chevron',
        },
        {
            id: 13,
            latLong: {lat: 37.4165048, lng: -122.1037412},
            streetview: {heading: 35.85, pitch: 4.52, zoom: 1},
            locationType: 'fuel',
            category: 'fuel',
            locationContent: '',
            title: 'Valero',
        },
        {
            id: 14,
            latLong: {lat: 37.3771601, lng: -122.1143203},
            streetview: {heading: 225, pitch: -4, zoom: 1.5},
            locationType: 'fuel',
            category: 'fuel',
            locationContent: '',
            title: '76',
        },

    ]);
    self.categories = ko.observableArray([
        {id: '', val: 'All'},
        {id: 'food', val: 'Restaurants'},
        {id: 'cafe', val: 'Coffee Shops'},
        {id: 'park', val: 'Parks'},
        {id: 'fuel', val: 'Gas Stations'}
    ]);
}

// ViewModel with the filters and population of markers
var NeighborhoodMapViewModel = function(map) {
    var self = this;

    // KO Observables
    self.neighborhood_map_model = ko.observable(new NeighborhoodMapModel());
    self.filter = ko.observable('');
    self.categoryfilter = ko.observable('');

    // Compute a list of filtered markers
    self.filteredLocations = ko.computed(function() {
        if (self.filter()) {
            var searchString = self.filter().toLowerCase();
            remaining = ko.utils.arrayFilter(
                self.neighborhood_map_model().locations(), function (loc) {
                return loc.title.toLowerCase().indexOf(searchString) >= 0;
            });
            showOnlyFilteredMarkers(remaining);
            return remaining;
        } else {
            if (markers.length != 0) {
                showOnlyFilteredMarkers(
                    self.neighborhood_map_model().locations());
            }
            return self.neighborhood_map_model().locations();
        }
    }, self);

    // Compute a list of markers for a particular category
    self.categoryLocations = ko.computed(function() {
        if (self.categoryfilter()) {
            var categoryString = self.categoryfilter().toLowerCase();
            remaining = ko.utils.arrayFilter(
                self.neighborhood_map_model().locations(), function (loc) {
                return loc.category.toLowerCase().indexOf(categoryString) >= 0;
            });
            showOnlyFilteredMarkers(remaining);
            return remaining;
        } else {
            if (markers.length != 0) {
                showOnlyFilteredMarkers(
                    self.neighborhood_map_model().locations());
            }
            return self.neighborhood_map_model().locations();
        }
    }, self);

    // This will populate the map initially with all the markers
    self.popoulateMap = function(map) {
        for (i = 0; i < self.neighborhood_map_model().locations().length; i++) {
            var location = self.neighborhood_map_model().locations()[i];
            var latLong = location.latLong;
            var locationContent = location.locationContent;
            var locationType = location.locationType;
            var locationStreetView = location.streetview;
            var title = location.title;
            var current_marker = createNewMarker(
                map, latLong, locationType, locationContent,
                locationStreetView, title
            );
        }
    };

    // This handles the click of a marker by populating the infowindow
    self.handleMarkerClick = function(data) {
        var id = data['id'];
        var marker = markers[id];
        self.categoryfilter('');
        populateInfoWindow(marker, infoWindow);
        handleAnimation(marker);
        $('.cd-nav-trigger').trigger('click');
    };

    // This handles the click of a particular category
    self.handleCategoryClick = function(data) {
        self.filter('');
        self.categoryfilter(data.id);
        closeInfoWindow(infoWindow, map);
        map.fitBounds(bounds);
        $('.cd-nav-trigger').trigger('click');
    };

    // This resets the map by clearing and reinitializing the map with bounds
    self.resetMap = function() {
        self.categoryfilter('');
        self.filter('');
        closeInfoWindow(infoWindow, map);
        for (var i = markers.length - 1; i >= 0; i--) {
            markers[i].setAnimation();
        };
        map.fitBounds(bounds);
    };

    self.popoulateMap(map);
    map.fitBounds(bounds);
};
