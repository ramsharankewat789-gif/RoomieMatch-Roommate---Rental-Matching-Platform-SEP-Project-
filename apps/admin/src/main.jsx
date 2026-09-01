import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/styles/index.css'
import '@shared/styles/globals.css'
import '@shared/styles/dark-theme.css'
import './styles/admin-theme.css'
import { AuthProvider } from '@shared/context/AuthContext'
import { NotificationProvider } from '@shared/context/NotificationContext'
import { SocketProvider } from '@shared/context/SocketContext'
import { ThemeProvider } from '@shared/context/ThemeContext'
import AdminRoutes from './routes/AdminRoutes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <AdminRoutes />
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
