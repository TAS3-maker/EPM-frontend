import React from 'react';
import { CommunicationTypeProvider } from '../../../context/CommunicationTypeContext';
import { CommunicationTypeMasterTable } from './CommunicationTypeMasterTable';

export const CommunicationMasterElement = () => {
  return (
    <div>
      <CommunicationTypeProvider>
        <CommunicationTypeMasterTable />
      </CommunicationTypeProvider>
    </div>
  )
}
