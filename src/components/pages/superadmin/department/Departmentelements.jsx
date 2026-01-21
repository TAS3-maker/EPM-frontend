import React from 'react'
// import { Role } from './Role'
import { Departmenttable } from './Departmenttable'
import { DepartmentProvider } from '../../../context/DepartmentContext'

export const Departmentelements = () => {
  return (
    <div>
        <DepartmentProvider>
            
                <Departmenttable/>
            </DepartmentProvider>
    </div>
  )
}
