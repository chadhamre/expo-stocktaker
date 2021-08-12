import * as Linking from 'expo-linking'
import Constants from 'expo-constants'
import React, { useState, useEffect } from 'react'

import { Audio } from 'expo-av'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { PermissionsScreen } from '../components/PermissionsScreen'
import { saveAuthReducer } from '../redux/reducers'
import { sharedStyles } from '../constants/Styles'
import { SpinnerScreen } from '../components/SpinnerScreen'
import { useSelector, useDispatch } from 'react-redux'
import {
  Text,
  View,
  StyleSheet,
  Vibration,
  Image,
  TouchableOpacity,
} from 'react-native'

export default function AuthScreen(props) {
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const saveAuth = (response) => dispatch(saveAuthReducer(response))

  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    ; (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
      // loginToCycleServer('3015a4f5-d3a5-493e-b694-35443bc020d0')
    })()
  }, [])

  const handleQRCodeScanned = async ({ type, data }) => {
    setScanned(true)
    makeNoise(true)
    await loginToCycleServer(data)
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

  const loginToCycleServer = (secret) => {
    fetch(`${Constants.manifest.extra.SERVER_HOST}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret }),
    })
      .then((response) => {
        try {
          return response.json()
        } catch (err) {
          throw err
        }
      })
      .then((response) => {
        if (response.message === 'Denied') {
          throw response
        } else {
          saveAuth(response)
        }
      })
      .catch((err) => {
        console.log(err)
        makeNoise()
        setTimeout(() => {
          setScanned(false)
        }, 2000)
      })
  }

  if (hasPermission === null) {
    return <SpinnerScreen />
  }
  if (hasPermission === false) {
    return <PermissionsScreen />
  }

  return (
    <View style={sharedStyles.outerRoundedContainer}>
      <View style={sharedStyles.innerRoundedContainer}>
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
            Log into our App on your Shopify desktop to see your sign in QR
            code.
          </Text>
          <Image
            source={require('../assets/images/qrcode.png')}
            style={styles.qrImage}
          />
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(
                'mailto:hello@saskatoonlabs.com?subject=StockTakerApp'
              )
            }}
          >
            <Text style={styles.centerText}>
              Need help? Email hello@saskatoonlabs.com.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
    width: 50,
    height: 50,
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
