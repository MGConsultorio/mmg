import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Save, CreditCard as Edit3, CircleAlert as AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface DienteData {
  numero: number;
  estado: string;
  tratamiento_necesario?: string;
  color: string;
}

interface OdontogramaProps {
  pacienteId: string;
  readonly?: boolean;
}

export default function OdontogramaInteractivo({ pacienteId, readonly = false }: OdontogramaProps) {
  const [dientes, setDientes] = useState<DienteData[]>([]);
  const [dienteSeleccionado, setDienteSeleccionado] = useState<DienteData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [estadoTemporal, setEstadoTemporal] = useState('');
  const [tratamientoTemporal, setTratamientoTemporal] = useState('');
  const [cargando, setCargando] = useState(true);

  const estadosDiente = [
    { valor: 'sano', label: 'Sano', color: '#10b981' },
    { valor: 'caries', label: 'Caries', color: '#f59e0b' },
    { valor: 'obturado', label: 'Obturado', color: '#6366f1' },
    { valor: 'corona', label: 'Corona', color: '#8b5cf6' },
    { valor: 'extraccion', label: 'Extracción', color: '#ef4444' },
    { valor: 'implante', label: 'Implante', color: '#06b6d4' },
    { valor: 'endodoncia', label: 'Endodoncia', color: '#f97316' },
    { valor: 'ausente', label: 'Ausente', color: '#6b7280' },
  ];

  useEffect(() => {
    cargarOdontograma();
  }, [pacienteId]);

  const cargarOdontograma = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('odontogramas')
        .select('*')
        .eq('paciente_id', pacienteId);

      if (error) throw error;

      // Crear array de 32 dientes
      const dientesCompletos = Array.from({ length: 32 }, (_, i) => {
        const numero = i + 1;
        const dienteExistente = data?.find(d => d.diente_numero === numero);
        
        return {
          numero,
          estado: dienteExistente?.estado || 'sano',
          tratamiento_necesario: dienteExistente?.tratamiento_necesario || '',
          color: estadosDiente.find(e => e.valor === (dienteExistente?.estado || 'sano'))?.color || '#10b981'
        };
      });

      setDientes(dientesCompletos);
    } catch (error) {
      console.error('Error cargando odontograma:', error);
      Alert.alert('Error', 'No se pudo cargar el odontograma');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarDiente = (diente: DienteData) => {
    if (readonly) return;
    
    setDienteSeleccionado(diente);
    setEstadoTemporal(diente.estado);
    setTratamientoTemporal(diente.tratamiento_necesario || '');
    setModalVisible(true);
  };

  const guardarCambiosDiente = async () => {
    if (!dienteSeleccionado) return;

    try {
      const estadoSeleccionado = estadosDiente.find(e => e.valor === estadoTemporal);
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('odontogramas')
        .upsert({
          paciente_id: pacienteId,
          diente_numero: dienteSeleccionado.numero,
          estado: estadoTemporal,
          tratamiento_necesario: tratamientoTemporal,
        });

      if (error) throw error;

      // Actualizar estado local
      setDientes(prev => prev.map(d => 
        d.numero === dienteSeleccionado.numero 
          ? {
              ...d,
              estado: estadoTemporal,
              tratamiento_necesario: tratamientoTemporal,
              color: estadoSeleccionado?.color || '#10b981'
            }
          : d
      ));

      setModalVisible(false);
      Alert.alert('Éxito', 'Diente actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el cambio');
    }
  };

  const renderDiente = (diente: DienteData) => (
    <TouchableOpacity
      key={diente.numero}
      style={[
        styles.diente,
        { backgroundColor: diente.color },
        diente.tratamiento_necesario && styles.dienteConTratamiento
      ]}
      onPress={() => seleccionarDiente(diente)}
      disabled={readonly}
    >
      <Text style={styles.numeroDiente}>{diente.numero}</Text>
      {diente.tratamiento_necesario && (
        <AlertCircle size={8} color="#ffffff" style={styles.iconoAlerta} />
      )}
    </TouchableOpacity>
  );

  const renderCuadrante = (inicio: number, fin: number, titulo: string) => (
    <View style={styles.cuadrante}>
      <Text style={styles.tituloCuadrante}>{titulo}</Text>
      <View style={styles.filaDientes}>
        {dientes.slice(inicio - 1, fin).map(renderDiente)}
      </View>
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <Text>Cargando odontograma...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Odontograma Digital</Text>
        {!readonly && (
          <Text style={styles.instrucciones}>Toca un diente para editarlo</Text>
        )}
      </View>

      <View style={styles.odontograma}>
        {/* Cuadrante Superior Derecho */}
        {renderCuadrante(1, 8, 'Superior Derecho')}
        
        {/* Cuadrante Superior Izquierdo */}
        {renderCuadrante(9, 16, 'Superior Izquierdo')}
        
        {/* Cuadrante Inferior Izquierdo */}
        {renderCuadrante(17, 24, 'Inferior Izquierdo')}
        
        {/* Cuadrante Inferior Derecho */}
        {renderCuadrante(25, 32, 'Inferior Derecho')}
      </View>

      {/* Leyenda */}
      <View style={styles.leyenda}>
        <Text style={styles.tituloLeyenda}>Leyenda:</Text>
        <View style={styles.estadosGrid}>
          {estadosDiente.map(estado => (
            <View key={estado.valor} style={styles.itemLeyenda}>
              <View style={[styles.colorLeyenda, { backgroundColor: estado.color }]} />
              <Text style={styles.textoLeyenda}>{estado.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Modal de edición */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              Editar Diente #{dienteSeleccionado?.numero}
            </Text>

            <Text style={styles.labelModal}>Estado del diente:</Text>
            <ScrollView style={styles.estadosContainer}>
              {estadosDiente.map(estado => (
                <TouchableOpacity
                  key={estado.valor}
                  style={[
                    styles.opcionEstado,
                    estadoTemporal === estado.valor && styles.opcionSeleccionada
                  ]}
                  onPress={() => setEstadoTemporal(estado.valor)}
                >
                  <View style={[styles.colorOpcion, { backgroundColor: estado.color }]} />
                  <Text style={styles.textoOpcion}>{estado.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.labelModal}>Tratamiento necesario:</Text>
            <TextInput
              style={styles.inputTratamiento}
              placeholder="Describe el tratamiento necesario..."
              value={tratamientoTemporal}
              onChangeText={setTratamientoTemporal}
              multiline
            />

            <View style={styles.botonesModal}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={guardarCambiosDiente}
              >
                <Save size={16} color="#ffffff" />
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
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  instrucciones: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  odontograma: {
    padding: 16,
    gap: 16,
  },
  cuadrante: {
    alignItems: 'center',
  },
  tituloCuadrante: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filaDientes: {
    flexDirection: 'row',
    gap: 4,
  },
  diente: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'relative',
  },
  dienteConTratamiento: {
    borderColor: '#f59e0b',
    borderWidth: 3,
  },
  numeroDiente: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  iconoAlerta: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  leyenda: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  tituloLeyenda: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  estadosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemLeyenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  colorLeyenda: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textoLeyenda: {
    fontSize: 12,
    color: '#374151',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  labelModal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  estadosContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  opcionEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  opcionSeleccionada: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  colorOpcion: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  textoOpcion: {
    fontSize: 14,
    color: '#374151',
  },
  inputTratamiento: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  botonesModal: {
    flexDirection: 'row',
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
    fontSize: 14,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  textoBotonGuardar: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});