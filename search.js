import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';

// Read the JSON file manually
const jsonText = await readFile('connection.json', 'utf-8');
const data = JSON.parse(jsonText);

console.log(`hostname ${data.host}`); // output 'testing'

// Create a connection 'db' to the database
const db = await mysql.createConnection({
    host: data.host, 
    port: data.port,
    user: data.user, 
    password: data.password,
    database: data.database
});

async function query(sql){
   let result = await db.execute(sql);
   return result[0];
}

//let columns = await query('SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = "sample"')

//console.log(columns[1])

const searchTerm = '664146833-X';

const sql = `
  SELECT * FROM sample
  WHERE author_first_name LIKE ?
     OR author_last_name LIKE ?
     OR category LIKE ?
     OR isbn LIKE ?
     OR type LIKE ?
`;

const param = `%${searchTerm}%`;

const [allPersons] = await db.execute(sql, [param, param, param, searchTerm, param]);
console.log('allPersons', allPersons);

 db.end(err => {
    if (err) {
      console.error('Error closing the connection:', err);
    } else {
      console.log('Connection closed.');
    }
  });