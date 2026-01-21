import React from 'react'
import { ClientProvider  } from '../../../context/ClientContext'
// import { Clients } from './Clients'
import { Clienttable } from './Clienttable'

export const Clientelements = () => {
  return (
    <div>
        <ClientProvider >
                {/* <Clients/> */}
                <Clienttable/>
            </ClientProvider >
    </div>
  )
}
