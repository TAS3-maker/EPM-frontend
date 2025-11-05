import React from 'react'

import { BDTeam } from './BDTeam'
import { BDTeamProvider } from '../../../context/BDTeamContext'


export const BDTeamelement = () => {
  return (
    <div>
      <BDTeamProvider>
          <BDTeam/>
      </BDTeamProvider>
    </div>
  )
}
