import { pool } from "./index.js";

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT table_name, column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' AND character_maximum_length <= 32;
    `);
    console.log("Columns <= 32:", res.rows);

    // Alter potential tight columns to generous sizes
    await client.query(`
      ALTER TABLE songs ALTER COLUMN key TYPE VARCHAR(128);
      ALTER TABLE songs ALTER COLUMN difficulty TYPE VARCHAR(64);
      ALTER TABLE songs ALTER COLUMN genre TYPE VARCHAR(128);
      ALTER TABLE songs ALTER COLUMN instrument TYPE VARCHAR(64);
      ALTER TABLE lessons ALTER COLUMN instrument TYPE VARCHAR(64);
      ALTER TABLE exercises ALTER COLUMN instrument TYPE VARCHAR(64);
      ALTER TABLE users ALTER COLUMN selected_instrument TYPE VARCHAR(64);
      ALTER TABLE users ALTER COLUMN experience_level TYPE VARCHAR(64);
      ALTER TABLE practice_sessions ALTER COLUMN instrument TYPE VARCHAR(64);
    `);
    console.log("Table alterations completed successfully.");
  } finally {
    client.release();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
