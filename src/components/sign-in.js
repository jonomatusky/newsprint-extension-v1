/* global chrome */

import { Box, Button, Grid, Typography } from '@mui/material'
import { v4 as uuid } from 'uuid'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''

function SignIn() {
  const checkForToken = async extensionId => {
    console.log('checking for token')

    const response = await sendMessageToBackend(extensionId)

    console.log(response)

    if (!response.token) {
      setTimeout(checkForToken, 1000) // Wait for 1 second and then check again
    } else {
      console.log('Token received:', response.token)
      // Handle token here if needed
    }
  }

  const sendMessageToBackend = extensionId => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: 'swapExtensionIdForToken',
          extensionId,
        },
        response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError))
          } else {
            resolve(response)
          }
        }
      )
    })
  }

  const handleOpenAuth = async (isSignUp = false) => {
    try {
      const extensionId = uuid()
      await chrome.storage.local.set({ extension_id: extensionId })

      chrome.tabs.create({
        url:
          REACT_APP_APP_URL +
          `/ext-auth/${isSignUp ? 'sign-up' : 'sign-in'}?id=` +
          extensionId,
      })

      // send a message to the backend, then once it's received, if it does not contain a token, wait one second and check again
      checkForToken(extensionId)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box width="100vw" display="flex" justifyContent="center" flexWrap="wrap">
        <Grid container spacing={1}>
          <Grid item xs={12} textAlign="center">
            <Typography
              variant="h5"
              gutterBottom
              textAlign="center"
              width="100vw"
            >
              Sign in to get started
            </Typography>
          </Grid>
          <Grid item xs={12} textAlign="center">
            <Button
              onClick={() => handleOpenAuth()}
              variant="outlined"
              sx={{ mr: 0.5 }}
            >
              Sign in
            </Button>

            <Button
              onClick={() => handleOpenAuth(true)}
              variant="contained"
              sx={{ ml: 0.5 }}
            >
              Sign up
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default SignIn
