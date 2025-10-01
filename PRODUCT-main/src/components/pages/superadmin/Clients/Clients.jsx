// In your Clients.jsx component

import React, { useState } from "react";
import { useClient } from "../../../context/ClientContext";
import { Loader2 } from "lucide-react";
import {
  CloseButton,
  // ... your buttons
  SubmitButton,
} from "../../../AllButtons/AllButtons";
import { useAlert } from "../../../context/AlertContext";

export const Clients = () => {
  const { addClient, isLoading, message } = useClient();
  const [clientName, setClientName] = useState("");
  const [hiringId, sethiringId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactnumber, setContactnumber] = useState("");
  const [clienttype, setClienttype] = useState("");
  const [companyname, setCompanyname] = useState("");
  const [address, setAddress] = useState("");
  const [communication, setCommunication] = useState("");
  const [projectType, setProjectType] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [formType, setFormType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { showAlert } = useAlert();

  // State to manage individual input errors (frontend and backend combined)
  const [errors, setErrors] = useState({});

  // const validateForm = () => {
  //   let newErrors = {};
  //   let isValid = true;

  //   // Validate client type
  //   if (!clienttype) {
  //     newErrors.client_type = "Please select a client type.";
  //     isValid = false;
  //   }

  //   // Email regex (basic check)
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //   // Phone regex (10 digits only)
  //   const phoneRegex = /^[0-9]{10}$/;

  //   if (clienttype === "Hired on Upwork") {
  //     if (!clientName.trim()) {
  //       newErrors.name = "Client Name is required.";
  //       isValid = false;
  //     }
  //     if (!hiringId.trim()) {
  //       newErrors.hire_on_id = "Hiring ID is required.";
  //       isValid = false;
  //     }
  //     if (!contactEmail.trim()) {
  //       newErrors.contact_email = "Contact Email is required.";
  //       isValid = false;
  //     } else if (!emailRegex.test(contactEmail)) {
  //       newErrors.contact_email = "Invalid Email format.";
  //       isValid = false;
  //     }
  //     if (!contactnumber.trim()) {
  //       newErrors.contact_number = "Contact Number is required.";
  //       isValid = false;
  //     } else if (!phoneRegex.test(contactnumber)) {
  //       newErrors.contact_number = "Contact Number must be 10 digits.";
  //       isValid = false;
  //     }
  //     if (!communication.trim()) {
  //       newErrors.communication = "Communication details are required.";
  //       isValid = false;
  //     }
  //   } else if (clienttype === "Direct") {
  //     if (!clientName.trim()) {
  //       newErrors.name = "Client Name is required.";
  //       isValid = false;
  //     }
  //     if (!contactEmail.trim()) {
  //       newErrors.contact_email = "Contact Email is required.";
  //       isValid = false;
  //     } else if (!emailRegex.test(contactEmail)) {
  //       newErrors.contact_email = "Invalid Email format.";
  //       isValid = false;
  //     }
  //     if (!contactnumber.trim()) {
  //       newErrors.contact_number = "Contact Number is required.";
  //       isValid = false;
  //     } else if (!phoneRegex.test(contactnumber)) {
  //       newErrors.contact_number = "Contact Number must be 10 digits.";
  //       isValid = false;
  //     }
  //     if (!address.trim()) {
  //       newErrors.company_address = "Address is required.";
  //       isValid = false;
  //     }
  //     if (!companyname.trim()) {
  //       newErrors.company_name = "Company Name is required.";
  //       isValid = false;
  //     }
  //     if (!communication.trim()) {
  //       newErrors.communication = "Communication details are required.";
  //       isValid = false;
  //     }
  //   }

  //   setErrors(newErrors);
  //   return isValid;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowMessage(false);

    const result = await addClient(
      clienttype,
      clientName,
      hiringId,
      contactEmail,
      contactnumber,
      address,
      companyname,
      communication

      // projectType
    );

    if (result.success) {
      // Reset form on success
      setClientName("");
      sethiringId("");
      setAddress("");
      setContactEmail("");
      setContactnumber("");
      setCompanyname("");
      setClienttype("");
      setCommunication("");
      // setProjectType("");
      setErrors({});
      setFormType(null);
    } else if (result.errors) {
      // Merge backend errors into state
      setErrors((prev) => ({ ...prev, ...result.errors }));

      // Only show alert if there are errors
      if (Object.keys(result.errors).length > 0) {
        // showAlert({ variant: "error", title: "Submission Error", message: "Please correct the errors below." });
      }
    } else {
      // Fallback for unexpected errors
      // showAlert({ variant: "error", title: "Submission Error", message: "Something went wrong. Please try again." });
    }
  };

  // Helper function to get error message for a field
  const getErrorMessage = (field) => {
    if (errors[field] && Array.isArray(errors[field])) {
      return errors[field][0]; // Laravel often sends an array of messages
    }
    return errors[field]; // For simple string errors or frontend errors
  };

  return (
    <div className="">
      <button onClick={() => setShowPopup(true)} className="add-items-btn">
        Add Client
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-center">
              Select Hiring Method
            </h3>
            <div className="grid flex-col space-y-4 my-4 mb-6 justify-center">
              <button
                onClick={() => {
                  setFormType("upwork");
                  setClienttype("Hired on Upwork");
                  setShowPopup(false);
                  setErrors({}); // Clear errors when changing form type
                  setShowMessage(false); // Hide previous general messages
                }}
                className="flex items-center justify-center w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5"
              >
                Hired on Upwork
              </button>
              <button
                onClick={() => {
                  setFormType("direct");
                  setClienttype("Direct");
                  setShowPopup(false);
                  setErrors({}); // Clear errors when changing form type
                  setShowMessage(false); // Hide previous general messages
                }}
                className="flex items-center justify-center w-full text-center px-4 py-2 mb-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5"
              >
                Direct
              </button>
            </div>
            <CloseButton onClick={() => setShowPopup(false)} />
          </div>
        </div>
      )}

      {showMessage && message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${
            message.includes("successfully")
              ? "bg-green-50 text-green-800 border border-green-300"
              : "bg-red-50 text-red-800 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {formType === "upwork" && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg md:max-w-lg">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold mb-6">Upwork Hiring Form</h3>
              <button
                className="font-bold"
                onClick={() => {
                  setFormType(null);
                  setErrors({});
                  setShowMessage(false);
                }}
              >
                X
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4"
            >
              <div>
                <label
                  htmlFor="clientName"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Client Name
                </label>
                <input
                  id="clientName"
                  required={true}
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    // setErrors({ ...errors, name: null }); // 'name' for backend validation
                    setErrors((prevErrors) => ({ ...prevErrors, name: null }));
                  }}
                  placeholder="Enter Client Name"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("name")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("name") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("name")}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactEmail"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  required={true}
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    setErrors({ ...errors, contact_email: null }); // 'contact_detail' for backend
                  }}
                  placeholder="Enter Contact E-mail"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("contact_email")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("contact_email") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("contact_email")}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactnumber"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Contact Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required={true}
                  id="contactnumber"
                  value={contactnumber}
                  onChange={(e) => {
                    setContactnumber(e.target.value);
                    // setErrors({ ...errors, contact_number: null }); // 'contact_detail' for backend
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      contact_number: null,
                    }));
                  }}
                  placeholder="Enter Contact Number"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("contact_number")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("contact_number") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("contact_number")}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="hiringId"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Hiring Id
                </label>
                <input
                  id="hiringId"
                  value={hiringId}
                  required={true}
                  onChange={(e) => {
                    sethiringId(e.target.value);
                    // setErrors({ ...errors, hire_on_id: null }); // 'hire_on_id' for backend
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      hire_on_id: null,
                    }));
                  }}
                  placeholder="Enter Hiring Id"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("hire_on_id")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("hire_on_id") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("hire_on_id")}
                  </p>
                )}
              </div>

              {/* <div>
                <label
                  htmlFor="projectType"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Project Type
                </label>
                <select
                  id="projectType"
                  value={projectType}
                  onChange={(e) => {
                    setProjectType(e.target.value);
                    setErrors({ ...errors, project_type: null }); // 'project_type' for backend
                  }}
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage('project_type') ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Project Type</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
                {getErrorMessage('project_type') && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage('project_type')}
                  </p>
                )}
              </div> */}
              <div className="col-span-2">
                <label
                  htmlFor="communication"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Communication
                </label>
                <input
                  id="communication"
                  type="text"
                  required={true}
                  value={communication}
                  onChange={(e) => {
                    setCommunication(e.target.value);
                    setErrors({ ...errors, communication: null }); // 'communication' for backend
                  }}
                  placeholder="e.g., Email, Upwork Chat, Phone"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("communication")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("communication") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("communication")}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                <SubmitButton disabled={isLoading} />
              </div>
            </form>
          </div>
        </div>
      )}

      {formType === "direct" && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl md:max-w-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-6">Direct Hiring Form</h3>
              <button
                className="font-bold"
                onClick={() => {
                  setFormType(null);
                  setErrors({});
                  setShowMessage(false);
                }}
              >
                X
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client Name
                </label>
                <input
                  value={clientName}
                  required={true}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setErrors((prevErrors) => ({ ...prevErrors, name: null }));
                  }}
                  placeholder="Enter Client Name"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("name")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("name") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("name")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact E-mail
                </label>
                <input
                  typeof="email"
                  value={contactEmail}
                  required={true}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      contact_email: null,
                    }));
                  }}
                  placeholder="Enter Contact Email"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("contact_email")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("contact_email") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("contact_email")}
                  </p>
                )}
              </div>

            <div>
  <label className="block text-sm font-medium text-gray-700">
    Contact Number
  </label>
  <input
    type="text" 
    maxLength={10}
    required={true}
    value={contactnumber}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d{0,10}$/.test(value)) {
        setContactnumber(value);
        setErrors((prevErrors) => ({
          ...prevErrors,
          contact_number: null,
        }));
      }
    }}
    onBlur={() => {
      if (contactnumber.length !== 10) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          contact_number: "Contact number must be 10 digits",
        }));
      }
    }}
    placeholder="Enter Contact Number"
    className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
      getErrorMessage("contact_number")
        ? "border-red-500"
        : "border-gray-300"
    }`}
  />
  {getErrorMessage("contact_number") && (
    <p className="text-red-500 text-xs mt-1">
      {getErrorMessage("contact_number")}
    </p>
  )}
</div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  value={companyname}
                  required={true}
                  onChange={(e) => {
                    setCompanyname(e.target.value);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      company_name: null,
                    }));
                  }}
                  placeholder="Enter Company Name"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("company_name")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("company_name") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("company_name")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  value={address}
                  required={true}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      company_address: null,
                    }));
                  }}
                  placeholder="Enter Address"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("company_address")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("company_address") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("company_address")}
                  </p>
                )}
              </div>

              {/* <div>
                <label
                  htmlFor="directProjectType"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Project Type
                </label>
                <select
                  id="directProjectType"
                  value={projectType}
                  onChange={(e) => {
                    setProjectType(e.target.value);
                    setErrors({ ...errors, project_type: null });
                  }}
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage('project_type') ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Project Type</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
                {getErrorMessage('project_type') && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage('project_type')}
                  </p>
                )}
              </div> */}

              <div>
                <label
                  htmlFor="directCommunication"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Communication
                </label>
                <input
                  id="directCommunication"
                  type="text"
                  required={true}
                  value={communication}
                  onChange={(e) => {
                    setCommunication(e.target.value);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      communication: null,
                    }));
                  }}
                  placeholder="e.g., Email, Slack, Microsoft Teams"
                  className={`w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    getErrorMessage("communication")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getErrorMessage("communication") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getErrorMessage("communication")}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                <SubmitButton disabled={isLoading} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
