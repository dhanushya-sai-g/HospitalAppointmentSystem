import { createContext, useState, useEffect, useContext } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setTheme(saved)
    setMounted(true)
  }, [])

  // Update document and localStorage when theme changes
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('theme', theme)

    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark')

    // Add the current theme class
    document.documentElement.classList.add(theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
