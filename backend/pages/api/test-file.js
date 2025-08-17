import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const filePath = path.join(process.cwd(), '..', 'test-social.org')
    const content = fs.readFileSync(filePath, 'utf8')
    
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(content)
  } catch (error) {
    console.error('Error serving test file:', error)
    res.status(404).json({ error: 'File not found' })
  }
}