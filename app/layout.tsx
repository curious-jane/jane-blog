import type { Metadata } from 'next'
import { site } from '@/lib/config'
import './globals.css'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: { default: site.name, template: '%s · ' + site.name },
  description: site.description
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();
        ` }} />
      </head>
      <body>
        <a href="#main" className="skip-link">跳到正文</a>
        <div className="site-shell">
          <header className="site-header">
            <a className="site-brand" href="/">{site.name}</a>
            <nav className="site-header-nav" aria-label="主导航">
              <a href="/#writings">Writing</a>
              <a href="/#interviews">专访</a>
              <a href="/#projects">Projects</a>
              <a href="/about">About</a>
            </nav>
            <div className="site-header-actions">
              <ThemeToggle />
            </div>
          </header>
          <main id="main">{children}</main>
          <footer className="site-footer">
            <span>Jane Liu</span>
            <div className="site-footer-actions">
              <nav aria-label="页脚导航">
                <a href="/#writings">Writing</a>
                <a href="/#projects">Projects</a>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
