let allJobs = [];

document.addEventListener("DOMContentLoaded", () => {

    loadJobs();

    const form = document.getElementById("searchForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const keyword =
            document
                .getElementById("searchKeyword")
                .value
                .trim();

        if (keyword) {

            const url =
                `search.html?q=${encodeURIComponent(keyword)}`;

            window.location.href = url;

        } else {

            window.location.href = "search.html";

        }

    });

});


/* =================================
   LOAD JOBS
================================= */

async function loadJobs() {

    try {

        const response =
            await fetch("data/jobs.json");

        if (!response.ok) {
            throw new Error("Unable to load jobs.");
        }

        allJobs = await response.json();

        allJobs = allJobs.filter(
            job => !isExpired(job)
        );

        performSearch();

    } catch (error) {

        console.error(error);

        document.getElementById("searchResults").innerHTML = `
            <div class="no-search-results">

                <h2>
                    Unable to load jobs
                </h2>

                <p>
                    Please try again later.
                </p>

            </div>
        `;

    }

}


/* =================================
   SEARCH
================================= */

function performSearch() {

    const params =
        new URLSearchParams(window.location.search);

    const query =
        params.get("q")
            ? params.get("q").trim()
            : "";

    const input =
        document.getElementById("searchKeyword");

    input.value = query;


    let results = [...allJobs];


    if (query) {

        const searchTerm =
            query.toLowerCase();

        results = results.filter(job => {

            const searchableText = [

                job.job_title,
                job.job_description,
                job.category,
                job.sub_category,
                job.job_requirements,
                job.location,
                job.work_mode,
                job.job_type,
                job.experience,
                job.salary,
                job.skills,
                job.company_name,
                job.company_description

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchTerm);

        });

    }


    /* Latest first */

    results.sort((a, b) => {

        return new Date(b.posted_date) -
               new Date(a.posted_date);

    });


    updateSearchTitle(query);

    renderResults(results);

}


/* =================================
   SEARCH TITLE
================================= */

function updateSearchTitle(query) {

    const title =
        document.getElementById("searchTitle");

    if (query) {

        title.textContent =
            `Search results for "${query}"`;

        document.title =
            `Jobs for "${query}" - JobPortal`;

    } else {

        title.textContent =
            "Latest Jobs";

        document.title =
            "Search Jobs - JobPortal";

    }

}


/* =================================
   RENDER RESULTS
================================= */

function renderResults(jobs) {

    const container =
        document.getElementById("searchResults");

    const count =
        document.getElementById("resultsCount");


    count.textContent =
        `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`;


    if (!jobs.length) {

        container.innerHTML = `

            <div class="no-search-results">

                <h2>
                    No jobs found
                </h2>

                <p>
                    We couldn't find any jobs matching your search.
                </p>

                <a
                    href="jobs.html"
                    class="browse-all-btn"
                >
                    Browse All Jobs
                </a>

            </div>

        `;

        return;

    }


    container.innerHTML =
        jobs
            .map(job => createJobCard(job))
            .join("");

}


/* =================================
   JOB CARD
================================= */

function createJobCard(job) {

    const companyLogo =
        createCompanyLogo(
            job.company_logo,
            job.company_name
        );


    const featured =
        job.featured
            ? `
                <span class="search-featured">
                    Featured
                </span>
              `
            : "";


    return `

        <article class="search-job-card">

            <div class="search-job-top">

                ${companyLogo}

                <div class="search-job-content">

                    ${featured}

                    <h3 class="search-job-title">

                        <a
                            href="job.html?id=${encodeURIComponent(job.job_id)}"
                        >
                            ${escapeHTML(job.job_title)}
                        </a>

                    </h3>


                    <div class="search-company">

                        ${escapeHTML(job.company_name)}

                    </div>


                    <div class="search-job-meta">

                        ${metaItem(
                            "📍",
                            job.location
                        )}

                        ${metaItem(
                            "💼",
                            job.job_type
                        )}

                        ${metaItem(
                            "🏠",
                            job.work_mode
                        )}

                        ${metaItem(
                            "⭐",
                            job.experience
                        )}

                        ${metaItem(
                            "💰",
                            job.salary
                        )}

                    </div>


                    <p class="search-job-description">

                        ${escapeHTML(
                            truncateText(
                                job.job_description,
                                180
                            )
                        )}

                    </p>

                </div>

            </div>


            <div class="search-job-footer">

                <span class="search-job-date">

                    Posted
                    ${formatDate(job.posted_date)}

                </span>


                <a
                    href="job.html?id=${encodeURIComponent(job.job_id)}"
                    class="search-view-btn"
                >
                    View Job
                </a>

            </div>

        </article>

    `;

}


/* =================================
   COMPANY LOGO
================================= */

function createCompanyLogo(
    logo,
    companyName
) {

    if (logo) {

        return `

            <img
                src="${escapeHTML(logo)}"
                alt="${escapeHTML(companyName)}"
                class="search-company-logo"
            >

        `;

    }


    const letter =
        companyName
            ? companyName
                .trim()
                .charAt(0)
                .toUpperCase()
            : "?";


    return `

        <div
            class="search-company-logo search-company-logo-letter"
        >
            ${escapeHTML(letter)}
        </div>

    `;

}


/* =================================
   META ITEM
================================= */

function metaItem(
    icon,
    value
) {

    if (!value) {
        return "";
    }

    return `
        <span>
            ${icon} ${escapeHTML(value)}
        </span>
    `;

}


/* =================================
   DATE
================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    if (isNaN(date)) {
        return "";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =================================
   CHECK EXPIRED
================================= */

function isExpired(job) {

    if (!job.expiry_date) {
        return false;
    }

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const expiry =
        new Date(job.expiry_date);

    expiry.setHours(
        23,
        59,
        59,
        999
    );


    return expiry < today;

}


/* =================================
   TRUNCATE
================================= */

function truncateText(
    text,
    maxLength
) {

    if (!text) {
        return "";
    }

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(
        0,
        maxLength
    ).trim() + "...";

}


/* =================================
   ESCAPE HTML
================================= */

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