/* global chrome */

import './App.css'
import React, { useState } from 'react'
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  useClerk,
  useUser,
  ClerkProvider,
} from '@clerk/chrome-extension'
import { Box, Button, Container, Grid, Typography } from '@mui/material'
import { useNavigate, Routes, Route, MemoryRouter } from 'react-router-dom'
import PageFrame from './components/page-frame'

const REACT_APP_SIGNIN_PAGE = process.env.REACT_APP_SIGNIN_PAGE || ''
const REACT_APP_APP_URL = process.env.REACT_APP_APP_URL || ''

const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || ''

function ClerkProviderWithRoutes() {
  const navigate = useNavigate()

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
    <ClerkProvider
      publishableKey={publishableKey}
      navigate={to => navigate(to)}
    >
      <div className="App">
        <main className="App-main">
          <Routes>
            <Route path="/sign-up/*" element={<SignUp signInUrl="/" />} />
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <PageFrame />
                  </SignedIn>
                  <SignedOut>
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
                          Sign in to get started
                        </Typography>
                        <Button onClick={handleSignIn} variant="contained">
                          Sign in
                        </Button>
                      </Box>
                    </Box>
                  </SignedOut>
                </>
              }
            />
          </Routes>
        </main>
      </div>
    </ClerkProvider>
  )
}

function App() {
  return (
    <MemoryRouter>
      <ClerkProviderWithRoutes />
    </MemoryRouter>
  )
}

export default App
