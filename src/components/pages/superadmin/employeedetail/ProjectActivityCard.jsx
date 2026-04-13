import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../utils/ApiConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectActivityCard = ({ projects = [], employeeId }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [pieChartData, setPieChartData] = useState(null);
  const [selectedProjectActivities, setSelectedProjectActivities] = useState(null);
  const [activityStartDate, setActivityStartDate] = useState('');
  const [activityEndDate, setActivityEndDate] = useState('');
  const [isActivityDateFilterOpen, setIsActivityDateFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userToken] = useState(localStorage.getItem('userToken'));
  const activityDateFilterRef = useRef(null);

  const chartColors = {
    primaryBlue: '#3B82F6',
    purple: '#A855F7',
    orange: '#F97316',
    gray: '#6B7280'
  };

  const pieDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { size: 12, family: 'Inter, sans-serif' }, color: '#4B5563', boxWidth: 20, padding: 15 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) label += context.parsed.toFixed(2) + ' hours';
            return label;
          }
        }
      }
    },
    cutout: '60%'
  };

  // ✅ FIXED API call function
  const fetchProjectActivities = useCallback(async (startDate = null, endDate = null) => {
    if (!userToken || !employeeId) return projects;
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }
      
      console.log('API URL:', `${API_URL}/api/getfull_proileemployee/${employeeId}?${params.toString()}`);
      
      const response = await axios.get(
        `${API_URL}/api/getfull_proileemployee/${employeeId}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      console.log('✅ Filtered API Response:', response.data.data.project_user);
      return response.data.data.project_user || [];
    } catch (error) {
      console.error('❌ Error fetching filtered activities:', error.response?.data || error.message);
      return projects; // fallback
    } finally {
      setLoading(false);
    }
  }, [employeeId, userToken, projects]);

  // ✅ FIXED: Show ONLY actual activity type with hours
  const processActivitiesData = (filteredProjects, selectedProjectName) => {
    const selected = filteredProjects.find(p => (p.project_name || 'Unnamed Project') === selectedProjectName);
    if (!selected || !selected.activities?.length) {
      setPieChartData(null);
      setSelectedProjectActivities(null);
      return;
    }

    // Get the first (and only) actual activity
    const actualActivity = selected.activities[0];
    const hours = parseFloat(actualActivity.total_hours.split(":")[0]) + 
                  parseFloat(actualActivity.total_hours.split(":")[1]) / 60;

    if (hours <= 0) {
      setPieChartData(null);
      setSelectedProjectActivities(null);
      return;
    }

    const activityType = actualActivity.activity_type || 'Activity';
    const color = chartColors.primaryBlue;

    setPieChartData({
      labels: [activityType],
      datasets: [{
        data: [hours],
        backgroundColor: [color],
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 10
      }]
    });

    setSelectedProjectActivities({
      projectName: selectedProjectName,
      totalHours: hours,
      activities: [{
        name: activityType,
        hours,
        percentage: '100%',
        color
      }]
    });
  };

  // ✅ FIXED Handle project change - No API call needed for default
  const handleProjectChange = (e) => {
    const selectedName = e.target.value;
    setSelectedProject(selectedName);

    if (!selectedName) {
      setPieChartData(null);
      setSelectedProjectActivities(null);
      return;
    }

    // Use original projects for default view
    processActivitiesData(projects, selectedName);
  };

  // ✅ FIXED Handle date filter apply
  const handleApplyDateFilter = async () => {
    if (!selectedProject || !activityStartDate || !activityEndDate) return;
    
    setIsActivityDateFilterOpen(false);
    const filteredProjects = await fetchProjectActivities(activityStartDate, activityEndDate);
    processActivitiesData(filteredProjects, selectedProject);
  };

  // Initialize first project ✅ SAME
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      const firstProjectName = projects[0].project_name || 'Unnamed Project';
      setSelectedProject(firstProjectName);
      processActivitiesData(projects, firstProjectName); // Direct processing
    }
  }, [projects]);

  // Outside click handler ✅ SAME
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activityDateFilterRef.current &&
        !activityDateFilterRef.current.contains(event.target)
      ) {
        setIsActivityDateFilterOpen(false);
      }
    };
    if (isActivityDateFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActivityDateFilterOpen]);

  return (
    <div className="space-y-12">
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
              disabled={loading}
              className="w-full p-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-gray-700 bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {selectedProjectActivities?.activities && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3 pb-4 border-b border-emerald-200">
                  <h5 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    Activity Summary
                  </h5>
                  <span className="text-sm font-medium text-emerald-700">
                    {selectedProjectActivities.totalHours?.toFixed(1)}h total
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  {selectedProjectActivities.activities.map((activity, index) => (
                    <div key={index} className="flex flex-row items-center flex-1 min-w-[70px] p-1 hover:scale-105 transition-all duration-200 group">
                      <div 
                        className="w-3 h-3 rounded-full shadow-lg flex-shrink-0 group-hover:shadow-xl"
                        style={{ backgroundColor: activity.color }}
                      ></div>
                      <div className="text-sm text-gray-900 text-center px-1 ">
                        {activity.name}
                      </div>
                      <div className="text-base font-bold text-gray-600 mb-1 group-hover:text-gray-800">
                        {activity.hours.toFixed(1)}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-2/3 space-y-6">
            {selectedProject ? (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {selectedProjectActivities?.projectName || selectedProject}
                    </h4>

                    <div className="relative" ref={activityDateFilterRef}>
                      <button
                        onClick={() => setIsActivityDateFilterOpen(!isActivityDateFilterOpen)}
                        disabled={loading}
                        className="flex items-center gap-2 backdrop-blur-sm border border-gray-600 rounded-lg px-2 py-1 text-black transition-all duration-200 group text-xs font-medium disabled:opacity-50"
                      >
                        📅
                        <span className="hidden sm:inline">
                          {activityStartDate && activityEndDate 
                            ? `${activityStartDate} - ${activityEndDate}` 
                            : 'All Dates'
                          }
                        </span>
                        <span className={`transition-transform ${isActivityDateFilterOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {isActivityDateFilterOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl p-4 z-50">
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-gray-600 font-medium mb-1.5 block">Start Date</label>
                              <input
                                type="date"
                                value={activityStartDate}
                                onChange={(e) => setActivityStartDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-11 bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-medium mb-1.5 block">End Date</label>
                              <input
                                type="date"
                                value={activityEndDate}
                                onChange={(e) => setActivityEndDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-11 bg-white"
                                min={activityStartDate}
                              />
                            </div>
                            <div className="pt-2 border-t border-gray-100 space-y-2">
                              <button
                                onClick={handleApplyDateFilter}
                                disabled={!activityStartDate || !activityEndDate || loading}
                                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? 'Filtering...' : 'Apply Filter'}
                              </button>
                              <button
                                onClick={() => {
                                  setActivityStartDate('');
                                  setActivityEndDate('');
                                  setIsActivityDateFilterOpen(false);
                                  handleProjectChange({ target: { value: selectedProject } });
                                }}
                                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                              >
                                Clear Filter
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                  ) :
                  
                  pieChartData?.datasets?.length > 0 && pieChartData.datasets[0].data.some(val => val > 0) ? (
                    <div className='flex justify-center items-center h-64 w-full max-w-md mx-auto'>
                      <Pie data={pieChartData} options={pieDoughnutOptions} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-xl shadow-inner">
                      <BarChart className="w-20 h-20 mx-auto mb-4 text-blue-200" />
                      <p className="font-medium text-lg">No activity data</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {(activityStartDate && activityEndDate) 
                          ? `No activities found for ${activityStartDate} to ${activityEndDate}` 
                          : 'This project has no logged activities.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : projects.length > 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-md border border-gray-100 min-h-[450px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                  <p className="font-semibold text-xl mb-2">Select a project</p>
                  <p className="text-lg text-gray-400">Choose from dropdown to see activity breakdown</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-md border border-gray-100 min-h-[450px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                  <p className="font-semibold text-xl mb-2">No projects assigned</p>
                  <p className="text-lg text-gray-400">This employee has no projects yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectActivityCard;
