import express from 'express';
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';

const app = express();
const port = 3000;

// Load connection.json manually
const jsonText = await readFile('./connection.json', 'utf-8');
const connection = JSON.parse(jsonText);

// Create DB connection
const db = await mysql.createConnection({
  host: connection.host,
  port: connection.port,
  user: connection.user,
  password: connection.password,
  database: connection.database
});

// REST API endpoint: /search?term=something
app.get('/search', async (req, res) => {
  const searchTerm = req.query.term;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing search term' });
  }

  const sql = `
    SELECT * FROM sample
    WHERE author_first_name LIKE ?
       OR author_last_name LIKE ?
       OR category LIKE ?
       OR isbn LIKE ?
       OR type LIKE ?
  `;

  const param = `%${searchTerm}%`;

  try {
    const [results] = await db.execute(sql, [param, param, param, searchTerm, param]);
    res.json(results);
  } catch (err) {
    console.error('Query failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});