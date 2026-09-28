
"use strict";


/* =====================================================
   ELEMENTS
===================================================== */

const companiesList =
    document.getElementById("companiesList");

const companySearch =
    document.getElementById("companySearch");

const companyCount =
    document.getElementById("companyCount");

const companiesEmpty =
    document.getElementById("companiesEmpty");


/* =====================================================
   DATA
===================================================== */

let jobs = [];

let companies = [];


/* =====================================================
   LOAD JOBS
===================================================== */

async function loadCompanies() {

    try {

        const response =
            await fetch("data/jobs.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load jobs.json"
            );

        }


        jobs =
            await response.json();


        if (!Array.isArray(jobs)) {

            throw new Error(
                "jobs.json must contain an array."
            );

        }


        buildCompanies();

        renderCompanies(
            companies
        );

    }
    catch (error) {

        console.error(
            "Companies error:",
            error
        );


        companiesList.innerHTML = `

            <div class="companies-loading">

                Unable to load company data.

                <br><br>

                Check:

                <strong>
                    data/jobs.json
                </strong>

            </div>

        `;

    }

}


/* =====================================================
   BUILD COMPANY DATA
===================================================== */

function buildCompanies() {

    const companyMap =
        new Map();


    jobs.forEach(
        function (job) {

            const name =
                getCompanyName(job);


            if (!name) {

                return;

            }


            const key =
                normalize(name);


            if (
                !companyMap.has(key)
            ) {

                companyMap.set(
                    key,
                    {
                        name: name,

                        description:
                            getCompanyDescription(
                                job
                            ),

                        logo:
                            getCompanyLogo(
                                job
                            ),

                        jobs: 0

                    }
                );

            }


            companyMap.get(
                key
            ).jobs++;

        }
    );


    companies =
        Array.from(
            companyMap.values()
        )
        .sort(
            function (a, b) {

                if (
                    b.jobs !== a.jobs
                ) {

                    return b.jobs - a.jobs;

                }


                return a.name.localeCompare(
                    b.name
                );

            }
        );

}


/* =====================================================
   COMPANY NAME
===================================================== */

function getCompanyName(job) {

    return String(

        job["company_name"] ??
        job.companyName ??
        job.company ??
        job.Company ??
        ""

    ).trim();

}


/* =====================================================
   COMPANY DESCRIPTION
===================================================== */

function getCompanyDescription(job) {

    return String(

        job["company_description"] ??
        job.companyDescription ??
        job.description ??
        ""

    ).trim();

}


/* =====================================================
   COMPANY LOGO
===================================================== */

function getCompanyLogo(job) {

    return String(

        job["company_logo"] ??
        job.companyLogo ??
        job.logo ??
        ""

    ).trim();

}


/* =====================================================
   RENDER
===================================================== */

function renderCompanies(
    companyData
) {

    companyCount.textContent =
        `${companyData.length} ${
            companyData.length === 1
                ? "company"
                : "companies"
        }`;


    if (
        companyData.length === 0
    ) {

        companiesList.innerHTML =
            "";

        companiesEmpty.style.display =
            "block";

        return;

    }


    companiesEmpty.style.display =
        "none";


    companiesList.innerHTML =
        companyData
            .map(
                function (company) {

                    return createCompanyHTML(
                        company
                    );

                }
            )
            .join("");

}


/* =====================================================
   COMPANY HTML
===================================================== */

function createCompanyHTML(
    company
) {

    const firstLetter =
        getFirstLetter(
            company.name
        );


    const logoHTML =
        company.logo

            ? `

                <div class="company-logo">

                    <img
                        src="${escapeHTML(
                            company.logo
                        )}"
                        alt="${escapeHTML(
                            company.name
                        )}"
                        loading="lazy"
                        onerror="this.parentElement.innerHTML='<span class=\\'company-logo-letter\\'>${escapeHTML(
                            firstLetter
                        )}</span>'"
                    >

                </div>

            `

            : `

                <div class="company-logo">

                    <span
                        class="company-logo-letter"
                    >
                        ${escapeHTML(
                            firstLetter
                        )}
                    </span>

                </div>

            `;


    const description =
        company.description
            ? company.description
            : "Explore available opportunities from this company.";


    return `

        <a
            class="company-item"
            href="jobs.html?company=${encodeURIComponent(
                company.name
            )}"
        >

            ${logoHTML}


            <div class="company-info">

                <div class="company-name">

                    ${escapeHTML(
                        company.name
                    )}

                </div>


                <div class="company-description">

                    ${escapeHTML(
                        description
                    )}

                </div>

            </div>


            <div class="company-jobs">

                ${company.jobs}

                ${
                    company.jobs === 1
                        ? "Job"
                        : "Jobs"
                }

            </div>


            <div class="company-arrow">

                →

            </div>

        </a>

    `;

}


/* =====================================================
   SEARCH
===================================================== */

companySearch.addEventListener(
    "input",
    function () {

        const search =
            normalize(
                companySearch.value
            );


        if (!search) {

            renderCompanies(
                companies
            );

            return;

        }


        const filtered =
            companies.filter(
                function (company) {

                    return (

                        normalize(
                            company.name
                        ).includes(
                            search
                        )

                        ||

                        normalize(
                            company.description
                        ).includes(
                            search
                        )

                    );

                }
            );


        renderCompanies(
            filtered
        );

    }
);


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
   FIRST LETTER
===================================================== */

function getFirstLetter(name) {

    const value =
        String(name || "").trim();


    if (!value) {

        return "?";

    }


    return value
        .charAt(0)
        .toUpperCase();

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

loadCompanies();
