# Sistema Interno (CRUD)

**Tipo:** Internal Management System  
**Complejidad:** Media  
**Horas base:** 120h  
**Equipo sugerido:** 2 developers, 0.3 QA  
**Stack:** Definido por usuario en paso "Técnico"

## Descripción

Sistema de gestión interno para empresa con CRUD de entidades, autenticación, reportes básicos y panel de administración.

## Alcance Incluido

- ✅ Autenticación y roles (admin, user)
- ✅ CRUD de 3-4 entidades principales
- ✅ Dashboard con métricas básicas
- ✅ Búsqueda y filtros
- ✅ Exportación a Excel/CSV
- ✅ Reportes básicos
- ✅ Responsive design

## Alcance NO Incluido

- ❌ Integraciones con sistemas externos
- ❌ Workflows complejos
- ❌ Reportes avanzados con BI
- ❌ Notificaciones en tiempo real
- ❌ Mobile app

## Módulos y Tareas Específicas

### 1. Authentication & Authorization (18h)

**Desarrollo:**
- Auth system setup: 3h
- Login/logout flows: 4h
- Role-based access control: 6h
- User management CRUD: 5h

### 2. Database & Models (15h)

**Desarrollo:**
- Database schema design: 5h
- Data models (3-4 entities): 6h
- Migrations setup: 2h
- Seed data: 2h

### 3. CRUD Modules (45h)

**Desarrollo (por cada entidad ~15h x 3):**
- List view con paginación: 5h
- Create/Edit forms: 6h
- Delete con confirmación: 2h
- Detail view: 2h

### 4. Dashboard & Reports (20h)

**Desarrollo:**
- Dashboard layout: 4h
- Métricas básicas (cards): 6h
- Charts implementation: 6h
- Reportes básicos: 4h

### 5. Search & Filters (12h)

**Desarrollo:**
- Search functionality: 5h
- Filters por campos: 5h
- Sorting: 2h

### 6. Export Functionality (8h)

**Desarrollo:**
- Export to Excel: 4h
- Export to CSV: 2h
- PDF generation (básico): 2h

### 7. Testing & Deployment (12h)

**QA:**
- Manual testing: 6h
- Bug fixes: 4h

**DevOps:**
- Deploy setup: 2h

## Distribución por Rol

- **Developer:** 108h (90%)
- **QA:** 8h (7%)
- **PM:** 4h (3%)

## Distribución por Fase

- **Setup:** 10h (8%)
- **Desarrollo:** 98h (82%)
- **Testing:** 8h (7%)
- **Deployment:** 4h (3%)

## Factores de Ajuste

**Agregar horas si:**
- **+15h:** Por cada entidad adicional
- **+20-25h:** Workflows de aprobación
- **+15-20h:** Integración con API externa
- **+10-15h:** Reportes avanzados con filtros complejos
- **+8-12h:** Notificaciones por email

**Reducir horas si:**
- **-15h:** Solo 2 entidades
- **-8-10h:** Sin dashboard/reportes
- **-5-7h:** Sin exportación

## Notas Importantes

- **Usuarios:** Sistema para uso interno (10-100 usuarios)
- **Seguridad:** Autenticación básica, no auditoría completa
- **Performance:** Optimizado para datasets medianos (<100k registros)
- **UI:** Funcional, no necesariamente diseño premium


