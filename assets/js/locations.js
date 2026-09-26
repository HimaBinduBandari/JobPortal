
"use strict";


/* =====================================================
   ELEMENTS
===================================================== */

const indiaMap =
    document.getElementById("indiaMap");

const locationSearch =
    document.getElementById("locationSearch");

const popularLocations =
    document.getElementById("popularLocations");

const stateList =
    document.getElementById("stateList");

const stateCount =
    document.getElementById("stateCount");

const totalJobs =
    document.getElementById("totalJobs");

const selectedState =
    document.getElementById("selectedState");

const noLocations =
    document.getElementById("noLocations");


/* =====================================================
   DATA
===================================================== */

let allJobs = [];

let stateData = [];

let cityData = [];


/*
 * Mapping of state names to common
 * city/location names.
 *
 * We can expand this as your job data grows.
 */

const stateAliases = {

    "Andhra Pradesh": [
        "andhra pradesh",
        "visakhapatnam",
        "vijayawada",
        "tirupati",
        "guntur"
    ],

    "Arunachal Pradesh": [
        "arunachal pradesh",
        "itanagar"
    ],

    "Assam": [
        "assam",
        "guwahati"
    ],

    "Bihar": [
        "bihar",
        "patna"
    ],

    "Chhattisgarh": [
        "chhattisgarh",
        "raipur",
        "bhilai"
    ],

    "Goa": [
        "goa",
        "panaji"
    ],

    "Gujarat": [
        "gujarat",
        "ahmedabad",
        "surat",
        "vadodara",
        "rajkot"
    ],

    "Haryana": [
        "haryana",
        "gurugram",
        "gurgaon",
        "faridabad"
    ],

    "Himachal Pradesh": [
        "himachal pradesh",
        "shimla"
    ],

    "Jharkhand": [
        "jharkhand",
        "ranchi",
        "jamshedpur"
    ],

    "Karnataka": [
        "karnataka",
        "bangalore",
        "bengaluru",
        "mysore",
        "mysuru",
        "mangalore",
        "hubli"
    ],

    "Kerala": [
        "kerala",
        "kochi",
        "cochin",
        "thiruvananthapuram",
        "trivandrum",
        "calicut"
    ],

    "Madhya Pradesh": [
        "madhya pradesh",
        "bhopal",
        "indore",
        "gwalior",
        "jabalpur"
    ],

    "Maharashtra": [
        "maharashtra",
        "mumbai",
        "pune",
        "nagpur",
        "nashik",
        "thane",
        "aurangabad"
    ],

    "Manipur": [
        "manipur",
        "imphal"
    ],

    "Meghalaya": [
        "meghalaya",
        "shillong"
    ],

    "Mizoram": [
        "mizoram",
        "aizawl"
    ],

    "Nagaland": [
        "nagaland",
        "kohima"
    ],

    "Odisha": [
        "odisha",
        "orissa",
        "bhubaneswar",
        "cuttack"
    ],

    "Punjab": [
        "punjab",
        "chandigarh",
        "ludhiana",
        "amritsar"
    ],

    "Rajasthan": [
        "rajasthan",
        "jaipur",
        "jodhpur",
        "udaipur",
        "kota"
    ],

    "Sikkim": [
        "sikkim",
        "gangtok"
    ],

    "Tamil Nadu": [
        "tamil nadu",
        "chennai",
        "coimbatore",
        "madurai",
        "salem",
        "trichy",
        "tiruchirappalli"
    ],

    "Telangana": [
        "telangana",
        "hyderabad",
        "warangal",
        "secunderabad"
    ],

    "Tripura": [
        "tripura",
        "agartala"
    ],

    "Uttar Pradesh": [
        "uttar pradesh",
        "lucknow",
        "noida",
        "greater noida",
        "kanpur",
        "agra",
        "varanasi",
        "meerut"
    ],

    "Uttarakhand": [
        "uttarakhand",
        "dehradun",
        "haridwar"
    ],

    "West Bengal": [
        "west bengal",
        "kolkata",
        "howrah",
        "siliguri"
    ],

    "Delhi": [
        "delhi",
        "new delhi"
    ],

    "Jammu and Kashmir": [
        "jammu",
        "kashmir",
        "srinagar",
        "jammu and kashmir"
    ],

    "Ladakh": [
        "ladakh",
        "leh"
    ],

    "Puducherry": [
        "puducherry",
        "pondicherry"
    ]

};


/* =====================================================
   LOAD JOB DATA
===================================================== */

async function loadJobs() {

    try {

        const response =
            await fetch(
                "data/jobs.json"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load data/jobs.json"
            );

        }


        allJobs =
            await response.json();


        if (
            !Array.isArray(allJobs)
        ) {

            throw new Error(
                "jobs.json must contain an array of jobs."
            );

        }


        buildLocationData();


        await loadIndiaMap();


    } catch (error) {

        console.error(
            error
        );


        totalJobs.textContent =
            "Unable to load jobs";


        indiaMap.innerHTML = `

            <div class="map-loading">

                Unable to load job data.

                <br><br>

                Please check
                <strong>data/jobs.json</strong>.

            </div>

        `;

    }

}


/* =====================================================
   BUILD LOCATION DATA
===================================================== */

function buildLocationData() {

    const states = {};

    const cities = {};


    allJobs.forEach(
        function (job) {

            const location =
                String(
                    job.location ||
                    ""
                )
                .trim();


            if (!location) {
                return;
            }


            /*
             * City count
             */

            const cityKey =
                location.toLowerCase();


            if (
                !cities[cityKey]
            ) {

                cities[cityKey] = {

                    name:
                        location,

                    count:
                        0

                };

            }


            cities[cityKey].count++;


            /*
             * State detection
             */

            const state =
                findState(
                    location
                );


            if (!state) {
                return;
            }


            if (
                !states[state]
            ) {

                states[state] = {

                    name:
                        state,

                    count:
                        0

                };

            }


            states[state].count++;

        }
    );


    stateData =
        Object.values(
            states
        )
        .sort(
            sortLocations
        );


    cityData =
        Object.values(
            cities
        )
        .sort(
            sortLocations
        );


    totalJobs.textContent =
        `${allJobs.length} ${
            allJobs.length === 1
                ? "job"
                : "jobs"
        }`;


    renderPopularLocations();


    renderStates();

}


/* =====================================================
   FIND STATE
===================================================== */

function findState(location) {

    const text =
        location
            .toLowerCase()
            .trim();


    /*
     * Direct state match
     */

    for (
        const state in stateAliases
    ) {

        const aliases =
            stateAliases[state];


        for (
            const alias of aliases
        ) {

            if (
                text.includes(
                    alias
                )
            ) {

                return state;

            }

        }

    }


    return null;

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
   LOAD INDIA SVG
===================================================== */

async function loadIndiaMap() {

    try {

        /*
         * SVG map of India.
         *
         * Each state path has a data-id.
         */

        const response =
            await fetch(
                "https://cdn.jsdelivr.net/npm/@svg-maps/india@1.0.1/india.svg"
            );


        if (!response.ok) {

            throw new Error(
                "India map could not be loaded."
            );

        }


        const svg =
            await response.text();


        indiaMap.innerHTML =
            svg;


        setupMap();


    } catch (error) {

        console.error(
            error
        );


        /*
         * If external SVG is unavailable,
         * still show the state list.
         */

        indiaMap.innerHTML = `

            <div class="map-loading">

                India map could not be loaded.

                <br><br>

                You can still browse jobs
                using the state list below.

            </div>

        `;

    }

}


/* =====================================================
   SETUP MAP
===================================================== */

function setupMap() {

    const paths =
        indiaMap.querySelectorAll(
            "path"
        );


    console.log(
        "Map states found:",
        paths.length
    );


    paths.forEach(
        function (path) {

            const stateName =
                getMapStateName(
                    path
                );


            if (!stateName) {
                return;
            }


            const state =
                stateData.find(
                    function (item) {

                        return normalize(
                            item.name
                        ) ===
                        normalize(
                            stateName
                        );

                    }
                );


            if (
                state &&
                state.count > 0
            ) {

                path.classList.add(
                    "has-jobs"
                );

            }


            path.addEventListener(
                "mouseenter",
                function (event) {

                    showTooltip(
                        event,
                        stateName,
                        state
                    );

                }
            );


            path.addEventListener(
                "mousemove",
                function (event) {

                    moveTooltip(
                        event
                    );

                }
            );


            path.addEventListener(
                "mouseleave",
                hideTooltip
            );


            path.addEventListener(
                "click",
                function () {

                    selectState(
                        stateName
                    );

                }
            );

        }
    );

}


/* =====================================================
   MAP STATE NAME
===================================================== */

function getMapStateName(path) {

    return (
        path.getAttribute(
            "data-name"
        ) ||

        path.getAttribute(
            "name"
        ) ||

        path.getAttribute(
            "aria-label"
        ) ||

        path.getAttribute(
            "id"
        )
    );

}


/* =====================================================
   SELECT STATE
===================================================== */

function selectState(stateName) {

    const state =
        stateData.find(
            function (item) {

                return (
                    normalize(
                        item.name
                    ) ===
                    normalize(
                        stateName
                    )
                );

            }
        );


    /*
     * Remove previous selection.
     */

    indiaMap
        .querySelectorAll(
            "path.selected"
        )
        .forEach(
            function (path) {

                path.classList.remove(
                    "selected"
                );

            }
        );


    /*
     * Update information.
     */

    if (state) {

        selectedState.classList.add(
            "active"
        );


        selectedState.innerHTML = `

            <strong>
                ${escapeHTML(
                    state.name
                )}
            </strong>

            ·

            ${state.count}
            ${
                state.count === 1
                    ? "job"
                    : "jobs"
            }

        `;


        /*
         * Open filtered jobs.
         */

        window.location.href =
            "jobs.html?location=" +
            encodeURIComponent(
                state.name
            );


        return;

    }


    selectedState.classList.add(
        "active"
    );


    selectedState.innerHTML = `

        <strong>
            ${escapeHTML(
                stateName
            )}
        </strong>

        · No jobs currently listed

    `;

}


/* =====================================================
   POPULAR LOCATIONS
===================================================== */

function renderPopularLocations() {

    const popular =
        cityData.slice(
            0,
            10
        );


    if (
        popular.length === 0
    ) {

        popularLocations.innerHTML =
            "<p>No locations available.</p>";

        return;

    }


    popularLocations.innerHTML =
        popular
            .map(
                function (location, index) {

                    return `

                        <a
                            class="popular-location"
                            href="jobs.html?location=${encodeURIComponent(
                                location.name
                            )}"
                        >

                            <div class="popular-location-info">

                                <div class="popular-number">
                                    ${index + 1}
                                </div>

                                <div class="popular-name">
                                    ${escapeHTML(
                                        location.name
                                    )}
                                </div>

                            </div>

                            <div class="popular-jobs">

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
   STATES LIST
===================================================== */

function renderStates(
    filteredStates =
        stateData
) {

    stateCount.textContent =
        `${filteredStates.length} ${
            filteredStates.length === 1
                ? "state"
                : "states"
        }`;


    if (
        filteredStates.length === 0
    ) {

        stateList.innerHTML =
            "";

        noLocations.style.display =
            "block";

        return;

    }


    noLocations.style.display =
        "none";


    stateList.innerHTML =
        filteredStates
            .map(
                function (state) {

                    return `

                        <a
                            href="jobs.html?location=${encodeURIComponent(
                                state.name
                            )}"
                            class="state-card"
                        >

                            <div class="state-name">

                                ${escapeHTML(
                                    state.name
                                )}

                            </div>

                            <div class="state-jobs">

                                ${state.count}
                                ${
                                    state.count === 1
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

locationSearch.addEventListener(
    "input",
    function () {

        const search =
            locationSearch.value
                .trim()
                .toLowerCase();


        if (!search) {

            renderStates(
                stateData
            );

            return;

        }


        /*
         * Search states first.
         */

        const matchingStates =
            stateData.filter(
                function (state) {

                    return state.name
                        .toLowerCase()
                        .includes(
                            search
                        );

                }
            );


        /*
         * If a city matches,
         * show the city directly.
         */

        const matchingCities =
            cityData.filter(
                function (city) {

                    return city.name
                        .toLowerCase()
                        .includes(
                            search
                        );

                }
            );


        if (
            matchingStates.length
        ) {

            renderStates(
                matchingStates
            );

        } else {

            renderCitySearchResults(
                matchingCities
            );

        }

    }
);


/* =====================================================
   CITY SEARCH RESULTS
===================================================== */

function renderCitySearchResults(
    cities
) {

    stateCount.textContent =
        `${cities.length} ${
            cities.length === 1
                ? "location"
                : "locations"
        }`;


    if (
        cities.length === 0
    ) {

        stateList.innerHTML =
            "";

        noLocations.style.display =
            "block";

        return;

    }


    noLocations.style.display =
        "none";


    stateList.innerHTML =
        cities
            .map(
                function (city) {

                    return `

                        <a
                            href="jobs.html?location=${encodeURIComponent(
                                city.name
                            )}"
                            class="state-card"
                        >

                            <div class="state-name">

                                ${escapeHTML(
                                    city.name
                                )}

                            </div>

                            <div class="state-jobs">

                                ${city.count}
                                ${
                                    city.count === 1
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
   TOOLTIP
===================================================== */

let tooltip = null;


function createTooltip() {

    if (tooltip) {
        return;
    }


    tooltip =
        document.createElement(
            "div"
        );


    tooltip.className =
        "map-tooltip";


    document.body.appendChild(
        tooltip
    );

}


function showTooltip(
    event,
    stateName,
    state
) {

    createTooltip();


    tooltip.innerHTML = `

        <strong>
            ${escapeHTML(
                stateName
            )}
        </strong>

        ${
            state
                ? state.count +
                  (
                    state.count === 1
                        ? " job"
                        : " jobs"
                  )
                : "No jobs"
        }

    `;


    tooltip.style.display =
        "block";


    moveTooltip(
        event
    );

}


function moveTooltip(event) {

    if (!tooltip) {
        return;
    }


    tooltip.style.left =
        (
            event.clientX + 15
        ) +
        "px";


    tooltip.style.top =
        (
            event.clientY + 15
        ) +
        "px";

}


function hideTooltip() {

    if (!tooltip) {
        return;
    }


    tooltip.style.display =
        "none";

}


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(value) {

    return String(
        value || ""
    )
    .toLowerCase()
    .replace(
        /[^a-z0-9]/g,
        ""
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value || ""
    )
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

loadJobs();
