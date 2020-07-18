import React, { useState, useEffect } from 'react'
import Constants from 'expo-constants'

import { MonoText } from '../components/StyledText'
import { reloadAsync } from 'expo-updates'
import { saveInventoryReducer } from '../redux/reducers'
import { ScrollView } from 'react-native-gesture-handler'
import { sharedStyles } from '../constants/Styles'
import { SpinnerScreen } from '../components/SpinnerScreen'
import { useSelector, useDispatch } from 'react-redux'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native'

export default function InventoryScreen({ navigation }) {
  // redux
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const saveInventory = (response) => dispatch(saveInventoryReducer(response))

  const requestInventory = async (
    location,
    token,
    setAttempts,
    saveInventory,
    retry = 0
  ) => {
    try {
      const retryCount = retry + 1
      const inventory = await fetch(
        `${Constants.manifest.extra.SERVER_HOST}/api/inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            location: location,
          }),
        }
      ).then((response) => response.json())

      if (['CREATED', 'RUNNING'].includes(inventory.status)) {
        setTimeout(async () => {
          setAttempts(retryCount)
          await requestInventory(
            location,
            token,
            setAttempts,
            saveInventory,
            retryCount
          )
        }, 1000)
      } else {
        saveInventory(inventory.inventory)
        navigation.navigate('Home')
      }
    } catch (err) {
      console.log(err)
    }
  }

  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    ;(async () => {
      const locationId = state.locationId.split('gid://shopify/Location/')[1]
      await requestInventory(
        locationId,
        state.token,
        setAttempts,
        saveInventory
      )
    })()
  }, [])

  return (
    <SpinnerScreen
      labelTop={`Getting latest data from Shopify.`}
      labelBottom={attempts ? `${attempts} sec.` : '...'}
    />
  )
}
