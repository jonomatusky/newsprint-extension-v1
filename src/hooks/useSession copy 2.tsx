import axios from 'axios'
import React, { useEffect } from 'react'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''
const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || ''

const useSession = () => {
  const [auth, setAuth] = React.useState(null as boolean | null)
  const [user, setUser] = React.useState(null as any)

  useEffect(() => {
    const getMe = async () => {
      try {
        const response = await axios.get(
          REACT_APP_APP_URL + REACT_APP_API_ENDPOINT + '/me'
        )
        setUser(response.data)
        setAuth(true)
      } catch (err) {
        setAuth(false)
      }
    }

    let counter = 0
    const limit = 10

    const interval = setInterval(() => {
      counter++

      if (counter === limit) {
        clearInterval(interval)
        setAuth(false)
      }

      if (auth === null) {
        getMe()
      } else {
        clearInterval(interval)
      }
    }, 1000) // Check every 100ms

    return () => clearInterval(interval) // Clean up on unmount
  }, [auth])

  return { auth, user }
}

export default useSession
