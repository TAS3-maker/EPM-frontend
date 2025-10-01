import React from 'react'
import { AssignAccessoryProvider } from '../../../context/AssignAccessoryContext'
import { EmployeeProvider } from '../../../context/EmployeeContext'
import { AssignAccessoryTable } from './AssignAccessorytable'
// import { Accessorytable } from './Accessorytable'
import { CategoryProvider } from '../../../context/CategoryContext'
import { AccessoryProvider } from '../../../context/AccessoryContext'

export const AssignAccessoryelements  = () => {
  return (
    <div>
        <AssignAccessoryProvider>
          <CategoryProvider> 
              <EmployeeProvider>
                <AccessoryProvider>
                    {/* <Accessorytable /> */}
                    <AssignAccessoryTable />
                    </AccessoryProvider>
              </EmployeeProvider>
            </CategoryProvider>
        </AssignAccessoryProvider>
    </div>
  )
}
