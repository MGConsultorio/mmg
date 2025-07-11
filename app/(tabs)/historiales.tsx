import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { FileText, User, Calendar, DollarSign, Eye, Bluetooth as Tooth, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import OdontogramaInteractivo from '@/components/OdontogramaInteractivo';

export default function HistorialesScreen() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [historialCompleto, setHistorialCompleto] = useState({
    tratamientos: [],
    odontograma: [],
    estudios: [],
    fichamedica: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nombre', { ascending: true })
        .limit(1000);

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      if (typeof Alert !== 'undefined') {
        Alert.alert('Error', 'No se pudieron cargar los pacientes');
      }
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorialPaciente = async (pacienteId: string) => {
    try {
      // Cargar tratamientos
      const { data: tratamientos } = await supabase
        .from('tratamientos')
        .select(`
          *,
          profesionales(nombre, apellido),
          citas(fecha_hora, motivo)
        `)
        .eq('paciente_id', pacienteId)
        .order('fecha_realizacion', { ascending: false });

      // Cargar odontograma
      const { data: odontograma } = await supabase
        .from('odontogramas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('diente_numero', { ascending: true });

      // Cargar estudios
      const { data: estudios } = await supabase
        .from('estudios')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha_subida', { ascending: false });

      // Cargar ficha médica
      const { data: fichamedica } = await supabase
        .from('fichas_medicas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .single();

      setHistorialCompleto({
        tratamientos: tratamientos || [],
        odontograma: odontograma || [],
        estudios: estudios || [],
        fichamedica: fichamedica || null,
      });

      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el historial del paciente');
    }
  };

  const formatearMoneda = (cantidad: number) => {
    return `₲ ${cantidad.toLocaleString('es-PY')}`;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PY');
  };

  const calcularSaldoTotal = () => {
    return historialCompleto.tratamientos
      .filter((t: any) => !t.pagado)
      .reduce((sum: number, t: any) => sum + Number(t.costo), 0);
  };

  const renderOdontograma = () => {
    const dientes = Array.from({ length: 32 }, (_, i) => i + 1);
    const estadosDiente = historialCompleto.odontograma.reduce((acc: any, item: any) => {
      acc[item.diente_numero] = item;
      return acc;
    }, {});

    return (
      <View style={styles.odontogramaContainer}>
        <Image 
          source={{ uri: '/assets/images/Odontograma.jpeg' }}
          style={styles.odontogramaImagen}
          resizeMode="contain"
        />
        <View style={styles.dientesGrid}>
          {dientes.map((numero) => {
            const estado = estadosDiente[numero];
            return (
              <View
                key={numero}
                style={[
                  styles.diente,
                  estado && styles.dienteConProblema,
                  estado?.tratamiento_necesario && styles.dienteNecesitaTratamiento,
                ]}
              >
                <Text style={styles.numeroDiente}>{numero}</Text>
                {estado && (
                  <Text style={styles.estadoDiente}>{estado.estado}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Historiales Médicos</Text>
      </View>

      <ScrollView style={styles.listaPacientes}>
        {pacientes.map((paciente: any) => (
          <TouchableOpacity
            key={paciente.id}
            style={styles.tarjetaPaciente}
            onPress={() => {
              setPacienteSeleccionado(paciente);
              cargarHistorialPaciente(paciente.id);
            }}
          >
            <View style={styles.avatarPaciente}>
              <User size={24} color="#2563eb" />
            </View>
            <View style={styles.infoPaciente}>
              <Text style={styles.nombrePaciente}>
                {paciente.nombre} {paciente.apellido}
              </Text>
              <Text style={styles.telefonoPaciente}>{paciente.telefono}</Text>
              {paciente.saldo_deuda > 0 && (
                <Text style={styles.saldoDeuda}>
                  Saldo: {formatearMoneda(paciente.saldo_deuda)}
                </Text>
              )}
            </View>
            <Eye size={20} color="#6b7280" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal de historial completo */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>
              Historial de {pacienteSeleccionado?.nombre} {pacienteSeleccionado?.apellido}
            </Text>
            <TouchableOpacity
              style={styles.botonCerrar}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoCerrar}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contenidoModal}>
            {/* Resumen financiero */}
            <View style={styles.seccionHistorial}>
              <Text style={styles.tituloSeccion}>Resumen Financiero</Text>
              <View style={styles.resumenFinanciero}>
                <Text style={styles.textoResumen}>
                  Saldo pendiente: {formatearMoneda(calcularSaldoTotal())}
                </Text>
                <Text style={styles.textoResumen}>
                  Total tratamientos: {historialCompleto.tratamientos.length}
                </Text>
              </View>
            </View>

            {/* Odontograma */}
            <View style={styles.seccionHistorial}>
              <Text style={styles.tituloSeccion}>Odontograma Digital</Text>
              <View style={styles.odontogramaContainer}>
                <OdontogramaInteractivo 
                  pacienteId={pacienteSeleccionado?.id} 
                  readonly={true}
                />
              </View>
            </View>

            {/* Tratamientos */}
            <View style={styles.seccionHistorial}>
              <Text style={styles.tituloSeccion}>Historial de Tratamientos</Text>
              {historialCompleto.tratamientos.length > 0 ? (
                historialCompleto.tratamientos.map((tratamiento: any) => (
                  <View key={tratamiento.id} style={styles.itemTratamiento}>
                    <View style={styles.headerTratamiento}>
                      <Text style={styles.descripcionTratamiento}>
                        {tratamiento.descripcion}
                      </Text>
                      <Text style={styles.costoTratamiento}>
                        {formatearMoneda(tratamiento.costo)}
                      </Text>
                    </View>
                    <Text style={styles.fechaTratamiento}>
                      {formatearFecha(tratamiento.fecha_realizacion)}
                    </Text>
                    <Text style={styles.profesionalTratamiento}>
                      Dr. {tratamiento.profesionales.nombre} {tratamiento.profesionales.apellido}
                    </Text>
                    <View style={styles.estadoPago}>
                      <Text style={[
                        styles.textoEstadoPago,
                        { color: tratamiento.pagado ? '#059669' : '#dc2626' }
                      ]}>
                        {tratamiento.pagado ? 'Pagado' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.textoVacio}>No hay tratamientos registrados</Text>
              )}
            </View>

            {/* Estudios */}
            <View style={styles.seccionHistorial}>
              <Text style={styles.tituloSeccion}>Estudios y Radiografías</Text>
              {historialCompleto.estudios.length > 0 ? (
                historialCompleto.estudios.map((estudio: any) => (
                  <View key={estudio.id} style={styles.itemEstudio}>
                    <Text style={styles.tipoEstudio}>{estudio.tipo.toUpperCase()}</Text>
                    <Text style={styles.descripcionEstudio}>{estudio.descripcion}</Text>
                    <Text style={styles.fechaEstudio}>
                      {formatearFecha(estudio.fecha_subida)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.textoVacio}>No hay estudios registrados</Text>
              )}
            </View>

            {/* Ficha médica */}
            <View style={styles.seccionHistorial}>
              <Text style={styles.tituloSeccion}>Ficha Médica</Text>
              {historialCompleto.fichamedica ? (
                <View style={styles.fichaMedica}>
                  <Text style={styles.labelFicha}>Enfermedades:</Text>
                  <Text style={styles.valorFicha}>
                    {historialCompleto.fichamedica.enfermedades || 'Ninguna'}
                  </Text>
                  
                  <Text style={styles.labelFicha}>Alergias:</Text>
                  <Text style={styles.valorFicha}>
                    {historialCompleto.fichamedica.alergias || 'Ninguna'}
                  </Text>
                  
                  <Text style={styles.labelFicha}>Medicamentos actuales:</Text>
                  <Text style={styles.valorFicha}>
                    {historialCompleto.fichamedica.medicamentos_actuales || 'Ninguno'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.textoVacio}>Ficha médica no completada</Text>
              )}
            </View>
          </ScrollView>
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
    alignItems: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listaPacientes: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tarjetaPaciente: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPaciente: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoPaciente: {
    flex: 1,
  },
  nombrePaciente: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  telefonoPaciente: {
    fontSize: 14,
    color: '#6b7280',
  },
  saldoDeuda: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  botonCerrar: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  textoCerrar: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  contenidoModal: {
    flex: 1,
    padding: 16,
  },
  seccionHistorial: {
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
  odontogramaContainer: {
    minHeight: 400,
  },
  resumenFinanciero: {
    gap: 8,
  },
  textoResumen: {
    fontSize: 14,
    color: '#374151',
  },
  resumenOdontograma: {
    gap: 4,
  },
  itemOdontograma: {
    fontSize: 14,
    color: '#374151',
  },
  masItems: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  textoVacio: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  itemTratamiento: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerTratamiento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  descripcionTratamiento: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  costoTratamiento: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  fechaTratamiento: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  profesionalTratamiento: {
    fontSize: 12,
    color: '#2563eb',
    marginBottom: 4,
  },
  estadoPago: {
    alignSelf: 'flex-start',
  },
  textoEstadoPago: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemEstudio: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tipoEstudio: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 2,
  },
  descripcionEstudio: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 2,
  },
  fechaEstudio: {
    fontSize: 12,
    color: '#6b7280',
  },
  fichaMedica: {
    gap: 8,
  },
  labelFicha: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  valorFicha: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
});