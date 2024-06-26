export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hookOnce("close", async () => {
    console.log("\n🔌 Disconnecting database...");

    // Drain the pool of all active clients, disconnect them, and shut down any internal timers in the pool.
    await drainDbPool();

    console.log("✅ Database is disconnected");
  });
});