
# Configuración de Base de Datos PostgreSQL

## Requisitos
- PostgreSQL 12 o superior
- Backend de Node.js con Express (separado del frontend)

## Configuración

1. **Instalar PostgreSQL**
   - Descarga e instala PostgreSQL desde https://www.postgresql.org/download/
   - Anota el usuario y contraseña que configures durante la instalación

2. **Crear la base de datos**
   ```bash
   # Conectarse a PostgreSQL como superusuario
   psql -U postgres
   
   # Crear la base de datos
   CREATE DATABASE evento_nomina_db;
   
   # Salir de psql
   \q
   ```

3. **Ejecutar el schema**
   ```bash
   # Ejecutar el script de schema
   psql -U postgres -d evento_nomina_db -f database/schema.sql
   ```

4. **Configurar el backend**
   - Este frontend requiere un backend separado en Node.js
   - El backend debe implementar las rutas de autenticación:
     - POST /auth/signup
     - POST /auth/signin  
     - GET /auth/verify
   - Configura las variables de entorno en el backend:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=evento_nomina_db
   DB_USER=postgres
   DB_PASSWORD=tu_password_aqui
   DB_SSL=false
   JWT_SECRET=tu_clave_secreta_jwt_aqui
   ```

5. **Configurar variables de entorno del frontend**
   - Copia `.env.example` a `.env`
   - Actualiza la URL del backend:
   ```
   VITE_API_URL=http://localhost:3001
   ```

## Usuario por defecto
- Email: admin@example.com
- Password: password

## Comandos útiles

### Conectarse a la base de datos
```bash
psql -U postgres -d evento_nomina_db
```

### Ver tablas
```sql
\dt
```

### Ver usuarios
```sql
SELECT * FROM users;
```

### Ver perfiles
```sql
SELECT * FROM profiles;
```

### Cambiar contraseña de un usuario
```sql
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'admin@example.com';
```

## Notas importantes
- Este frontend no incluye el backend
- Necesitarás crear un servidor Express separado que maneje las rutas de autenticación
- El backend debe usar las dependencias bcryptjs, jsonwebtoken y pg
- Las dependencias de Node.js no pueden ejecutarse en el frontend
