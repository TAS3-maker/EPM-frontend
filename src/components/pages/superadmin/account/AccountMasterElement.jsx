import React from 'react';
import { AccountProvider } from '../../../context/AccountContext';
import { ProjectSourceProvider } from '../../../context/ProjectSourceContext'; 
import { AccountMasterTable } from './AccountMasterTable';

export const AccountMasterElement = () => {
  return (
    <div>
      <ProjectSourceProvider>
        <AccountProvider>      
          <AccountMasterTable />
        </AccountProvider>
      </ProjectSourceProvider>
    </div>
  )
}
