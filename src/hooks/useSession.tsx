/* global chrome */

// import axios from 'axios'
// import { posthog } from 'posthog-js'
import React, { useEffect } from 'react'
import { v4 as uuid } from 'uuid'
// import jwt, { JwtPayload } from 'jsonwebtoken'

// Define the return type of useSession
type useSessionReturnType = {
  sessionToken: String | null
  auth: boolean | null
  extensionId: String | null
  logout: () => Promise<void>
  // user: Object
  // error: boolean
}

// const { REACT_APP_APP_URL, REACT_APP_API_ENDPOINT } = process.env

const useSession = (): useSessionReturnType => {
  const [storageReady, setStorageReady] = React.useState(false)
  const [sessionToken, setSessionToken] = React.useState(null as String | null)
  const [auth, setAuth] = React.useState(null as boolean | null)
  // const [user, setUser] = React.useState({})
  // const [error, setError] = React.useState(false as boolean)
  const [extensionId, setExtensionId] = React.useState(null as String | null)

  // console.log('user', user)

  useEffect(() => {
    // This function gets called whenever storage changes
    const handleStorageChange = (changes: any, namespace: any) => {
      for (let key in changes) {
        const change = changes[key]
        console.log(
          `Storage key "${key}" in namespace "${namespace}" changed. Old value was "${change.oldValue}", new value is "${change.newValue}"`
        )
      }
    }

    // Add the event listener when the component mounts
    chrome.storage.onChanged.addListener(handleStorageChange)

    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    chrome.storage.local.get(null, function (data) {
      console.log(data)
    })
  })

  const logout = async () => {
    await chrome.storage.local.remove(['token'])
    setAuth(false)
    setSessionToken(null)
  }

  // useEffect(() => {
  //   const getMe = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/me`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${sessionToken}`,
  //           },
  //         }
  //       )
  //       const data = response.data || {}
  //       const user = data.data

  //       if (!!user) {
  //         setAuth(true)
  //         setUser(user)
  //         setExtensionId(null)
  //       } else {
  //         setAuth(false)
  //       }
  //     } catch (err: any) {
  //       // remove token if 403 error
  //       if (err.response && err.response.status === 403) {
  //         logout()
  //       } else {
  //         setError(true)
  //       }
  //     }
  //   }

  //   if (!!sessionToken) {
  //     getMe()
  //   }
  // }, [sessionToken])

  useEffect(() => {
    const interval = setInterval(() => {
      if (chrome && chrome.storage && chrome.storage.local) {
        setStorageReady(true)
        clearInterval(interval)
      }
    }, 100) // Check every 100ms

    return () => clearInterval(interval) // Clean up on unmount
  }, [])

  useEffect(() => {
    if (auth === false && storageReady && !extensionId) {
      chrome.storage.local.get(['extension_id'], result => {
        if (result.extension_id) {
          setExtensionId(result.extension_id)
        } else {
          const newExtensionId = uuid()
          chrome.storage.local.set({ extension_id: newExtensionId }, () => {
            setExtensionId(newExtensionId)
          })
        }
      })
    }
  }, [auth, storageReady, extensionId])

  useEffect(() => {
    if (storageReady && auth === null) {
      chrome.storage.local.get(['token'], result => {
        if (result.token) {
          try {
            // let decodedToken = jwt.decode(result.token) as JwtPayload

            // if (!decodedToken) {
            //   logout()
            //   return
            // }

            // if (decodedToken && decodedToken.exp) {
            //   const now = Date.now() / 1000
            //   if (decodedToken.exp < now) {
            //     logout()
            //     return
            //   }
            // }

            setSessionToken(result.token)
            setAuth(true)
            setExtensionId(null)
          } catch (err) {
            logout()
          }
        } else {
          setAuth(false)
        }
      })
    }
  }, [storageReady, auth])

  console.log(auth)

  useEffect(() => {
    const getTokenFromExtensionId = async () => {
      const response = await chrome.runtime.sendMessage({
        action: 'getToken',
        extensionId,
      })

      console.log(response)
    }

    if (extensionId && auth === false) {
      getTokenFromExtensionId()
    }
  }, [extensionId, auth, storageReady])

  return { sessionToken, auth, extensionId, logout }
}

export default useSession
