"use strict";


/* =====================================================
   ELEMENTS
===================================================== */

const mapElement =
    document.getElementById("indiaMap");

const locationSearch =
    document.getElementById("locationSearch");

const popularLocations =
    document.getElementById("popularLocations");

const specialLocations =
    document.getElementById("specialLocations");

const locationList =
    document.getElementById("locationList");

const locationCount =
    document.getElementById("locationCount");

const totalJobs =
    document.getElementById("totalJobs");

const noLocations =
    document.getElementById("noLocations");


/* =====================================================
   DATA
===================================================== */

let allJobs = [];

let cityCoordinates = [];

let locations = [];

let specialLocationsData = [];

let leafletMap = null;


/* =====================================================
   MAP SETTINGS
===================================================== */

const INDIA_CENTER = [
    22.5937,
    78.9629
];

const INDIA_ZOOM = 5;


/* =====================================================
   LOAD DATA
===================================================== */

async function loadData() {

    try {

        const [
            jobsResponse,
            citiesResponse
        ] = await Promise.all([

            fetch("data/jobs.json"),

            fetch("data/cities.json")

        ]);


        if (!jobsResponse.ok) {

            throw new Error(
                "Unable to load jobs.json"
            );

        }


        if (!citiesResponse.ok) {

            throw new Error(
                "Unable to load cities.json"
            );

        }


        allJobs =
            await jobsResponse.json();


        cityCoordinates =
            await citiesResponse.json();


        if (!Array.isArray(allJobs)) {

            throw new Error(
                "jobs.json must contain an array."
            );

        }


        if (!Array.isArray(cityCoordinates)) {

            throw new Error(
                "cities.json must contain an array."
            );

        }


        buildLocations();

        initializeMap();

        renderPopularLocations();

        renderLocations();

        renderSpecialLocations();


        totalJobs.textContent =
            `${allJobs.length} ${
                allJobs.length === 1
                    ? "job"
                    : "jobs"
            }`;

    }
    catch (error) {

        console.error(
            "Locations error:",
            error
        );


        mapElement.innerHTML = `

            <div class="locations-loading">

                Unable to load location data.

                <br><br>

                <strong>
                    Check jobs.json and cities.json
                </strong>

            </div>

        `;

    }

}


/* =====================================================
   BUILD LOCATIONS
===================================================== */

function buildLocations() {

    const locationMap =
        new Map();

    const specialMap =
        new Map();


    allJobs.forEach(
        function (job) {

            const rawLocation =
                getJobLocation(job);


            if (!rawLocation) {

                return;

            }


            const cities =
                splitLocations(
                    rawLocation
                );


            cities.forEach(
                function (city) {

                    if (!city) {

                        return;

                    }


                    if (
                        isSpecialLocation(city)
                    ) {

                        const key =
                            normalize(city);


                        if (
                            !specialMap.has(key)
                        ) {

                            specialMap.set(
                                key,
                                {
                                    name: city,
                                    count: 0
                                }
                            );

                        }


                        specialMap.get(
                            key
                        ).count++;

                        return;

                    }


                    const matchedCity =
                        findCity(city);


                    const finalName =
                        matchedCity
                            ? matchedCity.name
                            : cleanCityName(city);


                    const key =
                        normalize(finalName);


                    if (
                        !locationMap.has(key)
                    ) {

                        locationMap.set(
                            key,
                            {
                                name: finalName,

                                count: 0,

                                coordinates:
                                    matchedCity
                            }
                        );

                    }


                    locationMap.get(
                        key
                    ).count++;

                }
            );

        }
    );


    locations =
        Array.from(
            locationMap.values()
        )
        .sort(sortLocations);


    specialLocationsData =
        Array.from(
            specialMap.values()
        )
        .sort(sortLocations);

}


/* =====================================================
   LOCATION FIELD
===================================================== */

function getJobLocation(job) {

    if (
        job.location !== undefined
    ) {

        return String(
            job.location
        ).trim();

    }


    if (
        job.Location !== undefined
    ) {

        return String(
            job.Location
        ).trim();

    }


    return "";

}


/* =====================================================
   SPLIT MULTIPLE CITIES
===================================================== */

function splitLocations(value) {

    return String(value || "")

        .replace(
            /\s*\/\s*/g,
            ","
        )

        .replace(
            /\s*\|\s*/g,
            ","
        )

        .replace(
            /\s*&\s*/g,
            ","
        )

        .replace(
            /\s+\band\b\s+/gi,
            ","
        )

        .split(",")

        .map(
            function (item) {

                return cleanCityName(
                    item
                );

            }
        )

        .filter(Boolean);

}


/* =====================================================
   CLEAN CITY
===================================================== */

function cleanCityName(value) {

    return String(value || "")

        .trim()

        .replace(
            /\s+/g,
            " "
        );

}


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(value) {

    return String(value || "")

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =====================================================
   FIND CITY
===================================================== */

function findCity(name) {

    const search =
        normalize(name);


    return cityCoordinates.find(
        function (city) {

            return (
                normalize(city.name) ===
                search
            );

        }
    ) || null;

}


/* =====================================================
   SORT
===================================================== */

function sortLocations(a, b) {

    if (
        b.count !== a.count
    ) {

        return b.count - a.count;

    }


    return a.name.localeCompare(
        b.name
    );

}


/* =====================================================
   SPECIAL LOCATIONS
===================================================== */

function isSpecialLocation(
    location
) {

    const value =
        normalize(location);


    const keywords = [

        "remote",

        "work from home",

        "wfh",

        "anywhere",

        "pan india",

        "india"

    ];


    return keywords.includes(
        value
    );

}


/* =====================================================
   INITIALIZE MAP
===================================================== */

function initializeMap() {

    leafletMap =
        L.map(
            "indiaMap",
            {

                center:
                    INDIA_CENTER,

                zoom:
                    INDIA_ZOOM,

                minZoom:
                    4,

                maxZoom:
                    12,

                scrollWheelZoom:
                    true

            }
        );


    /*
     * OpenStreetMap
     */

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:
                19,

            attribution:
                '&copy; OpenStreetMap contributors'

        }

    ).addTo(
        leafletMap
    );


    /*
     * Add city labels
     */

    locations.forEach(
        function (location) {

            if (
                !location.coordinates
            ) {

                return;

            }


            addCityLabel(
                location
            );

        }
    );


    /*
     * India view
     */

    leafletMap.setView(

        INDIA_CENTER,

        INDIA_ZOOM

    );

}


/* =====================================================
   ADD CLICKABLE CITY LABEL
===================================================== */

function addCityLabel(
    location
) {

    const latitude =
        Number(
            location.coordinates.latitude
        );


    const longitude =
        Number(
            location.coordinates.longitude
        );


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        return;

    }


    /*
     * Bigger labels for cities
     * with more jobs.
     */

    const large =
        location.count >= 10
            ? "large"
            : "";


    const icon =
        L.divIcon({

            className:
                "city-map-wrapper",

            html: `

                <a
                    href="jobs.html?location=${encodeURIComponent(
                        location.name
                    )}"
                    class="city-map-label ${large}"
                    title="View ${escapeHTML(
                        location.name
                    )} jobs"
                >

                    <span
                        class="city-map-dot"
                    ></span>


                    <span
                        class="city-map-name"
                    >
                        ${escapeHTML(
                            location.name
                        )}
                    </span>


                    <span
                        class="city-map-count"
                    >

                        ${location.count}

                    </span>

                </a>

            `,

            /*
             * Important:
             * Let the label extend around
             * the coordinate.
             */

            iconSize:
                null,

            iconAnchor:
                [0, 12]

        });


    L.marker(

        [
            latitude,
            longitude
        ],

        {

            icon:
                icon,

            interactive:
                true

        }

    ).addTo(
        leafletMap
    );

}


/* =====================================================
   POPULAR LOCATIONS
===================================================== */

function renderPopularLocations() {

    const popular =
        locations.slice(
            0,
            10
        );


    if (
        popular.length === 0
    ) {

        popularLocations.innerHTML = `

            <div class="locations-loading">

                No locations available.

            </div>

        `;

        return;

    }


    popularLocations.innerHTML =
        popular
            .map(
                function (
                    location,
                    index
                ) {

                    return `

                        <a
                            class="popular-location"
                            href="jobs.html?location=${encodeURIComponent(
                                location.name
                            )}"
                        >

                            <div
                                class="popular-location-info"
                            >

                                <div
                                    class="popular-number"
                                >

                                    ${index + 1}

                                </div>


                                <div
                                    class="popular-name"
                                >

                                    ${escapeHTML(
                                        location.name
                                    )}

                                </div>

                            </div>


                            <div
                                class="popular-jobs"
                            >

                                ${location.count}

                                ${
                                    location.count === 1
                                        ? "job"
                                        : "jobs"
                                }

                            </div>

                        </a>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   SPECIAL LOCATIONS
===================================================== */

function renderSpecialLocations() {

    if (
        specialLocationsData.length === 0
    ) {

        specialLocations.innerHTML =
            "";

        return;

    }


    specialLocations.innerHTML = `

        <div class="special-title">

            Other locations

        </div>


        ${
            specialLocationsData
                .map(
                    function (location) {

                        return `

                            <a
                                class="special-location"
                                href="jobs.html?location=${encodeURIComponent(
                                    location.name
                                )}"
                            >

                                ${escapeHTML(
                                    location.name
                                )}

                                (${location.count})

                            </a>

                        `;

                    }
                )
                .join("")
        }

    `;

}


/* =====================================================
   ALL LOCATIONS
===================================================== */

function renderLocations(
    filteredLocations =
        locations
) {

    locationCount.textContent =
        `${filteredLocations.length} ${
            filteredLocations.length === 1
                ? "location"
                : "locations"
        }`;


    if (
        filteredLocations.length === 0
    ) {

        locationList.innerHTML =
            "";

        noLocations.style.display =
            "block";

        return;

    }


    noLocations.style.display =
        "none";


    locationList.innerHTML =
        filteredLocations
            .map(
                function (location) {

                    return `

                        <a
                            href="jobs.html?location=${encodeURIComponent(
                                location.name
                            )}"
                            class="location-card"
                        >

                            <div
                                class="location-name"
                            >

                                ${escapeHTML(
                                    location.name
                                )}

                            </div>


                            <div
                                class="location-jobs"
                            >

                                ${location.count}

                                ${
                                    location.count === 1
                                        ? "job"
                                        : "jobs"
                                }

                            </div>

                        </a>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   SEARCH
===================================================== */

if (locationSearch) {

    locationSearch.addEventListener(
        "input",
        function () {

            const search =
                normalize(
                    locationSearch.value
                );


            if (!search) {

                renderLocations(
                    locations
                );

                return;

            }


            const filtered =
                locations.filter(
                    function (location) {

                        return normalize(
                            location.name
                        )
                        .includes(
                            search
                        );

                    }
                );


            renderLocations(
                filtered
            );

        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   START
===================================================== */

loadData();