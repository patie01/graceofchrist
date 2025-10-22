let map;
let userMarker;
let directionsService;
let directionsRenderer;
// Single source of truth for the church coordinates
const CHURCH_LOCATION = { lat: -33.945, lng: 25.607 };

function initMap() {
    try {
        // Initialize Google Maps services
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer();
        
        map = new google.maps.Map(document.getElementById("map"), {
            center: CHURCH_LOCATION,
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
            position: CHURCH_LOCATION,
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
                    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
                      <button onclick="getDirections()" style="padding:8px 12px; cursor:pointer;">Use My Location</button>
                      <a href="https://www.google.com/maps/dir/?api=1&destination=-33.945,25.607" target="_blank" style="padding:8px 12px; background:#f1c40f; color:#001f3f; text-decoration:none; border-radius:4px; font-weight:600;">Open in Google Maps</a>
                      <button onclick="copyChurchCoords()" style="padding:8px 12px; cursor:pointer;">Copy GPS</button>
                    </div>
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
                if (location.protocol === 'file:') {
                    alert('To use GPS, please open this site via http://localhost or https:// (not file://).');
                    return;
                }
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
                        calculateAndDisplayRoute(userLocation, CHURCH_LOCATION);
                        
                        // Fit bounds to show both markers
                        const bounds = new google.maps.LatLngBounds();
                        bounds.extend(userLocation);
                        bounds.extend(CHURCH_LOCATION);
                        map.fitBounds(bounds);
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        alert("Unable to get your location. Please ensure location services are enabled in your browser.");
                    }
                , { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
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
                const infoEl = document.getElementById('route-info');
                if (infoEl) {
                    infoEl.innerHTML = `<strong>Route:</strong> ${distance} • ${duration}`;
                } else {
                    alert(`Distance: ${distance}\nEstimated travel time: ${duration}`);
                }
            } else {
                console.error("Directions request failed:", status);
                const infoEl = document.getElementById('route-info');
                if (infoEl) {
                    infoEl.textContent = "Could not calculate directions. Please try again.";
                } else {
                    alert("Could not calculate directions. Please try again.");
                }
            }
        }
    );
}

function getDirections() {
    if (navigator.geolocation) {
        if (location.protocol === 'file:') {
            // Fallback: open maps without current location when not in secure context
            openGoogleMaps();
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                calculateAndDisplayRoute(userLocation, CHURCH_LOCATION);
            },
            () => {
                alert("Unable to get your location. Opening directions in Google Maps instead.");
                openGoogleMaps();
            }
        );
    } else {
        alert("Location services are not supported by your browser. Opening Google Maps.");
        openGoogleMaps();
    }
}

// Open external Google Maps with destination only (no geolocation required)
function openGoogleMaps() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${CHURCH_LOCATION.lat},${CHURCH_LOCATION.lng}`;
    window.open(url, '_blank');
}

// Copy church coordinates to clipboard
function copyChurchCoords() {
    const text = `${CHURCH_LOCATION.lat}, ${CHURCH_LOCATION.lng}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => alert('Church GPS copied to clipboard'))
            .catch(() => alert(text));
    } else {
        // Fallback
        alert(text);
    }
}

// Expose for InfoWindow inline handlers
window.getDirections = getDirections;
window.openGoogleMaps = openGoogleMaps;
window.copyChurchCoords = copyChurchCoords;

// Handle authentication failures
window.gm_authFailure = () => {
    document.getElementById("map").innerHTML = 
        "<p style='color: red; padding: 20px;'>Google Maps authentication failed. Please check the API key.</p>";
};

