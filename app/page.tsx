import { getSiteContent, type PageMeta } from '@/lib/notion'

export const revalidate = 300

function fmtDate(d?: string) {
  if (!d) return ''
  const [y, m, dd] = d.split('-')
  if (!y) return ''
  return m && dd ? `${y}年${Number(m)}月${Number(dd)}日` : `${y}年`
}

function PostItem({ it }: { it: PageMeta }) {
  const date = fmtDate(it.date)
  return (
    <li>
      <a className="post-item" href={`/${it.slug}`}>
        <span className="t">{it.title}</span>
        <div className="m">
          {it.summary ? `${it.summary}${date ? ' — ' + date : ''}` : date}
        </div>
        {it.tags?.length ? (
          <div>
            {it.tags.map((tag) => (
              <span className="tag" key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </a>
    </li>
  )
}

export default async function Home() {
  const content = await getSiteContent()

  return (
    <>
      <div className="hero">
        <h1>你好，我是 Jane 👋</h1>
        {content.intro ? <p>{content.intro}</p> : null}
      </div>

      <h2 className="section" id="writings">Writings</h2>
      <ul className="post-list">
        {content.writings.map((it) => <PostItem key={it.id} it={it} />)}
      </ul>

      <h2 className="section" id="interviews">跨界专访</h2>
      <ul className="post-list">
        {content.interviews.map((it) => <PostItem key={it.id} it={it} />)}
      </ul>

      <h2 className="section" id="projects">Projects</h2>
      <ul className="post-list">
        {content.projects.map((it) => <PostItem key={it.id} it={it} />)}
      </ul>
    </>
  )
}
