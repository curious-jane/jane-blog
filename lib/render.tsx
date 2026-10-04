import React from 'react'
import type { NotionBlock } from './notion'
import { getPageBlocks } from './notion'

// ---------- 富文本 ----------
function RichText({ richText }: { richText: any[] }) {
  if (!richText) return null
  return (
    <>
      {richText.map((t: any, i: number) => {
        if (t.type === 'mention') {
          return <span key={i} className="mention">{t.plain_text}</span>
        }
        if (t.type === 'equation') {
          return <code key={i}>{t.plain_text}</code>
        }
        const content = t.text?.content || t.plain_text || ''
        const link = t.text?.link?.url || t.href
        const ann = t.annotations || {}
        let el: React.ReactNode = content
        if (ann.code) el = <code>{el}</code>
        if (ann.bold) el = <strong>{el}</strong>
        if (ann.italic) el = <em>{el}</em>
        if (ann.strikethrough) el = <s>{el}</s>
        if (ann.underline) el = <u>{el}</u>
        if (link) el = <a href={link} target="_blank" rel="noopener">{el}</a>
        return <span key={i}>{el}</span>
      })}
    </>
  )
}

// ---------- 单块渲染 ----------
function Block({ block }: { block: NotionBlock }) {
  const t = block.type
  const data = block[t] || {}

  switch (t) {
    case 'paragraph':
      return <p><RichText richText={data.rich_text} /></p>
    case 'heading_1':
      return <h2><RichText richText={data.rich_text} /></h2>
    case 'heading_2':
      return <h3><RichText richText={data.rich_text} /></h3>
    case 'heading_3':
      return <h4><RichText richText={data.rich_text} /></h4>
    case 'bulleted_list_item':
      return <li><RichText richText={data.rich_text} /></li>
    case 'numbered_list_item':
      return <li><RichText richText={data.rich_text} /></li>
    case 'to_do':
      return (
        <li>
          <input type="checkbox" checked={!!data.checked} readOnly />{' '}
          <RichText richText={data.rich_text} />
        </li>
      )
    case 'quote':
      return <blockquote><RichText richText={data.rich_text} /></blockquote>
    case 'callout':
      return (
        <div className="callout">
          {data.icon?.emoji ? <span className="callout-icon">{data.icon.emoji}</span> : null}
          <RichText richText={data.rich_text} />
        </div>
      )
    case 'divider':
      return <hr />
    case 'code':
      return (
        <pre className="code">
          <code>{data.rich_text?.map((x: any) => x.plain_text).join('')}</code>
        </pre>
      )
    case 'image': {
      const url = data.type === 'external' ? data.external?.url : data.file?.url
      const cap = data.caption?.map((x: any) => x.plain_text).join('')
      if (!url) return null
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={cap || ''} loading="lazy" />
          {cap ? <figcaption>{cap}</figcaption> : null}
        </figure>
      )
    }
    case 'video': {
      const url = data.type === 'external' ? data.external?.url : data.file?.url
      if (!url) return null
      return (
        <p className="media-note">
          🎬 <a href={url} target="_blank" rel="noopener">视频（点击查看）</a>
        </p>
      )
    }
    case 'bookmark':
      return (
        <p>
          🔗 <a href={data.url} target="_blank" rel="noopener">{data.url}</a>
        </p>
      )
    case 'child_page':
      return <p className="child-page">📄 {data.title}</p>
    case 'embed':
      return <p className="media-note">🔌 {data.url}</p>
    default:
      return null
  }
}

// ---------- 列（递归获取子块）----------
async function Column({ block }: { block: NotionBlock }) {
  const childRefs = block[block.type]?.children || []
  const cols: React.ReactNode[] = []
  for (const ref of childRefs) {
    const children = await getPageBlocks(ref.id)
    cols.push(
      <div className="column" key={ref.id}>
        <Blocks blocks={children} />
      </div>
    )
  }
  return <div className="columns">{cols}</div>
}

// ---------- 块列表（分组列表项）----------
export async function Blocks({ blocks }: { blocks: NotionBlock[] }) {
  const out: React.ReactNode[] = []
  let i = 0
  while (i < blocks.length) {
    const b = blocks[i]
    const t = b.type

    if (t === 'bulleted_list_item' || t === 'numbered_list_item' || t === 'to_do') {
      const tag = t === 'bulleted_list_item' ? 'ul' : t === 'numbered_list_item' ? 'ol' : 'ul'
      const items: React.ReactNode[] = []
      while (i < blocks.length && blocks[i].type === t) {
        items.push(<Block key={blocks[i].id} block={blocks[i]} />)
        i++
      }
      out.push(React.createElement(tag, { key: t + i, className: t === 'to_do' ? 'todo' : undefined }, items))
      continue
    }
    if (t === 'column_list' || t === 'column') {
      out.push(await Column({ block: b }))
      i++
      continue
    }
    if (t === 'toggle') {
      // 简化：仅显示标题
      out.push(
        <details key={b.id}>
          <summary><RichText richText={b.toggle?.rich_text} /></summary>
        </details>
      )
      i++
      continue
    }

    out.push(<Block key={b.id} block={b} />)
    i++
  }
  return <>{out}</>
}
