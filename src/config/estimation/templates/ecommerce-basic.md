# E-commerce BÃ¡sico

**Tipo:** E-commerce Store  
**Complejidad:** Media-Alta  
**Horas base:** 150h  
**Equipo sugerido:** 2 developers, 0.5 QA, 0.2 PM  
**Stack tÃ­pico:** Next.js + Stripe + PostgreSQL/Supabase

## DescripciÃ³n

Tienda online bÃ¡sica con catÃ¡logo de productos, carrito de compras, checkout y panel de administraciÃ³n.

## Alcance Incluido

- âœ… CatÃ¡logo de productos con categorÃ­as
- âœ… Carrito de compras
- âœ… Checkout con Stripe
- âœ… GestiÃ³n de Ã³rdenes
- âœ… Panel de administraciÃ³n bÃ¡sico
- âœ… AutenticaciÃ³n de usuarios
- âœ… Email notifications
- âœ… Responsive design

## Alcance NO Incluido

- âŒ MÃºltiples mÃ©todos de pago
- âŒ Sistema de inventario complejo
- âŒ Programa de lealtad
- âŒ Reviews y ratings
- âŒ EnvÃ­o internacional complejo
- âŒ Multi-vendor

## MÃ³dulos y Tareas EspecÃ­ficas

### 1. Product Catalog (25h)

**Desarrollo:**
- Product listing page con grid: 6h
- Product filters (categorÃ­a, precio): 5h
- Product detail page: 6h
- Search functionality: 5h
- Categories navigation: 3h

### 2. Shopping Cart (16h)

**Desarrollo:**
- Cart UI component: 5h
- Add/remove/update items logic: 4h
- Cart persistence (localStorage/DB): 3h
- Quantity management: 2h
- Promo codes (bÃ¡sico): 2h

### 3. Checkout & Payments (30h)

**Desarrollo:**
- Checkout flow (3 steps): 10h
- Stripe integration: 12h
- Order confirmation page: 4h
- Email notifications (templates): 4h

### 4. User Authentication (20h)

**Desarrollo:**
- Login/Register pages: 6h
- NextAuth.js setup: 5h
- Password reset flow: 4h
- User profile page: 3h
- Order history page: 2h

### 5. Admin Panel (35h)

**Desarrollo:**
- Admin layout + auth: 5h
- Product management (CRUD): 12h
- Order management (list, detail, status): 10h
- User management (list, view): 5h
- Dashboard bÃ¡sico: 3h

### 6. Database & API (12h)

**Desarrollo:**
- Database schema design: 3h
- API routes (products, orders, users): 6h
- Data validation: 2h
- Error handling: 1h

### 7. Testing & Deployment (12h)

**QA:**
- Functional testing: 6h
- Payment testing (Stripe test mode): 3h

**DevOps:**
- Database setup (production): 2h
- Deploy & environment config: 1h

## DistribuciÃ³n por Rol

- **Developer:** 130h (87%)
- **QA:** 12h (8%)
- **PM:** 8h (5%)

## DistribuciÃ³n por Fase

- **Setup:** 8h (5%)
- **Desarrollo:** 122h (81%)
- **Testing:** 12h (8%)
- **Deployment:** 8h (5%)

## Factores de Ajuste

**Agregar horas si:**
- **+15-20h:** Reviews y ratings system
- **+10-15h:** Wishlist functionality
- **+12-18h:** Inventory management avanzado
- **+20-25h:** Multi-vendor marketplace
- **+8-12h:** EnvÃ­o internacional con mÃºltiples carriers

**Reducir horas si:**
- **-10-12h:** Sin admin panel (gestiÃ³n manual)
- **-8-10h:** CatÃ¡logo fijo (sin CRUD de productos)
