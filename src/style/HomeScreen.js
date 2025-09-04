// src/style/HomeScreen.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mottuDark,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.mottuWhite,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mottuLightGray,
    marginTop: 4,
    marginBottom: 16,
  },
  grid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#2b2b2b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  cardLabel: {
    color: Colors.mottuLightGray,
    fontSize: 13,
    marginBottom: 4,
  },
  cardValue: {
    color: Colors.mottuGreen,
    fontSize: 28,
    fontWeight: '900',
  },
  extraContent: {
    marginTop: 12,
  },
  extraText: {
    color: Colors.mottuLightGray,
    fontSize: 12,
    marginBottom: 6,
  },
  fakeBar: {
    height: 6,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fakeBarFill: {
    height: '100%',
    backgroundColor: Colors.mottuGreen,
  },
  noteBox: {
    marginTop: 20,
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  noteTitle: {
    color: Colors.mottuGreen,
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 14,
  },
  noteText: {
    color: Colors.mottuLightGray,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeStyles;
