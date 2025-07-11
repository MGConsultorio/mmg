import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import OdontogramaInteractivo from '@/components/OdontogramaInteractivo';

export default function OdontogramaScreen() {
  const { id } = useLocalSearchParams();
  const pacienteId = Array.isArray(id) ? id[0] : id;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#ffffff" />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Odontograma</Text>
        <View style={styles.espaciador} />
      </View>

      <OdontogramaInteractivo pacienteId={pacienteId} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoVolver: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  espaciador: {
    width: 60,
  },
});