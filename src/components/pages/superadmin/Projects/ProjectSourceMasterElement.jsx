import React from 'react'
import { ProjectSourceProvider } from '../../../context/ProjectSourceContext'
import { ProjectSourceMasterTable } from './ProjectSourceMasterTable'

export const ProjectSourceMasterElement = () => {
  return (
    <div>
      <ProjectSourceProvider>
        <ProjectSourceMasterTable />
      </ProjectSourceProvider>
    </div>
  )
}
