import React from 'react'

import { BDTeam } from './BDTeam'
import { BDTeamProvider } from '../../../context/BDTeamContext'
import { TeamProvider } from "../../../context/TeamContext";
import { DepartmentProvider } from '../../../context/DepartmentContext';
import { PMProvider } from '../../../context/PMContext';

export const BDTeamelement = () => {
  return (
    <div>
      
      <PMProvider>
      <BDTeamProvider>
 <TeamProvider>
          <DepartmentProvider>
          <BDTeam/>
</DepartmentProvider>

   </TeamProvider>
      </BDTeamProvider>
         </PMProvider>



    </div>
  )
}
