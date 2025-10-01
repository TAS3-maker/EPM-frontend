import React from 'react'
import { ClientProvider  } from '../../../context/ClientContext'
import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned"; 

import { Assignedtable } from './Assignedtable'

export const Assignedelement = () => {
  return (
    <div>
        <ClientProvider >
            <BDProjectsAssignedProvider >
                <Assignedtable/>
            </BDProjectsAssignedProvider >
          </ClientProvider >
    </div>
  )
}
