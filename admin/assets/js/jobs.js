/* =========================================================
   JobPortal Admin - Jobs Management
   admin/assets/js/jobs.js
   ========================================================= */

let allJobs = [];
let filteredJobs = [];

let jobToDelete = null;


/* =========================================================
   Initialize
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadJobs();

    setupMobileSidebar();

    setupFilters();

    setupDeleteModal();

});


/* =========================================================
   Load Jobs
   ========================================================= */

async function loadJobs() {

    showLoading();

    try {

        const response = await fetch("../data/jobs.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `Unable to load jobs.json (${response.status})`
            );
        }

        const jobs = await response.json();

        if (!Array.isArray(jobs)) {
            throw new Error(
                "jobs.json must contain an array."
            );
        }

        allJobs = jobs;

        populateFilters(allJobs);

        filteredJobs = [...allJobs];

        applySorting();

        renderJobs();

    } catch (error) {

        console.error("Jobs loading error:", error);

        showError();

    }

}


/* =========================================================
   Populate Filters
   ========================================================= */

function populateFilters(jobs) {

    populateSelect(
        "filterLocation",
        jobs.map(job => job.location),
        "All Locations"
    );

    populateSelect(
        "filterCategory",
        jobs.map(job => job.category),
        "All Categories"
    );

    populateSelect(
        "filterCompany",
        jobs.map(job => job.company_name),
        "All Companies"
    );

    populateSelect(
        "filterJobType",
        jobs.map(job => job.job_type),
        "All Job Types"
    );

    populateSelect(
        "filterWorkMode",
        jobs.map(job => job.work_mode),
        "All Work Modes"
    );

}


/* =========================================================
   Populate Select
   ========================================================= */

function populateSelect(
    elementId,
    values,
    defaultText
) {

    const select = document.getElementById(elementId);

    if (!select) {
        return;
    }

    const uniqueValues = [
        ...new Set(
            values
                .map(value => cleanValue(value))
                .filter(Boolean)
        )
    ].sort((a, b) =>
        a.localeCompare(b)
    );

    select.innerHTML = `
        <option value="">
            ${escapeHTML(defaultText)}
        </option>
    `;

    uniqueValues.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });

}


/* =========================================================
   Setup Filters
   ========================================================= */

function setupFilters() {

    const searchInput =
        document.getElementById("searchJobs");

    const locationFilter =
        document.getElementById("filterLocation");

    const categoryFilter =
        document.getElementById("filterCategory");

    const companyFilter =
        document.getElementById("filterCompany");

    const jobTypeFilter =
        document.getElementById("filterJobType");

    const workModeFilter =
        document.getElementById("filterWorkMode");

    const sortSelect =
        document.getElementById("sortJobs");

    const clearButton =
        document.getElementById("clearFilters");

    const emptyClearButton =
        document.getElementById(
            "emptyClearFilters"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    if (locationFilter) {

        locationFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (companyFilter) {

        companyFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (jobTypeFilter) {

        jobTypeFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (workModeFilter) {

        workModeFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            () => {

                applySorting();

                renderJobs();

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    if (emptyClearButton) {

        emptyClearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    const retryButton =
        document.getElementById("retryJobs");

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadJobs
        );

    }

}


/* =========================================================
   Apply Filters
   ========================================================= */

function applyFilters() {

    const search =
        cleanValue(
            document.getElementById(
                "searchJobs"
            )?.value
        ).toLowerCase();


    const location =
        cleanValue(
            document.getElementById(
                "filterLocation"
            )?.value
        );


    const category =
        cleanValue(
            document.getElementById(
                "filterCategory"
            )?.value
        );


    const company =
        cleanValue(
            document.getElementById(
                "filterCompany"
            )?.value
        );


    const jobType =
        cleanValue(
            document.getElementById(
                "filterJobType"
            )?.value
        );


    const workMode =
        cleanValue(
            document.getElementById(
                "filterWorkMode"
            )?.value
        );


    filteredJobs = allJobs.filter(job => {

        const title =
            cleanValue(job.job_title)
                .toLowerCase();

        const jobCompany =
            cleanValue(job.company_name)
                .toLowerCase();

        const jobDescription =
            cleanValue(job.job_description)
                .toLowerCase();

        const skills =
            cleanValue(job.skills)
                .toLowerCase();

        const jobLocation =
            cleanValue(job.location);

        const jobCategory =
            cleanValue(job.category);

        const jobTypeValue =
            cleanValue(job.job_type);

        const jobWorkMode =
            cleanValue(job.work_mode);


        const matchesSearch =
            !search ||
            title.includes(search) ||
            jobCompany.includes(search) ||
            jobDescription.includes(search) ||
            skills.includes(search);


        const matchesLocation =
            !location ||
            jobLocation === location;


        const matchesCategory =
            !category ||
            jobCategory === category;


        const matchesCompany =
            !company ||
            cleanValue(job.company_name) === company;


        const matchesJobType =
            !jobType ||
            jobTypeValue === jobType;


        const matchesWorkMode =
            !workMode ||
            jobWorkMode === workMode;


        return (
            matchesSearch &&
            matchesLocation &&
            matchesCategory &&
            matchesCompany &&
            matchesJobType &&
            matchesWorkMode
        );

    });


    applySorting();

    renderJobs();

}


/* =========================================================
   Sorting
   ========================================================= */

function applySorting() {

    const sort =
        document.getElementById(
            "sortJobs"
        )?.value || "newest";


    filteredJobs.sort((a, b) => {

        switch (sort) {

            case "oldest":

                return (
                    getTimestamp(a.posted_date) -
                    getTimestamp(b.posted_date)
                );


            case "title":

                return cleanValue(a.job_title)
                    .localeCompare(
                        cleanValue(b.job_title)
                    );


            case "company":

                return cleanValue(a.company_name)
                    .localeCompare(
                        cleanValue(b.company_name)
                    );


            case "newest":

            default:

                return (
                    getTimestamp(b.posted_date) -
                    getTimestamp(a.posted_date)
                );

        }

    });

}


/* =========================================================
   Render Jobs
   ========================================================= */

function renderJobs() {

    hideLoading();

    hideError();

    const tableWrapper =
        document.getElementById(
            "jobsTableWrapper"
        );

    const emptyState =
        document.getElementById(
            "jobsEmpty"
        );

    const tableBody =
        document.getElementById(
            "jobsTableBody"
        );


    updateJobCounts();


    if (!filteredJobs.length) {

        if (tableWrapper) {
            tableWrapper.style.display = "none";
        }

        if (emptyState) {
            emptyState.style.display = "block";
        }

        if (tableBody) {
            tableBody.innerHTML = "";
        }

        return;
    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    if (tableWrapper) {
        tableWrapper.style.display = "block";
    }


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        filteredJobs
            .map(job => createJobRow(job))
            .join("");

}


/* =========================================================
   Create Job Row
   ========================================================= */

function createJobRow(job) {

    const id =
        cleanValue(job.job_id);

    const title =
        cleanValue(job.job_title) ||
        "Untitled Job";

    const company =
        cleanValue(job.company_name) ||
        "Unknown Company";

    const location =
        cleanValue(job.location) ||
        "Not specified";

    const jobType =
        cleanValue(job.job_type) ||
        "Not specified";

    const postedDate =
        formatDate(job.posted_date);

    const featured =
        job.featured === true;


    const logo =
        createCompanyLogo(
            job.company_logo,
            company
        );


    return `
        <tr>

            <td>

                <div class="table-job">

                    ${logo}

                    <div class="table-job-info">

                        <a
                            href="../job.html?id=${encodeURIComponent(id)}"
                            target="_blank"
                            class="table-job-title"
                        >
                            ${escapeHTML(title)}
                        </a>

                        ${
                            featured
                                ? `
                                    <span class="featured-badge">
                                        Featured
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </td>


            <td>

                <span class="table-company">
                    ${escapeHTML(company)}
                </span>

            </td>


            <td>

                <span>
                    📍 ${escapeHTML(location)}
                </span>

            </td>


            <td>

                <span class="job-type-badge">
                    ${escapeHTML(jobType)}
                </span>

            </td>


            <td>

                <span>
                    ${escapeHTML(postedDate)}
                </span>

            </td>


            <td>

                ${
                    featured
                        ? `
                            <span class="status-badge featured">
                                Featured
                            </span>
                          `
                        : `
                            <span class="status-badge active">
                                Active
                            </span>
                          `
                }

            </td>


            <td>

                <div class="table-actions">

                    <a
                        href="job-form.html?id=${encodeURIComponent(id)}"
                        class="action-btn edit-btn"
                        title="Edit Job"
                    >
                        ✏️
                    </a>


                    <button
                        type="button"
                        class="action-btn delete-btn"
                        title="Delete Job"
                        data-job-id="${escapeAttribute(id)}"
                    >
                        🗑️
                    </button>

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   Company Logo
   ========================================================= */

function createCompanyLogo(
    logoURL,
    companyName
) {

    const name =
        cleanValue(companyName) ||
        "C";


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase();


    if (logoURL) {

        return `
            <div class="table-company-logo">

                <img
                    src="${escapeAttribute(logoURL)}"
                    alt="${escapeAttribute(name)}"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <span
                    class="table-company-logo-fallback"
                    style="display:none;"
                >
                    ${escapeHTML(firstLetter)}
                </span>

            </div>
        `;

    }


    return `
        <div class="table-company-logo table-company-logo-fallback">
            ${escapeHTML(firstLetter)}
        </div>
    `;

}


/* =========================================================
   Delete Modal
   ========================================================= */

function setupDeleteModal() {

    const tableBody =
        document.getElementById(
            "jobsTableBody"
        );


    if (tableBody) {

        tableBody.addEventListener(
            "click",
            event => {

                const deleteButton =
                    event.target.closest(
                        ".delete-btn"
                    );


                if (!deleteButton) {
                    return;
                }


                const jobId =
                    deleteButton.dataset.jobId;


                openDeleteModal(jobId);

            }
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelDelete"
        );


    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeDeleteModal
        );

    }


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            confirmDelete
        );

    }


    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    closeDeleteModal();
                }

            }
        );

    }

}


/* =========================================================
   Open Delete Modal
   ========================================================= */

function openDeleteModal(jobId) {

    jobToDelete = jobId;


    const job =
        allJobs.find(
            item =>
                cleanValue(item.job_id) ===
                cleanValue(jobId)
        );


    const message =
        document.getElementById(
            "deleteMessage"
        );


    if (message && job) {

        message.textContent =
            `Are you sure you want to delete "${cleanValue(job.job_title)}" from ${cleanValue(job.company_name) || "this company"}?`;

    }


    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (modal) {

        modal.style.display = "flex";

        document.body.classList.add(
            "modal-open"
        );

    }

}


/* =========================================================
   Close Delete Modal
   ========================================================= */

function closeDeleteModal() {

    jobToDelete = null;


    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (modal) {

        modal.style.display = "none";

    }


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   Confirm Delete
   ========================================================= */

function confirmDelete() {

    if (!jobToDelete) {
        return;
    }


    /*
     * Important:
     *
     * Browser JavaScript cannot directly overwrite
     * the jobs.json file on your computer.
     *
     * For now we remove the job from the CMS memory
     * and download the updated jobs.json file.
     *
     * Later we will connect this CMS securely to GitHub.
     */


    allJobs =
        allJobs.filter(
            job =>
                cleanValue(job.job_id) !==
                cleanValue(jobToDelete)
        );


    closeDeleteModal();


    populateFilters(allJobs);

    applyFilters();


    downloadJobsJSON();


    showNotification(
        "Job deleted. Updated jobs.json has been downloaded."
    );

}


/* =========================================================
   Download Updated JSON
   ========================================================= */

function downloadJobsJSON() {

    const json =
        JSON.stringify(
            allJobs,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = "jobs.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


/* =========================================================
   Clear Filters
   ========================================================= */

function clearFilters() {

    const searchInput =
        document.getElementById(
            "searchJobs"
        );


    const selects = [
        "filterLocation",
        "filterCategory",
        "filterCompany",
        "filterJobType",
        "filterWorkMode"
    ];


    if (searchInput) {
        searchInput.value = "";
    }


    selects.forEach(id => {

        const select =
            document.getElementById(id);

        if (select) {
            select.value = "";
        }

    });


    filteredJobs = [...allJobs];

    applySorting();

    renderJobs();

}


/* =========================================================
   Counts
   ========================================================= */

function updateJobCounts() {

    const jobsCount =
        document.getElementById(
            "jobsCount"
        );


    const tableSummary =
        document.getElementById(
            "tableSummary"
        );


    if (jobsCount) {

        jobsCount.textContent =
            filteredJobs.length;

    }


    if (tableSummary) {

        if (
            filteredJobs.length ===
            allJobs.length
        ) {

            tableSummary.textContent =
                `Showing all ${allJobs.length} job${allJobs.length === 1 ? "" : "s"}.`;

        } else {

            tableSummary.textContent =
                `Showing ${filteredJobs.length} of ${allJobs.length} jobs.`;

        }

    }

}


/* =========================================================
   Loading / Error States
   ========================================================= */

function showLoading() {

    const loading =
        document.getElementById(
            "jobsLoading"
        );


    const table =
        document.getElementById(
            "jobsTableWrapper"
        );


    const empty =
        document.getElementById(
            "jobsEmpty"
        );


    const error =
        document.getElementById(
            "jobsError"
        );


    if (loading) {
        loading.style.display = "flex";
    }

    if (table) {
        table.style.display = "none";
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (error) {
        error.style.display = "none";
    }

}


function hideLoading() {

    const loading =
        document.getElementById(
            "jobsLoading"
        );


    if (loading) {
        loading.style.display = "none";
    }

}


function showError() {

    hideLoading();


    const table =
        document.getElementById(
            "jobsTableWrapper"
        );


    const empty =
        document.getElementById(
            "jobsEmpty"
        );


    const error =
        document.getElementById(
            "jobsError"
        );


    if (table) {
        table.style.display = "none";
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (error) {
        error.style.display = "block";
    }

}


function hideError() {

    const error =
        document.getElementById(
            "jobsError"
        );


    if (error) {
        error.style.display = "none";
    }

}


/* =========================================================
   Notification
   ========================================================= */

function showNotification(message) {

    const existing =
        document.querySelector(
            ".admin-notification"
        );


    if (existing) {
        existing.remove();
    }


    const notification =
        document.createElement("div");


    notification.className =
        "admin-notification";


    notification.textContent =
        message;


    document.body.appendChild(
        notification
    );


    setTimeout(() => {

        notification.classList.add(
            "show"
        );

    }, 10);


    setTimeout(() => {

        notification.classList.remove(
            "show"
        );


        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 4000);

}


/* =========================================================
   Mobile Sidebar
   ========================================================= */

function setupMobileSidebar() {

    const sidebar =
        document.querySelector(
            ".admin-sidebar"
        );


    const overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    const menuButton =
        document.querySelector(
            ".mobile-menu-btn"
        );


    const closeButton =
        document.querySelector(
            ".sidebar-close"
        );


    if (!sidebar) {
        return;
    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                sidebar.classList.add(
                    "active"
                );


                if (overlay) {

                    overlay.classList.add(
                        "active"
                    );

                }


                document.body.classList.add(
                    "sidebar-open"
                );

            }
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeSidebar
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    sidebar
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 768
                    ) {

                        closeSidebar();

                    }

                }
            );

        });

}


function closeSidebar() {

    const sidebar =
        document.querySelector(
            ".admin-sidebar"
        );


    const overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "active"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "sidebar-open"
    );

}


/* =========================================================
   Utility Functions
   ========================================================= */

function cleanValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value).trim();

}


function getTimestamp(dateValue) {

    if (!dateValue) {
        return 0;
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 0;

    }


    return date.getTime();

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "Not specified";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not specified";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    return String(value ?? "")
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


function escapeAttribute(value) {

    return escapeHTML(value);

}