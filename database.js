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
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Add display_order column to existing tables if it doesn't exist
const columns = db.prepare('PRAGMA table_info(documents)').all()
const hasOrderColumn = columns.some(col => col.name === 'display_order')

if (!hasOrderColumn) {
  db.exec('ALTER TABLE documents ADD COLUMN display_order INTEGER DEFAULT 0')
  // Set initial order based on updated_at timestamp
  db.exec(`
    UPDATE documents 
    SET display_order = (
      SELECT COUNT(*) 
      FROM documents d2 
      WHERE d2.updated_at >= documents.updated_at
    )
  `)
}

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
  CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
`)

// Prepared statements for better performance
const statements = {
  getAllDocuments: db.prepare('SELECT * FROM documents ORDER BY display_order ASC, updated_at DESC'),
  getDocument: db.prepare('SELECT * FROM documents WHERE id = ?'),
  insertDocument: db.prepare(`
    INSERT INTO documents (title, content, preview, title_manually_set, display_order)
    VALUES (?, ?, ?, ?, (SELECT COALESCE(MIN(display_order), 1) - 1 FROM documents))
  `),
  updateDocument: db.prepare(`
    UPDATE documents 
    SET title = ?, content = ?, preview = ?, title_manually_set = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  deleteDocument: db.prepare('DELETE FROM documents WHERE id = ?'),
  updateOrder: db.prepare(`
    UPDATE documents 
    SET display_order = ?
    WHERE id = ?
  `)
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
  },

  // Update document order
  updateOrder(documentOrders) {
    const updateOrderTransaction = db.transaction((orders) => {
      for (const { id, order } of orders) {
        statements.updateOrder.run(order, id)
      }
    })
    
    try {
      updateOrderTransaction(documentOrders)
      return true
    } catch (error) {
      console.error('Error updating document order:', error)
      return false
    }
  }
}

// Graceful shutdown
process.on('exit', () => db.close())
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))