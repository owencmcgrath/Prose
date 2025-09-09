// API service for document operations

const API_BASE = '/api'

class DocumentApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'DocumentApiError'
    this.status = status
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new DocumentApiError(error.error || 'Request failed', response.status)
  }
  
  // Handle 204 No Content responses
  if (response.status === 204) {
    return null
  }
  
  return response.json()
}

export const documentApi = {
  // Get all documents
  async getAll() {
    const response = await fetch(`${API_BASE}/documents`)
    return handleResponse(response)
  },

  // Get a single document
  async getById(id) {
    const response = await fetch(`${API_BASE}/documents/${id}`)
    return handleResponse(response)
  },

  // Create a new document
  async create(title, content, preview, titleManuallySet = false) {
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, preview, titleManuallySet }),
    })
    return handleResponse(response)
  },

  // Update an existing document
  async update(id, title, content, preview, titleManuallySet = false) {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, preview, titleManuallySet }),
    })
    return handleResponse(response)
  },

  // Delete a document
  async delete(id) {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },

  // Update document order
  async updateOrder(documentOrders) {
    const response = await fetch(`${API_BASE}/documents/order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentOrders }),
    })
    return handleResponse(response)
  },
}