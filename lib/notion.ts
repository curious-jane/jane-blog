import { ids, NOTION_TOKEN } from './config'

// ---------- 类型 ----------
export interface PageMeta {
  id: string
  slug: string
  title: string
  type: 'writing' | 'project' | 'interview' | 'about' | 'contact'
  date?: string
  tags?: string[]
  summary?: string
  year?: string
  awards?: string
}

export interface SiteContent {
  intro: string
  writings: PageMeta[]
  projects: PageMeta[]
  interviews: PageMeta[]
}

// ---------- 基础 fetch ----------
async function notionFetch(path: string, options: RequestInit = {}) {
  const res = await fetch('https://api.notion.com/v1' + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...options.headers
    },
    // ISR 缓存 5 分钟
    next: { revalidate: 300 }
  })
  if (!res.ok) {
    throw new Error(`Notion API ${path} failed: ${res.status}`)
  }
  return res.json()
}

// ---------- 工具 ----------
export function slugify(title: string): string {
  return title
    .trim()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function richText(prop: any): string {
  if (!prop) return ''
  const arr = Array.isArray(prop) ? prop : prop.rich_text || prop.title || []
  return arr.map((x: any) => x?.plain_text || x?.text?.content || '').join('')
}

function multiSelect(prop: any): string[] {
  if (!prop) return []
  const arr = prop.multi_select || []
  return arr.map((x: any) => x.name)
}

// ---------- 内容枚举 ----------
async function queryDb(dbId: string): Promise<any[]> {
  const data = await notionFetch(`/databases/${dbId}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 100 })
  })
  return data.results || []
}

async function getChildPages(blockId: string): Promise<{ id: string; title: string }[]> {
  const data = await notionFetch(`/blocks/${blockId}/children?page_size=100`)
  const out: { id: string; title: string }[] = []
  for (const b of data.results || []) {
    if (b.type === 'child_page') {
      out.push({ id: b.id, title: b.child_page?.title || '' })
    }
  }
  return out
}

export async function getSiteContent(): Promise<SiteContent> {
  // 根页面简介
  const rootBlocks = await getPageBlocks(ids.rootPage)
  const intro = rootBlocks
    .filter((b) => b.type === 'paragraph')
    .map((b) => richText(b.paragraph?.rich_text))
    .join(' ')
    .slice(0, 300)

  // Writings
  const wPages = await queryDb(ids.writingsDb)
  const writings: PageMeta[] = wPages.map((p) => {
    const title = richText(p.properties?.Name)
    return {
      id: p.id,
      slug: slugify(title),
      title,
      type: 'writing' as const,
      date: (p.created_time || '').slice(0, 10),
      tags: multiSelect(p.properties?.Tag),
      summary: richText(p.properties?.['摘要'])
    }
  }).filter((w) => w.title && w.title !== '跨界专访（合集）')

  // Projects
  const pPages = await queryDb(ids.projectsDb)
  const projects: PageMeta[] = pPages.map((p) => {
    const title = richText(p.properties?.Name)
    return {
      id: p.id,
      slug: slugify(title),
      title,
      type: 'project' as const,
      date: (p.created_time || '').slice(0, 10),
      year: p.properties?.Year?.number ? String(p.properties.Year.number) : '',
      awards: richText(p.properties?.Awards),
      tags: multiSelect(p.properties?.Tag)
    }
  }).filter((p) => p.title)

  // Interviews（跨界专访，synced_block 内的子页）
  const interviewPages = await getChildPages(ids.interviewSyncedBlock)
  const interviews: PageMeta[] = interviewPages.map((c) => {
    const clean = c.title.replace(/^【跨界专访】/, '').replace(/^【独家】/, '').trim()
    return {
      id: c.id,
      slug: slugify(clean),
      title: clean,
      type: 'interview' as const
    }
  }).filter((i) => i.title)

  return { intro, writings, projects, interviews }
}

// ---------- 页面块 ----------
export interface NotionBlock {
  id: string
  type: string
  [key: string]: any
}

export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  let cursor: string | undefined
  const blocks: NotionBlock[] = []
  do {
    const url = `/blocks/${pageId}/children?page_size=100` + (cursor ? `&start_cursor=${cursor}` : '')
    const data = await notionFetch(url)
    blocks.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)
  return blocks
}

export async function getPageById(id: string): Promise<NotionBlock[]> {
  return getPageBlocks(id)
}
