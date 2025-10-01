import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'; // Import LinearScale and ArcElement
import { API_URL } from '../../../utils/ApiConfig';
import { SectionHeader } from '../../../components/SectionHeader';
import { BarChart, User } from "lucide-react"; // Consider 'User' for profile icon if not BarChart
import DashboardCard07 from '../dashboard copy/DashboardCard07';
import { ClientProvider } from '../../../context/ClientContext';
import { ProjectProvider } from '../../../context/ProjectContext';
import SuperAdminDashboard from '../SuperAdminDashboard';

// Register all necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const EmployeeDetail = () => {
  const { id } = useParams();
  const userToken = localStorage.getItem('userToken');

  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [barChartData, setBarChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [doughnutChartData, setDoughnutChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Define a consistent color palette
  const chartColors = {
    primaryBlue: '#3B82F6',
    secondaryRed: '#EF4444',
    yellow: '#FACC15',
    green: '#22C55E',
    orange: '#F97316',
    lightBlue: '#60A5FA',
    lightRed: '#F87171',
    // More shades or complementary colors can be added
  };

  useEffect(() => {
    const computeDoughnutChartData = (projects) => {
      const activityTypeTotals = {};

      projects.forEach(project => {
        project.activities.forEach(activity => {
          const [h, m] = activity.total_hours.split(":").map(Number);
          const hours = h + m / 60;
          const type = activity.activity_type;

          activityTypeTotals[type] = (activityTypeTotals[type] || 0) + hours;
        });
      });

      const labels = Object.keys(activityTypeTotals);
      const values = Object.values(activityTypeTotals);

      // Assign colors from your palette more dynamically or in a fixed order
      const backgroundColors = [
        chartColors.primaryBlue,
        chartColors.secondaryRed,
        chartColors.yellow,
        chartColors.green,
        chartColors.orange,
        chartColors.lightBlue,
        chartColors.lightRed
      ].slice(0, labels.length); // Ensure enough colors for all labels

      setDoughnutChartData({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: '#FFFFFF', // White border for separation
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      });
    };

    if (projects.length > 0) computeDoughnutChartData(projects);
  }, [projects]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!userToken) {
        setError("Authentication token not found. Please log in.");
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

        setEmployee(response.data.data.user);
        console.log("this also", response.data.data.user);
        setProjects(response.data.data.project_user);
        console.log("these i have to check inside", response.data.data.project_user);
        prepareBarChartData(response.data.data.project_user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("Failed to load employee data. Please try again.");
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id, userToken]);

  const prepareBarChartData = (projects) => {
    let totalBillable = 0;
    let totalNonBillable = 0;

    projects.forEach(project => {
      project.activities.forEach(activity => {
        const [hours, mins] = activity.total_hours.split(':').map(Number);
        const activityHours = hours + mins / 60;

        if (activity.activity_type === "Billable") {
          totalBillable += activityHours;
        } else if (activity.activity_type === "Non Billable") {
          totalNonBillable += activityHours;
        }
      });
    });

    setBarChartData({
      labels: ['Billable', 'Non-Billable'],
      datasets: [
        {
          label: 'Total Hours', // More descriptive label
          data: [totalBillable, totalNonBillable],
          backgroundColor: [chartColors.primaryBlue, chartColors.secondaryRed],
          borderColor: [chartColors.primaryBlue, chartColors.secondaryRed],
          borderWidth: 1,
          borderRadius: 4, // Slightly rounded bars
        }
      ]
    });
  };



  
 const handleProjectChange = (e) => {
    const selectedName = e.target.value;
    setSelectedProject(selectedName);
    const selected = projects.find(p => (p.project_name || 'Unnamed Project') === selectedName);
    if (!selected) return setPieChartData({});
    const types = ['Billable', 'Non Billable', 'inhouse', 'Learning (R&D)', 'No Work'];
    const data = types.map(type => {
      const act = selected.activities.find(a => typeof a.activity_type === 'string' && a.activity_type.toLowerCase() === type.toLowerCase());
      return act ? parseFloat(act.total_hours.split(":")[0]) + parseFloat(act.total_hours.split(":")[1]) / 60 : 0;
    });
    // Consistent color mapping for pie chart
    const pieColors = [
      chartColors.primaryBlue,
      chartColors.secondaryRed,
      chartColors.yellow,
      chartColors.green,
      chartColors.orange
    ];
    setPieChartData({
      labels: types,
      datasets: [{
        data,
        backgroundColor: pieColors.slice(0, data.length),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 10
      }]
    });
  };

  // Chart options for better presentation
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Often not needed for simple bar charts like this
      },
      title: {
        display: true,
        text: 'Billable vs. Non-Billable Hours',
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif' // Specify a font family
        },
        color: '#1F2937'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + ' hours';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#4B5563',
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB', // Lighter grid lines
        },
        ticks: {
          color: '#4B5563',
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    }
  };

  const pieDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Can be 'top', 'bottom', 'left', 'right'
        labels: {
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          color: '#4B5563',
          boxWidth: 20, // Adjust legend box size
          padding: 15, // Padding between legend items
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed.toFixed(2) + ' hours';
            }
            return label;
          }
        }
      }
    },
    cutout: '60%', // For Doughnut chart - adjust thickness
  };


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
    <>
      
        <div className="rounded-2xl border border-gray-100 bg-white shadow-xl max-h-screen overflow-y-auto space-y-12 font-sans px-6 py-10">
      {/* Header */}
      <SectionHeader
        icon={User}
        title="Employee Details"
        subtitle="Gain insights into employee profiles and project activity distributions."
      />

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 transition-shadow hover:shadow-xl duration-300">
  <div className="flex flex-col lg:flex-row items-start gap-6">
    
    {/* Profile Picture */}
    <div className="flex-shrink-0">
      <img
        src={employee.profile_pic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
        alt="Profile"
        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-100 shadow-md hover:scale-105 transition-transform duration-300 ring-2 ring-blue-100"
      />
    </div>

    {/* Profile Info */}
    <div className="flex flex-col flex-grow space-y-4">
      
      {/* Name & Email */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{employee.name}</h2>
        <p className="text-sm text-gray-500">{employee.email}</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
         <div>
          <span className="font-medium text-gray-800">Employee ID:</span> 
          
          {employee.employee_id || 'N/A'}
        </div>
        <div>
          <span className="font-medium text-gray-800">Designation:</span> {employee.roles}
        </div>
        <div>
          <span className="font-medium text-gray-800">Phone:</span> {employee.phone_num || 'N/A'}
        </div>
        <div>
          <span className="font-medium text-gray-800">Emergency Contact:</span> {employee.emergency_phone_num || 'N/A'}
        </div>
        <div>
          <span className="font-medium text-gray-800">Team:</span> {employee.team || 'N/A'}
        </div>
        <div className="sm:col-span-2">
          <span className="font-medium text-gray-800">Address:</span> {employee.address || 'N/A'}
        </div>
      </div>
    </div>
  </div>
</div>


      {employee.roles === 'Team' ? (
        <div className="space-y-12">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition-shadow hover:shadow-lg duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Total Billable vs. Non-Billable Hours</h3>
              <div className="flex justify-center items-center py-6">
  <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-4xl h-72">
    <Bar data={barChartData} options={barChartOptions} />
  </div>
</div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition-shadow hover:shadow-lg duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Activity Distribution (All Projects)</h3>
              <div className="h-64 w-full flex items-center justify-center">
                {doughnutChartData && doughnutChartData.labels.length > 0 ? (
                  <Doughnut data={doughnutChartData} options={pieDoughnutOptions} />
                ) : (
                  <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-xl shadow-inner transition-all duration-300">
                    <BarChart className="w-16 h-16 mx-auto mb-3 text-blue-200" />
                    <p className="font-medium">No activity data available for all projects.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Specific Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-8 transition-shadow hover:shadow-lg duration-300">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="w-full lg:w-1/3">
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select a project:
                </label>
                <select
                  id="project-select"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-gray-700 bg-white hover:shadow-md transition-all duration-200"
                >
                  <option value="" disabled>Choose a project</option>
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <option key={index} value={project.project_name || 'Unnamed Project'}>
                        {project.project_name || 'Unnamed Project'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No projects assigned</option>
                  )}
                </select>
              </div>

              {selectedProject && (
                <div className="w-full lg:w-2/3 bg-white p-6 rounded-2xl shadow-md border border-gray-100 min-h-[384px] flex items-center justify-center">
                  {pieChartData?.datasets?.length > 0 && pieChartData.datasets[0].data.some(val => val > 0) ? (
                    <div className='flex justify-center items-center h-60 w-full max-w-sm mx-auto'>
                      <Pie data={pieChartData} options={pieDoughnutOptions} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-xl shadow-inner transition-all duration-300">
                      <BarChart className="w-16 h-16 mx-auto mb-3 text-blue-200" />
                      <p className="font-medium">No activity data for the selected project.</p>
                      <p className="text-sm text-gray-400 mt-1">Please select another project or check project activities.</p>
                    </div>
                  )}
                </div>
              )}

              {!selectedProject && projects.length > 0 && (
                <div className="w-full lg:w-2/3 bg-white p-6 rounded-2xl shadow-md border border-gray-100 min-h-[384px] flex items-center justify-center">
                  <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-xl shadow-inner transition-all duration-300">
                    <BarChart className="w-16 h-16 mx-auto mb-3 text-blue-200" />
                    <p className="font-medium">Select a project from the dropdown to view its activity breakdown.</p>
                  </div>
                </div>
              )}

              {!selectedProject && projects.length === 0 && (
                <div className="w-full lg:w-2/3 bg-white p-6 rounded-2xl shadow-md border border-gray-100 min-h-[384px] flex items-center justify-center">
                  <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-xl shadow-inner transition-all duration-300">
                    <BarChart className="w-16 h-16 mx-auto mb-3 text-blue-200" />
                    <p className="font-medium">This employee is not assigned to any projects yet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <SuperAdminDashboard />
      )}
    </div>
    </>
  );
}

export default EmployeeDetail;
