import React, { useEffect } from 'react';
import DashboardCard01 from './dashboard copy/DashboardCard01';
import DashboardCard02 from './dashboard copy/DashboardCard02';
import DashboardCard03 from './dashboard copy/DashboardCard03';
import DashboardCard04 from './dashboard copy/DashboardCard04';
import DashboardCard05 from './dashboard copy/DashboardCard05';
import DashboardCard06 from './dashboard copy/DashboardCard06';
import DashboardCard07 from './dashboard copy/DashboardCard07';
import DashboardCard08 from './dashboard copy/DashboardCard08';
import DashboardCard09 from './dashboard copy/DashboardCard09';
import { GraphProvider } from '../../context/GraphContext'; 
import { ProjectProvider  } from '../../context/ProjectContext'
import { UserProvider } from '../../context/UserContext';


const EmployeeDashboard = () => {
  useEffect(() => {
    // console.log("Super Admin Dashboard Mounted");
  }, []);

  return (

    // <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    //   <div className="col-span-1 sm:col-span-2 lg:col-span-1">
    //     <RoleProvider>
    //       <Roletable/>
    //     </RoleProvider>
    //   </div>
    //   <div className="col-span-1 sm:col-span-2 lg:col-span-1">
    //     <TeamProvider>
    //       <Teamtable/>
    //     </TeamProvider>
    //   </div>
    //   <div className="col-span-1 sm:col-span-2 lg:col-span-1">
    //   <MonthlySales/>
    //   </div>
      
    // </div>
        <div className="grid grid-cols-12 gap-6 ">

                  <GraphProvider>
                    <DashboardCard06 />
                  </GraphProvider>

                  <GraphProvider>
                    <DashboardCard04 />
                  </GraphProvider>

                  <UserProvider>
                  <DashboardCard07 />
                  </UserProvider>
                  
                  <DashboardCard05 />
                  
                  
                </div>
  );
};

export default EmployeeDashboard;
