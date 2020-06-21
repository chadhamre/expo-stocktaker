import Constants from 'expo-constants'
import { saveLocationReducer, saveServerErrorReducer } from '../redux/reducers'
import { MonoText } from '../components/StyledText'
import { reloadAsync } from 'expo-updates'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector, useDispatch } from 'react-redux'
import { Spinner } from '../components/Spinner'
import React, { useState, useEffect } from 'react'
import { Button } from 'react-native-elements'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Colors from '../constants/Colors'

export default function LocationScreen() {
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
        <View style={styles.buttonContainer} key={item.id}>
          <Button title={item.name} onPress={() => saveLocation(item)} />
        </View>
      )
    })
  }

  if (locationList) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.helpContainer}>
            <Text>Select Location</Text>
          </View>
          <View style={styles.actionContainer}>
            <LocationList locations={locationList} />
          </View>
        </ScrollView>
      </View>
    )
  } else return <Spinner />
}

const styles = StyleSheet.create({
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
  buttonContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: '15%',
    paddingRight: '15%',
  },
  actionContainer: {
    paddingTop: 40,
  },
})
