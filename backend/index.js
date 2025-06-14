import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import PDFDocument from 'pdfkit';

const app = express();
const port = 3001;

// Configuración de la base de datos
// Configuración de la base de datos con manejo de errores
let pool;
try {
  pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'evento_nomina_db',
    password: '*Jb16359492',
    port: 5433,
    ssl: false
  });

  // Probar la conexión
  await pool.query('SELECT NOW()');
  console.log('Conexión a la base de datos establecida correctamente');
} catch (err) {
  console.error('Error al conectar a la base de datos:', err);
  process.exit(1);
}

// CORS más robusto
console.log('Configuring CORS for origin:', 'http://127.0.0.1:8080');

// Configuración CORS principal
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Para soporte de navegadores legacy
}));

// Manejo manual adicional de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Manejo de preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(bodyParser.json());

// Tus rutas existentes...
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, passwordHash]
    );

    // Crear perfil asociado
    await pool.query(
      'INSERT INTO profiles (user_id, role, full_name) VALUES ($1, $2, $3)',
      [newUser.rows[0].id, 'employee', fullName || null]
    );

    // Generar token JWT
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Omitir el hash de la contraseña en la respuesta
    const user = newUser.rows[0];
    delete user.password_hash;

    res.status(201).json({
      user,
      token
    });

  } catch (error) {
    console.error('Error detallado en signup:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      query: error.query,
      parameters: error.parameters
    });
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message,
      details: {
        code: error.code,
        query: error.query,
        parameters: error.parameters
      }
    });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Buscar usuario y su perfil en la base de datos
    const userQuery = await pool.query(
      `SELECT u.*, p.id as profile_id, p.role, p.full_name
       FROM users u
       JOIN profiles p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = userQuery.rows[0];
    const profile = {
      id: user.profile_id,
      role: user.role,
      full_name: user.full_name
    };
    delete user.profile_id;
    delete user.role;
    delete user.full_name;
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: profile.role,
        isAdmin: profile.role === 'admin'
      },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Omitir el hash de la contraseña en la respuesta
    delete user.password_hash;
    
    res.json({
      user,
      profile,
      token
    });
    
  } catch (error) {
    console.error('Error en signin:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET);

    // Obtener usuario y perfil
    const userQuery = await pool.query(
      `SELECT u.*, p.id as profile_id, p.role, p.full_name
       FROM users u
       JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userQuery.rows[0];
    const profile = {
      id: user.profile_id,
      role: user.role,
      full_name: user.full_name
    };
    delete user.profile_id;
    delete user.role;
    delete user.full_name;
    delete user.password_hash;

    res.json({
      user,
      profile
    });
  } catch (error) {
    console.error('Error en verify:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Endpoint para refrescar token
app.post('/api/auth/refresh', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET, { ignoreExpiration: true });

    // Generar nuevo token con tiempo de expiración extendido
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Endpoint para obtener reportes (ÚNICO - corregido)
app.get('/api/reports', async (req, res) => {
  try {
    console.log('Obteniendo reportes...');
    const result = await pool.query(`
      SELECT
    ws.id,
    emp.full_name AS employee_name,
    e.name AS event_name,
    ws.start_time::date AS date,
    ws.total_hours AS hours,
    emp.hourly_rate,
    ws.status
FROM work_sessions ws
JOIN employees emp ON ws.employee_id = emp.id
JOIN events e ON ws.event_id = e.id
ORDER BY ws.start_time DESC

    `);
    
    console.log('Reportes obtenidos:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Primer reporte:', result.rows[0]);
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo reportes:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      query: error.query,
      parameters: error.parameters
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message,
      details: {
        code: error.code,
        query: error.query,
        parameters: error.parameters
      }
    });
  }
});

// Endpoint para crear nuevos reportes
app.post('/api/reports', async (req, res) => {
  const { event, profile, workSession } = req.body;

  try {
    console.log('Datos recibidos:', { event, profile, workSession });
    
    // Iniciar transacción
    await pool.query('BEGIN');

    // Buscar el employee_id basado en el user_id del perfil
    const employeeQuery = await pool.query(
      'SELECT id FROM employees WHERE user_id = $1',
      [profile.user_id]
    );

    if (employeeQuery.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Empleado no encontrado' });
    }

    const employeeId = employeeQuery.rows[0].id;

    // Insertar evento
    console.log('Insertando evento...');
    const eventResult = await pool.query(
      `INSERT INTO events (name, location, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        event.name,
        event.location,
        event.start_time || event.date,
        event.end_time || event.date
      ]
    );
    const eventId = eventResult.rows[0].id;
    console.log('Evento insertado con ID:', eventId);

    // Calcular total de horas
    const totalHours = (new Date(workSession.end_time) - new Date(workSession.start_time)) / (1000 * 60 * 60);
    
    // Insertar sesión de trabajo
    console.log('Insertando sesión de trabajo...');
    const workSessionResult = await pool.query(
      `INSERT INTO work_sessions
       (event_id, employee_id, start_time, end_time, total_hours, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        eventId,
        employeeId,
        workSession.start_time,
        workSession.end_time,
        totalHours,
        'active',
        workSession.notes || null
      ]
    );
    console.log('Sesión de trabajo insertada:', workSessionResult.rows[0]);

    // Commit de la transacción
    await pool.query('COMMIT');
    console.log('Transacción completada exitosamente');

    res.status(201).json({
      message: 'Reporte creado exitosamente',
      report: workSessionResult.rows[0]
    });
  } catch (error) {
    // Rollback en caso de error
    await pool.query('ROLLBACK');
    console.error('Error creando reporte:', error);
    res.status(500).json({
      message: 'Error al crear el reporte',
      error: error.message,
      details: {
        code: error.code,
        query: error.query,
        parameters: error.parameters
      }
    });
  }
});

// Endpoint para exportar reportes a PDF
app.get('/api/reports/export', async (req, res) => {
  try {
    const reports = await pool.query(`
      SELECT
        ws.id,
        emp.full_name AS employee_name,
        ws.job_type,
        e.name AS event_name,
        ws.start_time::date AS date,
        ws.total_hours AS hours,
        emp.hourly_rate,
        ws.status,
        (emp.hourly_rate * ws.total_hours) AS total
      FROM work_sessions ws
      JOIN employees emp ON ws.employee_id = emp.id
      JOIN events e ON ws.event_id = e.id
      ORDER BY ws.start_time DESC
    `);

    // Crear PDF
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reportes.pdf');
    pdfDoc.pipe(res);

    // Encabezado
    pdfDoc.fontSize(25).text('Reportes de Trabajo', { align: 'center' });
    pdfDoc.moveDown();

    // Contenido
    reports.rows.forEach(report => {
      pdfDoc.fontSize(14)
        .text(`Empleado: ${report.employee_name}`)
        .text(`Evento: ${report.event_name}`)
        .text(`Fecha: ${report.date}`)
        .text(`Horas: ${report.hours}`)
        .text(`Tarifa por hora: $${report.hourly_rate}`)
        .text(`Total: $${report.total}`)
        .moveDown();
    });

    pdfDoc.end();
  } catch (error) {
    console.error('Error exportando reportes:', error);
    res.status(500).json({ message: 'Error al exportar reportes' });
  }
});

// Endpoint para aprobar reportes
app.patch('/api/reports/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE work_sessions SET status = $1 WHERE id = $2',
      ['approved', id]
    );
    res.json({ message: 'Reporte aprobado correctamente' });
  } catch (error) {
    console.error('Error aprobando reporte:', error);
    res.status(500).json({ message: 'Error al aprobar el reporte' });
  }
});

// Endpoint para rechazar reportes
app.patch('/api/reports/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE work_sessions SET status = $1 WHERE id = $2',
      ['rejected', id]
    );
    res.json({ message: 'Reporte rechazado correctamente' });
  } catch (error) {
    console.error('Error rechazando reporte:', error);
    res.status(500).json({ message: 'Error al rechazar el reporte' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${port}`);
});