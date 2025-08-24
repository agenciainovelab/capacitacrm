
require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🗃️ [MIGRATION] Connecting to database...')
    
    const client = await pool.connect()
    
    console.log('📄 [MIGRATION] Reading migration file...')
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrate-students.sql'), 
      'utf8'
    )
    
    console.log('⚡ [MIGRATION] Executing migration...')
    await client.query(migrationSQL)
    
    console.log('✅ [MIGRATION] Migration completed successfully!')
    
    client.release()
  } catch (error) {
    console.error('❌ [MIGRATION] Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
