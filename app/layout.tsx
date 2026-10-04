import type { Metadata } from 'next'
import { site } from '@/lib/config'
import './globals.css'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: site.name,
  description: site.description
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();
        ` }} />
      </head>
      <body>
        <div className="site">
          <header className="site-head">
            <a className="brand" href="/">Jane Liu</a>
            <nav>
              <a href="/#writings">Writings</a>
              <a href="/#interviews">专访</a>
              <a href="/#projects">Projects</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </nav>
            <ThemeToggle />
          </header>
          {children}
          <footer className="site-foot">© 2026 Jane Liu · Powered by Notion</footer>
        </div>
      </body>
    </html>
  )
}
