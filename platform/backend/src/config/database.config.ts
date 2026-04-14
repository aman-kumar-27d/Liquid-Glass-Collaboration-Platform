export default () => ({
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    name: process.env.DATABASE_NAME ?? 'liquid_glass',
    user: process.env.DATABASE_USER ?? 'postgres'
  }
});
