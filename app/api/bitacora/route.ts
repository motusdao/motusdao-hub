import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, content, mood, tags } = body

    // Validate required fields
    if (!userId || !content) {
      return NextResponse.json(
        { error: 'User ID and content are required' },
        { status: 400 }
      )
    }

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId,
        content,
        mood: mood || null,
        tags: tags ? JSON.stringify(tags) : null
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Journal entry created successfully',
        entry: journalEntry
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.journalEntry.count({
        where: { userId }
      })
    ])

    // Parse tags for each entry
    const entriesWithParsedTags = entries.map(entry => ({
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }))

    return NextResponse.json({
      entries: entriesWithParsedTags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, content, mood, tags } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const updatedEntry = await prisma.journalEntry.update({
      where: { id },
      data: {
        content,
        mood,
        tags: tags ? JSON.stringify(tags) : null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Journal entry updated successfully',
      entry: {
        ...updatedEntry,
        tags: updatedEntry.tags ? JSON.parse(updatedEntry.tags) : []
      }
    })
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    await prisma.journalEntry.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Journal entry deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
