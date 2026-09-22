import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#174e44' },
    background: { default: '#f7f8f5', paper: '#ffffff' },
    text: { primary: '#20332f', secondary: '#596862' },
  },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    h1: { fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.12 },
    h2: { fontSize: '1.5rem', fontWeight: 650 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
})
