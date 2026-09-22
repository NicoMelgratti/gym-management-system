const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});

async function check() {
  try {
    const schemas = await pool.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name ILIKE '%e22%'");
    console.log('Schemas:', schemas.rows);

    const tables = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema ILIKE '%e22%'");
    console.log('Tables:', tables.rows);

    if (tables.rows.length > 0) {
      const cols = await pool.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema ILIKE '%e22%'");
      console.log('Columns:', cols.rows);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
