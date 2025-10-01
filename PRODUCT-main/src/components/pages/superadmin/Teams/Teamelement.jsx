import React from 'react'
// import { Teams } from './Teams'
import { Teamtable } from './Teamtable'
import { TeamProvider } from "../../../context/TeamContext";

export const Teamelement = () => {
  return (
    <div>
        <TeamProvider>
                {/* <Teams/> */}
                <Teamtable/>
            </TeamProvider>
    </div>
  )
}
