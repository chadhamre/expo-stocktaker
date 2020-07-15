import * as React from 'react'
import Colors from '../constants/Colors'

import { Button } from 'react-native-elements'
import { MaterialIcons } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler'
import { sharedStyles } from '../constants/Styles'
import { SpinnerScreen } from '../components/SpinnerScreen'
import { useSelector, useDispatch } from 'react-redux'
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

export default function HomeScreen({ navigation }) {
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const logout = (response) => dispatch(logoutReducer(response))
  const clearLocation = () => dispatch(clearLocationReducer())
  const clearScanned = () => dispatch(clearScannedReducer())
  const clearInventory = () => dispatch(clearInventoryReducer())

  if (state.serverError) {
    navigation.navigate('ErrorScreen')
    return <SpinnerScreen />
  } else if (!state.token) {
    navigation.navigate('AuthScreen')
    return <SpinnerScreen />
  } else if (!state.locationName) {
    navigation.navigate('LocationScreen')
    return <SpinnerScreen />
  } else if (!state.inventory) {
    navigation.navigate('InventoryScreen')
    return <SpinnerScreen />
  } else if (state.updateShopify) {
    navigation.navigate('UpdateScreen')
    return <SpinnerScreen />
  }

  return (
    <View style={sharedStyles.lightContainer}>
      <ScrollView
        style={sharedStyles.lightContainer}
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
              buttonStyle={{
                backgroundColor: Colors.lightGreen,
              }}
              icon={
                <MaterialIcons
                  style={{ marginRight: 8 }}
                  name="camera-alt"
                  size={24}
                  color="white"
                />
              }
              title={`Scan Barcodes`}
              onPress={() => navigation.jumpTo('Scan')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={`Change Location`}
              onPress={() => areYouSure(clearLocation, 'Change Location')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={`Refresh Shopify Data`}
              onPress={() => areYouSure(clearInventory, 'Refresh Data')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              type="outline"
              title={`Clear Scanned`}
              onPress={() => areYouSure(clearScanned, 'Clear Data')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              type="outline"
              title={`Logout`}
              onPress={() => areYouSure(logout, 'Logout')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )

  function areYouSure(callBack, confirm) {
    Alert.alert(
      'Are you sure?',
      'This action will clear the app of any barcodes you have already scanned.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: confirm, onPress: callBack },
      ],
      { cancelable: false }
    )
  }
}

HomeScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionContainer: {
    paddingTop: 40,
  },
  pill: {
    textTransform: 'lowercase',
    fontWeight: 'bold',
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
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  buttonContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: '10%',
    paddingRight: '10%',
  },
})
