import React from 'react'
// import { Role } from './Role'
import { Roletable } from './Roletable'
import { RoleProvider } from '../../../context/RoleContext'

export const Roleelements = () => {
  return (
    <div>
        <RoleProvider>
                {/* <Role/> */}
                <Roletable/>
            </RoleProvider>
    </div>
  )
}
