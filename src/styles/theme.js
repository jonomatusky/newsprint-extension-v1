import { createTheme } from '@mui/material/styles'

export const font = "'Lato', sans-serif"

// Create a theme instance.
const theme = createTheme({
  shadows: Array(25).fill('none'),
  palette: {
    // mode: 'dark',
    primary: {
      main: '#00658d',
    },
    secondary: {
      main: '#a53d00',
    },
    error: {
      main: '#ba1a1a',
    },
    background: {
      default: '#fcfcff',
      paper: '#EEF4F9',
      paperLight: '#F5F9FC',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
    },
  },
  typography: {
    fontFamily: font,
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  transitions: {
    duration: {
      shortest: 250,
      shorter: 300,
      short: 350,
      standard: 450,
      complex: 500,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
})

export default theme
