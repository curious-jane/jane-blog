import { notFound } from 'next/navigation'
import { getSiteContent, getPageBlocks, slugify, type PageMeta } from '@/lib/notion'
import { ids } from '@/lib/config'
import { Blocks } from '@/lib/render'

export const revalidate = 300
export const dynamicParams = true

function fmtDate(d?: string) {
  if (!d) return ''
  const [y, m, dd] = d.split('-')
  if (!y) return ''
  return m && dd ? `${y}年${Number(m)}月${Number(dd)}日` : `${y}年`
}

async function findPage(rawSlug: string): Promise<{ meta: PageMeta; id: string } | null> {
  let slug = rawSlug
  try {
    slug = decodeURIComponent(rawSlug)
  } catch {
    slug = rawSlug
  }
  if (slug === 'about') {
    return { meta: { id: ids.aboutPage, slug: 'about', title: '关于我', type: 'about' }, id: ids.aboutPage }
  }
  if (slug === 'contact') {
    return { meta: { id: ids.contactPage, slug: 'contact', title: '联系我', type: 'contact' }, id: ids.contactPage }
  }
  const content = await getSiteContent()
  const all = [...content.writings, ...content.projects, ...content.interviews]
  const found = all.find((p) => p.slug === slug || slugify(p.title) === slug)
  return found ? { meta: found, id: found.id } : null
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await findPage(params.slug)
  return { title: page ? page.meta.title : 'Not Found' }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await findPage(params.slug)
  if (!page) notFound()

  const blocks = await getPageBlocks(page.id)
  const date = fmtDate(page.meta.date)
  const description = page.meta.summary || page.meta.awards || ''

  return (
    <article>
      <header className="article-header">
        <h1>{page.meta.title}</h1>
        {description ? <p className="article-description">{description}</p> : null}
        <div className="article-meta">
          {page.meta.tags?.length ? (
            page.meta.tags.map((t) => <span key={t}>#{t}</span>)
          ) : null}
          {date ? <span>{date}</span> : null}
          {page.meta.year ? <span>{page.meta.year}</span> : null}
        </div>
      </header>
      <div className="article-body">
        <Blocks blocks={blocks} />
      </div>
    </article>
  )
}
