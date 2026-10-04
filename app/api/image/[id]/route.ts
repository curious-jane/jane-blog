import { NextRequest, NextResponse } from 'next/server'

// 图片代理：实时从 Notion 取最新签名 URL，解决签名 1 小时过期的问题
export const revalidate = 300

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id)
  const token = process.env.NOTION_TOKEN || ''

  const res = await fetch(`https://api.notion.com/v1/blocks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28'
    }
  })

  if (!res.ok) {
    return new NextResponse('image not found', { status: 404 })
  }

  const block = await res.json()
  const img = block?.image
  const url = img?.type === 'external' ? img?.external?.url : img?.file?.url

  if (!url) {
    return new NextResponse('no image', { status: 404 })
  }

  // 302 到最新的签名 URL（浏览器直接从 S3 加载，不经过函数，无体积限制）
  return NextResponse.redirect(url, 302)
}
