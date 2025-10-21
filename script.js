let map;
let userMarker;
let directionsService;
let directionsRenderer;

function initMap() {
    // Church coordinates
    const churchLocation = { lat: -33.945, lng: 25.607 };
    
    try {
        // Initialize Google Maps services
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer();
        
        map = new google.maps.Map(document.getElementById("map"), {
            center: churchLocation,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            zoomControl: true,
            streetViewControl: true
        });

        // Set up directions renderer
        directionsRenderer.setMap(map);

        // Create church marker
        const churchMarker = new google.maps.Marker({
            position: churchLocation,
            map: map,
            title: "Grace of Christ Global Church",
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }
        });

        // Add info window for the church
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3>Grace of Christ Global Church</h3>
                    <p>4 Swartkops Street, North End<br>Port Elizabeth, South Africa</p>
                    <button onclick="getDirections()" style="padding: 8px; margin-top: 8px; cursor: pointer;">Get Directions</button>
                </div>`
        });

        // Show info window when marker is clicked
        churchMarker.addListener("click", () => {
            infoWindow.open(map, churchMarker);
        });

        // Add location button
        const locationButton = document.createElement("button");
        locationButton.textContent = "📍 Find My Location";
        locationButton.classList.add("custom-map-button");
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locationButton);

        // Add click event for location button
        locationButton.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        // Remove previous user marker if it exists
                        if (userMarker) {
                            userMarker.setMap(null);
                        }

                        // Add user's location marker
                        userMarker = new google.maps.Marker({
                            position: userLocation,
                            map: map,
                            title: "Your Location",
                            icon: {
                                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                            }
                        });

                        // Calculate and display route
                        calculateAndDisplayRoute(userLocation, churchLocation);
                        
                        // Fit bounds to show both markers
                        const bounds = new google.maps.LatLngBounds();
                        bounds.extend(userLocation);
                        bounds.extend(churchLocation);
                        map.fitBounds(bounds);
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        alert("Unable to get your location. Please ensure location services are enabled in your browser.");
                    }
                );
            } else {
                alert("Location services are not supported by your browser.");
            }
        });

    } catch (error) {
        console.error("Map initialization error:", error);
        document.getElementById("map").innerHTML = 
            "<p style='color: red; padding: 20px;'>Unable to load the map. Please refresh the page.</p>";
    }
}

function calculateAndDisplayRoute(start, end) {
    directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
                // Show distance and duration
                const route = response.routes[0];
                const distance = route.legs[0].distance.text;
                const duration = route.legs[0].duration.text;
                alert(`Distance: ${distance}\nEstimated travel time: ${duration}`);
            } else {
                console.error("Directions request failed:", status);
                alert("Could not calculate directions. Please try again.");
            }
        }
    );
}

function getDirections() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const churchLocation = { lat: -33.945, lng: 25.607 };
                calculateAndDisplayRoute(userLocation, churchLocation);
            },
            () => {
                alert("Unable to get your location. Please ensure location services are enabled.");
            }
        );
    } else {
        alert("Location services are not supported by your browser.");
    }
}

// Handle authentication failures
window.gm_authFailure = () => {
    document.getElementById("map").innerHTML = 
        "<p style='color: red; padding: 20px;'>Google Maps authentication failed. Please check the API key.</p>";
};

