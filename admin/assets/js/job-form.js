/* =========================================================
   JobPortal Admin - Add / Edit Job
   admin/assets/js/job-form.js
   ========================================================= */

let allJobs = [];

let editJobId = null;

let isEditMode = false;


/* =========================================================
   Initialize
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupMobileSidebar();

    initializeForm();

});


/* =========================================================
   Initialize Form
   ========================================================= */

async function initializeForm() {

    editJobId = getJobIdFromURL();

    isEditMode = Boolean(editJobId);

    try {

        await loadJobs();

        if (isEditMode) {

            loadJobForEditing(editJobId);

        } else {

            prepareNewJob();

        }

        setupFormSubmit();

    } catch (error) {

        console.error(
            "Form initialization error:",
            error
        );

        showNotification(
            "Unable to load jobs.json.",
            "error"
        );

    }

}


/* =========================================================
   Load Jobs
   ========================================================= */

async function loadJobs() {

    const response = await fetch(
        "../data/jobs.json",
        {
            cache: "no-store"
        }
    );


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

}


/* =========================================================
   Get ID From URL
   ========================================================= */

function getJobIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {
        return null;
    }


    return cleanValue(id);

}


/* =========================================================
   Prepare New Job
   ========================================================= */

function prepareNewJob() {

    setElementText(
        "formPageTitle",
        "Add New Job"
    );


    setElementText(
        "formPageDescription",
        "Create a new job listing"
    );


    setElementText(
        "saveJobButton",
        "Save Job"
    );


    /*
     * Automatically suggest the next numeric ID.
     *
     * Example:
     * Existing IDs: 1, 2, 3
     * New ID: 4
     */

    const nextId =
        generateNextJobId();


    setInputValue(
        "job_id",
        nextId
    );


    /*
     * Set today's date as the default
     * posted date.
     */

    const today =
        getTodayDate();


    setInputValue(
        "posted_date",
        today
    );


    /*
     * New jobs are not featured by default.
     */

    setCheckboxValue(
        "featured",
        false
    );

}


/* =========================================================
   Generate Next Job ID
   ========================================================= */

function generateNextJobId() {

    const numericIds =
        allJobs
            .map(job => {

                const value =
                    parseInt(
                        cleanValue(
                            job.job_id
                        ),
                        10
                    );

                return Number.isNaN(value)
                    ? 0
                    : value;

            })
            .filter(value => value > 0);


    if (!numericIds.length) {
        return "1";
    }


    const highestId =
        Math.max(...numericIds);


    return String(
        highestId + 1
    );

}


/* =========================================================
   Load Job For Editing
   ========================================================= */

function loadJobForEditing(jobId) {

    const job =
        allJobs.find(
            item =>
                cleanValue(item.job_id) ===
                cleanValue(jobId)
        );


    if (!job) {

        showNotification(
            `Job with ID "${jobId}" was not found.`,
            "error"
        );

        setTimeout(() => {

            window.location.href =
                "jobs.html";

        }, 1800);

        return;
    }


    isEditMode = true;


    setElementText(
        "formPageTitle",
        "Edit Job"
    );


    setElementText(
        "formPageDescription",
        `Editing job ID: ${jobId}`
    );


    setElementText(
        "saveJobButton",
        "Update Job"
    );


    /*
     * Populate every field using the
     * exact jobs.json field names.
     */

    setInputValue(
        "job_id",
        job.job_id
    );


    setInputValue(
        "job_title",
        job.job_title
    );


    setInputValue(
        "category",
        job.category
    );


    setInputValue(
        "sub_category",
        job.sub_category
    );


    setInputValue(
        "job_type",
        job.job_type
    );


    setInputValue(
        "work_mode",
        job.work_mode
    );


    setInputValue(
        "location",
        job.location
    );


    setInputValue(
        "experience",
        job.experience
    );


    setInputValue(
        "salary",
        job.salary
    );


    setInputValue(
        "skills",
        job.skills
    );


    setTextareaValue(
        "job_description",
        job.job_description
    );


    setTextareaValue(
        "job_requirements",
        job.job_requirements
    );


    setTextareaValue(
        "edu_requirements",
        job.edu_requirements
    );


    setInputValue(
        "company_name",
        job.company_name
    );


    setInputValue(
        "company_logo",
        job.company_logo
    );


    setTextareaValue(
        "company_description",
        job.company_description
    );


    setInputValue(
        "apply_url",
        job.apply_url
    );


    setInputValue(
        "posted_date",
        job.posted_date
    );


    setInputValue(
        "expiry_date",
        job.expiry_date
    );


    setCheckboxValue(
        "featured",
        job.featured === true
    );

}


/* =========================================================
   Setup Form Submit
   ========================================================= */

function setupFormSubmit() {

    const form =
        document.getElementById(
            "jobForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveJob();

        }
    );

}


/* =========================================================
   Save Job
   ========================================================= */

function saveJob() {

    const form =
        document.getElementById(
            "jobForm"
        );


    if (!form) {
        return;
    }


    /*
     * First allow browser validation
     * for required fields.
     */

    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }


    const job =
        collectFormData();


    /*
     * Additional validation.
     */

    const validationError =
        validateJob(job);


    if (validationError) {

        showNotification(
            validationError,
            "error"
        );

        return;

    }


    /*
     * ADD MODE
     */

    if (!isEditMode) {

        const duplicate =
            allJobs.some(
                existingJob =>
                    cleanValue(
                        existingJob.job_id
                    ) ===
                    cleanValue(
                        job.job_id
                    )
            );


        if (duplicate) {

            showNotification(
                `Job ID "${job.job_id}" already exists.`,
                "error"
            );

            return;

        }


        allJobs.push(job);


        downloadUpdatedJobs(
            "Job added successfully. Updated jobs.json has been downloaded."
        );


        return;
    }


    /*
     * EDIT MODE
     */

    const index =
        allJobs.findIndex(
            existingJob =>
                cleanValue(
                    existingJob.job_id
                ) ===
                cleanValue(
                    editJobId
                )
        );


    if (index === -1) {

        showNotification(
            "The job could not be found.",
            "error"
        );

        return;

    }


    /*
     * If the user changes the Job ID,
     * make sure the new ID is not already
     * used by another job.
     */

    const changedJobId =
        cleanValue(job.job_id) !==
        cleanValue(editJobId);


    if (changedJobId) {

        const duplicate =
            allJobs.some(
                (existingJob, existingIndex) => {

                    if (
                        existingIndex === index
                    ) {
                        return false;
                    }

                    return (
                        cleanValue(
                            existingJob.job_id
                        ) ===
                        cleanValue(
                            job.job_id
                        )
                    );

                }
            );


        if (duplicate) {

            showNotification(
                `Job ID "${job.job_id}" already exists.`,
                "error"
            );

            return;

        }

    }


    allJobs[index] = job;


    downloadUpdatedJobs(
        "Job updated successfully. Updated jobs.json has been downloaded."
    );

}


/* =========================================================
   Collect Form Data
   ========================================================= */

function collectFormData() {

    return {

        job_id:
            getInputValue("job_id"),

        job_title:
            getInputValue("job_title"),

        job_description:
            getTextareaValue("job_description"),

        category:
            getInputValue("category"),

        sub_category:
            getInputValue("sub_category"),

        job_requirements:
            getTextareaValue("job_requirements"),

        edu_requirements:
            getTextareaValue("edu_requirements"),

        location:
            getInputValue("location"),

        work_mode:
            getInputValue("work_mode"),

        job_type:
            getInputValue("job_type"),

        experience:
            getInputValue("experience"),

        salary:
            getInputValue("salary"),

        skills:
            getInputValue("skills"),

        apply_url:
            getInputValue("apply_url"),

        company_name:
            getInputValue("company_name"),

        company_description:
            getTextareaValue(
                "company_description"
            ),

        company_logo:
            getInputValue("company_logo"),

        posted_date:
            getInputValue("posted_date"),

        expiry_date:
            getInputValue("expiry_date"),

        featured:
            getCheckboxValue("featured")

    };

}


/* =========================================================
   Validate Job
   ========================================================= */

function validateJob(job) {

    if (!job.job_id) {
        return "Please enter a Job ID.";
    }


    if (!job.job_title) {
        return "Please enter a Job Title.";
    }


    if (!job.category) {
        return "Please enter a Category.";
    }


    if (!job.location) {
        return "Please enter a Location.";
    }


    if (!job.job_type) {
        return "Please select a Job Type.";
    }


    if (!job.job_description) {
        return "Please enter the Job Description.";
    }


    if (!job.company_name) {
        return "Please enter the Company Name.";
    }


    if (!job.apply_url) {
        return "Please enter the Application URL.";
    }


    if (!isValidURL(job.apply_url)) {

        return "Please enter a valid Application URL.";

    }


    if (!job.posted_date) {

        return "Please select the Posted Date.";

    }


    if (
        job.expiry_date &&
        job.posted_date &&
        job.expiry_date <
        job.posted_date
    ) {

        return "Expiry Date cannot be before Posted Date.";

    }


    if (
        job.company_logo &&
        !isValidURL(job.company_logo)
    ) {

        return "Please enter a valid Company Logo URL.";

    }


    return null;

}


/* =========================================================
   URL Validation
   ========================================================= */

function isValidURL(value) {

    try {

        const url =
            new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch (error) {

        return false;

    }

}


/* =========================================================
   Download Updated jobs.json
   ========================================================= */

function downloadUpdatedJobs(
    successMessage
) {

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


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    showNotification(
        successMessage,
        "success"
    );


    /*
     * Give the browser a moment to start
     * the download before returning to
     * the Jobs page.
     */

    setTimeout(() => {

        window.location.href =
            "jobs.html";

    }, 1800);

}


/* =========================================================
   Notification
   ========================================================= */

function showNotification(
    message,
    type = "success"
) {

    const notification =
        document.getElementById(
            "formNotification"
        );


    if (!notification) {
        return;
    }


    notification.textContent =
        message;


    notification.className =
        "admin-notification show";


    if (type === "error") {

        notification.style.background =
            "#dc2626";

    } else {

        notification.style.background =
            "#15803d";

    }


    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

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
   Form Helpers
   ========================================================= */

function getInputValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return cleanValue(
        element.value
    );

}


function getTextareaValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}


function getCheckboxValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return false;
    }


    return element.checked === true;

}


function setInputValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";

    }

}


function setTextareaValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";

    }

}


function setCheckboxValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.checked =
            value === true;

    }

}


function setElementText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   Date Helper
   ========================================================= */

function getTodayDate() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* =========================================================
   General Helper
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