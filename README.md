# Jane 的博客（Notion 官方 API + Next.js + 自动更新）

这是一个基于 **Notion 官方 API** 的博客，部署后你在 Notion 里改内容，网站 **5 分钟内自动更新**（ISR 增量再生成）。

## 内容结构

- 首页：简介 + Writings（6 篇）+ 跨界专访（20 篇）+ Projects（5 个）
- About / Contact 页面
- 每篇文章自动渲染（标题、列表、图片、引用、代码、列布局等）

## 部署（Vercel）

1. 把这个文件夹上传到一个 GitHub 仓库
2. Vercel → New Project → 导入该仓库（框架自动识别为 Next.js）
3. 在 Vercel 的 **Settings → Environment Variables** 里加一条：

   | Name | Value |
   |---|---|
   | `NOTION_TOKEN` | 你的 Notion 集成 token（`ntn_...`） |

4. Deploy

## 本地开发（可选）

```bash
npm install
# 创建 .env.local 并写入 NOTION_TOKEN=ntn_...
npm run dev
```

## 关键配置

`lib/config.ts` 里是站点名、Notion 各页/数据库的 ID。如果 Notion 结构变了（比如新建了库），改这里即可。

## 自动更新原理

- `app/page.tsx` 和 `app/[slug]/page.tsx` 都设了 `revalidate = 300`（5 分钟）
- 每隔 5 分钟，Vercel 会重新从 Notion 拉取内容并生成新页面
- 你在 Notion 里改完，最多等 5 分钟网站就更新
