# PlanDev - Plataforma de Estimación de Proyectos con IA

> **Herramienta SaaS para crear estimaciones profesionales de proyectos de software usando IA y metodología PERT**

## 🚀 Características

- **Estimación Inteligente**: Generación automática de planes de proyecto usando IA (Groq)
- **Metodología PERT**: Estimaciones de 3 puntos (optimista, más probable, pesimista)
- **Multi-tenancy**: Sistema de autenticación con NextAuth.js v5
- **Gestión Completa**: Módulos, tareas, fases y contingencias
- **Compartir Proyectos**: Genera enlaces públicos para compartir estimaciones
- **Arquitectura Hexagonal**: Separación clara de responsabilidades (Domain, Infrastructure, Services)

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **TypeScript**: ES2022 con strict mode
- **Base de Datos**: SQLite con [Prisma ORM](https://www.prisma.io/)
- **Autenticación**: [NextAuth.js v5](https://authjs.dev/)
- **UI**: React 19 + [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **IA**: Groq API para generación de planes
- **Validación**: Zod schemas

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de [Groq](https://console.groq.com/) (para API key)
- (Opcional) Google OAuth credentials para login social

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd planDev
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa las variables:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Database
DATABASE_URL="file:./dev.db"

# Groq AI
GROQ_API_KEY="tu-api-key-aqui"

# NextAuth
AUTH_SECRET="genera-uno-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
```

### 4. Inicializar base de datos

```bash
npx prisma generate
npx prisma db push
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard del usuario
│   ├── projects/          # Gestión de proyectos
│   ├── login/             # Autenticación
│   └── register/          # Registro
├── components/            # Componentes React
│   ├── forms/            # Formularios
│   ├── projects/         # Componentes de proyectos
│   └── ui/               # Componentes UI base (shadcn)
├── domain/               # Lógica de negocio (Hexagonal)
│   ├── config/           # Constantes y configuración
│   └── estimation/       # Cálculos PERT y estimaciones
├── infrastructure/       # Servicios externos
│   └── ai/              # Adaptadores de IA (Groq)
├── lib/                  # Utilidades
│   ├── db.ts            # Cliente Prisma
│   ├── error-handler.ts # Manejo centralizado de errores
│   └── utils.ts         # Funciones auxiliares
├── services/             # Servicios de aplicación
│   ├── ai.ts            # Servicio de IA
│   └── estimation.ts    # Servicio de estimación
└── types/               # Tipos TypeScript compartidos
```

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura hexagonal** (ports & adapters):

- **Domain**: Lógica de negocio pura (sin dependencias externas)
- **Infrastructure**: Adaptadores para servicios externos (IA, DB)
- **Services**: Orquestación de casos de uso
- **App**: Interfaz de usuario y API routes

## 🔐 Seguridad

- ✅ Autenticación con NextAuth.js
- ✅ Validación de permisos en API endpoints
- ✅ Variables de entorno protegidas
- ✅ Sanitización de inputs
- ✅ Prisma para prevenir SQL injection

## 🧪 Testing

```bash
# Lint
npm run lint

# Build (verificar TypeScript)
npm run build
```

## 📦 Producción

### Build

```bash
npm run build
npm start
```

### Deploy en Vercel

El proyecto está optimizado para Vercel:

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura las variables de entorno
3. Deploy automático en cada push

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Metodología PERT

PlanDev usa estimación de 3 puntos:

- **O (Optimista)**: Mejor caso posible
- **M (Más Probable)**: Escenario esperado
- **P (Pesimista)**: Peor caso realista

**Fórmula**: `E = (O + 4M + P) / 6`

Esto proporciona estimaciones más realistas que valores únicos.

## 📄 Licencia

MIT

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://authjs.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Groq](https://groq.com/)
