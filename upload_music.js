// import file system module
// - used to read file names from the music folder
import fs from 'fs';
// import the musicMetadata
// npm module - used to read metadata from music files
import * as musicMetadata from 'music-metadata';
// Import the database driver
//import mysql from 'mysql2/promise';

// A small function for a query
async function query(sql, listOfValues) {
  let result = await db.execute(sql, listOfValues);
  return result[0];
}

// read all file names from the test sound folder fodler
const files = (await fs.promises.readdir('./test_sound')).filter(file =>
  file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.flac')
);

// loop through all music files and read metadata
for (let file of files) {

  // Get the metadata for the file
  let metadata = await musicMetadata.parseFile('./test_sound/' + file);

  // delete (in-memory) some parts of the metadata
  // that we don't want in the database
  // note: we are not deleteing anything in the files
  // delete metadata.native;
  // delete metadata.quality;
  // delete metadata.common.disk;

  // INSERT TO DATABASE
  // let result = await query(`
  //   INSERT INTO music (fileName, metadata)
  //   VALUES(?, ?)
  // `, [file, metadata]);

  // Log the result of inserting in the database
  console.log(metadata);

}

// exit/stop the script when everything is imported
// so you don't have to precc Ctrl+C
// process.exit();