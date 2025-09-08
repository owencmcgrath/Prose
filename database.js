import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize database
const db = new Database(path.join(__dirname, 'documents.db'))

// Create documents table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    preview TEXT NOT NULL,
    title_manually_set BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
  CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
`)

// Prepared statements for better performance
const statements = {
  getAllDocuments: db.prepare('SELECT * FROM documents ORDER BY updated_at DESC'),
  getDocument: db.prepare('SELECT * FROM documents WHERE id = ?'),
  insertDocument: db.prepare(`
    INSERT INTO documents (title, content, preview, title_manually_set)
    VALUES (?, ?, ?, ?)
  `),
  updateDocument: db.prepare(`
    UPDATE documents 
    SET title = ?, content = ?, preview = ?, title_manually_set = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  deleteDocument: db.prepare('DELETE FROM documents WHERE id = ?')
}

// Database operations
export const documentDb = {
  // Get all documents
  getAll() {
    return statements.getAllDocuments.all()
  },

  // Get a single document
  getById(id) {
    return statements.getDocument.get(id)
  },

  // Create a new document
  create(title, content, preview, titleManuallySet = false) {
    const result = statements.insertDocument.run(title, content, preview, titleManuallySet ? 1 : 0)
    return result.lastInsertRowid
  },

  // Update an existing document
  update(id, title, content, preview, titleManuallySet = false) {
    const result = statements.updateDocument.run(title, content, preview, titleManuallySet ? 1 : 0, id)
    return result.changes > 0
  },

  // Delete a document
  delete(id) {
    const result = statements.deleteDocument.run(id)
    return result.changes > 0
  }
}

// Graceful shutdown
process.on('exit', () => db.close())
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))