# 🎣 Pescando Costa Rica

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-24-green?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=for-the-badge&logo=firebase)

Plataforma completa de reservación de tours de pesca deportiva en Costa Rica. Sistema web moderno con arquitectura de microservicios que conecta pescadores con capitanes expertos en las 7 provincias de Costa Rica.

## ✨ Características Principales

### 🎯 Para Usuarios
- 🔍 **Búsqueda Avanzada**: Filtra tours por provincia, tipo de pesca, precio, capacidad y rating
- 📅 **Sistema de Reservaciones**: Reserva tours con disponibilidad en tiempo real
- 💰 **Códigos Promocionales**: Sistema completo de descuentos y promociones
- ⭐ **Reviews y Ratings**: Califica y comenta sobre tours completados
- ❤️ **Favoritos**: Guarda tus tours preferidos
- 👤 **Perfil de Usuario**: Gestiona tu información y historial de reservaciones

### 🚤 Para Capitanes
- 📊 **Dashboard**: Administra tus tours y reservaciones
- 📈 **Estadísticas**: Ve el rendimiento de tus tours
- 💬 **Responde Reviews**: Interactúa con tus clientes

### 🛠️ Técnicas
- ⚡ **Arquitectura de Microservicios**: Servicios independientes y escalables
- 🔐 **Autenticación Firebase**: Seguridad robusta y social login
- 🗄️ **PostgreSQL en Neon**: Base de datos serverless de alto rendimiento
- 📱 **Diseño Responsive**: Optimizado para móviles, tablets y desktop
- 🎨 **UI Moderna**: Interfaz intuitiva con Tailwind CSS
- 🚀 **SEO Optimizado**: Meta tags y URLs amigables

### Autores
- Javier
- Marco
- Pablo

## 🏗️ Arquitectura del Sistema

```
pescandocostarica/
├── app/                          # Frontend (Next.js 15)
│   ├── page.js                   # Página principal
│   ├── layout.js                 # Layout global
│   └── globals.css               # Estilos globales
│
├── backend/                      # Backend (Node.js)
│   ├── src/
│   │   ├── config/               # Configuración
│   │   │   ├── database.js       # Conexión PostgreSQL (Neon)
│   │   │   └── firebase.js       # Firebase Admin
│   │   ├── middleware/           # Middleware
│   │   │   ├── auth.js           # Autenticación
│   │   │   ├── errorHandler.js  # Manejo de errores
│   │   │   └── validator.js     # Validación
│   │   ├── services/             # Microservicios
│   │   │   ├── tours/            # Servicio de Tours
│   │   │   ├── bookings/         # Servicio de Reservaciones
│   │   │   └── users/            # Servicio de Usuarios
│   │   └── server.js             # API Gateway
│   └── package.json
│
└── database/                     # Scripts de Base de Datos
    ├── schema.sql                # Schema completo
    ├── seed.sql                  # Datos de prueba
    ├── neon_setup.sql            # Setup para Neon Tech
    └── queries.sql               # Queries útiles
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta en [Neon Tech](https://neon.tech/) (PostgreSQL)
- Cuenta en [Firebase](https://firebase.google.com/) (Autenticación)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/pescandocostarica.git
cd pescandocostarica
```

### 2. Configurar Base de Datos

#### Crear Base de Datos en Neon

1. Ve a [Neon Tech](https://console.neon.tech/)
2. Crea un nuevo proyecto
3. Copia la cadena de conexión
4. Ejecuta el script de setup:

```bash
# Desde Neon SQL Editor, ejecuta:
database/neon_setup.sql
```

### 3. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DATABASE_URL=postgresql://tu_usuario:tu_password@tu_host.neon.tech/neondb?sslmode=require

# Firebase (opcional para desarrollo)
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_CLIENT_EMAIL=tu_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

JWT_SECRET=tu_secret_key
CORS_ORIGIN=http://localhost:3000
```

Iniciar el servidor:

```bash
npm run dev
```

El backend estará corriendo en `http://localhost:5000`

### 4. Configurar Frontend

```bash
cd ..
npm install

# Crear archivo .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
```

Iniciar el frontend:

```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:3000`

## 📡 API Endpoints

### Tours

```
GET    /api/tours                    # Listar todos los tours
GET    /api/tours/featured           # Tours destacados
GET    /api/tours/search?q=marlín    # Buscar tours
GET    /api/tours/:slug              # Tour específico
GET    /api/tours/:slug/availability # Disponibilidad
GET    /api/tours/:slug/reviews      # Reviews del tour
```

### Bookings

```
POST   /api/bookings                 # Crear reservación
GET    /api/bookings/my-bookings     # Mis reservaciones
GET    /api/bookings/:booking_number # Ver reservación
PUT    /api/bookings/:booking_number/cancel   # Cancelar
GET    /api/bookings/promo/:code/validate     # Validar promo
```

### Users

```
POST   /api/users                    # Crear usuario
GET    /api/users/profile            # Ver perfil
PUT    /api/users/profile            # Actualizar perfil
GET    /api/users/favorites          # Tours favoritos
POST   /api/users/favorites          # Agregar favorito
POST   /api/users/reviews            # Crear review
```

Ver documentación completa en [`backend/README.md`](backend/README.md)

## 🗄️ Base de Datos

### Schema Principal

- **users**: Usuarios del sistema (admin, capitan, cliente)
- **tours**: Tours de pesca disponibles
- **bookings**: Reservaciones con número único
- **promociones**: Códigos de descuento
- **reviews**: Calificaciones y reseñas
- **payments**: Registro de pagos
- **provincias**: 7 provincias de Costa Rica
- **locations**: Ubicaciones específicas

Ver schema completo en [`database/README.md`](database/README.md)

## 🎨 Características de UI

- ✅ Slider hero con 3 slides
- ✅ Filtros por provincia (7 provincias de Costa Rica)
- ✅ Búsqueda avanzada de tours
- ✅ Paginación (10 tours por página)
- ✅ Cards de tours con ratings
- ✅ Botón flotante de WhatsApp
- ✅ Header sticky con menú responsive
- ✅ Top bar con redes sociales
- ✅ Diseño mobile-first

## 🔐 Seguridad

- 🔒 Firebase Authentication
- 🛡️ Helmet.js para headers HTTP
- 🚦 Rate limiting (100 req/15min)
- ✅ Validación de inputs con Joi
- 🔐 SQL injection protection
- 🔑 JWT tokens
- 🌐 CORS configurado

## 📊 Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18, Tailwind CSS
- **Imágenes**: next/image optimizado
- **Estado**: React Hooks

### Backend
- **Runtime**: Node.js 24
- **Framework**: Express.js
- **Autenticación**: Firebase Admin SDK
- **Validación**: Joi
- **Seguridad**: Helmet, CORS, Rate Limit

### Base de Datos
- **Database**: PostgreSQL 16
- **Hosting**: Neon Tech (Serverless)
- **ORM**: pg (native driver)
- **Migraciones**: SQL scripts

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv
- **Logging**: Morgan, Winston

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ..
npm test
```

## 🚀 Deploy

### Backend (Railway/Render)

1. Conecta tu repositorio
2. Configura variables de entorno
3. Deploy automático

### Frontend (Vercel)

```bash
vercel
```

O conecta tu repositorio en [Vercel Dashboard](https://vercel.com)

## 📝 Variables de Entorno

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
JWT_SECRET=...
CORS_ORIGIN=https://tupagina.com
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.tupagina.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [`LICENSE`](LICENSE) para más información.

## 👥 Autores

- **Equipo Pescando Costa Rica** - *Desarrollo Inicial*

## 🙏 Agradecimientos

- Capitanes y pescadores de Costa Rica
- Comunidad de Next.js
- Firebase Team
- Neon Tech

## 📞 Soporte

- 📧 Email: support@pescandocostarica.com
- 💬 WhatsApp: +506-1234-5678
- 🌐 Website: [pescandocostarica.com](https://pescandocostarica.com)

---

<div align="center">

**Hecho con ❤️ en Costa Rica 🇨🇷**

[Website](https://pescandocostarica.com) • [API Docs](https://api.pescandocostarica.com/docs) • [Report Bug](https://github.com/tuusuario/pescandocostarica/issues)

</div>
