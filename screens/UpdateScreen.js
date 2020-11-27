import Colors from '../constants/Colors'
import Constants from 'expo-constants'
import React, { useState, useEffect } from 'react'

import { Button } from 'react-native-elements'
import { MaterialIcons } from '@expo/vector-icons'
import { reloadAsync } from 'expo-updates'
import { ScrollView } from 'react-native-gesture-handler'
import { sharedStyles } from '../constants/Styles'
import { SpinnerScreen } from '../components/SpinnerScreen'
import { TitleText } from '../components/StyledText'
import { useSelector, useDispatch } from 'react-redux'
import {
  clearInventoryReducer,
  clearScannedReducer,
  updateShopifyReducer,
} from '../redux/reducers'
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SegmentedControlIOSComponent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function InventoryScreen() {
  // redux
  const state = useSelector((state) => state)
  const buttonIndex = state.buttonIndex
  const dispatch = useDispatch()
  const updateShopify = (status) => dispatch(updateShopifyReducer(status))
  const clearScanned = () => dispatch(clearScannedReducer())
  const clearInventory = () => dispatch(clearInventoryReducer())

  const [attempts, setAttempts] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  const [pending, setPending] = useState(null)
  const [done, setDone] = useState(null)
  const [batch, setBatch] = useState(null)

  useEffect(() => {
    ;(async () => {
      if (!batch) {
        await updateInventory()
      } else {
        await checkBatchStatus(batch)
      }
    })()
  }, [])

  if (pending === 0) {
    const succeeded = done > 0
    return (
      <View style={sharedStyles.outerRoundedContainer}>
        <View style={sharedStyles.innerRoundedContainer}>
          <ScrollView
            style={sharedStyles.container}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.welcomeContainer}>
              <View>
                {succeeded ? (
                  <View>
                    <MaterialIcons
                      name="check"
                      size={100}
                      color={Colors.lightGreen}
                    />
                  </View>
                ) : (
                  <Text style={sharedStyles.underline}>Failure</Text>
                )}
              </View>
            </View>

            <View style={styles.helpContainer}>
              {succeeded ? (
                <TitleText>{`${done} items updated on Shopify`}</TitleText>
              ) : (
                <Text>{errorMessage}</Text>
              )}
            </View>
            <View style={styles.buttonContainer}>
              {succeeded ? (
                <Button title="Finish" onPress={handleSuccess} />
              ) : (
                <Button title="Go Back" onPress={handleFailure} />
              )}
            </View>
            <View style={styles.helpContainer}>
              {succeeded ? (
                <Text
                  style={{ textAlign: 'center' }}
                >{`After clicking finish, an CSV will be emailed to ${state.email}`}</Text>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }

  return (
    <SpinnerScreen
      labelTop={`Updating inventory on Shopify`}
      labelBottom={pending ? `${pending} remaining...` : ''}
    />
  )

  async function updateInventory() {
    const deltas = []
    const overwrites = []
    const isOverwrite = buttonIndex == 2

    state.applyList.forEach((item) => {
      const isSibling = !state.scannedGood.hasOwnProperty(item.barcode)
      const zeroDelta = item.delta === 0

      if (isOverwrite || (isSibling && zeroDelta)) {
        overwrites.push({
          id: item.id.split('gid://shopify/InventoryItem/')[1],
          barcode: item.barcode,
          overwrite: item.overwrite,
        })
      } else {
        deltas.push({
          id: item.id.split('gid://shopify/InventoryItem/')[1],
          barcode: item.barcode,
          delta: item.delta,
        })
      }
    })

    try {
      await fetch(`${Constants.manifest.extra.SERVER_HOST}/api/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({
          location: state.locationId.split('gid://shopify/Location/')[1],
          deltas,
          overwrites,
        }),
      })
        .then((response) => response.json())
        .then(async (response) => {
          if (response.error) {
            setErrorMessage(response.error.message)
          }
          if (response.success && response.batch) {
            setBatch(response.batch)
            setPending(response.pending)
            checkBatchStatus(response.batch)
          }
        })
    } catch (err) {
      console.log(err)
    }
  }

  async function checkBatchStatus(batchId) {
    await fetch(`${Constants.manifest.extra.SERVER_HOST}/api/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({
        batchId,
      }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        if (response.pending === 0) {
          setPending(response.pending)
          setDone(response.done)
        } else {
          setPending(response.pending)
          setDone(response.done)
          setTimeout(async () => {
            return await checkBatchStatus(batchId)
          }, 1000)
        }
      })
  }

  async function handleSuccess() {
    Alert.alert(
      'CSV by Email?',
      `Do you want a CSV report sent by email?`,
      [
        {
          text: 'No',
          onPress: () => {
            clearInventory(false)
            clearScanned()
            updateShopify(false)
          },
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            fetch(`${Constants.manifest.extra.SERVER_HOST}/api/summary`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`,
              },
              body: JSON.stringify({
                batchId: batch,
                email: state.email,
              }),
            })
              .then((response) => response.json())
              .then((response) => {
                clearInventory(false)
                clearScanned()
                updateShopify(false)
              })
          },
        },
      ],
      { cancelable: false }
    )
  }

  function handleFailure() {
    updateShopify(false)
  }
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

const styles = StyleSheet.create({
  buttonContainer: {
    paddingTop: 30,
    paddingBottom: 15,
    paddingLeft: '10%',
    paddingRight: '10%',
  },
  contentContainer: {
    marginTop: -60,
    flexGrow: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
})
