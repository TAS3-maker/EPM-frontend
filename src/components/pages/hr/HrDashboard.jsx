import React, { useEffect } from 'react';
// import MonthlySales from './Dashboard/MonthlySales';
// import { Roletable } from './Roles/Roletable';
// import { Teamtable } from './Teams/Teamtable';
// import { RoleProvider } from "../../context/RoleContext";
// import { TeamProvider } from "../../context/TeamContext";
import DashboardCard01 from './dashboard copy/DashboardCard01';
import DashboardCard02 from './dashboard copy/DashboardCard02';
// import DashboardCard03 from './dashboard copy/DashboardCard03';
// import DashboardCard04 from './dashboard copy/DashboardCard04';
// import DashboardCard05 from './dashboard copy/DashboardCard05';
import DashboardCard06 from './dashboard copy/DashboardCard06';
import DashboardCard07 from './dashboard copy/DashboardCard07';
// import DashboardCard08 from './dashboard copy/DashboardCard08';
// import DashboardCard09 from './dashboard copy/DashboardCard09';
import { GraphProvider } from '../../context/GraphContext'; 
import { ProjectProvider  } from '../../context/ProjectContext'
import { ClientProvider  } from '../../context/ClientContext'

const HrDashboard = () => {
  useEffect(() => {
    // console.log("Super Admin Dashboard Mounted");
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 p-4 ">

              <GraphProvider>
                <ProjectProvider>
                  <DashboardCard01 />
                </ProjectProvider>
              </GraphProvider>

              <GraphProvider>
                <DashboardCard06 />
              </GraphProvider>
              
              {/* <GraphProvider>
                <DashboardCard04 />
              </GraphProvider> */}

              <ClientProvider >
                <ProjectProvider>
                  <DashboardCard07 />
                </ProjectProvider>
              </ClientProvider>

              {/* <GraphProvider>
                <DashboardCard09 />
              </GraphProvider> */}

              <GraphProvider>
                <DashboardCard02 />
              </GraphProvider>

            </div>
  );
};

export default HrDashboard;
