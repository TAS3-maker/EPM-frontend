import React from 'react'
import { ActivityProvider } from '../../../context/ActivityContext'
import { Activitytable } from './Activitytable'

export const Activityelement = () => {
  return (
    <div>
        <ActivityProvider>
            {/* <Role/> */}
            <Activitytable/>
        </ActivityProvider>
    </div>
  )
}
