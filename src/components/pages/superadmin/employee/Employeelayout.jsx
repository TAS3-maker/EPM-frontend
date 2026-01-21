import React from 'react'
import Manageemployess from './Manageemployess';
import { EmployeeProvider } from '../../../context/EmployeeContext';
import { TeamProvider } from '../../../context/TeamContext';
import { RoleProvider } from '../../../context/RoleContext';
import { DepartmentProvider } from '../../../context/DepartmentContext';
export const Employeelayout = () => {
  return (
    <div>
        <EmployeeProvider>
          <TeamProvider>
            <RoleProvider>
              <DepartmentProvider>
              <Manageemployess/>
              </DepartmentProvider>
            </RoleProvider>
          </TeamProvider>
        </EmployeeProvider>
    </div>
  )
}