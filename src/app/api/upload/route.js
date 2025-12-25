import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

// POST /api/upload - 上传图片
export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!file) {
    return NextResponse.json({ error: '未选择文件' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // 生成唯一文件名
  const timestamp = Date.now()
  const ext = file.name.split('.').pop()
  const filename = `${timestamp}.${ext}`

  const uploadDir = join(process.cwd(), 'public/uploads')
  const filepath = join(uploadDir, filename)

  await writeFile(filepath, buffer)

  return NextResponse.json({
    url: `/uploads/${filename}`
  })
}
