import { Sequelize } from 'sequelize';

function clean(v) {
  return typeof v === 'string' ? v.trim() : v;
}

const env = {
  DATABASE_URL: clean(process.env.DATABASE_URL),
  DB_DIALECT: clean(process.env.DB_DIALECT) || 'postgres',
  DB_HOST: clean(process.env.DB_HOST),
  DB_PORT: clean(process.env.DB_PORT) || '5432',
  DB_NAME: clean(process.env.DB_NAME),
  DB_USER: clean(process.env.DB_USER),
  DB_PASSWORD: clean(process.env.DB_PASSWORD),
  DB_SSL: clean(process.env.DB_SSL), // e.g. "require" para Supabase
};

const useUrl = !!env.DATABASE_URL && /^postgres(ql)?:\/\//i.test(env.DATABASE_URL);

console.log('[DB CONFIG]', {
  via: useUrl ? 'DATABASE_URL' : 'CONFIG_OBJECT',
  host: useUrl ? '(from DATABASE_URL)' : env.DB_HOST,
  port: useUrl ? '(from DATABASE_URL)' : env.DB_PORT,
  db: useUrl ? '(from DATABASE_URL)' : env.DB_NAME,
  user: useUrl ? '(from DATABASE_URL)' : env.DB_USER,
  ssl: env.DB_SSL || (useUrl ? 'require' : undefined),
});

const commonOptions = {
  logging: false,
  dialect: env.DB_DIALECT,
};

let sequelize;

/**
 * Siempre usamos el constructor con OBJETO para evitar que Sequelize
 * intente parsear una connection string cuando algo viene undefined.
 */
if (useUrl) {
  const url = new URL(env.DATABASE_URL);
  const database = url.pathname?.replace(/^\//, '') || 'postgres';
  const username = decodeURIComponent(url.username || 'postgres');
  const password = decodeURIComponent(url.password || '');

  sequelize = new Sequelize({
    ...commonOptions,
    host: url.hostname,
    port: url.port || '5432',
    database,
    username,
    password,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  });
} else {
  const dialectOptions = env.DB_SSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : undefined;

  sequelize = new Sequelize({
    ...commonOptions,
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    dialectOptions,
  });
}

/**
 * Conecta y sincroniza modelos.
 * @param {{ sync?: boolean, force?: boolean, alter?: boolean }} opts
 */
export async function connectDB(opts = {}) {
  const { sync = false, force = false, alter = false } = opts;
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    if (sync) {
      await sequelize.sync({ force, alter });
      console.log(`✅ Models synchronized (force=${!!force}, alter=${!!alter})`);
    }
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
    throw err;
  }
}

export { sequelize };
export default sequelize;
