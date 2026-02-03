import React from "react";
import { User } from "lucide-react";

const EmployeeProfileCard = ({ employee }) => {
  if (!employee) return null;

  return (
    <div className="bg-white rounded-2xl sm:shadow-md border sm:border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 transition-shadow hover:shadow-lg duration-300 w-full">
      
      {/* Header */}
      <div className="px-5 py-3 flex items-center bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
        <h3 className="text-sm md:text-md font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4" />
          Employee Profile
        </h3>
      </div>


      <div className="flex flex-col w-full md:flex-row items-start gap-8 p-3 sm:p-6">
        

        <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/3">
          <img
            src={
              employee.profile_pic ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-blue-200 shadow-lg ring-4 ring-blue-100"
          />
          <span className="mt-3 text-sm font-semibold text-gray-700">
            {employee.employee_id || "N/A"}
          </span>
        </div>

   
<div className="flex flex-col w-full min-w-0 text-end">
  <div className="text-[12px] text-end text-gray-700 w-full max-w-full space-y-2">
    {/* Name */}
    <div className="flex flex-row gap-2 justify-start items-start w-full">
      <span className=" text-right font-medium text-gray-800 whitespace-nowrap flex-shrink-0">
        Name
      </span>
      <span className="text-left text-gray-500 break-words  w-fit min-w-0 overflow-hidden">
        {employee.name}
      </span>
    </div>

    {/* Email */}
    <div className="flex text-[12px] flex-row justify-start gap-2 items-start w-full">
      <span className=" text-right font-medium text-gray-800 whitespace-nowrap flex-shrink-0">
        Email
      </span>
      <span className="text-left text-gray-500 break-words  w-fit min-w-0 overflow-hidden">
        {employee.email}
      </span>
    </div>

    {/* Phone */}
    <div className="flex text-[12px] flex-row justify-start gap-2 items-start w-full">
      <span className=" text-right font-medium text-gray-800 whitespace-nowrap flex-shrink-0">
        Phone
      </span>
      <span className="text-left break-words  min-w-0 w-fit overflow-hidden">
        {employee.phone_num || "N/A"}
      </span>
    </div>

    {/* Designation */}
    <div className="flex text-[12px] flex-row justify-start gap-2 items-start w-full">
      <span className=" text-right font-medium text-gray-800 whitespace-nowrap flex-shrink-0">
        Designation
      </span>
      <span className="text-left break-words  min-w-0 w-fit overflow-hidden">
        {employee.roles || "N/A"}
      </span>
    </div>

    {/* Team */}
    <div className="flex text-[12px] flex-row justify-start gap-2 items-start w-full">
      <span className=" text-right font-medium text-gray-800 whitespace-nowrap flex-shrink-0">
        Team
      </span>
      <span className="text-left break-words  min-w-0 w-fit overflow-hidden">
        {employee.teams?.length ? employee.teams.join(", ") : "N/A"}
      </span>
    </div>
  </div>
</div>






      </div>
    </div>
  );
};

export default EmployeeProfileCard;












// import React from "react";
// import { User } from "lucide-react";

// const EmployeeProfileCard = ({ employee }) => {
//   if (!employee) return null;

//   return (
//     <div className="bg-white rounded-2xl shadow-md border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 transition-shadow hover:shadow-lg duration-300 w-full">
      
//       {/* Header */}
//       <div className="px-5 py-3 flex items-center bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
//         <h3 className="text-sm md:text-md font-semibold text-white flex items-center gap-2">
//           <User className="w-4 h-4" />
//           Employee Profile
//         </h3>
//       </div>


//       <div className="flex flex-col md:flex-row items-start gap-8 p-6">
        

//         <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/3">
//           <img
//             src={
//               employee.profile_pic ||
//               "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             alt="Profile"
//             className="w-32 h-32 rounded-full object-cover border-2 border-blue-200 shadow-lg ring-4 ring-blue-100"
//           />
//           <span className="mt-3 text-sm font-semibold text-gray-700">
//             {employee.employee_id || "N/A"}
//           </span>
//         </div>

   
// <div className="flex flex-col w-full items-end">

//   <table className="text-sm text-gray-700 w-full max-w-md border-collapse">
//     <tbody>

//       {/* Name */}
//       <tr>
//         <td className="pr-4 text-right font-medium text-gray-800 whitespace-nowrap">
//           Name
//         </td>
//         <td className="text-left text-sm text-gray-500">
//             {employee.name}
//           </td>

//       </tr>

//       {/* Email */}
//       <tr>
//         <td className="pr-4 text-right font-medium text-gray-800 whitespace-nowrap">
//           Email
//         </td>
//         <td className="text-left text-sm text-gray-500">
//           {employee.email}
//         </td>
//       </tr>

//       {/* Phone */}
//       <tr>
//         <td className="pr-4 text-right font-medium text-gray-800 whitespace-nowrap">
//           Phone
//         </td>
//         <td className="text-left">
//           {employee.phone_num || "N/A"}
//         </td>
//       </tr>

//       {/* Designation */}
//       <tr>
//         <td className="pr-4 text-right font-medium text-gray-800 whitespace-nowrap">
//           Designation
//         </td>
//         <td className="text-left">
//           {employee.roles || "N/A"}
//         </td>
//       </tr>

//       {/* Team */}
//       <tr>
//         <td className="pr-4 text-right font-medium text-gray-800 whitespace-nowrap align-top">
//           Team
//         </td>
//         <td className="text-left">
//           {employee.teams?.length ? employee.teams.join(", ") : "N/A"}
//         </td>
//       </tr>

//     </tbody>
//   </table>

// </div>





//       </div>
//     </div>
//   );
// };

// export default EmployeeProfileCard;
