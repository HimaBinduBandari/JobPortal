let allJobs = [];
let filteredJobs = [];

const jobList = document.getElementById("jobList");
const resultsCount = document.getElementById("resultsCount");

const keywordFilter = document.getElementById("keywordFilter");
const locationFilter = document.getElementById("locationFilter");
const categoryFilter = document.getElementById("categoryFilter");
const workModeFilter = document.getElementById("workModeFilter");
const jobTypeFilter = document.getElementById("jobTypeFilter");
const experienceFilter = document.getElementById("experienceFilter");
const salaryFilter = document.getElementById("salaryFilter");
const sortJobs = document.getElementById("sortJobs");
const clearFilters = document.getElementById("clearFilters");


/* =========================
   LOAD JOBS
========================= */

fetch("data/jobs.json")
    .then(response => response.json())
    .then(data => {

        allJobs = data.filter(job => !isExpired(job));

        filteredJobs = [...allJobs];

        populateFilters();

        loadURLFilters();

        applyFilters();

    })
    .catch(error => {

        console.error("Error loading jobs:", error);

        resultsCount.textContent = "Unable to load jobs.";

    });


/* =========================
   CHECK EXPIRY
========================= */

function isExpired(job) {

    if (!job.expiry_date) {
        return false;
    }

    const expiry = new Date(job.expiry_date);
    const today = new Date();

    return expiry < today;
}


/* =========================
   POPULATE FILTERS
========================= */

function populateFilters() {

    populateSelect(
        locationFilter,
        getUniqueValues("location")
    );

    populateSelect(
        categoryFilter,
        getUniqueValues("category")
    );

    populateSelect(
        workModeFilter,
        getUniqueValues("work_mode")
    );

    populateSelect(
        jobTypeFilter,
        getUniqueValues("job_type")
    );

    populateSelect(
        experienceFilter,
        getUniqueValues("experience")
    );

    populateSelect(
        salaryFilter,
        getUniqueValues("salary")
    );
}


function getUniqueValues(field) {

    return [
        ...new Set(
            allJobs
                .map(job => job[field])
                .filter(value => value)
        )
    ].sort();
}


function populateSelect(select, values) {

    values.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });

}


/* =========================
   FILTER JOBS
========================= */

function applyFilters() {

    const keyword =
        keywordFilter.value
            .trim()
            .toLowerCase();

    const location =
        locationFilter.value;

    const category =
        categoryFilter.value;

    const workMode =
        workModeFilter.value;

    const jobType =
        jobTypeFilter.value;

    const experience =
        experienceFilter.value;

    const salary =
        salaryFilter.value;


    filteredJobs = allJobs.filter(job => {

        const searchableText = [

            job.job_title,

            job.job_description,

            job.company_name,

            job.skills,

            job.category,

            job.sub_category

        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


        const keywordMatch =
            !keyword ||
            searchableText.includes(keyword);


        const locationMatch =
            !location ||
            job.location === location;


        const categoryMatch =
            !category ||
            job.category === category;


        const workModeMatch =
            !workMode ||
            job.work_mode === workMode;


        const jobTypeMatch =
            !jobType ||
            job.job_type === jobType;


        const experienceMatch =
            !experience ||
            job.experience === experience;


        const salaryMatch =
            !salary ||
            job.salary === salary;


        return (
            keywordMatch &&
            locationMatch &&
            categoryMatch &&
            workModeMatch &&
            jobTypeMatch &&
            experienceMatch &&
            salaryMatch
        );

    });


    sortResults();

    renderJobs();

}


/* =========================
   SORT
========================= */

function sortResults() {

    const sortValue = sortJobs.value;

    filteredJobs.sort((a, b) => {

        const dateA = new Date(a.posted_date);
        const dateB = new Date(b.posted_date);

        if (sortValue === "oldest") {

            return dateA - dateB;

        }

        return dateB - dateA;

    });

}


/* =========================
   RENDER JOBS
========================= */

function renderJobs() {

    resultsCount.textContent =
        `${filteredJobs.length} job${filteredJobs.length === 1 ? "" : "s"} found`;


    if (filteredJobs.length === 0) {

        jobList.innerHTML = `

            <div class="no-results">

                <h3>No jobs found</h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;

    }


    jobList.innerHTML =
        filteredJobs
            .map(job => createJobCard(job))
            .join("");

}


/* =========================
   JOB CARD
========================= */

function createJobCard(job) {

    const featured = job.featured
        ? `<span class="featured-badge">FEATURED</span>`
        : "";


        const companyLogo = createCompanyLogo(
        job.company_logo,
        job.company_name
            );


    return `

        <article class="job-card">

            <div class="job-card-top">

                ${companyLogo}


                <div class="job-main">

                    ${featured}

                    <h2 class="job-title">

                        <a href="job.html?id=${encodeURIComponent(job.job_id)}">

                            ${escapeHTML(job.job_title)}

                        </a>

                    </h2>


                    <div class="company-name">

                        ${escapeHTML(job.company_name)}

                    </div>


                    <div class="job-meta">

                        ${metaItem(job.location)}

                        ${metaItem(job.work_mode)}

                        ${metaItem(job.job_type)}

                        ${metaItem(job.experience)}

                        ${metaItem(job.salary)}

                    </div>

                </div>

            </div>


            <p class="job-description">

                ${escapeHTML(
                    truncateText(job.job_description, 180)
                )}

            </p>


            <div class="job-footer">

                <span class="posted-date">

                    Posted ${formatDate(job.posted_date)}

                </span>


                <a
                    href="job.html?id=${encodeURIComponent(job.job_id)}"
                    class="view-job"
                >

                    View Job →

                </a>

            </div>

        </article>

    `;

}


/* =========================
   META ITEM
========================= */

function metaItem(value) {

    if (!value) {
        return "";
    }

    return `
        <span>
            ${escapeHTML(value)}
        </span>
    `;

}


/* =========================
   DATE
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================
   TRUNCATE TEXT
========================= */

function truncateText(text, length) {

    if (!text) {
        return "";
    }

    if (text.length <= length) {
        return text;
    }

    return text.substring(0, length) + "...";

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   URL FILTERS
========================= */

function loadURLFilters() {

    const params =
        new URLSearchParams(window.location.search);


    const keyword =
        params.get("q");

    const location =
        params.get("location");

    const category =
        params.get("category");


    if (keyword) {

        keywordFilter.value = keyword;

    }


    if (location) {

        locationFilter.value = location;

    }


    if (category) {

        categoryFilter.value = category;

    }

}


/* =========================
   EVENTS
========================= */

keywordFilter.addEventListener(
    "input",
    applyFilters
);


locationFilter.addEventListener(
    "change",
    applyFilters
);


categoryFilter.addEventListener(
    "change",
    applyFilters
);


workModeFilter.addEventListener(
    "change",
    applyFilters
);


jobTypeFilter.addEventListener(
    "change",
    applyFilters
);


experienceFilter.addEventListener(
    "change",
    applyFilters
);


salaryFilter.addEventListener(
    "change",
    applyFilters
);


sortJobs.addEventListener(
    "change",
    applyFilters
);


/* =========================
   CLEAR FILTERS
========================= */

clearFilters.addEventListener(
    "click",
    () => {

        keywordFilter.value = "";

        locationFilter.value = "";

        categoryFilter.value = "";

        workModeFilter.value = "";

        jobTypeFilter.value = "";

        experienceFilter.value = "";

        salaryFilter.value = "";

        sortJobs.value = "latest";

        applyFilters();

        window.history.replaceState(
            {},
            document.title,
            "jobs.html"
        );

    }
);

/* =========================================
   COMPANY LOGO
========================================= */

function createCompanyLogo(logo, companyName) {

    if (logo) {

        return `
            <img
                src="${escapeHTML(logo)}"
                alt="${escapeHTML(companyName)}"
                class="company-logo"
            >
        `;

    }

    const letter =
        companyName
            ? companyName.trim().charAt(0).toUpperCase()
            : "?";

    return `
        <div class="company-logo company-logo-letter">
            ${escapeHTML(letter)}
        </div>
    `;
};