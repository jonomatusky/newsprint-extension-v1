import { createContext } from 'react'

type SessionContextType = {
  sessionToken: string | null
  auth: boolean | null
  extensionId: string | null
  logout: () => Promise<void>
}

export const SessionContext = createContext<SessionContextType | null>(null)
