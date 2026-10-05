import { getSiteContent, type PageMeta } from '@/lib/notion'
import { site } from '@/lib/config'

export const revalidate = 300

function fmtYear(d?: string) {
  if (!d) return ''
  return d.slice(0, 4)
}

function IndexItem({ it, dateLabel }: { it: PageMeta; dateLabel?: string }) {
  return (
    <li>
      <a href={`/${it.slug}`}>
        {dateLabel ? <time>{dateLabel}</time> : <span />}
        <span className="article-index-title">{it.title}</span>
        {it.summary ? <span className="desc">{it.summary}</span> : null}
      </a>
    </li>
  )
}

export default async function Home() {
  const content = await getSiteContent()

  return (
    <div className="home">
      <h1>{site.name}</h1>
      {content.intro ? <p className="home-intro">{content.intro}</p> : null}

      <div className="section-label" id="writings">Writing</div>
      <ul className="article-index">
        {content.writings.map((it) => (
          <IndexItem key={it.id} it={it} dateLabel={fmtYear(it.date)} />
        ))}
      </ul>

      <div className="section-label" id="interviews">跨界专访</div>
      <ul className="article-index">
        {content.interviews.map((it) => (
          <IndexItem key={it.id} it={it} />
        ))}
      </ul>

      <div className="section-label" id="projects">Projects</div>
      <ul className="article-index">
        {content.projects.map((it) => (
          <IndexItem key={it.id} it={it} dateLabel={it.year} />
        ))}
      </ul>
    </div>
  )
}
