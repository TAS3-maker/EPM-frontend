import React from 'react'
import { Categorytable } from './Categorytable'
import { CategoryProvider } from '../../../context/CategoryContext'

export const Categoryelements = () => {
  return (
    <div>
        <CategoryProvider>
            {/* <category /> */}
            <Categorytable/>
        </CategoryProvider>
    </div>
  )
}
