/*
  # Esquema completo para Sistema Odontológico GN SOFT

  1. Nuevas Tablas
    - `clinicas` - Información de clínicas/consultorios
    - `profesionales` - Personal odontológico
    - `pacientes` - Registro de pacientes
    - `citas` - Programación de citas
    - `tratamientos` - Historial de tratamientos
    - `odontogramas` - Estado dental de pacientes
    - `estudios` - Radiografías y estudios
    - `recetas` - Recetas digitales
    - `fichas_medicas` - Información médica completa

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas de acceso por clínica
    - Autenticación requerida para acceso
*/

-- Tabla de clínicas/consultorios
CREATE TABLE IF NOT EXISTS clinicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion text NOT NULL,
  telefono text NOT NULL,
  email text UNIQUE NOT NULL,
  tipo_membresia text CHECK (tipo_membresia IN ('mensual', 'anual')) DEFAULT 'mensual',
  fecha_vencimiento timestamptz NOT NULL,
  activa boolean DEFAULT true,
  periodo_prueba boolean DEFAULT true,
  fecha_creacion timestamptz DEFAULT now()
);

-- Tabla de profesionales
CREATE TABLE IF NOT EXISTS profesionales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  especialidad text NOT NULL,
  numero_licencia text UNIQUE NOT NULL,
  telefono text NOT NULL,
  email text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  fecha_creacion timestamptz DEFAULT now()
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  fecha_nacimiento date NOT NULL,
  telefono text NOT NULL,
  email text,
  direccion text NOT NULL,
  tutor_id uuid REFERENCES pacientes(id),
  saldo_deuda numeric(10,2) DEFAULT 0,
  fecha_creacion timestamptz DEFAULT now()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id uuid REFERENCES profesionales(id) ON DELETE CASCADE,
  fecha_hora timestamptz NOT NULL,
  estado text CHECK (estado IN ('programada', 'completada', 'cancelada')) DEFAULT 'programada',
  motivo text NOT NULL,
  observaciones text,
  fecha_creacion timestamptz DEFAULT now()
);

-- Tabla de tratamientos
CREATE TABLE IF NOT EXISTS tratamientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id uuid REFERENCES profesionales(id) ON DELETE CASCADE,
  cita_id uuid REFERENCES citas(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  costo numeric(10,2) NOT NULL,
  pagado boolean DEFAULT false,
  fecha_realizacion timestamptz DEFAULT now()
);

-- Tabla de odontogramas
CREATE TABLE IF NOT EXISTS odontogramas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  diente_numero integer NOT NULL CHECK (diente_numero BETWEEN 1 AND 32),
  estado text NOT NULL,
  tratamiento_necesario text,
  fecha_actualizacion timestamptz DEFAULT now(),
  UNIQUE(paciente_id, diente_numero)
);

-- Tabla de estudios/radiografías
CREATE TABLE IF NOT EXISTS estudios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo text CHECK (tipo IN ('radiografia', 'estudio')) NOT NULL,
  archivo_url text NOT NULL,
  descripcion text NOT NULL,
  fecha_subida timestamptz DEFAULT now()
);

-- Tabla de recetas digitales
CREATE TABLE IF NOT EXISTS recetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id uuid REFERENCES citas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id uuid REFERENCES profesionales(id) ON DELETE CASCADE,
  medicamentos text NOT NULL,
  indicaciones text NOT NULL,
  codigo_qr text NOT NULL,
  fecha_emision timestamptz DEFAULT now()
);

-- Tabla de fichas médicas
CREATE TABLE IF NOT EXISTS fichas_medicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  enfermedades text,
  alergias text,
  medicamentos_actuales text,
  observaciones text,
  fecha_actualizacion timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_medicas ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para clínicas
CREATE POLICY "Clínicas pueden ver sus propios datos"
  ON clinicas FOR ALL
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Políticas para profesionales
CREATE POLICY "Profesionales pueden ver datos de su clínica"
  ON profesionales FOR ALL
  TO authenticated
  USING (clinica_id IN (
    SELECT id FROM clinicas WHERE auth.uid()::text = id::text
  ));

-- Políticas para pacientes
CREATE POLICY "Pacientes pueden ver datos de su clínica"
  ON pacientes FOR ALL
  TO authenticated
  USING (clinica_id IN (
    SELECT id FROM clinicas WHERE auth.uid()::text = id::text
  ));

-- Políticas para citas
CREATE POLICY "Citas visibles por clínica"
  ON citas FOR ALL
  TO authenticated
  USING (clinica_id IN (
    SELECT id FROM clinicas WHERE auth.uid()::text = id::text
  ));

-- Políticas para tratamientos
CREATE POLICY "Tratamientos visibles por clínica"
  ON tratamientos FOR ALL
  TO authenticated
  USING (paciente_id IN (
    SELECT id FROM pacientes WHERE clinica_id IN (
      SELECT id FROM clinicas WHERE auth.uid()::text = id::text
    )
  ));

-- Políticas para odontogramas
CREATE POLICY "Odontogramas visibles por clínica"
  ON odontogramas FOR ALL
  TO authenticated
  USING (paciente_id IN (
    SELECT id FROM pacientes WHERE clinica_id IN (
      SELECT id FROM clinicas WHERE auth.uid()::text = id::text
    )
  ));

-- Políticas para estudios
CREATE POLICY "Estudios visibles por clínica"
  ON estudios FOR ALL
  TO authenticated
  USING (paciente_id IN (
    SELECT id FROM pacientes WHERE clinica_id IN (
      SELECT id FROM clinicas WHERE auth.uid()::text = id::text
    )
  ));

-- Políticas para recetas
CREATE POLICY "Recetas visibles por clínica"
  ON recetas FOR ALL
  TO authenticated
  USING (paciente_id IN (
    SELECT id FROM pacientes WHERE clinica_id IN (
      SELECT id FROM clinicas WHERE auth.uid()::text = id::text
    )
  ));

-- Políticas para fichas médicas
CREATE POLICY "Fichas médicas visibles por clínica"
  ON fichas_medicas FOR ALL
  TO authenticated
  USING (paciente_id IN (
    SELECT id FROM pacientes WHERE clinica_id IN (
      SELECT id FROM clinicas WHERE auth.uid()::text = id::text
    )
  ));

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profesionales_clinica ON profesionales(clinica_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tratamientos_paciente ON tratamientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_odontogramas_paciente ON odontogramas(paciente_id);