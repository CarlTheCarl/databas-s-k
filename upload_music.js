// import file system module
import fs from 'fs';
// import the musicMetadata
import * as musicMetadata from 'music-metadata';
// Import the database driver
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import path from 'path';

let db;

 try {
  
  // Load DB credentials
  const jsonText = await readFile('connection.json', 'utf-8');
  const data = JSON.parse(jsonText);

      // Connect to DB
  db = await mysql.createConnection({
    host: data.host,
    port: data.port,
    user: data.user,
    password: data.password,
    database: data.database
  });
  console.log("[Connected to DB]");

  const createStatement = `
      CREATE TABLE IF NOT EXISTS sounds (
          title VARCHAR(50), 
          artists VARCHAR(255), 
          album VARCHAR(50), 
          genres VARCHAR(255), 
          duration DECIMAL(6,2),
          year INT
      )
  `;
  await db.execute(createStatement);

    const files = (await fs.promises.readdir('./test_sound')).filter(file =>
    file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.flac')
    );

    const insertQuery = `
      INSERT INTO sounds (title, artists, album, genres, duration, year)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (let [index, file] of files.entries()) {
  const filePath = path.join('./test_sound', file);
  try {
    const metadata = await musicMetadata.parseFile(filePath);
    console.log(`[Processing file ${index + 1} of ${files.length}: ${file}]`);

    const title = metadata.common.title || null;
    const artists = metadata.common.artists?.join(', ') || null;
    const album = metadata.common.album || null;
    const genres = metadata.common.genre?.join(', ') || null;
    const rawDuration = metadata.format.duration;
    const duration = rawDuration != null
      ? Number(rawDuration.toFixed(2))
      : null;
    const year = metadata.common.year || null;

    await db.execute(insertQuery, [
      title,
      artists,
      album,
      genres,
      duration,
      year
    ]);

  } catch (fileErr) {
    console.warn(`Failed to process ${file}:`, fileErr.message);
  }
}

 } catch(err) {
   console.error("Fatal error: ", err.message);
} finally {
    if (db) {
         await db.end(); // always close the connection
       console.log("[Connection closed]");
     }
 }