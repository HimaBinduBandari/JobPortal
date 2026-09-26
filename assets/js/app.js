const DATA_URL = "data/jobs.json";


async function loadJobs() {

    const response = await fetch(DATA_URL);

    if (!response.ok) {
        throw new Error("Unable to load jobs data");
    }

    return await response.json();
}


function escapeHTML(value = "") {

    return String(value).replace(/[&<>"']/g, function (character) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character];

    });

}


function isActive(job) {

    if (!job.expiry_date) {
        return true;
    }

    const expiry =
        new Date(job.expiry_date + "T23:59:59");

    return expiry >= new Date();
}


function jobURL(job) {

    return `job.html?id=${encodeURIComponent(job.job_id)}`;

}


function jobCard(job) {

    return `
        <article class="job-card">

            <div class="job-card-top">

                <div class="company-logo">
                    ${escapeHTML(
                        job.company_name
                            ? job.company_name.charAt(0)
                            : "J"
                    )}
                </div>

                <div>

                    <h3>
                        ${escapeHTML(job.job_title)}
                    </h3>

                    <div class="company-name">
                        ${escapeHTML(job.company_name)}
                    </div>

                </div>

            </div>


            <div class="job-meta">

                ${escapeHTML(job.location)}
                ·
                ${escapeHTML(job.work_mode)}
                ·
                ${escapeHTML(job.job_type)}

            </div>


            <div class="job-experience">

                ${escapeHTML(job.experience)}

            </div>


            <div class="job-card-bottom">

                <strong>
                    ${escapeHTML(
                        job.salary || "Salary not disclosed"
                    )}
                </strong>

                <a href="${jobURL(job)}">
                    View Job →
                </a>

            </div>

        </article>
    `;
}


function featuredCard(job) {

    return `
        <article class="featured-card">

            <div class="company-logo featured-logo">

                ${escapeHTML(
                    job.company_name
                        ? job.company_name.charAt(0)
                        : "J"
                )}

            </div>


            <div class="featured-content">

                <h3>
                    ${escapeHTML(job.job_title)}
                </h3>

                <div class="featured-company">

                    ${escapeHTML(job.company_name)}

                </div>

                <div class="featured-meta">

                    ${escapeHTML(job.location)}
                    ·
                    ${escapeHTML(job.work_mode)}
                    ·
                    ${escapeHTML(job.job_type)}
                    ·
                    ${escapeHTML(job.experience)}

                </div>

            </div>


            <div class="featured-right">

                <strong>
                    ${escapeHTML(
                        job.salary || "Salary not disclosed"
                    )}
                </strong>

                <a href="${jobURL(job)}">
                    View opportunity →
                </a>

            </div>

        </article>
    `;
}


async function renderHomepage() {

    const jobs = await loadJobs();

    const activeJobs =
        jobs.filter(isActive);


    const featuredJobs =
        activeJobs
            .filter(job =>
                job.featured === true ||
                String(job.featured).toLowerCase() === "true"
            )
            .slice(0, 4);


    const latestJobs =
        [...activeJobs]
            .sort(
                (a, b) =>
                    new Date(b.posted_date) -
                    new Date(a.posted_date)
            )
            .slice(0, 6);


    const featuredContainer =
        document.querySelector("#featuredJobs");


    const latestContainer =
        document.querySelector("#latestJobs");


    if (featuredContainer) {

        featuredContainer.innerHTML =
            featuredJobs.length
                ? featuredJobs.map(featuredCard).join("")
                : `<div class="empty">No featured jobs available.</div>`;

    }


    if (latestContainer) {

        latestContainer.innerHTML =
            latestJobs.length
                ? latestJobs.map(jobCard).join("")
                : `<div class="empty">No jobs available.</div>`;

    }


    const categoryCounts = {};
    const locationCounts = {};


    activeJobs.forEach(job => {

        if (job.category) {

            categoryCounts[job.category] =
                (categoryCounts[job.category] || 0) + 1;

        }


        if (job.location) {

            locationCounts[job.location] =
                (locationCounts[job.location] || 0) + 1;

        }

    });


    const categoryContainer =
        document.querySelector("#categories");


    if (categoryContainer) {

        categoryContainer.innerHTML =
            Object.entries(categoryCounts)
                .map(([category, count]) => {

                    return `
                        <a
                            class="category-card"
                            href="category.html?category=${encodeURIComponent(category)}"
                        >

                            <strong>
                                ${escapeHTML(category)}
                            </strong>

                            <span>
                                ${count} jobs →
                            </span>

                        </a>
                    `;

                })
                .join("");

    }


    const locationContainer =
        document.querySelector("#locations");


    if (locationContainer) {

        locationContainer.innerHTML =
            Object.entries(locationCounts)
                .map(([location, count]) => {

                    return `
                        <a
                            class="location-card"
                            href="location.html?location=${encodeURIComponent(location)}"
                        >

                            <strong>
                                ${escapeHTML(location)}
                            </strong>

                            <span>
                                ${count} jobs
                            </span>

                        </a>
                    `;

                })
                .join("");

    }

}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.querySelector("#jobSearch");


        if (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();


                    const keyword =
                        document
                            .querySelector("#keyword")
                            .value
                            .trim();


                    const location =
                        document
                            .querySelector("#location")
                            .value
                            .trim();


                    const params =
                        new URLSearchParams();


                    if (keyword) {
                        params.set("q", keyword);
                    }


                    if (location) {
                        params.set("location", location);
                    }


                    window.location.href =
                        `search.html?${params.toString()}`;

                }
            );

        }


        if (
            document.querySelector("#featuredJobs") ||
            document.querySelector("#latestJobs")
        ) {

            renderHomepage()
                .catch(error => {

                    console.error(error);

                });

        }

    }
);