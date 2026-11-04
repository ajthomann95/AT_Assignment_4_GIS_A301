// ======================================================
// PHOTO DATA
// Information about each photograph and its location
// ======================================================

const photos = [

    {
        title: "Blueberry Knoll",
        image: "Photos with data/Blueberry Knoll.jpeg",
        longitude: -149.6743,
        latitude: 61.0967,
        x: 355826.05,
        y: 6776504.67
    },

    {
        title: "Far North",
        image: "Photos with data/Far North.jpeg",
        longitude: -149.7697,        
        latitude: 61.1599,
        x: 350983.10,
        y: 6783753.89

    },

    {
        title: "Hillstrand Pond",
        image: "Photos with data/Hillstrand Pond.jpeg",
        longitude: -149.8423,
        latitude: 61.2003,
        x: 347274.34,
        y: 6788418.61
    },

    {
        title: "McHugh Creek",
        image: "Photos with data/McHugh Creek.jpeg",
        longitude: -149.7281,
        latitude: 61.0177,
        x: 352560.09,
        y: 6767830.26
    },

    {
        title: "Westchester Lagoon",
        image: "Photos with data/Westchester Lagoon.jpeg",
        longitude: -149.9235,
        latitude: 61.2081,
        x: 342952.07,
        y: 6789479.29
    }

];



// ======================================================
// CONNECT TO THE ARCGIS MAPS SDK
// ======================================================

const [Map, MapView, Graphic] = await $arcgis.import([
    "@arcgis/core/Map.js",
    "@arcgis/core/views/MapView.js",
    "@arcgis/core/Graphic.js"
]);



// ======================================================
// CREATE THE WEB MAP
// ======================================================

const map = new Map({

    basemap:"hybrid"
});



// ======================================================
// DISPLAY THE MAP ON THE WEBPAGE
// ======================================================

const view = new MapView({

    container: "map",

    map: map,

    center: [-149.8423, 61.1],

    zoom: 10

});



// ======================================================
// ADD PHOTO LOCATIONS TO THE MAP
// Each photograph is represented by a red point
// ======================================================

const gallery = document.getElementById("gallery");

function addPhotoLocation(photo, index) {
    const marker = new Graphic({
        geometry: {
            type: "point",
            longitude: photo.longitude,
            latitude: photo.latitude
        },
        symbol: {
            type: "picture-marker",
            url: "Photos with data/location-pin.png",
            width: "24px",
            height: "32px"
        },
        attributes: {
            photoIndex: index,
            title: photo.title
        }
    });

    view.graphics.add(marker);

    const image = document.createElement("img");
    image.src = photo.image;
    image.className = "thumbnail";
    image.onclick = function() {
        showPhoto(index);
    };
    gallery.appendChild(image);
}

photos.forEach(addPhotoLocation);



// ======================================================
// CREATE THE PHOTO GALLERY
// Display the photographs at the bottom of the webpage
// ======================================================

// ======================================================
// DISPLAY A SELECTED PHOTO
// Used when either a map location or thumbnail is selected
// ======================================================

function showPhoto(index) {

    const photo = photos[index];


    // Display the selected photograph
    document.getElementById("selected-photo").src =
        photo.image;


    // Display the name of the location
    document.getElementById("photo-title").textContent =
        photo.title;


    // Find all thumbnails
    const thumbnails =
        document.querySelectorAll(".thumbnail");


    // Remove the selected style from all thumbnails
    thumbnails.forEach(function(thumbnail) {

        thumbnail.classList.remove("selected");

    });


    // Highlight the selected thumbnail
    thumbnails[index].classList.add("selected");

}



// ======================================================
// RESPOND WHEN A PHOTO LOCATION IS CLICKED ON THE MAP
// ======================================================

view.on("click", async function(event) {

    // Look only for our red photo markers
    const response = await view.hitTest(event, {
        include: view.graphics
    });


    // Check whether a marker was clicked
    if (response.results.length > 0) {

        const result = response.results[0];

        // Get the photograph connected to the marker
        const index = result.graphic.attributes.photoIndex;

        // Display the photograph
        showPhoto(index);

    }

});


// ======================================================
// DISPLAY THE FIRST PHOTO WHEN THE APP OPENS
// ======================================================

showPhoto(0);

// ======================================================
// COLLAPSE AND EXPAND THE PHOTO GALLERY
// ======================================================

const gallerySection =
    document.getElementById("gallery-section");

const galleryToggle =
    document.getElementById("gallery-toggle");


galleryToggle.onclick = function() {

    gallerySection.classList.toggle("collapsed");

};

// ======================================================
// CALCULATE DISTANCE BETWEEN ANY TWO EXISTING LOCATIONS
// All X/Y values use WGS 84 / UTM zone 50N (EPSG:32650), meters.
// ======================================================

const point1Select = document.getElementById("point1");
const point2Select = document.getElementById("point2");

// Create dropdown options using our existing photo data.
photos.forEach(function(photo, index) {
    const option1 = document.createElement("option");
    option1.value = index;
    option1.textContent = photo.title;
    point1Select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = index;
    option2.textContent = photo.title;
    point2Select.appendChild(option2);
});

// Start with the stadium and museum selected.
point1Select.value = "0";
point2Select.value = "1";

document.getElementById("distance-btn").onclick = function() {
    const point1 = photos[Number(point1Select.value)];
    const point2 = photos[Number(point2Select.value)];

    if (point1 === point2) {
        document.getElementById("distance-result").textContent =
            "Please select two different locations.";
        return;
    }

    // Difference between UTM eastings (X) and northings (Y).
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;

    // Pythagorean theorem: straight-line planar distance in meters.
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    console.log(point1.title, "to", point2.title, distance.toFixed(2), "meters");

    document.getElementById("distance-result").textContent =
        "Distance: " + distance.toFixed(2) + " meters (" +
        (distance / 1000).toFixed(3) + " km)";
};

// ======================================================
// ACCEPT A NEW LOCATION FROM THE USER
// No UTM X/Y values are needed for adding map markers.
// ======================================================
const locationForm = document.getElementById("location-form");
const formMessage = document.getElementById("form-message");

locationForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the page from reloading

    // Read the values from the HTML form
    const title = document.getElementById("location-title").value.trim();
    const imageFile = document.getElementById("location-image").files[0];
    const longitudeText = document.getElementById("location-longitude").value;
    const latitudeText = document.getElementById("location-latitude").value;
    const longitude = Number(longitudeText);
    const latitude = Number(latitudeText);

    // Check that the user entered valid information
    if (!title || !imageFile || !imageFile.type.startsWith("image/") ||
        longitudeText === "" || latitudeText === "" ||
        !Number.isFinite(longitude) || !Number.isFinite(latitude) ||
        longitude < -180 || longitude > 180 ||
        latitude < -90 || latitude > 90) {
        formMessage.textContent = "Please enter a title, image, and valid longitude/latitude.";
        formMessage.className = "error";
        return;
    }

    // Make the selected local image available to the browser
    const imageURL = URL.createObjectURL(imageFile);

    // Store the new location with the existing locations
    const newPhoto = {
        title: title,
        image: imageURL,
        longitude: longitude,
        latitude: latitude
    };
    photos.push(newPhoto);
    const newIndex = photos.length - 1;

    // Add the new location to the map and photo gallery
    addPhotoLocation(newPhoto, newIndex);
    showPhoto(newIndex);

    // Move the map to the new location
    view.goTo({ center: [longitude, latitude], zoom: 14 }).catch(function(error) {
        if (error.name !== "AbortError") console.error(error);
    });

    formMessage.textContent = title + " was added to the map!";
    formMessage.className = "success";
    locationForm.reset();
});
