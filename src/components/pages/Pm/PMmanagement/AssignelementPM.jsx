import React from 'react'
import { Outlet } from 'react-router-dom';

import { ClientProvider  } from '../../../context/ClientContext'

import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned"; 
import { PMassign } from './PMassign';
import { PMProvider } from "../../../context/PMContext";
import { Tableassigned } from './Tableassigned';


export const AssignelementPM = () => {
  return (
   
      <PMProvider>
        <ClientProvider >
            <BDProjectsAssignedProvider >

          <Outlet />
                {/* <Tableassigned/> */}
            </BDProjectsAssignedProvider >
          </ClientProvider >
          </PMProvider >

  )
}
