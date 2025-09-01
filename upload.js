import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import csvtojson from 'csvtojson';

let db; // define outside so we can access it in finally

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

    console.log("✅ Connected to DB");

    // Drop and recreate table
    await db.execute("DROP TABLE IF EXISTS sample");

    const createStatement = `
        CREATE TABLE sample (
            author_first_name CHAR(50), 
            author_last_name CHAR(50), 
            isbn CHAR(50), 
            category CHAR(50), 
            number_of_pages INT, 
            packaging CHAR(30),
            revision_number INT, 
            number_of_lends INT, 
            type CHAR(30), 
            release_date CHAR(30)
        )
    `;
    await db.execute(createStatement);

    // Load CSV
    const source = await csvtojson().fromFile("books.csv");

    const insertStatement = `
        INSERT INTO sample VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (let i = 0; i < source.length; i++) {
        const row = source[i];
        const items = [
            row["author_first_name"],
            row["author_last_name"],
            row["isbn"],
            row["category"],
            parseInt(row["number_of_pages"]),
            row["packaging"],
            parseInt(row["revision_number"]),
            parseInt(row["number_of_lends"]),
            row["type"],
            row["release_date"]
        ];

        try {
            await db.execute(insertStatement, items);
        } catch (err) {
            console.error(`❌ Error at row ${i + 1}:`, err.message);
        }
    }

    console.log("✅ All rows inserted successfully");

} catch (err) {
    console.error("❌ Fatal error:", err.message);
} finally {
    if (db) {
        await db.end(); // always close the connection
        console.log("🔌 Connection closed");
    }
}