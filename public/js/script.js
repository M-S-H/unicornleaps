var app = new Vue({
  el: '#unicornmap',

  data: {
    map: null,
    directionsDisplay: null,
    directionsService: null,
    transitType: "WALKING",
    origin: null,
    originMarker: null,
    destination: null,
    destinationMarker: null,
    line: null,
    travelDistance: '',
    travelTime: ''
  },

  mounted: function() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: {lat: 35.0853, lng: -106.6056},
      disableDefaultUI: true
    });

    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;

    this.directionsDisplay.setMap(this.map);

    this.map.addListener('click', this.addMarker)
  },

  computed: {
    instructions: function() {
      if (!this.origin) {
        return "Click To Select Origin"
      } else if (!this.destination) {
        return "Click To Select Destination"
      }
    }
  },

  watch: {
    transitType: function() {
      if (this.origin && this.destination) {
        this.displayRoute()
      }
    }
  },

  methods: {
    displayRoute() {
      console.log("JKJJL")
      if (this.transitType == "UNICORN") {
        app.originMarker.setMap(this.map)
        app.destinationMarker.setMap(this.map)

        // add line 
        app.line = new google.maps.Polyline({
          path: [app.origin, app.destination],
          geodesic: true,
          strokeColor: '#d857e0',
          strokeOpacity: 1.0,
          strokeWeight: 4
        });

        app.directionsDisplay.setMap(null);

        app.line.setMap(app.map)

        distance = google.maps.geometry.spherical.computeDistanceBetween(this.origin, this.destination) * 0.000621371 * 2;
        distance = Number(Math.round(distance+'e2')+'e-2');
        time = distance * 14 / 60
        time = Number(Math.round(time+'e2')+'e-2');
        this.travelDistance = distance + " leaps"
        this.travelTime = time + " minutes"
      } else {
        this.directionsService.route({
          origin: this.origin,
          destination: this.destination,
          travelMode: google.maps.TravelMode[this.transitType]
        }, function(response, status) {
          if (status == 'OK') {
            // Remove original markers
            app.originMarker.setMap(null)
            app.destinationMarker.setMap(null)

            var service = new google.maps.DistanceMatrixService();

            service.getDistanceMatrix({
              origins: [app.origin],
              destinations: [app.destination],
              travelMode: app.transitType,
              unitSystem: google.maps.UnitSystem.IMPERIAL
            }, function(r) {
              console.log(r)
              app.travelDistance = r.rows[0].elements[0].distance.text
              app.travelTime = r.rows[0].elements[0].duration.text
            })

            if (app.line) {
              app.line.setMap(null)
            }

            app.directionsDisplay.setMap(app.map)
            app.directionsDisplay.setDirections(response);
          } else {
            window.alert('SAD DAYYYYYYY!!!')
          }
        })
      }
    },

    addMarker(event) {
      if (!this.origin) {
        this.originMarker = new google.maps.Marker({position: event.latLng, map: this.map})
        this.origin = event.latLng
      } else if (!this.destination) {
        this.destinationMarker = new google.maps.Marker({position: event.latLng, map: this.map})
        this.destination = event.latLng

        this.displayRoute()
      }
    },

    reset() {
      this.directionsDisplay.setMap(null)
      this.originMarker.setMap(null)
      this.destinationMarker.setMap(null)
      if (this.line) {
        this.line.setMap(null)
      }

      this.origin = null
      this.destination = null
      this.travelDistance = ''
    }
  }
})