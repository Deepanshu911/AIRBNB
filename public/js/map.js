const locationName = window.listingLocation;

const url =
    "https://nominatim.openstreetmap.org/search?format=json&q=" +
    encodeURIComponent(locationName);

fetch(url)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {

        console.log("Location:", locationName);
        console.log("Geocoding result:", data);

        if (data.length === 0) {
            console.log("Location not found:", locationName);
            return;
        }

        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);

       const map = L.map("map", {
            scrollWheelZoom: false
        }).setView(
            [latitude, longitude],
            13
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors"
            }
        ).addTo(map);

        L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(
                "<b>" + window.listingTitle + "</b><br>" +
                locationName
            )
            .openPopup();
    })
    .catch(function (error) {
        console.error("Map error:", error);
    });