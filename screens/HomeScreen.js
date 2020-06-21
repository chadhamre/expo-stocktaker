import { ScrollView } from 'react-native-gesture-handler'
import { Spinner } from '../components/Spinner'
import { useSelector, useDispatch } from 'react-redux'
import * as React from 'react'
import Colors from '../constants/Colors'
import { Button } from 'react-native-elements'
import {
  clearLocationReducer,
  clearInventoryReducer,
  clearScannedReducer,
  logoutReducer,
} from '../redux/reducers'
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function HomeScreen() {
  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const logout = response => dispatch(logoutReducer(response))
  const clearLocation = () => dispatch(clearLocationReducer())
  const clearScanned = () => dispatch(clearScannedReducer())
  const clearInventory = () => dispatch(clearInventoryReducer())

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.welcomeContainer}>
          <Image
            source={require('../assets/images/shopify.png')}
            style={styles.welcomeImage}
          />
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.shopName}>{state.shop}</Text>
        </View>

        <View style={styles.helpContainer}>
          <Text>
            location: <Text style={styles.pill}>{state.locationName}</Text>
          </Text>
        </View>

        <View style={styles.helpContainer}>
          <Text>
            barcodes:{' '}
            <Text style={styles.pill}>
              {Object.keys(state.inventory).length.toLocaleString()}
            </Text>
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.buttonContainer}>
            <Button
              title={`Change Location`}
              onPress={() => areYouSure(clearLocation)}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={`Update Barcodes`}
              onPress={() => areYouSure(clearInventory)}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={`Clear Scanned`}
              onPress={() => areYouSure(clearScanned)}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button title={`Logout`} onPress={() => areYouSure(logout)} />
          </View>
        </View>
      </ScrollView>
    </View>
  )

  function areYouSure(callBack) {
    Alert.alert(
      'Are you sure?',
      'This action will clear the app of any barcodes you have already scanned.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'YES', onPress: callBack },
      ],
      { cancelable: false }
    )
  }
}

HomeScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionContainer: {
    paddingTop: 60,
  },
  pill: {
    textTransform: 'lowercase',
    fontWeight: 'bold',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
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
})
