import React from 'react'
// import { ClientProvider  } from '../../../context/ClientContext'
import { MasterClientProvider } from '../../../context/MasterClientContext'
// import { Clients } from './Clients'
// import { Clienttable } from './Clienttable';
import { ClientMastertable } from './ClientMastertable';

export const ClientMasterElement = () => {
  return (
    <div>
        <MasterClientProvider >
                {/* <Clients/> */}
                <ClientMastertable/>
            </MasterClientProvider >
    </div>
  )
}
