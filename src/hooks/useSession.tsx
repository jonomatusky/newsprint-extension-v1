/* global chrome */

import axios from 'axios'
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
  error: boolean
}

const { REACT_APP_APP_URL, REACT_APP_API_ENDPOINT } = process.env

const useSession = (): useSessionReturnType => {
  const [storageReady, setStorageReady] = React.useState(false)
  const [sessionToken, setSessionToken] = React.useState(null as String | null)
  const [auth, setAuth] = React.useState(null as boolean | null)
  // const [user, setUser] = React.useState({})
  const [error, setError] = React.useState(false as boolean)
  const [extensionId, setExtensionId] = React.useState(null as String | null)

  console.log('extensionId', extensionId)
  console.log('storageReady', storageReady)
  console.log('auth', auth)
  // console.log('user', user)

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

  useEffect(() => {
    const getTokenFromExtensionId = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_APP_URL}${REACT_APP_API_ENDPOINT}/auth/ext/${extensionId}`
        )

        // get token from response
        const data = response.data || {}
        const token = data.token
        const user = data.user

        // save token to local storage
        if (!!token) {
          await chrome.storage.local.set({ token })

          if (!!user) {
            console.log('user', user)
            await chrome.storage.local.set({ user })
            // posthog.identify(user.id, {
            //   email: user.email,
            //   name: user.first_name + ' ' + user.last_name,
            // })
          }

          setSessionToken(token)
          setAuth(true)
          setExtensionId(null)
        }
      } catch (err: any) {
        // if extension id is already claimed, remove extension id
        try {
          if (err.response && err.response.status === 400) {
            chrome.storage.local.remove(['extension_id'])
            setExtensionId(null)
          } else {
            console.log(err)
          }
        } catch (err) {
          console.log(err)
          setError(true)
        }
      }
    }

    if (extensionId && auth === false && storageReady) {
      getTokenFromExtensionId()
    }
  }, [extensionId, auth, storageReady])

  return { sessionToken, auth, extensionId, logout, error }
}

export default useSession
