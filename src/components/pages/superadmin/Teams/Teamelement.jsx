import React from 'react'
// import { Teams } from './Teams'
import { Teamtable } from './Teamtable'
import { TeamProvider } from "../../../context/TeamContext";
import { DepartmentProvider } from '../../../context/DepartmentContext';
export const Teamelement = () => {
  return (
    <div>
        <TeamProvider>
          <DepartmentProvider>
                {/* <Teams/> */}
                <Teamtable/>
                </DepartmentProvider>
            </TeamProvider>
    </div>
  )
}
