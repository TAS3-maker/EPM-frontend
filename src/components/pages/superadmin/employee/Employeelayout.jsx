import React from 'react'
import Manageemployess from './Manageemployess';
import { EmployeeProvider } from '../../../context/EmployeeContext';
import { TeamProvider } from '../../../context/TeamContext';
import { RoleProvider } from '../../../context/RoleContext';
export const Employeelayout = () => {
  return (
    <div>
        <EmployeeProvider>
          <TeamProvider>
            <RoleProvider>
              <Manageemployess/>
            </RoleProvider>
          </TeamProvider>
        </EmployeeProvider>
    </div>
  )
}