import Constants from 'expo-constants'
import { saveInventoryReducer } from '../redux/reducers'
import { MonoText } from '../components/StyledText'
import { Spinner } from '../components/Spinner'
import { reloadAsync } from 'expo-updates'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native'

export default function InventoryScreen() {
  // redux
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const saveInventory = (response) => dispatch(saveInventoryReducer(response))

  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    ;(async () => {
      const locationId = state.locationId.split('gid://shopify/Location/')[1]
      requestInventory(locationId, state.token, setAttempts, saveInventory)
    })()
  }, [])

  return (
    <Spinner
      labelTop={`Getting latest data from Shopify.`}
      labelBottom={attempts ? `${attempts} sec.` : '...'}
    />
  )
}

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
    }
  } catch (err) {
    console.log(err)
  }
}
