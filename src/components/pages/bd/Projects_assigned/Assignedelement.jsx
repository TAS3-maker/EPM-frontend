import React from 'react'
import { Outlet } from 'react-router-dom';
import { ClientProvider  } from '../../../context/ClientContext'
import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned"; 

import { Assignedtable } from './Assignedtable'
import {NotAssignedTable} from './NotAssignedTable'
export const Assignedelement = () => {
  return (
    <div>
        <ClientProvider >
            <BDProjectsAssignedProvider >
          <Outlet />
            </BDProjectsAssignedProvider >
          </ClientProvider >
    </div>
  )
}
