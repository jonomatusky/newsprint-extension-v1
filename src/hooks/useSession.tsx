import { useAuth } from '@clerk/chrome-extension'
import React, { useCallback, useEffect } from 'react'

const useSession = () => {
  const { getToken } = useAuth()

  const [sessionToken, setSessionToken] = React.useState('')

  const handleSetSessionToken = (token: String) => {
    console.log('setting session token')
    setSessionToken(token as string)
  }

  const sessionTokenIsNew = useCallback(
    (token: any) => {
      return token !== sessionToken
    },
    [sessionToken]
  )

  useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken()

      const isNew = sessionTokenIsNew(token)

      if (isNew && !!token) {
        handleSetSessionToken(token as string)
      }
    }, 1000)

    return () => clearInterval(scheduler)
  }, [getToken, sessionTokenIsNew])

  return { sessionToken }
}

export default useSession
