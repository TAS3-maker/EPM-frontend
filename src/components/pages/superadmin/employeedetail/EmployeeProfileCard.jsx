import React from 'react';
import { User } from 'lucide-react';

const EmployeeProfileCard = ({ employee }) => {
    if (!employee) return null;

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 transition-shadow hover:shadow-lg duration-300 w-full md:max-w-50%">
            <div className="px-5 py-2 flex items-center justify-between bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-t-xl">
                <h3 className="text-sm md:text-md font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employee Profile
                </h3>
            </div>
            <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <img
                        src={employee.profile_pic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt="Profile"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-1 border-blue-100 shadow-md hover:scale-105 transition-transform duration-300 ring-2 ring-blue-100"
                    />
                    <span className='text-sm font-semibold'>{employee.employee_id || 'N/A'}</span>
                </div>
                <div className="flex flex-col flex-grow space-y-4">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{employee.name}</h2>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-700">
                        <div><span className="font-medium text-gray-800">Phone:</span> {employee.phone_num || 'N/A'}</div>
                        <div><span className="font-medium text-gray-800">Designation:</span> {employee.roles}</div>
                        <div>
                            <span className="font-medium text-gray-800">Team:</span>
                            {employee.teams && employee.teams.length > 0 ? (
                                employee.teams.map((team, index) => (
                                    <span key={index}>{team}{index !== employee.teams.length - 1 ? ', ' : ''}</span>
                                ))
                            ) : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileCard;
