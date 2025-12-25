import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// DELETE /api/memories/[id] - 删除记忆
export async function DELETE(request, { params }) {
  const id = parseInt(params.id)

  await prisma.memory.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
