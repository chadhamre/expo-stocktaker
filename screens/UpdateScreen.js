import Constants from 'expo-constants'
import {
  updateShopifyReducer,
  clearScannedReducer,
  clearInventoryReducer,
} from '../redux/reducers'
import { MaterialIcons } from '@expo/vector-icons'
import { MonoText } from '../components/StyledText'
import { Spinner } from '../components/Spinner'
import { reloadAsync } from 'expo-updates'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect } from 'react'
import Colors from '../constants/Colors'
import { Button } from 'react-native-elements'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SegmentedControlIOSComponent,
} from 'react-native'

export default function InventoryScreen() {
  // redux
  const state = useSelector((state) => state)
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
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
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
                <Text style={styles.underline}>Failure</Text>
              )}
            </View>
          </View>

          <View style={styles.helpContainer}>
            {succeeded ? (
              <Text>{`${done} items updated on Shopify`}</Text>
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
    )
  }

  return (
    <Spinner
      labelTop={`Updating inventory on Shopify`}
      labelBottom={pending ? `${pending} remaining` : ''}
    />
  )

  async function updateInventory() {
    const deltas = []
    const overwrites = []
    state.applyList.forEach((item) => {
      if (item.delta !== 0) {
        deltas.push({
          id: item.id.split('gid://shopify/InventoryItem/')[1],
          barcode: item.barcode,
          delta: item.delta,
        })
      } else {
        overwrites.push({
          id: item.id.split('gid://shopify/InventoryItem/')[1],
          barcode: item.barcode,
          overwrite: item.overwrite,
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
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: '15%',
    paddingRight: '15%',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
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
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: Colors.tintColor,
  },
})
