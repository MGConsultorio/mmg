import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Plus, Calendar, Clock, User, Phone } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function CitasScreen() {
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [nuevaCita, setNuevaCita] = useState({
    paciente_id: '',
    profesional_id: '',
    fecha_hora: '',
    motivo: '',
    observaciones: '',
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      // Cargar citas del día seleccionado
      const { data: citasData } = await supabase
        .from('citas')
        .select(`
          *,
          pacientes(nombre, apellido, telefono),
          profesionales(nombre, apellido, especialidad)
        `)
        .gte('fecha_hora', `${fechaSeleccionada}T00:00:00`)
        .lt('fecha_hora', `${fechaSeleccionada}T23:59:59`)
        .order('fecha_hora', { ascending: true })
        .limit(100);

      setCitas(citasData || []);

      // Cargar pacientes y profesionales para el modal
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido')
        .order('nombre')
        .limit(1000);

      const { data: profesionalesData } = await supabase
        .from('profesionales')
        .select('id, nombre, apellido, especialidad')
        .eq('activo', true)
        .order('nombre')
        .limit(100);

      setPacientes(pacientesData || []);
      setProfesionales(profesionalesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      if (typeof Alert !== 'undefined') {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      }
    } finally {
      setCargando(false);
    }
  };

  const programarCita = async () => {
    try {
      if (!nuevaCita.paciente_id || !nuevaCita.profesional_id || !nuevaCita.fecha_hora || !nuevaCita.motivo) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
        return;
      }

      const { error } = await supabase
        .from('citas')
        .insert([{
          ...nuevaCita,
          clinica_id: 'temp-clinic-id', // Esto debería venir del contexto de la clínica
          estado: 'programada',
        }]);

      if (error) throw error;

      Alert.alert('Éxito', 'Cita programada correctamente');
      setModalVisible(false);
      setNuevaCita({
        paciente_id: '',
        profesional_id: '',
        fecha_hora: '',
        motivo: '',
        observaciones: '',
      });
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo programar la cita');
    }
  };

  const cambiarEstadoCita = async (citaId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: nuevoEstado })
        .eq('id', citaId);

      if (error) throw error;
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado de la cita');
    }
  };

  const formatearHora = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'programada': return '#2563eb';
      case 'completada': return '#059669';
      case 'cancelada': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Gestión de Citas</Text>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.textoBotonAgregar}>Nueva Cita</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectorFecha}>
        <Calendar size={20} color="#2563eb" />
        <TextInput
          style={styles.inputFecha}
          value={fechaSeleccionada}
          onChangeText={(fecha) => {
            setFechaSeleccionada(fecha);
            setTimeout(cargarDatos, 100);
          }}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <ScrollView style={styles.listaCitas}>
        {citas.length === 0 ? (
          <View style={styles.sinCitas}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.textoSinCitas}>No hay citas programadas para esta fecha</Text>
          </View>
        ) : (
          citas.map((cita: any) => (
            <View key={cita.id} style={styles.tarjetaCita}>
              <View style={styles.horaCita}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.textoHora}>{formatearHora(cita.fecha_hora)}</Text>
              </View>

              <View style={styles.infoCita}>
                <Text style={styles.nombrePaciente}>
                  {cita.pacientes.nombre} {cita.pacientes.apellido}
                </Text>
                <Text style={styles.motivoCita}>{cita.motivo}</Text>
                <Text style={styles.profesionalCita}>
                  Dr. {cita.profesionales.nombre} {cita.profesionales.apellido}
                </Text>
                <Text style={styles.especialidadCita}>{cita.profesionales.especialidad}</Text>
              </View>

              <View style={styles.estadoCita}>
                <View style={[styles.indicadorEstado, { backgroundColor: getColorEstado(cita.estado) }]} />
                <Text style={[styles.textoEstado, { color: getColorEstado(cita.estado) }]}>
                  {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                </Text>
              </View>

              {cita.estado === 'programada' && (
                <View style={styles.accionesCita}>
                  <TouchableOpacity
                    style={styles.botonCompletar}
                    onPress={() => cambiarEstadoCita(cita.id, 'completada')}
                  >
                    <Text style={styles.textoBotonAccion}>Completar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botonCancelar}
                    onPress={() => cambiarEstadoCita(cita.id, 'cancelada')}
                  >
                    <Text style={styles.textoBotonAccion}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para nueva cita */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Programar Nueva Cita</Text>
            
            <ScrollView style={styles.formulario}>
              <Text style={styles.labelInput}>Paciente *</Text>
              <View style={styles.selectorContainer}>
                {pacientes.map((paciente: any) => (
                  <TouchableOpacity
                    key={paciente.id}
                    style={[
                      styles.opcionSelector,
                      nuevaCita.paciente_id === paciente.id && styles.opcionSeleccionada
                    ]}
                    onPress={() => setNuevaCita({...nuevaCita, paciente_id: paciente.id})}
                  >
                    <Text style={styles.textoOpcion}>
                      {paciente.nombre} {paciente.apellido}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.labelInput}>Profesional *</Text>
              <View style={styles.selectorContainer}>
                {profesionales.map((profesional: any) => (
                  <TouchableOpacity
                    key={profesional.id}
                    style={[
                      styles.opcionSelector,
                      nuevaCita.profesional_id === profesional.id && styles.opcionSeleccionada
                    ]}
                    onPress={() => setNuevaCita({...nuevaCita, profesional_id: profesional.id})}
                  >
                    <Text style={styles.textoOpcion}>
                      Dr. {profesional.nombre} {profesional.apellido}
                    </Text>
                    <Text style={styles.especialidadOpcion}>{profesional.especialidad}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Fecha y Hora (YYYY-MM-DD HH:MM) *"
                value={nuevaCita.fecha_hora}
                onChangeText={(text) => setNuevaCita({...nuevaCita, fecha_hora: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Motivo de la consulta *"
                value={nuevaCita.motivo}
                onChangeText={(text) => setNuevaCita({...nuevaCita, motivo: text})}
                multiline
              />
              
              <TextInput
                style={styles.input}
                placeholder="Observaciones"
                value={nuevaCita.observaciones}
                onChangeText={(text) => setNuevaCita({...nuevaCita, observaciones: text})}
                multiline
              />
            </ScrollView>

            <View style={styles.botonesModal}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.botonGuardarModal}
                onPress={programarCita}
              >
                <Text style={styles.textoBotonGuardarModal}>Programar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  botonAgregar: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  textoBotonAgregar: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectorFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputFecha: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  listaCitas: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sinCitas: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  textoSinCitas: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  tarjetaCita: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horaCita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  textoHora: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoCita: {
    marginBottom: 12,
  },
  nombrePaciente: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  motivoCita: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  profesionalCita: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  especialidadCita: {
    fontSize: 12,
    color: '#6b7280',
  },
  estadoCita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  indicadorEstado: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textoEstado: {
    fontSize: 12,
    fontWeight: '600',
  },
  accionesCita: {
    flexDirection: 'row',
    gap: 8,
  },
  botonCompletar: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  textoBotonAccion: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  formulario: {
    maxHeight: 400,
  },
  labelInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectorContainer: {
    maxHeight: 120,
    marginBottom: 16,
  },
  opcionSelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  opcionSeleccionada: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  textoOpcion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  especialidadOpcion: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  botonesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  botonCancelarModal: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonCancelarModal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardarModal: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonGuardarModal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});