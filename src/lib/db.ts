import Database from 'better-sqlite3'
import path from 'path'
import { mkdirSync } from 'fs'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'cards.db')

const globalForDb = globalThis as unknown as { db: Database.Database | undefined }

function createDb(): Database.Database {
  mkdirSync(DB_DIR, { recursive: true })
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
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
      has_been_revealed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contributions (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      contributor_name TEXT NOT NULL,
      message TEXT NOT NULL,
      photo_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );
  `)
  return db
}

export function getDb(): Database.Database {
  if (!globalForDb.db) {
    globalForDb.db = createDb()
  }
  return globalForDb.db
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

// ── Card operations ────────────────────────────────────────────────
export function createCard(data: {
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
}): DbCard {
  const db = getDb()
  db.prepare(`
    INSERT INTO cards (id, share_id, reveal_id, creator_name, recipient_name, theme, message, photo_url, playlist_url, lock_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.id,
    data.shareId,
    data.revealId,
    data.creatorName,
    data.recipientName,
    data.theme,
    data.message,
    data.photoUrl ?? null,
    data.playlistUrl ?? null,
    data.lockDate ?? null,
  )
  return db.prepare('SELECT * FROM cards WHERE id = ?').get(data.id) as DbCard
}

export function getCardByShareId(shareId: string): (DbCard & { contributions: DbContribution[] }) | null {
  const db = getDb()
  const card = db.prepare('SELECT * FROM cards WHERE share_id = ?').get(shareId) as DbCard | undefined
  if (!card) return null
  const contributions = db.prepare('SELECT * FROM contributions WHERE card_id = ? ORDER BY created_at ASC').all(card.id) as DbContribution[]
  return { ...card, contributions }
}

export function getCardByRevealId(revealId: string): (DbCard & { contributions: DbContribution[] }) | null {
  const db = getDb()
  const card = db.prepare('SELECT * FROM cards WHERE reveal_id = ?').get(revealId) as DbCard | undefined
  if (!card) return null
  const contributions = db.prepare('SELECT * FROM contributions WHERE card_id = ? ORDER BY created_at ASC').all(card.id) as DbContribution[]
  return { ...card, contributions }
}

export function markCardRevealed(revealId: string): boolean {
  const db = getDb()
  const card = db.prepare('SELECT has_been_revealed FROM cards WHERE reveal_id = ?').get(revealId) as { has_been_revealed: number } | undefined
  if (!card) return false
  const isFirst = card.has_been_revealed === 0
  if (isFirst) {
    db.prepare('UPDATE cards SET has_been_revealed = 1 WHERE reveal_id = ?').run(revealId)
  }
  return isFirst
}

// ── Contribution operations ────────────────────────────────────────
export function createContribution(data: {
  id: string
  cardId: string
  contributorName: string
  message: string
  photoUrl?: string
}): DbContribution {
  const db = getDb()
  db.prepare(`
    INSERT INTO contributions (id, card_id, contributor_name, message, photo_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    data.id,
    data.cardId,
    data.contributorName,
    data.message,
    data.photoUrl ?? null,
  )
  return db.prepare('SELECT * FROM contributions WHERE id = ?').get(data.id) as DbContribution
}
