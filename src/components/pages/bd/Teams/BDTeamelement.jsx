import React from 'react'

import { BDTeam } from './BDTeam'
import { BDTeamProvider } from '../../../context/BDTeamContext'
import { TeamProvider } from "../../../context/TeamContext";
import { DepartmentProvider } from '../../../context/DepartmentContext';

export const BDTeamelement = () => {
  return (
    <div>
      
      
      <BDTeamProvider>
 <TeamProvider>
          <DepartmentProvider>
          <BDTeam/>
</DepartmentProvider>

   </TeamProvider>
      </BDTeamProvider>
         



    </div>
  )
}
