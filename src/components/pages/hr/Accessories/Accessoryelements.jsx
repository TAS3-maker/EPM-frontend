import React from 'react'
import { AccessoryProvider } from '../../../context/AccessoryContext'
import { Accessorytable } from './Accessorytable'
import { CategoryProvider } from '../../../context/CategoryContext'
import { AssignAccessoryProvider } from '../../../context/AssignAccessoryContext'

export const Accessoryelements = () => {
  return (
    <div>
      <AccessoryProvider>
        <CategoryProvider>
          <AssignAccessoryProvider>
            <Accessorytable />
            </AssignAccessoryProvider>
        </CategoryProvider>
      </AccessoryProvider>
    </div>
  )
}
