import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/styles/index.css'
import '@shared/styles/globals.css'
import { AuthProvider } from '@shared/context/AuthContext'
import { NotificationProvider } from '@shared/context/NotificationContext'
import { SocketProvider } from '@shared/context/SocketContext'
import AdminRoutes from './routes/AdminRoutes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <AdminRoutes />
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
