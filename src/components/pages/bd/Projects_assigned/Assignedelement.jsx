import React from 'react'
import { Outlet } from 'react-router-dom';
import { ClientProvider  } from '../../../context/ClientContext'
import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned"; 
import { PMProvider } from "../../../context/PMContext";
import { TLProvider } from "../../../context/TLContext";

import { Assignedtable } from './Assignedtable'
import {NotAssignedTable} from './NotAssignedTable'
export const Assignedelement = () => {
  return (
    <div>
                 

        <ClientProvider >
            <BDProjectsAssignedProvider >
              
              <PMProvider>

                <TLProvider>
                <Outlet />
                </TLProvider>

          </PMProvider>
          
            </BDProjectsAssignedProvider >
          </ClientProvider >
                       

    </div>
  )
}
