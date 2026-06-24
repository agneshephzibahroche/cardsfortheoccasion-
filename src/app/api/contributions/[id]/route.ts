import { NextRequest, NextResponse } from 'next/server'
import { deleteContribution } from '@/lib/db'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteContribution(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contribution:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
