/* =========================================================
   JobPortal Admin Dashboard
   admin/assets/js/admin.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    setupMobileSidebar();
});


/* =========================================================
   Load Dashboard
   ========================================================= */

async function loadDashboard() {
    const statusBadge = document.getElementById("dataStatus");
    const statusText = document.getElementById("dataStatusText");

    try {
        if (statusBadge) {
            statusBadge.textContent = "Loading...";
            statusBadge.className = "status-badge loading";
        }

        const response = await fetch("../data/jobs.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Unable to load jobs.json (${response.status})`);
        }

        const jobs = await response.json();

        if (!Array.isArray(jobs)) {
            throw new Error("jobs.json must contain an array of jobs.");
        }

        updateStatistics(jobs);
        renderRecentJobs(jobs);
        updateDataStatus(jobs);

    } catch (error) {
        console.error("Dashboard error:", error);

        showErrorState();

        if (statusBadge) {
            statusBadge.textContent = "Error";
            statusBadge.className = "status-badge error";
        }

        if (statusText) {
            statusText.textContent = error.message;
        }
    }
}


/* =========================================================
   Update Statistics
   ========================================================= */

function updateStatistics(jobs) {

    const totalJobs = jobs.length;

    const featuredJobs = jobs.filter(job => {
        return job.featured === true;
    }).length;

    const companies = new Set(
        jobs
            .map(job => cleanValue(job.company_name))
            .filter(Boolean)
    );

    const categories = new Set(
        jobs
            .map(job => cleanValue(job.category))
            .filter(Boolean)
    );

    setElementText("totalJobs", totalJobs);
    setElementText("featuredJobs", featuredJobs);
    setElementText("totalCompanies", companies.size);
    setElementText("totalCategories", categories.size);
}


/* =========================================================
   Render Recent Jobs
   ========================================================= */

function renderRecentJobs(jobs) {

    const container = document.getElementById("recentJobs");

    if (!container) {
        return;
    }

    if (!jobs.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No jobs found</h3>
                <p>Add your first job to get started.</p>
                <a href="job-form.html" class="btn btn-primary">
                    Add Job
                </a>
            </div>
        `;

        return;
    }

    const sortedJobs = [...jobs].sort((a, b) => {

        const dateA = parseDate(a.posted_date);
        const dateB = parseDate(b.posted_date);

        if (!dateA && !dateB) {
            return 0;
        }

        if (!dateA) {
            return 1;
        }

        if (!dateB) {
            return -1;
        }

        return dateB - dateA;
    });

    const recentJobs = sortedJobs.slice(0, 5);

    container.innerHTML = recentJobs.map(job => {

        const jobId = cleanValue(job.job_id);
        const title = cleanValue(job.job_title) || "Untitled Job";
        const company = cleanValue(job.company_name) || "Unknown Company";
        const location = cleanValue(job.location) || "Location not specified";
        const jobType = cleanValue(job.job_type) || "Job Type not specified";
        const postedDate = formatDate(job.posted_date);

        const logoHTML = createCompanyLogo(
            job.company_logo,
            company
        );

        return `
            <div class="recent-job-item">

                <div class="recent-job-company">
                    ${logoHTML}
                </div>

                <div class="recent-job-info">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    <p class="recent-job-company-name">
                        ${escapeHTML(company)}
                    </p>

                    <div class="recent-job-meta">

                        <span>
                            📍 ${escapeHTML(location)}
                        </span>

                        <span>
                            💼 ${escapeHTML(jobType)}
                        </span>

                        <span>
                            📅 ${escapeHTML(postedDate)}
                        </span>

                    </div>

                </div>

                <div class="recent-job-actions">

                    <a
                        href="job-form.html?id=${encodeURIComponent(jobId)}"
                        class="btn btn-small btn-secondary"
                    >
                        Edit
                    </a>

                </div>

            </div>
        `;

    }).join("");
}


/* =========================================================
   Company Logo
   ========================================================= */

function createCompanyLogo(logoURL, companyName) {

    const name = cleanValue(companyName) || "C";

    const firstLetter = name
        .charAt(0)
        .toUpperCase();

    if (logoURL) {

        return `
            <div class="company-logo-small">
                <img
                    src="${escapeAttribute(logoURL)}"
                    alt="${escapeAttribute(name)}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <span
                    class="company-logo-fallback"
                    style="display:none;"
                >
                    ${escapeHTML(firstLetter)}
                </span>
            </div>
        `;
    }

    return `
        <div class="company-logo-small company-logo-fallback">
            ${escapeHTML(firstLetter)}
        </div>
    `;
}


/* =========================================================
   Data Status
   ========================================================= */

function updateDataStatus(jobs) {

    const statusBadge = document.getElementById("dataStatus");
    const statusText = document.getElementById("dataStatusText");
    const lastUpdated = document.getElementById("lastUpdated");

    if (statusBadge) {
        statusBadge.textContent = "Connected";
        statusBadge.className = "status-badge success";
    }

    if (statusText) {
        statusText.textContent =
            `${jobs.length} job${jobs.length === 1 ? "" : "s"} loaded successfully.`;
    }

    if (lastUpdated) {
        lastUpdated.textContent =
            `Last checked: ${formatDateTime(new Date())}`;
    }
}


/* =========================================================
   Error State
   ========================================================= */

function showErrorState() {

    setElementText("totalJobs", "—");
    setElementText("featuredJobs", "—");
    setElementText("totalCompanies", "—");
    setElementText("totalCategories", "—");

    const container = document.getElementById("recentJobs");

    if (container) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">⚠️</div>

                <h3>Unable to load jobs</h3>

                <p>
                    Please make sure
                    <strong>data/jobs.json</strong>
                    is available.
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadDashboard()"
                >
                    Try Again
                </button>

            </div>
        `;
    }
}


/* =========================================================
   Mobile Sidebar
   ========================================================= */

function setupMobileSidebar() {

    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    const menuButton = document.querySelector(
        ".mobile-menu-btn"
    );

    const closeButton = document.querySelector(
        ".sidebar-close"
    );

    if (!sidebar) {
        return;
    }


    /* Open sidebar */

    if (menuButton) {

        menuButton.addEventListener("click", () => {

            sidebar.classList.add("active");

            if (overlay) {
                overlay.classList.add("active");
            }

            document.body.classList.add("sidebar-open");
        });
    }


    /* Close sidebar */

    if (closeButton) {

        closeButton.addEventListener("click", closeSidebar);
    }


    /* Click overlay */

    if (overlay) {

        overlay.addEventListener("click", closeSidebar);
    }


    /* Close when navigation link clicked */

    const navLinks = sidebar.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 768) {
                closeSidebar();
            }

        });

    });
}


function closeSidebar() {

    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

    document.body.classList.remove("sidebar-open");
}


/* =========================================================
   Helpers
   ========================================================= */

function setElementText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function cleanValue(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}


/* =========================================================
   Date Helpers
   ========================================================= */

function parseDate(dateValue) {

    if (!dateValue) {
        return null;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}


function formatDate(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {
        return "Not specified";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {
        return "Not available";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   HTML Security Helpers
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}