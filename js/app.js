// Model with the locations and categories
var NeighborhoodMapModel = function() {
    var self = this;
    self.locations = ko.observableArray(locations);
    self.categories = ko.observableArray(categories);
};

// ViewModel with the filters and population of markers
var NeighborhoodMapViewModel = function(map) {
    var self = this;

    // KO Observables
    self.neighborhood_map_model = ko.observable(new NeighborhoodMapModel());
    self.filter = ko.observable('');
    self.categoryfilter = ko.observable('');

    self.panoData = ko.observable();
    self.fsqrData = ko.observable();
    self.yelpData = ko.observable();
    self.panoVisible = ko.observable(true);
    self.fsqrVisible = ko.observable(false);
    self.yelpVisible = ko.observable(false);

    // Infowindow creation
    var iwcontent = '<div id="iw"' +
        'data-bind="template: {' +
            'name: \'iw-template\',' +
            'pano: panoData, fsqr: fsqrData, yelp: yelpData' +
        '}"></div>';
    self.infoWindow = createNewInfoWindow(iwcontent);

    var isInfoWindowLoaded = false;
    google.maps.event.addListener(self.infoWindow, 'domready', function () {
        if (!isInfoWindowLoaded) {
            ko.applyBindings(self, $("#iw")[0]);
            isInfoWindowLoaded = true;
        }
    });

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
            if (self.categoryfilter()) {
                var categoryString = self.categoryfilter().toLowerCase();
                remaining = ko.utils.arrayFilter(
                    self.neighborhood_map_model().locations(), function (loc) {
                    return loc.category.toLowerCase().indexOf(categoryString) >= 0;
                });
                showOnlyFilteredMarkers(remaining);
                return remaining;
            } else {
                if (markers.length !== 0) {
                    showOnlyFilteredMarkers(
                        self.neighborhood_map_model().locations());
                }
                return self.neighborhood_map_model().locations();
            }
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
            if (markers.length !== 0) {
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
        var id = data.id;
        var marker = markers[id];
        populateInfoWindow(marker);
        handleAnimation(marker);
        $('.cd-nav-trigger').trigger('click');
    };

    // This handles the click of a particular category
    self.handleCategoryClick = function(data) {
        self.filter('');
        self.categoryfilter(data.id);
        closeInfoWindow(self.infoWindow, map);
        map.fitBounds(bounds);
        $('.cd-nav-trigger').trigger('click');
    };

    // This resets the map by clearing and reinitializing the map with bounds
    self.resetMap = function() {
        self.categoryfilter('');
        self.filter('');
        closeInfoWindow(self.infoWindow, map);
        for (var i = markers.length - 1; i >= 0; i--) {
            markers[i].setAnimation();
        }
        map.fitBounds(bounds);
    };

    self.popoulateMap(map);
    map.fitBounds(bounds);
};
