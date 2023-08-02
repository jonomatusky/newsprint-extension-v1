/* global chrome */

import axios from 'axios'
import React, { useEffect } from 'react'
import { v4 as uuid } from 'uuid'

const { REACT_APP_APP_URL, REACT_APP_API_ENDPOINT } = process.env

const useSession = () => {
  const [storageReady, setStorageReady] = React.useState(false)
  const [sessionToken, setSessionToken] = React.useState(null as String | null)
  const [auth, setAuth] = React.useState(null as boolean | null)
  const [extensionId, setExtensionId] = React.useState(null as String | null)

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
    if (auth === false && storageReady) {
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
  }, [auth, storageReady])

  useEffect(() => {
    if (storageReady && auth === null) {
      chrome.storage.local.get(['token'], result => {
        if (result.token) {
          setSessionToken(result.token)
          setAuth(true)
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
        const token = response.data?.token

        // save token to local storage
        if (!!token) {
          chrome.storage.local.set({ token }, () => {
            // console.log('Token saved to local storage')
          })
          setAuth(true)
          setSessionToken(token)
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (extensionId && auth === false && storageReady) {
      getTokenFromExtensionId()
    }
  }, [extensionId, auth, storageReady])

  return { sessionToken, auth, extensionId }
}

export default useSession
