import React from 'react'

import { BDTeam } from './BDTeam'
import { BDTeamProvider } from '../../../context/BDTeamContext'
import { TeamProvider } from "../../../context/TeamContext";
import { DepartmentProvider } from '../../../context/DepartmentContext';
import { PMProvider } from '../../../context/PMContext';
import { EmployeeProvider } from "../../../context/EmployeeContext";

export const BDTeamelement = () => {
  return (
    <div>
      
      <PMProvider>
        <BDTeamProvider>
          <TeamProvider>
            <DepartmentProvider>
              <EmployeeProvider>
                <BDTeam/>
              </EmployeeProvider>
            </DepartmentProvider>
          </TeamProvider>
        </BDTeamProvider>
       </PMProvider>

    </div>
  )
}
