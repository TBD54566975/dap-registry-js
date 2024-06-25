export default defineNitroPlugin(async () => {
  console.info('🔄 Running Database migrations...')
  await runDbMigrations();
  console.info('🏁 Database is ready')
});