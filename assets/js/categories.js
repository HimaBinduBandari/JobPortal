"use strict";


/* =====================================================
   ELEMENTS
===================================================== */

const categoriesList =
    document.getElementById(
        "categoriesList"
    );


const categorySearch =
    document.getElementById(
        "categorySearch"
    );


const categoryCount =
    document.getElementById(
        "categoryCount"
    );


const categoriesEmpty =
    document.getElementById(
        "categoriesEmpty"
    );


/* =====================================================
   DATA
===================================================== */

let jobs = [];

let categories = [];


/* =====================================================
   LOAD JOB DATA
===================================================== */

async function loadCategories() {

    try {

        const response =
            await fetch(
                "data/jobs.json"
            );


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


        buildCategories();


        renderCategories(
            categories
        );

    }

    catch (error) {

        console.error(
            "Categories error:",
            error
        );


        categoriesList.innerHTML = `

            <div class="categories-loading">

                Unable to load category data.

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
   BUILD CATEGORIES
===================================================== */

function buildCategories() {

    const categoryMap =
        new Map();


    jobs.forEach(
        function (job) {


            const category =
                getCategory(job);


            if (!category) {

                return;

            }


            const key =
                normalize(category);


            if (
                !categoryMap.has(key)
            ) {

                categoryMap.set(
                    key,
                    {

                        name:
                            category,

                        jobs:
                            0,

                        subCategories:
                            new Map()

                    }
                );

            }


            const categoryData =
                categoryMap.get(key);


            categoryData.jobs++;


            const subCategory =
                getSubCategory(job);


            if (subCategory) {

                const subKey =
                    normalize(
                        subCategory
                    );


                if (
                    !categoryData.subCategories.has(
                        subKey
                    )
                ) {

                    categoryData.subCategories.set(
                        subKey,
                        subCategory
                    );

                }

            }

        }
    );


    categories =
        Array.from(
            categoryMap.values()
        );


    categories.forEach(
        function (category) {

            category.subCategories =
                Array.from(
                    category.subCategories.values()
                )
                .sort(
                    function (a, b) {

                        return a.localeCompare(
                            b
                        );

                    }
                );

        }
    );


    categories.sort(
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
   GET CATEGORY
===================================================== */

function getCategory(job) {

    return String(

        job["Category"] ??
        job.category ??
        job.CategoryName ??
        ""

    ).trim();

}


/* =====================================================
   GET SUB CATEGORY
===================================================== */

function getSubCategory(job) {

    return String(

        job["Sub Category"] ??
        job.subCategory ??
        job["SubCategory"] ??
        ""

    ).trim();

}


/* =====================================================
   RENDER CATEGORIES
===================================================== */

function renderCategories(
    categoryData
) {

    categoryCount.textContent =

        `${categoryData.length} ${
            categoryData.length === 1
                ? "category"
                : "categories"
        }`;


    if (
        categoryData.length === 0
    ) {

        categoriesList.innerHTML =
            "";


        categoriesEmpty.style.display =
            "block";


        return;

    }


    categoriesEmpty.style.display =
        "none";


    categoriesList.innerHTML =

        categoryData
            .map(
                function (category) {

                    return createCategoryHTML(
                        category
                    );

                }
            )
            .join("");

}


/* =====================================================
   CATEGORY HTML
===================================================== */

function createCategoryHTML(
    category
) {


    const icon =
        getCategoryIcon(
            category.name
        );


    const description =
        getCategoryDescription(
            category.name
        );


    const subCategories =
        category.subCategories
            .slice(0, 5);


    let subCategoryHTML =
        "";


    if (
        subCategories.length > 0
    ) {

        subCategoryHTML = `

            <div
                class="category-subcategories"
            >

                ${

                    subCategories
                        .map(
                            function (sub) {

                                return `

                                    <span
                                        class="sub-category"
                                    >

                                        ${escapeHTML(
                                            sub
                                        )}

                                    </span>

                                `;

                            }
                        )
                        .join("")

                }

            </div>

        `;

    }


    return `

        <a
            href="jobs.html?category=${encodeURIComponent(
                category.name
            )}"
            class="category-item"
        >


            <div
                class="category-icon"
            >

                ${icon}

            </div>


            <div
                class="category-info"
            >

                <div
                    class="category-name"
                >

                    ${escapeHTML(
                        category.name
                    )}

                </div>


                <div
                    class="category-description"
                >

                    ${escapeHTML(
                        description
                    )}

                </div>


                ${subCategoryHTML}

            </div>


            <div
                class="category-jobs"
            >

                ${category.jobs}

                ${
                    category.jobs === 1
                        ? "Job"
                        : "Jobs"
                }

            </div>


            <div
                class="category-arrow"
            >

                →

            </div>


        </a>

    `;

}


/* =====================================================
   CATEGORY DESCRIPTION
===================================================== */

function getCategoryDescription(
    category
) {

    const descriptions = {

        "software development":
            "Software engineering, web development, applications and programming opportunities.",

        "development":
            "Software engineering, web development, applications and programming opportunities.",

        "data":
            "Data analytics, data science, business intelligence and database opportunities.",

        "data science":
            "Data science, machine learning, analytics and artificial intelligence opportunities.",

        "artificial intelligence":
            "AI, machine learning, generative AI and intelligent technology opportunities.",

        "ai":
            "Artificial intelligence, machine learning, generative AI and related opportunities.",

        "cloud":
            "Cloud computing, infrastructure, DevOps and platform engineering opportunities.",

        "devops":
            "DevOps, automation, infrastructure, CI/CD and cloud engineering opportunities.",

        "cybersecurity":
            "Cybersecurity, information security, security operations and risk opportunities.",

        "marketing":
            "Digital marketing, content, growth, SEO and marketing opportunities.",

        "sales":
            "Sales, business development, account management and customer-facing opportunities.",

        "finance":
            "Finance, accounting, banking, investment and financial operations opportunities.",

        "human resources":
            "Recruitment, talent acquisition, HR operations and people management opportunities.",

        "hr":
            "Recruitment, talent acquisition, HR operations and people management opportunities.",

        "design":
            "UI, UX, graphic design, product design and creative opportunities.",

        "product management":
            "Product strategy, product operations and product management opportunities."

    };


    const key =
        normalize(category);


    return descriptions[key] ||

        `Explore ${category} jobs and discover opportunities from companies hiring now.`;

}


/* =====================================================
   CATEGORY ICON
===================================================== */

function getCategoryIcon(
    category
) {

    const value =
        normalize(category);


    if (
        value.includes("software") ||
        value.includes("development") ||
        value.includes("programming")
    ) {

        return "</>";

    }


    if (
        value.includes("data")
    ) {

        return "▥";

    }


    if (
        value.includes("ai") ||
        value.includes("artificial")
    ) {

        return "✦";

    }


    if (
        value.includes("cloud")
    ) {

        return "☁";

    }


    if (
        value.includes("devops")
    ) {

        return "⚙";

    }


    if (
        value.includes("security") ||
        value.includes("cyber")
    ) {

        return "◈";

    }


    if (
        value.includes("marketing")
    ) {

        return "↗";

    }


    if (
        value.includes("sales")
    ) {

        return "◆";

    }


    if (
        value.includes("finance") ||
        value.includes("account")
    ) {

        return "₹";

    }


    if (
        value.includes("human") ||
        value === "hr"
    ) {

        return "●";

    }


    if (
        value.includes("design")
    ) {

        return "◇";

    }


    if (
        value.includes("product")
    ) {

        return "▣";

    }


    return "＋";

}


/* =====================================================
   SEARCH
===================================================== */

categorySearch.addEventListener(
    "input",
    function () {

        const search =
            normalize(
                categorySearch.value
            );


        if (!search) {

            renderCategories(
                categories
            );

            return;

        }


        const filtered =
            categories.filter(
                function (category) {


                    const categoryName =
                        normalize(
                            category.name
                        );


                    const subCategories =
                        category.subCategories
                            .map(
                                function (sub) {

                                    return normalize(
                                        sub
                                    );

                                }
                            )
                            .join(" ");


                    return (

                        categoryName.includes(
                            search
                        )

                        ||

                        subCategories.includes(
                            search
                        )

                    );

                }
            );


        renderCategories(
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

loadCategories();
