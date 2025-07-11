# GN SOFT ODONTOLÓGICO

Sistema de gestión odontológica completo desarrollado con React Native y Expo, diseñado específicamente para clínicas y consultorios dentales en Paraguay.

## 🚀 Características Principales

### 📱 Multiplataforma
- **Web**: Funciona en navegadores modernos
- **iOS**: Compatible con iPhone y iPad
- **Android**: Compatible con dispositivos Android
- **Responsive**: Diseño adaptativo para todos los tamaños de pantalla

### 🏥 Funcionalidades del Sistema

#### 1. **Panel Administrativo**
- Dashboard con estadísticas en tiempo real
- Gestión de profesionales y personal
- Control de membresías y facturación
- Reportes financieros

#### 2. **Gestión de Pacientes**
- Registro completo de pacientes
- Gestión de menores por tutores
- Historial médico detallado
- Control de saldos y deudas

#### 3. **Sistema de Citas**
- Programación de citas con calendario
- Reservas online para pacientes
- Notificaciones automáticas
- Gestión de horarios disponibles

#### 4. **Odontograma Digital**
- Odontograma interactivo moderno
- Registro de problemas dentales
- Planificación de tratamientos
- Seguimiento visual del progreso

#### 5. **Historiales Médicos**
- Fichas médicas completas
- Registro de alergias y medicamentos
- Historial de tratamientos
- Almacenamiento de estudios y radiografías

#### 6. **Recetas Digitales**
- Generación de recetas con código QR
- Verificación para farmacias
- Historial de prescripciones
- Indicaciones médicas detalladas

#### 7. **Sistema de Membresías**
- Planes mensual y anual
- Período de prueba gratuito de 7 días
- Gestión automática de vencimientos
- Múltiples métodos de pago

### 💰 Moneda y Localización
- **Moneda**: Guaraní paraguayo (₲)
- **Idioma**: Español completo
- **Formato de fechas**: DD/MM/YYYY
- **Zona horaria**: America/Asuncion

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React Native con Expo
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Iconos**: Lucide React Native
- **Navegación**: Expo Router
- **Estilos**: StyleSheet nativo

## 📋 Requisitos del Sistema

### Para Desarrollo
- Node.js 18 o superior
- npm o yarn
- Expo CLI
- Cuenta de Supabase

### Para Producción
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- iOS 11+ para dispositivos Apple
- Android 6.0+ para dispositivos Android

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd gn-soft-odontologico
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` con:
```
EXPO_PUBLIC_SUPABASE_URL=https://rfrwbgbezeknwppruaud.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcndiZ2JlemVrbndwcHJ1YXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODk1NTYsImV4cCI6MjA2Nzc2NTU1Nn0.aDYRNsJVqZfBuzkCWr-_qX8AsxDQZfpoZj5kIqhoyE4
```

### 4. Configurar Base de Datos
Las migraciones de Supabase se ejecutan automáticamente. El esquema incluye:
- Tablas de clínicas, profesionales y pacientes
- Sistema de citas y tratamientos
- Odontogramas y estudios médicos
- Recetas digitales y fichas médicas
- Políticas de seguridad RLS

### 5. Ejecutar en Desarrollo
```bash
npm run dev
```

## 📱 Guía de Uso

### Para Administradores
1. **Configuración inicial**: Registrar clínica y profesionales
2. **Gestión de pacientes**: Agregar y administrar base de pacientes
3. **Programación**: Configurar horarios y disponibilidad
4. **Reportes**: Monitorear estadísticas y finanzas

### Para Profesionales
1. **Agenda**: Ver citas programadas del día
2. **Atención**: Registrar tratamientos y observaciones
3. **Odontograma**: Actualizar estado dental de pacientes
4. **Recetas**: Generar prescripciones digitales

### Para Pacientes
1. **Reservas**: Solicitar citas online
2. **Historial**: Consultar ficha médica personal
3. **Tratamientos**: Ver plan de tratamiento
4. **Pagos**: Consultar saldos y realizar pagos

## 🔧 Desarrollo y Personalización

### Estructura del Proyecto
```
/
├── app/                    # Pantallas principales
│   ├── (tabs)/            # Navegación por pestañas
│   │   ├── index.tsx      # Dashboard principal
│   │   ├── pacientes.tsx  # Gestión de pacientes
│   │   ├── citas.tsx      # Sistema de citas
│   │   ├── historiales.tsx # Historiales médicos
│   │   └── administracion.tsx # Panel admin
│   └── _layout.tsx        # Layout principal
├── lib/                   # Configuraciones
│   └── supabase.ts       # Cliente de Supabase
├── hooks/                 # Hooks personalizados
├── supabase/             # Migraciones de BD
│   └── migrations/       # Scripts SQL
└── assets/               # Recursos estáticos
```

### Agregar Nuevas Funcionalidades
1. Crear nuevas pantallas en `/app`
2. Agregar migraciones en `/supabase/migrations`
3. Actualizar tipos en `/lib/supabase.ts`
4. Implementar lógica de negocio

### Personalización de Estilos
- Modificar colores en cada archivo de estilos
- Ajustar tipografía y espaciado
- Personalizar componentes según marca

## 🔒 Seguridad

### Autenticación
- Sistema de autenticación robusto con Supabase
- Tokens JWT seguros
- Sesiones persistentes

### Autorización
- Row Level Security (RLS) en todas las tablas
- Políticas de acceso por clínica
- Separación de datos por organización

### Datos Sensibles
- Encriptación en tránsito y reposo
- Cumplimiento con regulaciones de salud
- Backup automático de datos

## 📊 Monitoreo y Analytics

### Métricas Incluidas
- Número de pacientes activos
- Citas programadas y completadas
- Ingresos mensuales y anuales
- Utilización de profesionales

### Reportes Disponibles
- Estadísticas financieras
- Rendimiento de profesionales
- Satisfacción de pacientes
- Uso del sistema

## 🆘 Soporte y Mantenimiento

### Actualizaciones
- Actualizaciones automáticas de seguridad
- Nuevas funcionalidades mensuales
- Mejoras de rendimiento continuas

### Soporte Técnico
- Documentación completa incluida
- Soporte por email y chat
- Capacitación para usuarios

### Backup y Recuperación
- Backup automático diario
- Recuperación de datos en 24h
- Redundancia geográfica

## 📄 Licencia

Este software es propiedad de GN SOFT y está protegido por derechos de autor. El uso está sujeto a los términos de la licencia comercial.

## 📞 Contacto

- **Empresa**: GN SOFT
- **Email**: soporte@gnsoft.com.py
- **Teléfono**: +595 XXX XXX XXX
- **Sitio Web**: www.gnsoft.com.py

---

**GN SOFT ODONTOLÓGICO** - Transformando la gestión dental en Paraguay 🇵🇾