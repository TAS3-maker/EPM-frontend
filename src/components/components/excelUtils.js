import * as XLSX from "xlsx";
import React, { createContext, useContext, useState, useEffect } from "react";

import { useEmployees } from "../context/EmployeeContext";
import { useProject } from "../context/ProjectContext";
import { useClient } from "../context/ClientContext";
import { useAlert } from "../context/AlertContext";
/**
 * Function to export data to Excel
 */

// const { showAlert } = useAlert();
export const exportToExcel = (data, fileName) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format.");
    return;
  }

  // Include all keys except:
  // - "id"
  // - any key that ends with "_id" (EXCEPT "hire_on_id")
  // - "created_at"
  // - "updated_at"
  const allKeys = Object.keys(data[0]).filter(key =>
    key !== "id" &&
    (key === "hire_on_id" || !key.endsWith("_id")) &&
    key !== "created_at" &&
    key !== "updated_at"
  );

  const filteredData = data.map(item => {
    const newItem = {};
    allKeys.forEach(key => {
      newItem[key] = item[key];
    });
    return newItem;
  });

  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};


/**
 * Validate Email Format
 */
const isValidEmail = (email) => {
  if (!email) return false;
  email = email.replace(/"/g, "").trim(); // Clean email
  // console.log("Checking email:", email);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // if (!isValid) console.log("Invalid email format:", email);
  return isValid;
};
/**
 * Function to import data from an Excel file
 */
export const importFromExcel = (file, importHandler,showAlert) => {
  
  const reader = new FileReader();
    
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      // alert("The file is empty or unreadable.");
              showAlert({ variant: "warning", title: "warning", message: "The file is empty or unreadable." });

      
      return;
    }

    const rawHeaders = Object.keys(jsonData[0]);
    const normalizedHeaders = rawHeaders.map(h =>
      h.toLowerCase().replace(/\s+/g, "_").trim()
    );

    // console.log("📥 Raw Headers:", rawHeaders);
    // console.log("✅ Normalized Headers:", normalizedHeaders);
const isProjectFormat = normalizedHeaders.includes("client_id") &&
                        normalizedHeaders.includes("project_name") &&
                        normalizedHeaders.includes("tags_activitys");

    // Detect formats
    const isClientFormat1 = normalizedHeaders.includes("hire_on_id") && normalizedHeaders.includes("contact_detail");
    const isClientFormat2 = normalizedHeaders.includes("company_name") && normalizedHeaders.includes("company_address") && normalizedHeaders.includes("contact_detail");
    const isEmployeeFormat = normalizedHeaders.includes("email") && normalizedHeaders.includes("phone_num") && normalizedHeaders.includes("team");

    let validData = [];

    if (isClientFormat1) {
      // console.log("📂 Client Format 1 Detected (with hire_on_id)");

      const required = [
        "name",
        "contact_detail",
        "hire_on_id",
        "project_type",
        "communication"
      ];

      validData = jsonData
        .map(row => {
          const mapped = {};
          let isValid = true;
          required.forEach(col => {
            const value = row[col] ?? "";
            mapped[col] = value;
            if (!value) isValid = false;
          });
          return isValid ? mapped : null;
        })
        .filter(Boolean);
    }

    else if (isClientFormat2) {
      // console.log("📂 Client Format 2 Detected (with company_name & address)");

      const required = [
        "name",
        "contact_detail",
        "company_name",
        "company_address",
        "project_type",
        "communication"
      ];

      validData = jsonData
        .map(row => {
          const mapped = {};
          let isValid = true;
          required.forEach(col => {
            const value = row[col] ?? "";
            mapped[col] = value;
            if (!value) isValid = false;
          });
          return isValid ? mapped : null;
        })
        .filter(Boolean);
    }

    else if (isEmployeeFormat) {
      // console.log("📂 Employee Format Detected");

      const required = [
        "name",
        "email",
        "phone_num",
        "emergency_phone_num",
        "roles",
        "address",
        "team",
        "profile_pic_url"
      ];

      validData = jsonData
        .map(row => {
          const mapped = {};
          required.forEach(col => {
            const value = row[col];
            if (value === undefined || value === "") {
              mapped[col] = null;
            } else if (!isNaN(value) && col !== "phone_num" && col !== "emergency_phone_num") {
              mapped[col] = Number(value);
            } else {
              mapped[col] = typeof value === "string" ? value.trim() : value;
            }
          });
          return mapped;
        })
        .filter(emp => emp.name && emp.phone_num && isValidEmail(emp.email));
    }
else if (isProjectFormat) {
  // console.log("📂 Project Format Detected");

  const required = ["project_name"];
  validData = jsonData.map(row => {
    const mapped = {};
    let isValid = true;

    required.forEach(col => {
      const value = row[col] ?? "";
      mapped[col] = value;
      if (!value) isValid = false;
    });

    // Handle optional fields
    mapped.client_id = row["client_id"] || 0;
    mapped.tags_activitys = row["tags_activitys"]
      ? row["tags_activitys"].split(",").map(t => t.trim()).filter(Boolean)
      : [];

    mapped.deadline = row["deadline"] || null;

    return isValid ? mapped : null;
  }).filter(Boolean);
}


    else {
      // alert("❌ Unsupported file format. Please check required headers.");
      console.error("Unrecognized Headers:", normalizedHeaders);
      return;
    }

    if (validData.length === 0) {
      // alert("⚠️ No valid records found. Check your file's data.");
      return;
    }

    // console.log("✅ Final Valid Data to Import:", validData);
    importHandler(validData);
  };

  reader.readAsArrayBuffer(file);
};



/**
 * Function to fetch data from Google Sheets
 */
export const fetchGoogleSheetData = async (url, importHandler) => {
  const sheetId = extractSheetId(url);
  if (!sheetId) {
    alert("Invalid Google Sheets URL.");
    return;
  }

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  try {
    const response = await fetch(sheetUrl);
    const text = await response.text();
    const parsedData = parseCSV(text);
    if (parsedData.length === 0) {
      alert("Google Sheet is empty or has formatting issues.");
      return;
    }

    const rawHeaders = Object.keys(parsedData[0]);
    const normalizedHeaders = rawHeaders.map(h =>
      h.toLowerCase().replace(/\s+/g, "_").trim()
    );

    const isClientFormat1 = normalizedHeaders.includes("hire_on_id") && normalizedHeaders.includes("contact_detail");
    const isClientFormat2 = normalizedHeaders.includes("company_name") && normalizedHeaders.includes("company_address") && normalizedHeaders.includes("contact_detail");
    const isEmployeeFormat = normalizedHeaders.includes("email") && normalizedHeaders.includes("phone_num") && normalizedHeaders.includes("team");

    let validData = [];

    if (isClientFormat1) {
      // console.log("📂 Google Sheet: Client Format 1 Detected");
      const required = ["name", "contact_detail", "hire_on_id", "project_type", "communication"];
      validData = parsedData.map(row => {
        const mapped = {};
        let isValid = true;
        required.forEach(col => {
          const value = row[col] ?? "";
          mapped[col] = value;
          if (!value) isValid = false;
        });
        return isValid ? mapped : null;
      }).filter(Boolean);
    }

    else if (isClientFormat2) {
      // console.log("📂 Google Sheet: Client Format 2 Detected");
      const required = ["name", "contact_detail", "company_name", "company_address", "project_type", "communication"];
      validData = parsedData.map(row => {
        const mapped = {};
        let isValid = true;
        required.forEach(col => {
          const value = row[col] ?? "";
          mapped[col] = value;
          if (!value) isValid = false;
        });
        return isValid ? mapped : null;
      }).filter(Boolean);
    }

    else if (isEmployeeFormat) {
      // console.log("📂 Google Sheet: Employee Format Detected");
      const required = ["name", "email", "phone_num", "emergency_phone_num", "roles", "address", "team"];
      validData = parsedData.map(row => {
        const mapped = {};
        required.forEach(col => {
          const value = row[col];
          if (value === undefined || value === "") {
            mapped[col] = "";
          } else if (!isNaN(value) && col !== "phone_num" && col !== "emergency_phone_num") {
            mapped[col] = Number(value);
          } else {
            mapped[col] = value.trim();
          }
        });
        mapped.password = "DefaultPass123";
        mapped.profile_pic = null;
        return mapped;
      }).filter(emp => emp.name && emp.phone_num && isValidEmail(emp.email));
    }

    else {
      console.warn("❌ Google Sheet format not supported:", normalizedHeaders);
      return;
    }

    if (validData.length === 0) {
      alert("⚠️ No valid records found in Google Sheet.");
      return;
    }

    // console.log("✅ Final Valid Data from Google Sheet:", validData);
    importHandler(validData);
  } catch (error) {
    console.error("❌ Failed to fetch Google Sheet data:", error);
  }
};

/**
 * Extract Google Sheet ID from URL
 */
const extractSheetId = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};




/**
 * Convert CSV text to an array of employees
 */
function parseCSV(text) {
  const rows = text
    .split("\n")
    .map(row => row.split(",").map(value => value.replace(/^"|"$/g, "").trim())); // Remove surrounding quotes
  if (rows.length < 2) {
    console.error("CSV data is empty or incorrect");
    return [];
  }
  // Extract headers and ensure they match required column names
  const headers = rows[0].map(header => header.toLowerCase().replace(/\s+/g, "_")); // Normalize headers
  // console.log("CSV Headers (Cleaned):", headers);
  const data = rows.slice(1).map(row => {
    let obj = {};
    row.forEach((value, index) => {
      obj[headers[index]] = value || ""; // Ensure no undefined values
    });
    return obj;
  });
  // console.log("Parsed Data (Fully Cleaned):", data);
  return data;
}

export const useImportEmployees = () => {
  const { addEmployee } = useEmployees();
  const { showAlert } = useAlert();
  const [loading1, setLoading1] = useState(false);

  const importEmployees = async (newEmployees) => {
    if (!Array.isArray(newEmployees) || newEmployees.length === 0) {
      showAlert({
        variant: "error",
        title: "No Employee Data",
        message: "The uploaded Excel file is empty or contains invalid data.",
      });
      return;
    }

    setLoading1(true);

    let successCount = 0;
    let failedCount = 0;

    for (const employee of newEmployees) {
      if (!employee.name || !employee.email) {
        failedCount++;
        continue;
      }

      const result = await addEmployee(employee);

      if (result) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    setLoading1(false);

    const totalCount = successCount + failedCount;

    showAlert({
      variant: failedCount > 0 ? "warning" : "success",
      title: "Import Summary",
      message: `Total: ${totalCount}\nSuccess: ${successCount}\nFailed: ${failedCount}`,
    });
  };

  return { importEmployees, loading1 };
};








export const useImportProjects = () => {
  const { addProject } = useProject();
  const { showAlert } = useAlert();

  const importProjects = async (projectList) => {
    if (!Array.isArray(projectList) || projectList.length === 0) {
      showAlert({
        variant: "error",
        title: "No Project Data",
        message: "Excel file is empty or invalid.",
      });
      return;
    }

    const skipped = [];

    for (const project of projectList) {
      try {
        const clientId = parseInt(project.client_id);
        const projectName = project.project_name;
        const tags_activitys = Array.isArray(project.tags_activitys)
          ? project.tags_activitys
          : typeof project.tags_activitys === "string"
          ? project.tags_activitys.split(",").map(t => t.trim()).filter(Boolean)
          : [];

        if (!clientId || !projectName || tags_activitys.length === 0) {
          skipped.push(`Invalid data for project: ${project.project_name || "Unnamed Project"}`);
          continue;
        }

        await addProject(clientId, projectName, tags_activitys);
      } catch (error) {
        skipped.push(`Failed to import project "${project.project_name}": ${error.message}`);
      }
    }

    if (skipped.length > 0) {
      showAlert({
        variant: "warning",
        title: "Some Projects Skipped",
        message: skipped.join("\n"),
      });
    } else {
      showAlert({
        variant: "success",
        title: "Projects Imported",
        message: "All projects were successfully imported.",
      });
    }
  };

  return { importProjects };
};


export const useImportClients = () => {
  const { addClient } = useClient();
  const { showAlert } = useAlert();

  const VALID_HEADERS = [
    "name",
    "contact_detail",
    "hire_on_id",
    "company_name",
    "company_address",
    "communication",
    "project_type"
  ];

  const validateHeaders = (inputHeaders) => {
    return inputHeaders.filter((h) => !VALID_HEADERS.includes(h));
  };

  const importClients = async (newClients, headers = []) => {
    const skippedClients = [];

    if (!Array.isArray(newClients) || newClients.length === 0) {
      showAlert({
        variant: "error",
        title: "No Client Data",
        message: "Excel file is empty or invalid.",
      });
      return;
    }

    // Validate headers
    const unrecognizedHeaders = validateHeaders(headers);

    if (unrecognizedHeaders.length > 0) {
      showAlert({
        variant: "error",
        title: "Unrecognized Headers Found",
        message: `The following headers are not supported:\n\n${unrecognizedHeaders.join(", ")}\n\nPlease check your Excel file format.`,
      });
      return;
    }

    for (const client of newClients) {
      try {
        let clienttype = "";
        const clientName = client.name || "Unnamed Client";

        if (client.hire_on_id) {
          if (isNaN(client.hire_on_id)) {
            skippedClients.push(`${clientName}: Invalid hire_on_id "${client.hire_on_id}" (must be a number)`);
            continue;
          }
          clienttype = "Hired on Upwork";
        } else if (client.company_name && client.company_address) {
          clienttype = "Direct";
        } else {
          skippedClients.push(`${clientName}: Missing hire_on_id or company details (client type unknown)`);
          continue;
        }

        const result = await addClient(
          clienttype,
          client.name || "",
          client.hire_on_id || "",
          client.contact_detail || "",
          client.company_address || "",
          client.company_name || "",
          client.communication || "",
          client.project_type || ""
        );

        if (!result.success) {
          const formattedErrors = result.errors
            ? Object.entries(result.errors)
                .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
                .join("; ")
            : "Unknown error";

          skippedClients.push(`${clientName}: Failed to import — ${formattedErrors}`);
        }

      } catch (error) {
        skippedClients.push(`${client.name || "Unnamed Client"}: Unexpected error — ${error.message}`);
      }
    }

    if (skippedClients.length > 0) {
      showAlert({
        variant: "warning",
        title: "Some Clients Skipped",
        message: skippedClients.join("\n"),
      });
    } else {
      showAlert({
        variant: "success",
        title: "Clients Imported",
        message: "All clients were successfully imported.",
      });
    }
  };

  return { importClients };
};










