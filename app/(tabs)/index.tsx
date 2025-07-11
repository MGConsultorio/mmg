import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, Users, FileText, TrendingUp, Clock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function InicioScreen() {
  const [estadisticas, setEstadisticas] = useState({
    totalPacientes: 0,
    citasHoy: 0,
    citasPendientes: 0,
    ingresosMes: 0,
  });

  const [proximasCitas, setProximasCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      
      // Cargar estadísticas reales
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id, saldo_deuda')
        .limit(1000);

      const hoy = new Date().toISOString().split('T')[0];
      const { data: citasHoy } = await supabase
        .from('citas')
        .select('id')
        .gte('fecha_hora', `${hoy}T00:00:00`)
        .lt('fecha_hora', `${hoy}T23:59:59`)
        .limit(100);

      const { data: citasPendientes } = await supabase
        .from('citas')
        .select('id')
        .eq('estado', 'programada')
        .limit(100);

      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: tratamientos } = await supabase
        .from('tratamientos')
        .select('costo')
        .eq('pagado', true)
        .gte('fecha_realizacion', inicioMes.toISOString())
        .limit(1000);

      const ingresosMes = tratamientos?.reduce((sum, t) => sum + Number(t.costo), 0) || 0;

      setEstadisticas({
        totalPacientes: pacientes?.length || 0,
        citasHoy: citasHoy?.length || 0,
        citasPendientes: citasPendientes?.length || 0,
        ingresosMes,
      });

      // Cargar próximas citas
      const { data: citas } = await supabase
        .from('citas')
        .select(`
          *,
          pacientes(nombre, apellido),
          profesionales(nombre, apellido)
        `)
        .eq('estado', 'programada')
        .gte('fecha_hora', new Date().toISOString())
        .order('fecha_hora', { ascending: true })
        .limit(5);

      setProximasCitas(citas || []);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (cantidad: number) => {
    return `₲ ${cantidad.toLocaleString('es-PY')}`;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>GN SOFT ODONTOLÓGICO</Text>
        <Text style={styles.subtitulo}>Panel de Control</Text>
      </View>

      <View style={styles.estadisticasContainer}>
        <View style={styles.tarjetaEstadistica}>
          <Users size={24} color="#2563eb" />
          <Text style={styles.numeroEstadistica}>{estadisticas.totalPacientes}</Text>
          <Text style={styles.labelEstadistica}>Total Pacientes</Text>
        </View>

        <View style={styles.tarjetaEstadistica}>
          <Calendar size={24} color="#059669" />
          <Text style={styles.numeroEstadistica}>{estadisticas.citasHoy}</Text>
          <Text style={styles.labelEstadistica}>Citas Hoy</Text>
        </View>

        <View style={styles.tarjetaEstadistica}>
          <Clock size={24} color="#dc2626" />
          <Text style={styles.numeroEstadistica}>{estadisticas.citasPendientes}</Text>
          <Text style={styles.labelEstadistica}>Pendientes</Text>
        </View>

        <View style={styles.tarjetaEstadistica}>
          <TrendingUp size={24} color="#7c3aed" />
          <Text style={styles.numeroEstadistica}>{formatearMoneda(estadisticas.ingresosMes)}</Text>
          <Text style={styles.labelEstadistica}>Ingresos Mes</Text>
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Próximas Citas</Text>
        {proximasCitas.length === 0 ? (
          <Text style={styles.textoVacio}>No hay citas programadas</Text>
        ) : (
          proximasCitas.map((cita: any) => (
            <View key={cita.id} style={styles.tarjetaCita}>
              <View style={styles.infoCita}>
                <Text style={styles.nombrePaciente}>
                  {cita.pacientes.nombre} {cita.pacientes.apellido}
                </Text>
                <Text style={styles.motivoCita}>{cita.motivo}</Text>
                <Text style={styles.profesionalCita}>
                  Dr. {cita.profesionales.nombre} {cita.profesionales.apellido}
                </Text>
              </View>
              <Text style={styles.fechaCita}>{formatearFecha(cita.fecha_hora)}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.botonAccionRapida} onPress={cargarDashboard}>
        <Text style={styles.textoBotonAccion}>Actualizar Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#bfdbfe',
    marginTop: 4,
  },
  estadisticasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  tarjetaEstadistica: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numeroEstadistica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  labelEstadistica: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  seccion: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  textoVacio: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 20,
  },
  tarjetaCita: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoCita: {
    flex: 1,
  },
  nombrePaciente: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  motivoCita: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  profesionalCita: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 2,
  },
  fechaCita: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  botonAccionRapida: {
    backgroundColor: '#2563eb',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonAccion: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});