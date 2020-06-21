import { Audio } from 'expo-av'
import { MonoText } from '../components/StyledText'
import { BarCodeScanner } from 'expo-barcode-scanner'
import React, { useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import { saveGoodScanReducer, saveBadScanReducer } from '../redux/reducers'
import { Text, View, StyleSheet, Button, Vibration, Image } from 'react-native'
import Colors from '../constants/Colors'

const blankLatest = {
  title: null,
  barcode: null,
  available: null,
  bad: false,
}

export default function ScanScreen(props) {
  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const saveGoodScan = response => dispatch(saveGoodScanReducer(response))
  const saveBadScan = response => dispatch(saveBadScanReducer(response))

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
    if (!props.navigation.isFocused()) return undefined

    // Otherwise save barcode
    setScanned(true)
    findBarcode(data)

    await unlockScanner(2000)
  }

  const makeNoise = async good => {
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

  const unlockScanner = async delay => {
    try {
      return await setTimeout(() => {
        setScanned(false)
      }, delay)
    } catch (err) {
      console.log(err)
    }
  }

  const findBarcode = barcode => {
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
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
      }}
    >
      <View
        style={
          latest.barcode
            ? latest.bad
              ? styles.badBorder
              : styles.goodBorder
            : styles.header
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'center',
          }}
        >
          {!latest.barcode ? (
            <View style={styles.container}>
              <Image
                source={require('../assets/images/barcode.png')}
                style={styles.barcodeImage}
              />
            </View>
          ) : null}
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
      <View style={{ flex: 6 }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: 150,
    alignItems: 'center',
    padding: 16,
  },
  goodBorder: {
    backgroundColor: 'white',
    flex: 1,
    borderLeftColor: Colors.tintColor,
    borderLeftWidth: 6,
    paddingLeft: 8,
    marginLeft: 16,
    marginBottom: 8,
  },
  badBorder: {
    backgroundColor: 'white',
    flex: 1,
    borderLeftColor: 'red',
    borderLeftWidth: 6,
    paddingLeft: 8,
    marginLeft: 16,
    marginBottom: 8,
  },
  header: {
    backgroundColor: 'white',
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  barcodeImage: {
    flex: 1,
    opacity: 0.2,
    height: 50,
  },
})
