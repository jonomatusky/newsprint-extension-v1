/* global chrome */

import './App.css'
import React from 'react'
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import PageFrame from './components/page-frame'
import useSession from './hooks/useSession'
import { SessionContext } from './context/session-context'
// import posthog from 'posthog-js'

const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''
// const REACT_APP_POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY || ''

// posthog.init(REACT_APP_POSTHOG_KEY, {
//   api_host: 'https://app.posthog.com',
// })

function App() {
  const { sessionToken, auth, extensionId, logout, error } = useSession()
  // const { auth } = useSession()

  // console.log('auth', auth)

  const handleOpenAuth = (isSignUp = false) => {
    try {
      chrome.tabs.create({
        url:
          REACT_APP_APP_URL +
          `/ext-auth/${isSignUp ? 'sign-up' : 'sign-in'}?id=` +
          extensionId,
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <SessionContext.Provider
      value={{ sessionToken, auth, extensionId, logout } as any}
    >
      <div className="App">
        <main className="App-main">
          {auth === null && (
            <Box
              height="100vh"
              width="100vw"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              {error ? (
                <Typography>Unable to connect</Typography>
              ) : (
                <CircularProgress />
              )}
            </Box>
          )}
          {auth === false && (
            <Box
              height="100vh"
              width="100vw"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                width="100vw"
                display="flex"
                justifyContent="center"
                flexWrap="wrap"
              >
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
          )}
          {auth === true && <PageFrame />}
        </main>
      </div>
    </SessionContext.Provider>
  )
}

export default App
