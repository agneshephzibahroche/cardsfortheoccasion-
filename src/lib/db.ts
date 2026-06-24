import { createClient, type Client, type Row } from '@libsql/client'
import { mkdirSync } from 'fs'
import path from 'path'

const globalForDb = globalThis as unknown as { turso: Client | undefined }

function getClient(): Client {
  if (!globalForDb.turso) {
    const url = process.env.TURSO_DATABASE_URL ?? 'file:./data/cards.db'
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (url.startsWith('file:')) {
      const filePath = url.replace('file:./', '')
      mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true })
    }
    globalForDb.turso = createClient({ url, authToken })
  }
  return globalForDb.turso
}

let schemaReady: Promise<void> | null = null

async function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady
  const client = getClient()
  schemaReady = (async () => {
    await client.batch(
      [
        {
          sql: `CREATE TABLE IF NOT EXISTS cards (
            id TEXT PRIMARY KEY,
            share_id TEXT UNIQUE NOT NULL,
            reveal_id TEXT UNIQUE NOT NULL,
            creator_name TEXT NOT NULL,
            recipient_name TEXT NOT NULL,
            theme TEXT NOT NULL DEFAULT 'birthday',
            message TEXT NOT NULL,
            photo_url TEXT,
            playlist_url TEXT,
            lock_date TEXT,
            accent_color TEXT,
            has_been_revealed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
        },
        {
          sql: `CREATE TABLE IF NOT EXISTS contributions (
            id TEXT PRIMARY KEY,
            card_id TEXT NOT NULL,
            contributor_name TEXT NOT NULL,
            message TEXT NOT NULL,
            photo_url TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
          )`,
        },
      ],
      'write',
    )
    // Migration: add accent_color to existing databases
    try {
      await client.execute({ sql: 'ALTER TABLE cards ADD COLUMN accent_color TEXT' })
    } catch {
      // Column already exists — fine
    }
  })()
  return schemaReady
}

// ── Types ──────────────────────────────────────────────────────────
export interface DbCard {
  id: string
  share_id: string
  reveal_id: string
  creator_name: string
  recipient_name: string
  theme: string
  message: string
  photo_url: string | null
  playlist_url: string | null
  lock_date: string | null
  accent_color: string | null
  has_been_revealed: number
  created_at: string
}

export interface DbContribution {
  id: string
  card_id: string
  contributor_name: string
  message: string
  photo_url: string | null
  created_at: string
}

function toCard(row: Row): DbCard {
  return {
    id: row['id'] as string,
    share_id: row['share_id'] as string,
    reveal_id: row['reveal_id'] as string,
    creator_name: row['creator_name'] as string,
    recipient_name: row['recipient_name'] as string,
    theme: row['theme'] as string,
    message: row['message'] as string,
    photo_url: row['photo_url'] as string | null,
    playlist_url: row['playlist_url'] as string | null,
    lock_date: row['lock_date'] as string | null,
    accent_color: row['accent_color'] as string | null,
    has_been_revealed: row['has_been_revealed'] as number,
    created_at: row['created_at'] as string,
  }
}

function toContribution(row: Row): DbContribution {
  return {
    id: row['id'] as string,
    card_id: row['card_id'] as string,
    contributor_name: row['contributor_name'] as string,
    message: row['message'] as string,
    photo_url: row['photo_url'] as string | null,
    created_at: row['created_at'] as string,
  }
}

// ── Card operations ────────────────────────────────────────────────
export async function createCard(data: {
  id: string
  shareId: string
  revealId: string
  creatorName: string
  recipientName: string
  theme: string
  message: string
  photoUrl?: string
  playlistUrl?: string
  lockDate?: string
  accentColor?: string
}): Promise<DbCard> {
  await ensureSchema()
  const client = getClient()
  await client.execute({
    sql: `INSERT INTO cards (id, share_id, reveal_id, creator_name, recipient_name, theme, message, photo_url, playlist_url, lock_date, accent_color)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.id, data.shareId, data.revealId,
      data.creatorName, data.recipientName, data.theme, data.message,
      data.photoUrl ?? null, data.playlistUrl ?? null, data.lockDate ?? null,
      data.accentColor ?? null,
    ],
  })
  const result = await client.execute({ sql: 'SELECT * FROM cards WHERE id = ?', args: [data.id] })
  return toCard(result.rows[0])
}

export async function getCardByShareId(shareId: string): Promise<(DbCard & { contributions: DbContribution[] }) | null> {
  await ensureSchema()
  const client = getClient()
  const cardResult = await client.execute({ sql: 'SELECT * FROM cards WHERE share_id = ?', args: [shareId] })
  if (!cardResult.rows[0]) return null
  const card = toCard(cardResult.rows[0])
  const contribs = await client.execute({ sql: 'SELECT * FROM contributions WHERE card_id = ? ORDER BY created_at ASC', args: [card.id] })
  return { ...card, contributions: contribs.rows.map(toContribution) }
}

export async function getCardByRevealId(revealId: string): Promise<(DbCard & { contributions: DbContribution[] }) | null> {
  await ensureSchema()
  const client = getClient()
  const cardResult = await client.execute({ sql: 'SELECT * FROM cards WHERE reveal_id = ?', args: [revealId] })
  if (!cardResult.rows[0]) return null
  const card = toCard(cardResult.rows[0])
  const contribs = await client.execute({ sql: 'SELECT * FROM contributions WHERE card_id = ? ORDER BY created_at ASC', args: [card.id] })
  return { ...card, contributions: contribs.rows.map(toContribution) }
}

export async function markCardRevealed(revealId: string): Promise<boolean> {
  await ensureSchema()
  const client = getClient()
  const result = await client.execute({ sql: 'SELECT has_been_revealed FROM cards WHERE reveal_id = ?', args: [revealId] })
  if (!result.rows[0]) return false
  const isFirst = (result.rows[0]['has_been_revealed'] as number) === 0
  if (isFirst) {
    await client.execute({ sql: 'UPDATE cards SET has_been_revealed = 1 WHERE reveal_id = ?', args: [revealId] })
  }
  return isFirst
}

export async function createContribution(data: {
  id: string
  cardId: string
  contributorName: string
  message: string
  photoUrl?: string
}): Promise<DbContribution> {
  await ensureSchema()
  const client = getClient()
  await client.execute({
    sql: `INSERT INTO contributions (id, card_id, contributor_name, message, photo_url) VALUES (?, ?, ?, ?, ?)`,
    args: [data.id, data.cardId, data.contributorName, data.message, data.photoUrl ?? null],
  })
  const result = await client.execute({ sql: 'SELECT * FROM contributions WHERE id = ?', args: [data.id] })
  return toContribution(result.rows[0])
}
