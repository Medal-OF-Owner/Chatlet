import mysql from "mysql2/promise";

async function checkConnection() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("[CheckDB] Testing connection to:", dbUrl ? dbUrl.replace(/:.*@/, ":****@") : "UNDEFINED");

  if (!dbUrl) {
    console.error("[CheckDB] DATABASE_URL is not defined!");
    process.exit(1);
  }

  try {
    if (dbUrl.startsWith("mysql")) {
      const connection = await mysql.createConnection(dbUrl);
      await connection.ping();
      await connection.end();
      console.log("[CheckDB] SUCCESS: Database is reachable!");
      process.exit(0);
    } else {
      console.log("[CheckDB] Skipping check for non-mysql URL");
      process.exit(0);
    }
  } catch (error: any) {
    console.error("[CheckDB] FAILED to connect to database!");
    console.error("[CheckDB] Error details:", error.message || error);
    process.exit(1);
  }
}

checkConnection();
