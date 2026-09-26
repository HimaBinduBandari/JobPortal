"use strict";


/* =====================================================
   GLOBAL DATA
===================================================== */

let convertedData = [];


/* =====================================================
   ELEMENTS
===================================================== */

const excelFile =
    document.getElementById("excelFile");

const chooseFileButton =
    document.getElementById("chooseFileButton");

const fileName =
    document.getElementById("fileName");

const statusBox =
    document.getElementById("status");

const previewSection =
    document.getElementById("previewSection");

const previewHead =
    document.getElementById("previewHead");

const previewBody =
    document.getElementById("previewBody");

const recordCount =
    document.getElementById("recordCount");

const downloadButton =
    document.getElementById("downloadButton");


/* =====================================================
   STARTUP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Excel to JSON page loaded."
        );


        /*
         * Check whether SheetJS loaded.
         */

        if (
            typeof XLSX === "undefined"
        ) {

            showError(
                "Excel reader library did not load. Check your internet connection or use the local SheetJS version."
            );

            console.error(
                "XLSX library is NOT available."
            );

            return;

        }


        console.log(
            "SheetJS loaded successfully."
        );

    }
);


/* =====================================================
   CHOOSE FILE
===================================================== */

chooseFileButton.addEventListener(
    "click",
    function () {

        console.log(
            "Choose file clicked."
        );

        excelFile.click();

    }
);


/* =====================================================
   FILE SELECTED
===================================================== */

excelFile.addEventListener(
    "change",
    function (event) {

        console.log(
            "File change event triggered."
        );


        const file =
            event.target.files[0];


        if (!file) {

            console.log(
                "No file selected."
            );

            return;

        }


        console.log(
            "Selected file:",
            file.name
        );


        console.log(
            "File size:",
            file.size
        );


        fileName.textContent =
            file.name;


        hideStatus();


        /*
         * Check library again.
         */

        if (
            typeof XLSX === "undefined"
        ) {

            showError(
                "Excel reader library is not available. Please refresh the page."
            );

            return;

        }


        readExcelFile(
            file
        );

    }
);


/* =====================================================
   READ EXCEL FILE
===================================================== */

function readExcelFile(file) {

    showSuccess(
        "Reading Excel file..."
    );


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            console.log(
                "File loaded into browser."
            );


            try {

                const arrayBuffer =
                    event.target.result;


                const workbook =
                    XLSX.read(
                        arrayBuffer,
                        {
                            type: "array",
                            cellDates: true
                        }
                    );


                console.log(
                    "Workbook:",
                    workbook
                );


                console.log(
                    "Sheets:",
                    workbook.SheetNames
                );


                processWorkbook(
                    workbook
                );


            } catch (error) {

                console.error(
                    "Excel reading error:",
                    error
                );


                showError(
                    "Unable to read Excel file: " +
                    error.message
                );

            }

        };


    reader.onerror =
        function () {

            showError(
                "Browser could not read the Excel file."
            );

        };


    reader.readAsArrayBuffer(
        file
    );

}


/* =====================================================
   PROCESS WORKBOOK
===================================================== */

function processWorkbook(workbook) {

    try {

        if (
            !workbook.SheetNames ||
            workbook.SheetNames.length === 0
        ) {

            throw new Error(
                "No worksheet found."
            );

        }


        /*
         * Prefer sheet named Jobs.
         */

        let sheetName =
            workbook.SheetNames[0];


        const jobsSheet =
            workbook.SheetNames.find(
                function (name) {

                    return (
                        name
                            .trim()
                            .toLowerCase()
                        ===
                        "jobs"
                    );

                }
            );


        if (jobsSheet) {

            sheetName =
                jobsSheet;

        }


        console.log(
            "Selected worksheet:",
            sheetName
        );


        const worksheet =
            workbook.Sheets[
                sheetName
            ];


        /*
         * Convert worksheet into JSON.
         */

        const rows =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    defval: "",
                    raw: true
                }
            );


        console.log(
            "Rows:",
            rows
        );


        if (
            rows.length === 0
        ) {

            throw new Error(
                "The selected worksheet does not contain any job records."
            );

        }


        /*
         * Clean headers.
         */

        const cleanedRows =
            rows.map(
                cleanRow
            );


        console.log(
            "Cleaned rows:",
            cleanedRows
        );


        /*
         * Convert data.
         */

        convertedData =
            cleanedRows.map(
                convertJob
            );


        console.log(
            "Final JSON:",
            convertedData
        );


        if (
            convertedData.length === 0
        ) {

            throw new Error(
                "No job records were converted."
            );

        }


        /*
         * Show preview.
         */

        renderPreview();


        downloadButton.disabled =
            false;


        showSuccess(
            convertedData.length +
            " job record" +
            (
                convertedData.length === 1
                    ? ""
                    : "s"
            ) +
            " converted successfully."
        );

    } catch (error) {

        console.error(
            "Processing error:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =====================================================
   CLEAN EXCEL ROW
===================================================== */

function cleanRow(row) {

    const result = {};


    Object.keys(row).forEach(
        function (key) {

            const cleanKey =
                String(key)
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    );


            result[cleanKey] =
                row[key];

        }
    );


    return result;

}


/* =====================================================
   GET VALUE
===================================================== */

function getValue(
    row,
    possibleNames
) {

    for (
        let i = 0;
        i < possibleNames.length;
        i++
    ) {

        const name =
            possibleNames[i];


        if (
            Object.prototype.hasOwnProperty.call(
                row,
                name
            )
        ) {

            return row[name];

        }

    }


    return "";

}


/* =====================================================
   CONVERT JOB
===================================================== */

function convertJob(row) {

    return {

        job_id:
            cleanValue(
                getValue(
                    row,
                    ["Job ID"]
                )
            ),


        job_title:
            cleanValue(
                getValue(
                    row,
                    ["Job Title"]
                )
            ),


        job_description:
            cleanValue(
                getValue(
                    row,
                    ["Job Description"]
                )
            ),


        category:
            cleanValue(
                getValue(
                    row,
                    ["Category"]
                )
            ),


        sub_category:
            cleanValue(
                getValue(
                    row,
                    ["Sub Category"]
                )
            ),


        job_requirements:
            cleanValue(
                getValue(
                    row,
                    ["Job Requirements"]
                )
            ),


        edu_requirements:
            cleanValue(
                getValue(
                    row,
                    [
                        "Edu Requirements",
                        "Education Requirements"
                    ]
                )
            ),


        location:
            cleanValue(
                getValue(
                    row,
                    ["Location"]
                )
            ),


        work_mode:
            cleanValue(
                getValue(
                    row,
                    ["Work Mode"]
                )
            ),


        job_type:
            cleanValue(
                getValue(
                    row,
                    ["Job Type"]
                )
            ),


        experience:
            cleanValue(
                getValue(
                    row,
                    ["Experience"]
                )
            ),


        salary:
            cleanValue(
                getValue(
                    row,
                    ["Salary"]
                )
            ),


        skills:
            cleanValue(
                getValue(
                    row,
                    ["Skills"]
                )
            ),


        apply_url:
            cleanValue(
                getValue(
                    row,
                    ["Apply URL"]
                )
            ),


        company_name:
            cleanValue(
                getValue(
                    row,
                    ["Company Name"]
                )
            ),


        company_description:
            cleanValue(
                getValue(
                    row,
                    ["Company Description"]
                )
            ),


        company_logo:
            cleanValue(
                getValue(
                    row,
                    ["Company Logo"]
                )
            ),


        posted_date:
            formatDate(
                getValue(
                    row,
                    ["Posted Date"]
                )
            ),


        expiry_date:
            formatDate(
                getValue(
                    row,
                    ["Expiry Date"]
                )
            ),


        featured:
            convertBoolean(
                getValue(
                    row,
                    ["Featured"]
                )
            )

    };

}


/* =====================================================
   CLEAN VALUE
===================================================== */

function cleanValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    ).trim();

}


/* =====================================================
   BOOLEAN
===================================================== */

function convertBoolean(value) {

    if (
        typeof value === "boolean"
    ) {

        return value;

    }


    const text =
        String(
            value ?? ""
        )
        .trim()
        .toLowerCase();


    return (
        text === "true" ||
        text === "yes" ||
        text === "1" ||
        text === "featured"
    );

}


/* =====================================================
   DATE
===================================================== */

function formatDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }


    /*
     * JavaScript Date
     */

    if (
        value instanceof Date &&
        !isNaN(
            value.getTime()
        )
    ) {

        return formatDateObject(
            value
        );

    }


    /*
     * Excel serial date
     */

    if (
        typeof value === "number"
    ) {

        try {

            const parsed =
                XLSX.SSF.parse_date_code(
                    value
                );


            if (parsed) {

                return [
                    parsed.y,
                    String(
                        parsed.m
                    ).padStart(
                        2,
                        "0"
                    ),
                    String(
                        parsed.d
                    ).padStart(
                        2,
                        "0"
                    )
                ].join("-");

            }

        } catch (error) {

            console.warn(
                "Date parsing error:",
                error
            );

        }

    }


    /*
     * Text date
     */

    const date =
        new Date(
            value
        );


    if (
        !isNaN(
            date.getTime()
        )
    ) {

        return formatDateObject(
            date
        );

    }


    return String(
        value
    ).trim();

}


/* =====================================================
   FORMAT DATE OBJECT
===================================================== */

function formatDateObject(date) {

    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");

}


/* =====================================================
   PREVIEW
===================================================== */

function renderPreview() {

    previewSection.style.display =
        "block";


    recordCount.textContent =
        convertedData.length +
        " job" +
        (
            convertedData.length === 1
                ? ""
                : "s"
        );


    const columns = [

        ["Job ID", "job_id"],

        ["Job Title", "job_title"],

        ["Category", "category"],

        ["Location", "location"],

        ["Work Mode", "work_mode"],

        ["Job Type", "job_type"],

        ["Experience", "experience"],

        ["Salary", "salary"],

        ["Company", "company_name"],

        ["Posted", "posted_date"],

        ["Expiry", "expiry_date"],

        ["Featured", "featured"]

    ];


    /*
     * Header
     */

    previewHead.innerHTML =
        "<tr>" +

        columns
            .map(
                function (column) {

                    return (
                        "<th>" +
                        escapeHTML(
                            column[0]
                        ) +
                        "</th>"
                    );

                }
            )
            .join("") +

        "</tr>";


    /*
     * Body
     */

    previewBody.innerHTML =
        convertedData
            .map(
                function (job) {

                    return (
                        "<tr>" +

                        columns
                            .map(
                                function (column) {

                                    const value =
                                        job[
                                            column[1]
                                        ];


                                    return (
                                        "<td>" +
                                        escapeHTML(
                                            previewValue(
                                                value
                                            )
                                        ) +
                                        "</td>"
                                    );

                                }
                            )
                            .join("") +

                        "</tr>"
                    );

                }
            )
            .join("");

}


/* =====================================================
   PREVIEW VALUE
===================================================== */

function previewValue(value) {

    if (
        value === true
    ) {

        return "TRUE";

    }


    if (
        value === false
    ) {

        return "FALSE";

    }


    const text =
        String(
            value ?? ""
        );


    if (
        text.length > 70
    ) {

        return (
            text.substring(
                0,
                70
            ) +
            "..."
        );

    }


    return text;

}


/* =====================================================
   DOWNLOAD JSON
===================================================== */

downloadButton.addEventListener(
    "click",
    function () {

        if (
            convertedData.length === 0
        ) {

            showError(
                "Please upload an Excel file first."
            );

            return;

        }


        const json =
            JSON.stringify(
                convertedData,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "jobs.json";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            100
        );


        showSuccess(
            "jobs.json downloaded successfully."
        );

    }
);


/* =====================================================
   STATUS
===================================================== */

function showSuccess(message) {

    statusBox.textContent =
        message;

    statusBox.className =
        "status success";

}


function showError(message) {

    statusBox.textContent =
        message;

    statusBox.className =
        "status error";

}


function hideStatus() {

    statusBox.textContent =
        "";

    statusBox.className =
        "status";

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
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