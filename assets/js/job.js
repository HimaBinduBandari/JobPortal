/* =========================================
   JOB DETAILS
========================================= */

const jobContainer =
    document.getElementById("jobContainer");


/* =========================================
   GET JOB ID
========================================= */

const params =
    new URLSearchParams(window.location.search);

const jobId =
    params.get("id");


/* =========================================
   LOAD JOB DATA
========================================= */

fetch("data/jobs.json")

    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to load jobs");
        }

        return response.json();

    })

    .then(jobs => {

        const job =
            jobs.find(
                item =>
                    String(item.job_id) === String(jobId)
            );


        if (!job) {

            showJobNotFound();

            return;

        }


        if (isExpired(job)) {

            showExpiredJob(job);

            return;

        }


        renderJob(job);

    })

    .catch(error => {

        console.error(error);

        jobContainer.innerHTML = `

            <div class="job-not-found">

                <h1>
                    Something went wrong
                </h1>

                <p>
                    We couldn't load this job.
                    Please try again.
                </p>

                <a
                    href="jobs.html"
                    class="apply-btn"
                >
                    Browse Jobs →
                </a>

            </div>

        `;

    });


/* =========================================
   RENDER JOB
========================================= */

function renderJob(job) {

    document.title =
        `${job.job_title} at ${job.company_name} | JobPortal`;


    const metaDescription =
        document.getElementById("metaDescription");


    if (metaDescription) {

        metaDescription.setAttribute(
            "content",
            truncateText(
                job.job_description,
                155
            )
        );

    }


    const featured =
        job.featured
            ? `
                <span class="featured-badge">
                    FEATURED
                </span>
              `
            : "";


    const companyLogo = createCompanyLogo(
    job.company_logo,
    job.company_name
);


    jobContainer.innerHTML = `

        <!-- ================================
             JOB HERO
        ================================= -->

        <div class="job-detail-hero">

            <div class="job-detail-top">


                <div class="job-company">

                    ${companyLogo}


                    <div>

                        ${featured}

                        <h1 class="job-detail-title">

                            ${escapeHTML(job.job_title)}

                        </h1>


                        <div class="detail-company-name">

                            ${escapeHTML(job.company_name)}

                        </div>


                        <div class="detail-meta">

                            ${metaItem(job.location)}

                            ${metaItem(job.work_mode)}

                            ${metaItem(job.job_type)}

                            ${metaItem(job.experience)}

                        </div>

                    </div>

                </div>


                <a
                    href="${safeURL(job.apply_url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="apply-btn"
                >
                    Apply Now →
                </a>

            </div>

        </div>


        <!-- ================================
             CONTENT
        ================================= -->

        <div class="job-detail-layout">


            <!-- MAIN CONTENT -->

            <div class="job-detail-content">


                <!-- DESCRIPTION -->

                <section class="job-section">

                    <h2>
                        Job Description
                    </h2>

                    <p>
                        ${escapeHTML(job.job_description)}
                    </p>

                </section>


                <!-- REQUIREMENTS -->

                <section class="job-section">

                    <h2>
                        Job Requirements
                    </h2>

                    ${renderRequirements(job.job_requirements)}

                </section>


                <!-- SKILLS -->

                <section class="job-section">

                    <h2>
                        Skills
                    </h2>

                    <div class="skills-list">

                        ${renderSkills(job.skills)}

                    </div>

                </section>


                <!-- COMPANY -->

                <section class="job-section">

                    <h2>
                        About ${escapeHTML(job.company_name)}
                    </h2>

                    <p>
                        ${escapeHTML(job.company_description)}
                    </p>

                </section>


                <!-- BOTTOM APPLY -->

                <div class="bottom-apply">

                    <div>

                        <h3>
                            Interested in this opportunity?
                        </h3>

                        <p>
                            Apply directly through the company.
                        </p>

                    </div>


                    <a
                        href="${safeURL(job.apply_url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="apply-btn"
                    >
                        Apply Now →
                    </a>

                </div>

            </div>


            <!-- SIDEBAR -->

            <aside class="job-sidebar">


                <div class="overview-card">

                    <h3>
                        Job Overview
                    </h3>


                    ${overviewItem(
                        "Job Type",
                        job.job_type
                    )}


                    ${overviewItem(
                        "Work Mode",
                        job.work_mode
                    )}


                    ${overviewItem(
                        "Experience",
                        job.experience
                    )}


                    ${overviewItem(
                        "Salary",
                        job.salary
                    )}


                    ${overviewItem(
                        "Location",
                        job.location
                    )}


                    ${overviewItem(
                        "Category",
                        job.category
                    )}


                    ${overviewItem(
                        "Sub Category",
                        job.sub_category
                    )}


                    ${overviewItem(
                        "Posted",
                        formatDate(job.posted_date)
                    )}


                    ${overviewItem(
                        "Expires",
                        formatDate(job.expiry_date)
                    )}


                    <a
                        href="${safeURL(job.apply_url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="apply-btn sidebar-apply"
                    >
                        Apply Now →
                    </a>

                </div>


                <div class="company-card">

                    <h3>
                        About the Company
                    </h3>

                    <p>
                        ${escapeHTML(
                            job.company_description
                        )}
                    </p>

                </div>

            </aside>

        </div>

    `;

}


/* =========================================
   REQUIREMENTS
========================================= */

function renderRequirements(requirements) {

    if (!requirements) {

        return `
            <p>
                No specific requirements provided.
            </p>
        `;

    }


    if (Array.isArray(requirements)) {

        return `

            <ul class="requirements-list">

                ${requirements
                    .map(item => `
                        <li>
                            ${escapeHTML(item)}
                        </li>
                    `)
                    .join("")
                }

            </ul>

        `;

    }


    return `
        <p>
            ${escapeHTML(requirements)}
        </p>
    `;

}


/* =========================================
   SKILLS
========================================= */

function renderSkills(skills) {

    if (!skills) {

        return `
            <span class="skill-tag">
                Not specified
            </span>
        `;

    }


    let skillArray;


    if (Array.isArray(skills)) {

        skillArray = skills;

    } else {

        skillArray =
            String(skills)
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean);

    }


    return skillArray
        .map(skill => `

            <span class="skill-tag">

                ${escapeHTML(skill)}

            </span>

        `)
        .join("");

}


/* =========================================
   OVERVIEW ITEM
========================================= */

function overviewItem(label, value) {

    if (!value) {
        return "";
    }


    return `

        <div class="overview-item">

            <span class="overview-label">

                ${escapeHTML(label)}

            </span>

            <span class="overview-value">

                ${escapeHTML(value)}

            </span>

        </div>

    `;

}


/* =========================================
   META ITEM
========================================= */

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


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return dateString;
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


/* =========================================
   EXPIRED JOB
========================================= */

function isExpired(job) {

    if (!job.expiry_date) {
        return false;
    }


    const expiry =
        new Date(job.expiry_date);


    return expiry < new Date();

}


function showExpiredJob(job) {

    document.title =
        `${job.job_title} | Job Expired | JobPortal`;


    jobContainer.innerHTML = `

        <div class="job-not-found">

            <h1>
                This job has expired
            </h1>

            <p>
                The opportunity for
                <strong>
                    ${escapeHTML(job.job_title)}
                </strong>
                is no longer available.
            </p>

            <a
                href="jobs.html"
                class="apply-btn"
            >
                Browse Other Jobs →
            </a>

        </div>

    `;

}


/* =========================================
   JOB NOT FOUND
========================================= */

function showJobNotFound() {

    document.title =
        "Job Not Found | JobPortal";


    jobContainer.innerHTML = `

        <div class="job-not-found">

            <h1>
                Job Not Found
            </h1>

            <p>
                The job you're looking for doesn't exist
                or may have been removed.
            </p>

            <a
                href="jobs.html"
                class="apply-btn"
            >
                Browse Jobs →
            </a>

        </div>

    `;

}


/* =========================================
   TEXT HELPERS
========================================= */

function truncateText(text, length) {

    if (!text) {
        return "";
    }


    if (text.length <= length) {
        return text;
    }


    return text.substring(0, length) + "...";

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================
   SAFE URL
========================================= */

function safeURL(url) {

    if (!url) {
        return "#";
    }


    try {

        const parsed =
            new URL(url, window.location.href);


        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {

            return parsed.href;

        }

    } catch (error) {

        console.error(
            "Invalid URL:",
            url
        );

    }


    return "#";

}

/* =========================================
   COMPANY LOGO
========================================= */

function createCompanyLogo(logo, companyName) {

    if (logo) {

        return `
            <img
                src="${escapeHTML(logo)}"
                alt="${escapeHTML(companyName)}"
                class="detail-company-logo"
            >
        `;

    }

    const letter =
        companyName
            ? companyName.trim().charAt(0).toUpperCase()
            : "?";

    return `
        <div class="detail-company-logo company-logo-letter">
            ${escapeHTML(letter)}
        </div>
    `;
}