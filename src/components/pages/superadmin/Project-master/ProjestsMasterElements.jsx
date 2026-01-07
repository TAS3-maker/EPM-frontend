import React from 'react';
import { ProjectMasterProvider } from '../../../context/ProjectMasterContext'; 
import { ProjectMasterTable } from './ProjectMasterTable';                    
import { ActivityProvider } from '../../../context/ActivityContext';          
import { MasterClientProvider } from '../../../context/MasterClientContext';  
import { ProjectSourceProvider } from '../../../context/ProjectSourceContext'; 
import { CommunicationTypeProvider } from '../../../context/CommunicationTypeContext'; 
import { AccountProvider } from '../../../context/AccountContext';        
import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned";  
import { PMProvider } from "../../../context/PMContext";  
import { TLProvider } from '../../../context/TLContext';
import { EmployeeProvider } from '../../../context/EmployeeContext';

export const ProjectsMasterElements = () => {
  return (
    <div>
      <EmployeeProvider>
      <ActivityProvider>
        <ProjectMasterProvider>
          <MasterClientProvider>       
            <ProjectSourceProvider>     
              <CommunicationTypeProvider> 
                <AccountProvider>     
                 <BDProjectsAssignedProvider>  
                  <PMProvider>  
                    <TLProvider>
                  <ProjectMasterTable /> 
                  </TLProvider>
                  </PMProvider>
                  </BDProjectsAssignedProvider>
                </AccountProvider>
              </CommunicationTypeProvider>
            </ProjectSourceProvider>
          </MasterClientProvider>
        </ProjectMasterProvider>
      </ActivityProvider>
      </EmployeeProvider>
    </div>
  );
};
