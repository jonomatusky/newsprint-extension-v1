/* global chrome */

import './App.css'
import React from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import PageFrame from './components/page-frame'
import useSession from './hooks/useSession'

const REACT_APP_SIGNIN_PAGE = process.env.REACT_APP_SIGNIN_PAGE || ''
const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''

function App() {
  // const { auth, extensionId } = useSession()
  const { auth } = useSession()

  // console.log('auth', auth)

  const handleSignIn = () => {
    try {
      chrome.tabs.create({
        url: REACT_APP_APP_URL + REACT_APP_SIGNIN_PAGE,
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
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
            <CircularProgress />
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
              <Typography
                variant="h5"
                gutterBottom
                textAlign="center"
                width="100vw"
              >
                Sign up to get started
              </Typography>
              <Button onClick={handleSignIn} variant="contained">
                Sign in
              </Button>
            </Box>
          </Box>
        )}
        {auth === true && <PageFrame />}
      </main>
    </div>
  )
}

export default App
