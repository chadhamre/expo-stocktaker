import { Audio } from 'expo-av'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { MonoText } from '../components/StyledText'
import { saveGoodScanReducer, saveBadScanReducer } from '../redux/reducers'
import { Spinner } from '../components/Spinner'
import { Text, View, StyleSheet, Button, Vibration, Image } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../constants/Colors'
import React, { useState, useEffect } from 'react'

const blankLatest = {
  title: null,
  barcode: null,
  available: null,
  bad: false,
}

export default function ScanScreen({ navigation }) {
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const saveGoodScan = (response) => dispatch(saveGoodScanReducer(response))
  const saveBadScan = (response) => dispatch(saveBadScanReducer(response))

  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [latest, setLatest] = useState(blankLatest)

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setLatest(blankLatest)
    }, [])
  )

  const handleBarCodeScanned = async ({ type, data }) => {
    // If this tab is not focussed, exit handler.
    if (!navigation.isFocused()) return undefined

    // Otherwise save barcode
    setScanned(true)
    findBarcode(data)

    await unlockScanner(3000)
  }

  const makeNoise = async (good) => {
    try {
      let sound = require('../assets/sounds/beep.mp3')
      if (!good) sound = require('../assets/sounds/beepBad.mp3')
      Vibration.vibrate()
      const soundObject = new Audio.Sound()
      await soundObject.loadAsync(sound)
      await soundObject.playAsync()
    } catch (err) {
      console.log(err)
    }
  }

  const unlockScanner = async (delay) => {
    try {
      return await setTimeout(() => {
        setScanned(false)
      }, delay)
    } catch (err) {
      console.log(err)
    }
  }

  const findBarcode = (barcode) => {
    if (state.inventory[barcode]) {
      makeNoise(true)
      setLatest(state.inventory[barcode])
      saveGoodScan(barcode)
    } else {
      makeNoise(false)
      const update = { ...blankLatest }
      update.title = 'barcode not found'
      update.barcode = barcode
      update.bad = true
      setLatest(update)
      saveBadScan(barcode)
    }
    return state.inventory[barcode] || blankLatest
  }

  // Render

  if (hasPermission === null) {
    return <Spinner />
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  if (state.serverError) {
    navigation.navigate('ErrorScreen')
    return null
  } else if (!state.token) {
    navigation.navigate('AuthScreen')
    return null
  } else if (!state.locationName) {
    navigation.navigate('LocationScreen')
    return null
  } else if (!state.inventory) {
    navigation.navigate('InventoryScreen')
    return null
  } else if (state.updateShopify) {
    navigation.navigate('UpdateScreen')
    return null
  }

  return (
    <View
      style={{
        height: '100%',
        display: 'flex',
        backgroundColor: Colors.lightest,
      }}
    >
      <View
        style={[
          styles.topSection,
          latest.barcode
            ? latest.bad
              ? styles.badBorder
              : styles.goodBorder
            : styles.header,
        ]}
      >
        {!latest.barcode ? (
          <View style={styles.container}>
            <Image
              source={require('../assets/images/barcode.png')}
              style={styles.barcodeImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.textContainer}>
            <View style={styles.innerContainer}>
              <Text style={styles.title}>{latest.title}</Text>
              <Text>
                {latest.barcode ? `barcode: ` : null}{' '}
                <MonoText>{latest.barcode}</MonoText>
              </Text>
              <Text>{latest.sku ? `sku: ${latest.sku}` : null}</Text>
              <Text>
                {latest.available !== null
                  ? `stock: ${latest.available} available`
                  : null}
              </Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.barCodeScannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  barCodeScannerContainer: {
    flex: 4,
    margin: 10,
  },
  topSection: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  textContainer: {
    height: '100%',
    display: 'flex',
    justifyContent: 'space-around',
  },

  goodBorder: {
    borderLeftColor: Colors.tintColor,
    borderLeftWidth: 6,
    paddingLeft: 8,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
    display: 'flex',
  },
  badBorder: {
    borderLeftColor: 'red',
    borderLeftWidth: 6,
    paddingLeft: 8,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  barcodeImage: {
    flex: 1,
    opacity: 0.2,
    width: 200,
  },
  scanner: {
    flex: 1,
  },
})
