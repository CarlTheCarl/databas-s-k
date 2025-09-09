// import file system module
// - used to read file names from the music folder
import fs from 'fs';
// import the musicMetadata
// npm module - used to read metadata from music files
import * as musicMetadata from 'music-metadata';
// Import the database driver
import mysql from 'mysql2/promise';

// A small function for a query
// Load DB credentials from connection.json
const config = JSON.parse(await fs.promises.readFile('connection.json', 'utf-8'));

// Connect to the database
const db = await mysql.createConnection(config);

// A helper query function
async function query(sql, listOfValues) {
  let result = await db.execute(sql, listOfValues);
  return result[0];
}

// Read music files
const files = (await fs.promises.readdir('./test_sound')).filter(file =>
  file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.flac')
);

console.log("#=#")
// loop through all music files and read metadata
for (let file of files) {
  let metadata = await musicMetadata.parseFile('./test_sound/' + file);

console.log("FORMAT METADATA for:", file);
console.log(metadata.format);

  const title = metadata.common.title || null
  console.log("title: " + title)
  const artists = metadata.common.artists || null
  console.log("artists: " + artists)
  const album = metadata.common.album || null
  console.log("album: " + album)
  const genre = metadata.common.genre || null
  console.log("genre: " + genre)
 const duration = metadata.format.duration ?? null;
 console.log("duration:", duration);
  console.log("#=#")

}

// exit/stop the script when everything is imported
// so you don't have to precc Ctrl+C
process.exit();