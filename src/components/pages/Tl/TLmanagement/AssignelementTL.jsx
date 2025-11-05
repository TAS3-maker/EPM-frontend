import React from 'react'
import { ClientProvider  } from '../../../context/ClientContext'
import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned";
import { TLassign } from './TLassign';
import { TLProvider } from "../../../context/TLContext";
import { Tableassigned } from './Tableassigned';

export const AssignelementTL = () => {
  return (
    <div>
      <TLProvider>
        <ClientProvider >
            <BDProjectsAssignedProvider >
                <TLassign/>
                {/* <Tableassigned/> */}
            </BDProjectsAssignedProvider >
          </ClientProvider >
          </TLProvider >
    </div>
  )
}
