
// Configuración de conexión a la base de datos PostgreSQL
// Este archivo es para referencia del backend, no se usa en el frontend

export const dbConfig = {
  host: process.env.VITE_DB_HOST || 'localhost',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  database: process.env.VITE_DB_NAME || 'evento_nomina_db',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'password',
  ssl: process.env.VITE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Nota: La conexión real a PostgreSQL debe manejarse en el backend
// Este archivo solo exporta la configuración para referencia
