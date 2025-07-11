import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfrwbgbezeknwppruaud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcndiZ2JlemVrbndwcHJ1YXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODk1NTYsImV4cCI6MjA2Nzc2NTU1Nn0.aDYRNsJVqZfBuzkCWr-_qX8AsxDQZfpoZj5kIqhoyE4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
});

export type Database = {
  public: {
    Tables: {
      clinicas: {
        Row: {
          id: string;
          nombre: string;
          direccion: string;
          telefono: string;
          email: string;
          tipo_membresia: 'mensual' | 'anual';
          fecha_vencimiento: string;
          activa: boolean;
          periodo_prueba: boolean;
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['clinicas']['Row'], 'id' | 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['clinicas']['Insert']>;
      };
      profesionales: {
        Row: {
          id: string;
          clinica_id: string;
          nombre: string;
          apellido: string;
          especialidad: string;
          numero_licencia: string;
          telefono: string;
          email: string;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['profesionales']['Row'], 'id' | 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['profesionales']['Insert']>;
      };
      pacientes: {
        Row: {
          id: string;
          clinica_id: string;
          nombre: string;
          apellido: string;
          fecha_nacimiento: string;
          telefono: string;
          email: string;
          direccion: string;
          tutor_id?: string;
          saldo_deuda: number;
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['pacientes']['Row'], 'id' | 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['pacientes']['Insert']>;
      };
      citas: {
        Row: {
          id: string;
          clinica_id: string;
          paciente_id: string;
          profesional_id: string;
          fecha_hora: string;
          estado: 'programada' | 'completada' | 'cancelada';
          motivo: string;
          observaciones?: string;
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['citas']['Row'], 'id' | 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['citas']['Insert']>;
      };
      tratamientos: {
        Row: {
          id: string;
          paciente_id: string;
          profesional_id: string;
          cita_id: string;
          descripcion: string;
          costo: number;
          pagado: boolean;
          fecha_realizacion: string;
        };
        Insert: Omit<Database['public']['Tables']['tratamientos']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['tratamientos']['Insert']>;
      };
      odontogramas: {
        Row: {
          id: string;
          paciente_id: string;
          diente_numero: number;
          estado: string;
          tratamiento_necesario?: string;
          fecha_actualizacion: string;
        };
        Insert: Omit<Database['public']['Tables']['odontogramas']['Row'], 'id' | 'fecha_actualizacion'>;
        Update: Partial<Database['public']['Tables']['odontogramas']['Insert']>;
      };
      estudios: {
        Row: {
          id: string;
          paciente_id: string;
          tipo: 'radiografia' | 'estudio';
          archivo_url: string;
          descripcion: string;
          fecha_subida: string;
        };
        Insert: Omit<Database['public']['Tables']['estudios']['Row'], 'id' | 'fecha_subida'>;
        Update: Partial<Database['public']['Tables']['estudios']['Insert']>;
      };
      recetas: {
        Row: {
          id: string;
          cita_id: string;
          paciente_id: string;
          profesional_id: string;
          medicamentos: string;
          indicaciones: string;
          codigo_qr: string;
          fecha_emision: string;
        };
        Insert: Omit<Database['public']['Tables']['recetas']['Row'], 'id' | 'fecha_emision'>;
        Update: Partial<Database['public']['Tables']['recetas']['Insert']>;
      };
    };
  };
};