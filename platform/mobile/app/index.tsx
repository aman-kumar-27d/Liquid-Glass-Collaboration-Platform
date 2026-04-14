import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Liquid Glass Mobile</Text>
      <Text style={styles.title}>Mobile delivery is scaffolded and aligned to the backend-first roadmap.</Text>
      <Text style={styles.copy}>
        Next implementation phases will add tenant auth, room lists, messaging, and call participation on top of shared contracts.
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
    paddingHorizontal: 24,
    justifyContent: 'center'
  },
  eyebrow: {
    color: '#88dfff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  title: {
    color: '#f3f9ff',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36
  },
  copy: {
    color: '#bfd5ea',
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24
  }
});
