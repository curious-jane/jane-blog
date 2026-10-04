'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const d = document.documentElement
    d.classList.toggle('dark')
    localStorage.setItem('theme', d.classList.contains('dark') ? 'dark' : 'light')
    setDark(d.classList.contains('dark'))
  }

  return (
    <button className="theme-btn" onClick={toggle} aria-label="切换主题">
      {dark ? '☾' : '☀'}
    </button>
  )
}
