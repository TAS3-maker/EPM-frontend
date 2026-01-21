import React from 'react'
import { UserProvider } from '../../../context/UserContext'
import { NotesManagement } from './NotesManagement'


export const NotesManagementElement = () => {
  return (
    <div>
        <UserProvider>
                <NotesManagement/>
          </UserProvider>
    </div>
  )
}
