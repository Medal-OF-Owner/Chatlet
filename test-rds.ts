import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

async function testConnection() {
  const config = {
    host: process.env.DB_Host,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.db_port || "3306"),
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log("Tentative de connexion à RDS avec :", { ...config, password: "***" });

  try {
    const connection = await mysql.createConnection(config);
    console.log("✅ Connexion réussie !");

    const [rows] = await connection.execute("SHOW TABLES");
    console.log("Tables trouvées :", rows);

    await connection.end();
  } catch (error) {
    console.error("❌ Erreur de connexion :", error);
  }
}

testConnection();
