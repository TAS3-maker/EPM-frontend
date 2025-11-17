import React from 'react'
import { Outlet } from 'react-router-dom';
import { ClientProvider  } from '../../../context/ClientContext'
import { BDProjectsAssignedProvider } from "../../../context/BDProjectsassigned";
import { TLassign } from './TLassign';
import { TLProvider } from "../../../context/TLContext";
import { Tableassigned } from './Tableassigned';
export const AssignelementTL = () => {
  return (
    <TLProvider>
      <ClientProvider>
        <BDProjectsAssignedProvider>
          <Outlet />
        </BDProjectsAssignedProvider>
      </ClientProvider>
    </TLProvider>
  );
};