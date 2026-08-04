import mysql from 'mysql2/promise';
import config from '../config/config';

const dbConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
};

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    console.log('--- MYSQL POOL CREATION DBCONFIG ---');
    console.log({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password ? 'PASSWORD EXISTS' : 'NO PASSWORD',
    });
    console.log('------------------------------------');
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function checkDbConnection(): Promise<boolean> {
  console.log(`[MySQL Check] Attempting connection -> Host: ${dbConfig.host}, Port: ${dbConfig.port}, DB: ${dbConfig.database}, User: ${dbConfig.user}`);
  try {
    const activePool = getPool();
    const conn = await activePool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log(`✅ [MySQL Verified] Successfully executed SELECT 1 on ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return true;
  } catch (err: any) {
    console.error(`❌ [MySQL Connection Error] Unable to connect to ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}:`, err.message);
    console.error(`FULL CONFIG USED (Excluding Password):`, {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
    });
    return false;
  }
}

export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const activePool = getPool();
  try {
    const [rows] = await activePool.execute(sql, params);
    return rows as T[];
  } catch (err: any) {
    console.error(`❌ [MySQL Execution Error]: ${err.message}\nSQL: ${sql}`);
    throw err;
  }
}

export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const activePool = getPool();
  const connection = await activePool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err: any) {
    await connection.rollback();
    console.error('❌ [MySQL Transaction Error]:', err.message);
    throw err;
  } finally {
    connection.release();
  }
}

export function isDbActive(): boolean {
  return true;
}

export default {
  getPool,
  checkDbConnection,
  executeQuery,
  executeTransaction,
  isDbActive,
};
