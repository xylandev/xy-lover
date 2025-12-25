import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/memories - 获取所有记忆
export async function GET() {
  const memories = await prisma.memory.findMany({
    orderBy: { date: 'desc' }
  })
  return NextResponse.json(memories)
}

// POST /api/memories - 创建新记忆
export async function POST(request) {
  const body = await request.json()
  const { content, imageUrl, date } = body

  if (!content || !imageUrl || !date) {
    return NextResponse.json(
      { error: '缺少必要字段' },
      { status: 400 }
    )
  }

  const memory = await prisma.memory.create({
    data: { content, imageUrl, date }
  })

  return NextResponse.json(memory, { status: 201 })
}
