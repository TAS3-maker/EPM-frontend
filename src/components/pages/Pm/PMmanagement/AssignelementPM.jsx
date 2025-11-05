import React from 'react'
import { ClientProvider  } from '../../../context/ClientContext'
import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned"; 
import { PMassign } from './PMassign';
import { PMProvider } from "../../../context/PMContext";
import { Tableassigned } from './Tableassigned';


export const AssignelementPM = () => {
  return (
    <div>
      <PMProvider>
        <ClientProvider >
            <BDProjectsAssignedProvider >

                <PMassign/>
                {/* <Tableassigned/> */}
            </BDProjectsAssignedProvider >
          </ClientProvider >
          </PMProvider >
    </div>
  )
}
