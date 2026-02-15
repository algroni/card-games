import React, {useEffect, useState, useCallback, useRef} from 'react';
import {SafeAreaView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Animated, Easing, TouchableWithoutFeedback} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import words from './src/data/words.json';

type Word = { id: number; en: string; es: string };

const STORAGE_KEY = 'remainingWordIds_v1';

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [remaining, setRemaining] = useState<number[] | null>(null);
  const [current, setCurrent] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const ids: number[] = JSON.parse(raw);
          setRemaining(ids);
          setCurrent(wordById(ids[0]));
        } else {
          const ids = shuffle(words.map(w => w.id));
          setRemaining(ids);
          setCurrent(wordById(ids[0]));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        }
      } catch (e) {
        Alert.alert('Error','Failed to load progress');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const wordById = useCallback((id?: number) => {
    if (id === undefined) return null;
    const w = words.find(x => x.id === id);
    return w ?? null;
  }, []);

  const removeCurrent = async () => {
    if (!remaining || remaining.length === 0) return;
    // animate press feedback then remove
    Animated.sequence([
      Animated.timing(scale, {toValue:0.96,duration:80,easing:Easing.out(Easing.quad),useNativeDriver:true}),
      Animated.timing(scale, {toValue:1,duration:120,easing:Easing.out(Easing.quad),useNativeDriver:true})
    ]).start();

    const [, ...rest] = remaining;
    setRemaining(rest);
    const next = wordById(rest[0]);
    setCurrent(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  };

  const resetAll = async () => {
    const ids = shuffle(words.map(w => w.id));
    setRemaining(ids);
    setCurrent(wordById(ids[0]));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  };

  if (loading || !remaining) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const total = words.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.headerText}>Cards remaining</Text> */}
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{remaining.length}</Text>
          </View>

          <TouchableOpacity onPress={resetAll} style={styles.badge}>
            <Text style={styles.badgeText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {current ? (
        <TouchableWithoutFeedback onPress={removeCurrent} disabled={remaining.length===0}>
          <Animated.View style={[styles.card, {transform:[{scale}]} as any]}>

 <View style={styles.innerFrame}>
  <View style={[styles.cornerGem, { top: 10, left: 10 }]} />
  <View style={[styles.cornerGem, { top: 10, right: 10 }]} />

  <View style={styles.labelBadge}>
    <Text style={styles.labelText}>English</Text>
  </View>

  <Text style={styles.wordLarge}>{current.en}</Text>

  <View style={{ height: 24 }} />

  <View style={styles.labelBadge}>
    <Text style={styles.labelText}>Español</Text>
  </View>

  <Text style={styles.wordLarge}>{current.es}</Text>

  <View style={[styles.cornerGem, { bottom: 10, left: 10 }]} />
  <View style={[styles.cornerGem, { bottom: 10, right: 10 }]} />
 </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      ) : (
        <View style={styles.cardEmpty}>
          <Text style={styles.wordLarge}>No more words — well done!</Text>
          <TouchableOpacity onPress={resetAll} style={styles.resetButtonLarge}>
            <Text style={styles.resetText}>Restart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* bottom controls removed; reset moved to header */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, alignItems:'center', justifyContent:'center', padding:20, backgroundColor:'#fafafa'},
  header: {width:'100%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#f9f9f9'},
  resetButton: {padding:8, backgroundColor:'#eee', borderRadius:6},
  resetText: {fontSize:14},
  headerText: {fontSize:18, fontWeight:'600'},
  badge: {backgroundColor:'#0a84ff', paddingHorizontal:12, paddingVertical:6, borderRadius:20},
  badgeText: {color:'#fff', fontWeight:'700'},
  cardEmpty: {width:'100%', padding:24, borderRadius:12, backgroundColor:'#fff', alignItems:'center'},
  langTitle: {fontSize:12, color:'#666', marginBottom:6},
  controls: {marginTop:20, width:'100%'},
  button: {padding:16, backgroundColor:'#0a84ff', borderRadius:8, alignItems:'center'},
  buttonText: {color:'#fff', fontWeight:'600'},
  headerRight: {flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',width: '100%'},
    card: {
        width: '100%',
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderRadius: 24,

        backgroundColor: '#F8F1E7', // soft parchment feel

        borderWidth: 6,
        borderColor: '#5B2D82', // purple outer frame

        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 }
    
    },
    innerFrame: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F59E0B', // gold/orange trim
    backgroundColor: '#FFFBF3'
    },
    langBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,

    backgroundColor: '#F97316', // orange-red
    marginBottom: 12,
    },

    langBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    },
    wordLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 12,
    },
    cornerGem: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#60A5FA', // blue gem
    transform: [{ rotate: '45deg' }],
    },
    labelBadge: {
    alignSelf: 'center',
    backgroundColor: '#FF6A00',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,

    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    },

    labelText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    },
    resetButtonLarge: {marginTop:12, padding:10, backgroundColor:'#0a84ff', borderRadius:8}
});
 
// Additional styles for new layout
Object.assign(styles, {
  row: {flexDirection:'row', alignItems:'center', justifyContent:'space-between'},
  langBlock: {flex:1, alignItems:'center', paddingHorizontal:12},
  divider: {width:1, height:80, backgroundColor:'#eee', marginHorizontal:6},
  progressRow: {marginTop:16, alignItems:'center'},
  progressBarTrack: {height:8, backgroundColor:'#f0f0f0', width:'100%', borderRadius:6, overflow:'hidden'},
  progressBarFill: {height:8, backgroundColor:'#0a84ff'},
  hint: {marginTop:8, fontSize:12, color:'#666', textAlign:'center'},
  resetButtonLarge: {marginTop:12, padding:10, backgroundColor:'#0a84ff', borderRadius:8}
});
