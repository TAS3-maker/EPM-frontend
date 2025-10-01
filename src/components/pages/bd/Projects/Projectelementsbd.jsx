import React from 'react'
import { ClientProvider  } from '../../../context/ClientContext'
import { ProjectProvider  } from '../../../context/ProjectContext'
// import { Projects } from './Projects'
import { Projecttable } from './Projecttable'
import { ActivityProvider } from '../../../context/ActivityContext'


export const Projectelementsbd = () => {
  return (
    <div>
      <ActivityProvider>
        <ClientProvider >
        <ProjectProvider>
                {/* <Projects/> */}
                <Projecttable/>
                </ProjectProvider>
            </ClientProvider >
            </ActivityProvider>
    </div>
  )
}
