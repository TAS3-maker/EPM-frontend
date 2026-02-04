import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../utils/ApiConfig';
import { SectionHeader } from '../../../components/SectionHeader';

import EmployeeProfileCard from '../../superadmin/employeedetail/EmployeeProfileCard'
import TotalLeaveCard from '../../superadmin/employeedetail/TotalLeaveCard';
import TotalWorkingHoursCard from '../../superadmin/employeedetail/TotalWorkingHoursCard';
import ProjectOverviewCard from '../../superadmin/employeedetail/ProjectOverviewCard';
import ProjectActivityCard from '../../superadmin/employeedetail/ProjectActivityCard';
import { User } from 'lucide-react';
import { LeaveProvider } from "../../../context/LeaveContext";

const EmployeeDetailMain = () => {
  const { id } = useParams();
  const userToken = localStorage.getItem('userToken');
  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployeeData = async () => {
    if (!userToken) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/getfull_proileemployee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      
      console.log('this also,', response.data.data.user);
      setEmployee(response.data.data.user);
      
      
      setProjects(response.data.data.project_user);
      console.log('these i have to check inside,', response.data.data.project_user);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('Failed to load employee data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id, userToken]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 bg-gray-50 min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-xl text-gray-600">Loading employee details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 bg-red-50 min-h-screen">
      <div className="text-center p-6 rounded-lg shadow-md bg-white">
        <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
        <p className="text-gray-600">Please check your internet connection or try refreshing the page.</p>
      </div>
    </div>
  );

  if (!employee) return (
    <div className="flex items-center justify-center py-20 bg-gray-50 min-h-screen">
      <div className="text-center p-6 rounded-lg shadow-md bg-white">
        <p className="text-xl text-gray-600 font-semibold mb-4">No employee data found.</p>
        <p className="text-gray-500">The employee ID might be invalid or there's no information available.</p>
      </div>
    </div>
  );

  return (
    <div className=" space-y-6 font-sans">
      <SectionHeader icon={User} title="Employee Details" subtitle="Gain insights into employee profiles and project activity distributions."
      showBack={true}
      showRefresh={true}
      onRefresh={fetchEmployeeData}
        />
      
      {/* Profile + Leaves */}
      <div className="flex flex-col md:flex-row  gap-4">
        <EmployeeProfileCard employee={employee} />
        <LeaveProvider>
          <TotalLeaveCard />
        </LeaveProvider>

      </div>

      {/* Working Hours */}
      <TotalWorkingHoursCard />

      {/* Project Activity */}
      <ProjectActivityCard projects={projects} employeeId={id} />

      {/* Project Overview */}
      <ProjectOverviewCard projects={projects} />

      
    </div>
  );
};

export default EmployeeDetailMain;



