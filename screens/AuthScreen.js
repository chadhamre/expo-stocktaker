import { Audio } from 'expo-av'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { reloadAsync } from 'expo-updates'
import { saveAuthReducer } from '../redux/reducers'
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Button, Vibration, Image } from 'react-native'

export default function AuthScreen(props) {
  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const saveAuth = response => dispatch(saveAuthReducer(response))

  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  const handleQRCodeScanned = async ({ type, data }) => {
    setScanned(true)
    await loginToCycleServer(data)
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

  const loginToCycleServer = secret => {
    fetch('https://cycle-server.ngrok.io/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret }),
    })
      .then(response => {
        try {
          return response.json()
        } catch (err) {
          throw err
        }
      })
      .then(response => {
        if (response.message === 'Denied') {
          throw response
        } else {
          makeNoise(true)
          saveAuth(response)
        }
      })
      .catch(err => {
        console.log(err)
        makeNoise()
        setTimeout(() => {
          setScanned(false)
        }, 2000)
      })
  }

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
      }}
    >
      <View style={styles.top}>
        <Text style={styles.tabBarInfoText}>Sign In</Text>
      </View>
      <View style={{ flex: 6 }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleQRCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <View style={styles.bottom}>
        <Text style={styles.centerText}>
          Log into our App on your Shopify desktop to see your sign in QR code.
        </Text>
        <Image
          source={require('../assets/images/qrcode.png')}
          style={styles.qrImage}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  top: {
    flex: 1.4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  bottom: {
    flex: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 18,
  },
  qrImage: {
    margin: 12,
    opacity: 0.2,
    width: 150,
    height: 150,
  },
  centerText: {
    textAlign: 'center',
  },
  tabBarInfoText: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
})
