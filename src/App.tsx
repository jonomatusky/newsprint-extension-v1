import './App.css'
import { Box, CircularProgress } from '@mui/material'
import PageFrame from './components/page-frame'
import useSession from './hooks/useSession'
import { SessionContext } from './context/session-context'
import SignIn from './components/sign-in'

function App() {
  const { sessionToken, auth, extensionId, logout } = useSession()

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
              {/* {error ? (
                <Typography>Unable to connect</Typography>
              ) : ( */}
              <CircularProgress />
              {/* )} */}
            </Box>
          )}
          {auth === false && <SignIn />}
          {auth === true && <PageFrame />}
        </main>
      </div>
    </SessionContext.Provider>
  )
}

export default App
