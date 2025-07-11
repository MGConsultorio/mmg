import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Settings, Users, Calendar, DollarSign, FileText, Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function AdministracionScreen() {
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalPacientes: 0,
    citasMes: 0,
    ingresosMes: 0,
    profesionalesActivos: 0,
  });
  const [modalProfesional, setModalProfesional] = useState(false);
  const [profesionalEditando, setProfesionalEditando] = useState<any>(null);
  const [nuevoProfesional, setNuevoProfesional] = useState({
    nombre: '',
    apellido: '',
    especialidad: '',
    numero_licencia: '',
    telefono: '',
    email: '',
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      // Cargar profesionales
      const { data: profesionalesData } = await supabase
        .from('profesionales')
        .select('*')
        .order('nombre', { ascending: true })
        .limit(100);

      setProfesionales(profesionalesData || []);

      // Cargar estadísticas
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id')
        .limit(1000);

      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: citasMes } = await supabase
        .from('citas')
        .select('id')
        .gte('fecha_hora', inicioMes.toISOString())
        .limit(1000);

      const { data: tratamientos } = await supabase
        .from('tratamientos')
        .select('costo')
        .eq('pagado', true)
        .gte('fecha_realizacion', inicioMes.toISOString())
        .limit(1000);

      const ingresosMes = tratamientos?.reduce((sum, t) => sum + Number(t.costo), 0) || 0;

      setEstadisticas({
        totalPacientes: pacientes?.length || 0,
        citasMes: citasMes?.length || 0,
        ingresosMes,
        profesionalesActivos: profesionalesData?.filter(p => p.activo).length || 0,
      });
    } catch (error) {
      console.error('Error cargando datos administrativos:', error);
      if (typeof Alert !== 'undefined') {
        Alert.alert('Error', 'No se pudieron cargar los datos administrativos');
      }
    } finally {
      setCargando(false);
    }
  };

  const guardarProfesional = async () => {
    try {
      if (!nuevoProfesional.nombre || !nuevoProfesional.apellido || !nuevoProfesional.especialidad) {
        Alert.alert('Error', 'Por favor complete los campos obligatorios');
        return;
      }

      if (profesionalEditando) {
        // Actualizar profesional existente
        const { error } = await supabase
          .from('profesionales')
          .update(nuevoProfesional)
          .eq('id', profesionalEditando.id);

        if (error) throw error;
        Alert.alert('Éxito', 'Profesional actualizado correctamente');
      } else {
        // Crear nuevo profesional
        const { error } = await supabase
          .from('profesionales')
          .insert([{
            ...nuevoProfesional,
            clinica_id: 'temp-clinic-id', // Esto debería venir del contexto de la clínica
          }]);

        if (error) throw error;
        Alert.alert('Éxito', 'Profesional registrado correctamente');
      }

      setModalProfesional(false);
      setProfesionalEditando(null);
      setNuevoProfesional({
        nombre: '',
        apellido: '',
        especialidad: '',
        numero_licencia: '',
        telefono: '',
        email: '',
      });
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el profesional');
    }
  };

  const editarProfesional = (profesional: any) => {
    setProfesionalEditando(profesional);
    setNuevoProfesional({
      nombre: profesional.nombre,
      apellido: profesional.apellido,
      especialidad: profesional.especialidad,
      numero_licencia: profesional.numero_licencia,
      telefono: profesional.telefono,
      email: profesional.email,
    });
    setModalProfesional(true);
  };

  const eliminarProfesional = async (profesionalId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar este profesional?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('profesionales')
                .update({ activo: false })
                .eq('id', profesionalId);

              if (error) throw error;
              Alert.alert('Éxito', 'Profesional desactivado correctamente');
              cargarDatos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo desactivar el profesional');
            }
          },
        },
      ]
    );
  };

  const formatearMoneda = (cantidad: number) => {
    return `₲ ${cantidad.toLocaleString('es-PY')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Panel Administrativo</Text>
        <Settings size={24} color="#ffffff" />
      </View>

      <ScrollView style={styles.contenido}>
        {/* Estadísticas generales */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Estadísticas del Mes</Text>
          <View style={styles.estadisticasGrid}>
            <View style={styles.tarjetaEstadistica}>
              <Users size={20} color="#2563eb" />
              <Text style={styles.numeroEstadistica}>{estadisticas.totalPacientes}</Text>
              <Text style={styles.labelEstadistica}>Total Pacientes</Text>
            </View>

            <View style={styles.tarjetaEstadistica}>
              <Calendar size={20} color="#059669" />
              <Text style={styles.numeroEstadistica}>{estadisticas.citasMes}</Text>
              <Text style={styles.labelEstadistica}>Citas del Mes</Text>
            </View>

            <View style={styles.tarjetaEstadistica}>
              <DollarSign size={20} color="#7c3aed" />
              <Text style={styles.numeroEstadistica}>{formatearMoneda(estadisticas.ingresosMes)}</Text>
              <Text style={styles.labelEstadistica}>Ingresos del Mes</Text>
            </View>

            <View style={styles.tarjetaEstadistica}>
              <FileText size={20} color="#dc2626" />
              <Text style={styles.numeroEstadistica}>{estadisticas.profesionalesActivos}</Text>
              <Text style={styles.labelEstadistica}>Profesionales Activos</Text>
            </View>
          </View>
        </View>

        {/* Gestión de profesionales */}
        <View style={styles.seccion}>
          <View style={styles.headerSeccion}>
            <Text style={styles.tituloSeccion}>Gestión de Profesionales</Text>
            <TouchableOpacity
              style={styles.botonAgregar}
              onPress={() => setModalProfesional(true)}
            >
              <Plus size={16} color="#ffffff" />
              <Text style={styles.textoBotonAgregar}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {profesionales.map((profesional: any) => (
            <View key={profesional.id} style={styles.tarjetaProfesional}>
              <View style={styles.infoProfesional}>
                <Text style={styles.nombreProfesional}>
                  Dr. {profesional.nombre} {profesional.apellido}
                </Text>
                <Text style={styles.especialidadProfesional}>{profesional.especialidad}</Text>
                <Text style={styles.contactoProfesional}>
                  {profesional.telefono} • {profesional.email}
                </Text>
                <Text style={styles.licenciaProfesional}>
                  Licencia: {profesional.numero_licencia}
                </Text>
              </View>

              <View style={styles.accionesProfesional}>
                <TouchableOpacity
                  style={styles.botonEditar}
                  onPress={() => editarProfesional(profesional)}
                >
                  <Edit size={16} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonEliminar}
                  onPress={() => eliminarProfesional(profesional.id)}
                >
                  <Trash2 size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>

              <View style={[
                styles.estadoProfesional,
                { backgroundColor: profesional.activo ? '#dcfce7' : '#fee2e2' }
              ]}>
                <Text style={[
                  styles.textoEstadoProfesional,
                  { color: profesional.activo ? '#166534' : '#991b1b' }
                ]}>
                  {profesional.activo ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Información de membresía */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Estado de Membresía</Text>
          <View style={styles.tarjetaMembresia}>
            <Text style={styles.tipoMembresia}>Plan Mensual</Text>
            <Text style={styles.estadoMembresia}>Activa - Período de Prueba</Text>
            <Text style={styles.vencimientoMembresia}>
              Vence: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PY')}
            </Text>
            <TouchableOpacity style={styles.botonRenovar}>
              <Text style={styles.textoBotonRenovar}>Renovar Membresía</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para profesional */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalProfesional}
        onRequestClose={() => setModalProfesional(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {profesionalEditando ? 'Editar Profesional' : 'Nuevo Profesional'}
            </Text>
            
            <ScrollView style={styles.formulario}>
              <TextInput
                style={styles.input}
                placeholder="Nombre *"
                value={nuevoProfesional.nombre}
                onChangeText={(text) => setNuevoProfesional({...nuevoProfesional, nombre: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Apellido *"
                value={nuevoProfesional.apellido}
                onChangeText={(text) => setNuevoProfesional({...nuevoProfesional, apellido: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Especialidad *"
                value={nuevoProfesional.especialidad}
                onChangeText={(text) => setNuevoProfesional({...nuevoProfesional, especialidad: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Número de Licencia"
                value={nuevoProfesional.numero_licencia}
                onChangeText={(text) => setNuevoProfesional({...nuevoProfesional, numero_licencia: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={nuevoProfesional.telefono}
                onChangeText={(text) => setNuevoProfesional({...nuevoProfesional, telefono: text})}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={nuevoProfesional.email}
                onChangeText={(text) => setNuevoProfesional({...nuevoProfesional, email: text})}
                keyboardType="email-address"
              />
            </ScrollView>

            <View style={styles.botonesModal}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => {
                  setModalProfesional(false);
                  setProfesionalEditando(null);
                  setNuevoProfesional({
                    nombre: '',
                    apellido: '',
                    especialidad: '',
                    numero_licencia: '',
                    telefono: '',
                    email: '',
                  });
                }}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={guardarProfesional}
              >
                <Text style={styles.textoBotonGuardar}>Guardar</Text>
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
  contenido: {
    flex: 1,
    padding: 16,
  },
  seccion: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  headerSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  botonAgregar: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  textoBotonAgregar: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  estadisticasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tarjetaEstadistica: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  numeroEstadistica: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  labelEstadistica: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  tarjetaProfesional: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoProfesional: {
    flex: 1,
  },
  nombreProfesional: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  especialidadProfesional: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 2,
  },
  contactoProfesional: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  licenciaProfesional: {
    fontSize: 12,
    color: '#6b7280',
  },
  accionesProfesional: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  botonEditar: {
    padding: 6,
  },
  botonEliminar: {
    padding: 6,
  },
  estadoProfesional: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoEstadoProfesional: {
    fontSize: 10,
    fontWeight: '600',
  },
  tarjetaMembresia: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  tipoMembresia: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  estadoMembresia: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  vencimientoMembresia: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  botonRenovar: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoBotonRenovar: {
    color: '#ffffff',
    fontSize: 14,
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
  botonCancelar: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonGuardar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});