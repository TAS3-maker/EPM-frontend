import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectOverviewCard = ({ projects = [] }) => {
  const [projectCountChartData, setProjectCountChartData] = useState(null);
  const [selectedProjectStatus, setSelectedProjectStatus] = useState('Active');
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    inProgress: 0,
    toDo: 0
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupProjects, setPopupProjects] = useState([]);
  const [popupTitle, setPopupTitle] = useState('');
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_name");

  const chartColors = {
    active: '#22C55E',
    inactive: '#6B7280',
    inProgress: '#F59E0B',
    toDo: '#A855F7',
    total: '#3B82F6' 
  };

  const projectCountPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${selectedProjectStatus} Projects vs Total`,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((ctx.parsed / total) * 100).toFixed(1);
            return `${ctx.label}: ${ctx.parsed} (${percent}%)`;
          }
        }
      }
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return 'Other';
    const s = status.toLowerCase().trim();
    if (s === 'active') return 'Active';
    if (s === 'inactive') return 'Inactive';
    if (s.includes('in progress')) return 'In Progress';
    if (s.includes('to do')) return 'To Do';
    return 'Other';
  };

  const prepareProjectStats = (data) => {
    const stats = {
      total: data.length,
      active: data.filter(p => normalizeStatus(p.project_status) === 'Active').length,
      inactive: data.filter(p => normalizeStatus(p.project_status) === 'Inactive').length,
      inProgress: data.filter(p => normalizeStatus(p.project_status) === 'In Progress').length,
      toDo: data.filter(p => normalizeStatus(p.project_status) === 'To Do').length
    };
    setProjectStats(stats);
    return stats;
  };

  
  const preparePieChart = (stats) => {
    let data = [];
    let labels = [];
    let colors = [];

    if (selectedProjectStatus === 'Active') {
      data = [stats.active, stats.total - stats.active];
      labels = ['Active', 'Total'];
      colors = [chartColors.active, chartColors.total];
    } else if (selectedProjectStatus === 'Inactive') {
      data = [stats.inactive, stats.total - stats.inactive];
      labels = ['Inactive', 'Total'];
      colors = [chartColors.inactive, chartColors.total];
    } else if (selectedProjectStatus === 'In Progress') {
      data = [stats.inProgress, stats.total - stats.inProgress];
      labels = ['In Progress', 'Total'];
      colors = [chartColors.inProgress, chartColors.total];
    } else if (selectedProjectStatus === 'To Do') {
      data = [stats.toDo, stats.total - stats.toDo];
      labels = ['To Do', 'Total'];
      colors = [chartColors.toDo, chartColors.total];
    }

    setProjectCountChartData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 8
        }
      ]
    });
  };

  useEffect(() => {
    if (projects.length) {
      const stats = prepareProjectStats(projects);
      preparePieChart(stats);
    }
  }, [projects, selectedProjectStatus]);

  const handleProjectStatusChange = (e) => {
    setSelectedProjectStatus(e.target.value);
  };

  const getProjectsByStatus = (status) => {
    if (status === 'Total') return projects;
    return projects.filter(p => normalizeStatus(p.project_status) === status);
  };

  const handleStatusClick = (status) => {
    setPopupProjects(getProjectsByStatus(status));
    setPopupTitle(status === 'Total' ? 'Total Projects' : `${status} Projects`);
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  const getProjectId = (p) => p.project_id || p.id || p._id || 'N/A';

  const getProjectDisplayName = (p, i) =>
    p.project_name || p.name || p.projectName || `Project ${i + 1}`;

  const StatusRow = ({ label, value, color, status }) => (
    <button
      onClick={() => handleStatusClick(status)}
      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl"
    >
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <div className="flex-1 text-left text-sm">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border relative">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-xl font-semibold">Project Overview</h3>

        <select
          value={selectedProjectStatus}
          onChange={handleProjectStatusChange}
          className="p-2 border rounded-xl text-sm"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="In Progress">In Progress</option>
          <option value="To Do">To Do</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row justify-around gap-4">
        <div className="h-64 flex-1 flex justify-center items-center">
          {projectCountChartData ? (
            <Pie data={projectCountChartData} options={projectCountPieOptions} />
          ) : (
            <BarChart className="text-gray-300 w-12 h-12" />
          )}
        </div>

        <div className="space-y-2 flex-1 max-w-xs">
          <StatusRow label="Total Projects" value={projectStats.total} color="bg-blue-500" status="Total" />
          <StatusRow label="Active Projects" value={projectStats.active} color="bg-green-500" status="Active" />
          <StatusRow label="Inactive Projects" value={projectStats.inactive} color="bg-gray-500" status="Inactive" />
          <StatusRow label="In Progress" value={projectStats.inProgress} color="bg-orange-500" status="In Progress" />
          <StatusRow label="To Do" value={projectStats.toDo} color="bg-purple-500" status="To Do" />
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={closePopup}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between">
              <h3 className="font-bold">{popupTitle}</h3>
              <button onClick={closePopup}><X /></button>
            </div>
            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {popupProjects.map((p, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/${userRole}/projects/tasks/${getProjectId(p)}`)}
                  className="w-full text-left p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500"
                >
                  {getProjectDisplayName(p, i)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverviewCard;











// import React, { useState, useEffect } from 'react';
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { BarChart, X } from 'lucide-react';
// import { useNavigate } from "react-router-dom";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const ProjectOverviewCard = ({ projects = [] }) => {
//   const [projectCountChartData, setProjectCountChartData] = useState(null);
//   const [selectedProjectStatus, setSelectedProjectStatus] = useState('Active');
//   const [projectStats, setProjectStats] = useState({ total: 0, active: 0, close: 0, complete: 0, ongoing: 0 });
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupProjects, setPopupProjects] = useState([]);
//   const [popupTitle, setPopupTitle] = useState('');
//   const navigate = useNavigate();
//   const userRole = localStorage.getItem("user_name");

//   const chartColors = {
//     primaryBlue: '#3B82F6',
//     green: '#22C55E',
//     purple: '#A855F7',
//     red: '#EF4444',
//     orange: '#F59E0B'
//   };

//   const projectCountPieOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { 
//         position: 'bottom',
//         labels: {
//           padding: 20,
//           usePointStyle: true,
//           font: { size: 12 }
//         }
//       },
//       title: {
//         display: true,
//         text: `${selectedProjectStatus} Projects - Type Distribution`,
//         font: { size: 16, weight: 'bold' },
//         padding: { bottom: 20 }
//       },
//       tooltip: {
//         callbacks: {
//           label: function(context) {
//             const total = context.dataset.data.reduce((a, b) => a + b, 0);
//             const percentage = ((context.parsed / total) * 100).toFixed(1);
//             return `${context.label}: ${context.parsed} (${percentage}%)`;
//           }
//         }
//       }
//     }
//   };

  
//   const getProjectId = (project) => {
//     return project.project_id || project.id || project._id || 'N/A';
//   };

//   const handleViewClick = (project_id) => {
//     if (project_id && project_id !== 'N/A') {
//       navigate(`/${userRole}/projects/tasks/${project_id}`);
//     }
//   };

//   const getProjectsByStatus = (status) => {
//     if (status === 'Total') {
//       return projects; 
//     }
//     return projects.filter(project => project.status === status);
//   };

//   const handleStatusClick = (status) => {
//     const statusProjects = getProjectsByStatus(status);
//     setPopupProjects(statusProjects);
//     setPopupTitle(status === 'Total' ? 'Total Projects' : `${status} Projects`);
//     setShowPopup(true);
//   };

//   const closePopup = () => {
//     setShowPopup(false);
//     setPopupProjects([]);
//     setPopupTitle('');
//   };

//   const prepareStatusWiseChartData = (status) => {
//     const statusProjects = getProjectsByStatus(status);
//     let billableProjects = 0;
//     let inHouseProjects = 0;
    
//     statusProjects.forEach(project => {
//       const hasBillable = project.activities?.some(act => act.activitytype === 'Billable' || act.activity_type === 'Billable');
//       const hasInHouse = project.activities?.some(act => 
//         (act.activitytype || act.activity_type || '').toLowerCase().includes('inhouse')
//       );
//       if (hasBillable) billableProjects++;
//       else if (hasInHouse) inHouseProjects++;
//     });
    
//     const others = statusProjects.length - billableProjects - inHouseProjects;
    
//     setProjectCountChartData({
//       labels: ['Billable', 'In-House', 'Others'],
//       datasets: [{
//         data: [billableProjects, inHouseProjects, others],
//         backgroundColor: [chartColors.primaryBlue, chartColors.green, chartColors.purple],
//         borderWidth: 2,
//         borderColor: '#ffffff',
//         hoverOffset: 8
//       }]
//     });
//   };

//   const prepareProjectStats = (projectsData) => {
//     const total = projectsData.length;
//     const active = projectsData.filter(p => p.status === 'Active').length;
//     const close = projectsData.filter(p => p.status === 'Close').length;
//     const complete = projectsData.filter(p => p.status === 'Complete').length;
//     const ongoing = projectsData.filter(p => p.status === 'Ongoing').length;
    
//     setProjectStats({ total, active, close, complete, ongoing });
//   };

//   const handleProjectStatusChange = (e) => {
//     const status = e.target.value;
//     setSelectedProjectStatus(status);
//     prepareStatusWiseChartData(status);
//   };

//   useEffect(() => {
//     if (projects.length > 0) {
//       prepareProjectStats(projects);
//       prepareStatusWiseChartData('Active');
//     }
//   }, [projects]);

 
//   const getProjectDisplayName = (project, index) => {
//     return (
//       project.project_name ||
//       project.name ||
//       project.projectName ||
//       project.title ||
//       `Project ${index + 1}`
//     );
//   };

//   const StatusRow = ({ label, value, color, status }) => (
//     <button
//       onClick={() => handleStatusClick(status)}
//       className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
//     >
//       <div className={`w-3 h-3 rounded-full ${color} group-hover:scale-110 transition-transform`} />
//       <div className="flex-1 text-left text-sm text-gray-700 group-hover:text-gray-900">{label}</div>
//       <div className="text-lg font-bold text-gray-800">{value}</div>
//     </button>
//   );

//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition-shadow hover:shadow-lg duration-300 relative">
//       <div className="flex justify-between items-center mb-4 border-b pb-2">
//         <h3 className="text-xl font-semibold text-gray-800">Project Overview</h3>
//         <select 
//           value={selectedProjectStatus} 
//           onChange={handleProjectStatusChange} 
//           className="p-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//         >
//           <option value="Active">Active</option>
//           <option value="Close">Close</option>
//           <option value="Complete">Complete</option>
//           <option value="Ongoing">Ongoing</option>
//         </select>
//       </div>
      
//       <div className='flex flex-col md:flex-row justify-around items-center gap-4'>
//         <div className="h-64 flex items-center justify-center flex-1">
//           {projectCountChartData?.labels ? (
//             <Pie data={projectCountChartData} options={projectCountPieOptions} />
//           ) : (
//             <div className="text-center text-gray-500 flex flex-col items-center">
//               <BarChart className="w-12 h-12 mb-2 text-gray-300" />
//               <div>No project data available</div>
//             </div>
//           )}
//         </div>
        
//         <div className="space-y-2 flex-1 max-w-xs">
//           <StatusRow label="Total Projects" value={projectStats.total} color="bg-blue-500" status="Total" />
//           <StatusRow label="Active Projects" value={projectStats.active} color="bg-green-500" status="Active" />
//           <StatusRow label="Close Projects" value={projectStats.close} color="bg-red-500" status="Close" />
//           <StatusRow label="Complete Projects" value={projectStats.complete} color="bg-purple-500" status="Complete" />
//           <StatusRow label="Ongoing Projects" value={projectStats.ongoing} color="bg-orange-500" status="Ongoing" />
//         </div>
//       </div>

      
//       {showPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closePopup}>
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center shadow-sm">
//               <h3 className="text-xl font-bold text-gray-800">{popupTitle}</h3>
//               <button onClick={closePopup} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             <div className="p-6 max-h-96 overflow-y-auto">
//               {popupProjects.length > 0 ? (
//                 <div className="space-y-3">
//                   {popupProjects.map((project, index) => {
//                     const projectId = getProjectId(project);
//                     const projectName = getProjectDisplayName(project, index);
//                     return (
//                       <button 
//                         key={projectId || index} 
//                         onClick={() => handleViewClick(projectId)} 
//                         title={projectName}
//                         className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 hover:shadow-md hover:bg-blue-100 transition-all duration-200"
//                       >
//                         <div className="font-semibold text-gray-800 truncate pr-16" title={projectName}>
//                           {getProjectDisplayName(project, index)}
//                         </div>
                        
                        
//                         {/* <div className="text-xs bg-gray-100 px-2 py-1 rounded-full mt-2 inline-block text-gray-600 font-mono">
//                           ID: {projectId}
//                         </div> */}
                        
//                         {project.status && (
//                           <div className="text-xs text-gray-500 mt-1 capitalize font-medium">
//                             Status: {project.status}
//                           </div>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 text-gray-500">
//                   <BarChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                   <p className="text-lg font-medium">No projects found</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectOverviewCard;
