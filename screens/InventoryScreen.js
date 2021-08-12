import React, { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

import { saveInventoryReducer } from '../redux/reducers'
import { SpinnerScreen } from '../components/SpinnerScreen'
import { useSelector, useDispatch } from 'react-redux'

export default function InventoryScreen({ navigation }) {
  // redux
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const saveInventory = (response, sessionId) =>
    dispatch(saveInventoryReducer(response, sessionId))

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
        const sessionId = uuidv4()
        saveInventory(inventory.inventory, sessionId)
        navigation.navigate('Home')
      }
    } catch (err) {
      console.log(err)
    }
  }

  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    ; (async () => {
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
      attempts={attempts}
    />
  )
}
