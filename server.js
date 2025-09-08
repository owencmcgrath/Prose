
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { documentDb } from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, 'build')))

// API Routes
app.get('/api/documents', (req, res) => {
  try {
    const documents = documentDb.getAll()
    res.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

app.get('/api/documents/:id', (req, res) => {
  try {
    const document = documentDb.getById(req.params.id)
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    res.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    res.status(500).json({ error: 'Failed to fetch document' })
  }
})

app.post('/api/documents', (req, res) => {
  try {
    const { title, content, preview, titleManuallySet } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }
    
    const documentId = documentDb.create(title, content, preview || '', titleManuallySet || false)
    const document = documentDb.getById(documentId)
    res.status(201).json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    res.status(500).json({ error: 'Failed to create document' })
  }
})

app.put('/api/documents/:id', (req, res) => {
  try {
    const { title, content, preview, titleManuallySet } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }
    
    const updated = documentDb.update(req.params.id, title, content, preview || '', titleManuallySet || false)
    if (!updated) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    const document = documentDb.getById(req.params.id)
    res.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    res.status(500).json({ error: 'Failed to update document' })
  }
})

app.delete('/api/documents/:id', (req, res) => {
  try {
    const deleted = documentDb.delete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Document not found' })
    }
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ error: 'Failed to delete document' })
  }
})

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})