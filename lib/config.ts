// 站点配置与 Notion 结构 ID

export const site = {
  name: 'Jane Liu',
  description: "Jane 的生活、学习和工作思考"
}

export const NOTION_TOKEN = process.env.NOTION_TOKEN || ''

export const ids = {
  rootPage: 'bf27c9b9-f92e-42df-ab88-60baa7157f41',
  writingsDb: '423c5e9a-67c4-4733-9d80-a45519d3e9c3',
  projectsDb: '3efcd84d-9447-80de-913a-cf763707788b',
  aboutPage: '72f4268a-7047-4d68-97b1-036309244f67',
  contactPage: '8c5cb835-044e-4e38-ae16-2ac3d1777eea',
  // 跨界专访合集页内的 synced_block，含 20 篇专访子页
  interviewSyncedBlock: '83b86531-02c5-4d7b-af3a-942988f77d7c'
}
