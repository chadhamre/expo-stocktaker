import { Button } from 'react-native-elements'
import { TitleText } from '../components/StyledText'
import { reloadAsync } from 'expo-updates'
import { saveLocationReducer, saveServerErrorReducer } from '../redux/reducers'
import { ScrollView } from 'react-native-gesture-handler'
import { sharedStyles } from '../constants/Styles'
import { SpinnerScreen } from '../components/SpinnerScreen'
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../constants/Colors'
import Constants from 'expo-constants'
import React, { useState, useEffect } from 'react'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function LocationScreen({ navigation }) {
  // redux
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const saveLocation = (response) => dispatch(saveLocationReducer(response))
  const saveServerError = (response) =>
    dispatch(saveServerErrorReducer(response))

  const [locationList, setLocationList] = useState(null)

  useEffect(() => {
    ;(async () => {
      await fetch(`${Constants.manifest.extra.SERVER_HOST}/api/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.error && response.error.type === 'BAD_TOKEN') {
            saveServerError(response.error.message)
          } else {
            setLocationList(response)
          }
        })
        .catch((err) => console.log(err))
    })()
  }, [])

  const LocationList = (props) => {
    return props.locations.map((item) => {
      return (
        <View style={sharedStyles.buttonContainer} key={item.id}>
          <Button title={item.name} onPress={() => saveLocation(item)} />
        </View>
      )
    })
  }

  if (locationList) {
    return (
      <View style={sharedStyles.outerRoundedContainer}>
        <View style={sharedStyles.innerRoundedContainer}>
          <View style={styles.container}>
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.contentContainer}
            >
              <View style={styles.helpContainer}>
                <TitleText>Select Location</TitleText>
              </View>
              <View style={styles.actionContainer}>
                <LocationList locations={locationList} />
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    )
  } else return <SpinnerScreen />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    marginTop: -60,
    flexGrow: 1,
    justifyContent: 'center',
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  actionContainer: {
    paddingTop: 20,
  },
})
