import { ButtonGroup, CheckBox, Button } from 'react-native-elements'
import { MonoText } from '../components/StyledText'
import { RectButton, ScrollView } from 'react-native-gesture-handler'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, Text, View, Link, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../constants/Colors'
import React, { useState } from 'react'
import {
  prepareApplyListReducer,
  saveButtonIndexReducer,
  toggleIncludeSiblingsReducer,
  updateShopifyReducer,
} from '../redux/reducers'

export default function ApplyScreen() {
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const prepareApplyList = () => dispatch(prepareApplyListReducer())
  const saveButtonIndex = (index) => dispatch(saveButtonIndexReducer(index))
  const toggleIncludeSiblings = () => dispatch(toggleIncludeSiblingsReducer())
  const updateShopify = (status) => dispatch(updateShopifyReducer(status))

  const [buttonIndex, setButtonIndex] = useState(0)
  const [display, setDisplay] = useState(0)

  const buttons = ['Add', 'Subtract', 'Overwrite']

  const displayMap = {
    0: 'barcode',
    1: 'title',
    2: 'sku',
  }

  useFocusEffect(
    React.useCallback(() => {
      prepareApplyList()
    }, [])
  )

  return (
    <View style={styles.container}>
      <View style={{ padding: 12, backgroundColor: 'white' }}>
        <CheckBox
          right
          iconRight
          title="include related variants"
          checked={state.includeSiblings}
          onPress={() => handleIncludeSiblings()}
        />
        <ButtonGroup
          buttons={buttons}
          // onPress={setButtonIndex}
          selectedIndex={buttonIndex}
          onPress={(buttonIndex) => handleButtonGroup(buttonIndex)}
        ></ButtonGroup>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <NothingScanned />
        <BarcodeListGood />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title={'Update Shopify'} onPress={areYouSure} />
      </View>
    </View>
  )

  function handleButtonGroup(buttonIndex) {
    setButtonIndex(buttonIndex)
    saveButtonIndex(buttonIndex)
    prepareApplyList()
  }

  function handleIncludeSiblings() {
    toggleIncludeSiblings()
    prepareApplyList()
  }

  function NothingScanned() {
    if (state.scannedGoodTotal + state.scannedBadTotal === 0) {
      return (
        <RectButton style={[styles.option]}>
          <View style={[{ flexDirection: 'row' }, styles.badBorder]}>
            <View style={styles.optionTextContainer}>
              <View style={styles.barcode}>
                <Text style={[styles.optionLabel, styles.title]}>
                  Nothing Scanned
                </Text>
              </View>
            </View>
          </View>
        </RectButton>
      )
    } else return null
  }

  function BarcodeListGood() {
    if (state.applyList.length > 0) {
      return (
        <View>
          <CountHead label="barcode" count="new shopify value" />
          <BarcodeListGoodInner />
        </View>
      )
    }
    return null
  }

  function BarcodeListGoodInner() {
    return state.applyList.map((item) => {
      const barcode = item.barcode
      return (
        <CountItem
          key={barcode}
          item={state.inventory[barcode]}
          delta={item.delta}
          overwrite={item.overwrite}
          sibling={!!!state.scannedGood[barcode]}
        />
      )
    })
  }

  function toggleDisplay() {
    if (display < 2) setDisplay(display + 1)
    else setDisplay(0)
  }

  function CountItem({ isLastOption, item, delta, overwrite, sibling }) {
    const before = item && item.available
    const after = calculateAfter(before, delta, overwrite)

    return (
      <RectButton style={[styles.option, isLastOption && styles.lastOption]}>
        <View style={[{ flexDirection: 'row' }, styles.goodBorder]}>
          <View style={styles.optionTextContainer}>
            <View style={styles.barcode}>
              {display === 1 ? (
                <Text style={[styles.optionLabel, styles.title]}>
                  {item[displayMap[display]]}
                </Text>
              ) : (
                <MonoText style={[styles.optionLabel]}>
                  {item[displayMap[display]]}
                </MonoText>
              )}
            </View>
            {delta !== 0 && !sibling ? (
              <View style={styles.barcodeCount}>
                <Text style={styles.optionCountDelta}>
                  {delta > 0 ? '+' : ''}
                  {delta}
                </Text>
              </View>
            ) : (
              <View style={styles.barcodeCount}>
                <Text style={styles.optionCountDelta}></Text>
              </View>
            )}
            <View style={styles.barcodeCount}>
              <Text style={styles.optionCount}>{after}</Text>
            </View>
          </View>
        </View>
      </RectButton>
    )
  }

  function CountHead({ label, count }) {
    return (
      <RectButton onPress={toggleDisplay} style={[styles.option]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.optionTextContainer}>
            <View style={styles.barcode}>
              <Text style={styles.optionTitle}>
                <Text>{displayMap[display]}</Text>
              </Text>
            </View>
            <View>
              <MaterialIcons
                name="touch-app"
                size={24}
                color={Colors.lightGrey}
              />
            </View>
            <View style={styles.barcode}>
              <Text
                style={[
                  styles.optionCount,
                  { textDecorationLine: 'underline' },
                ]}
              >
                After
              </Text>
            </View>
          </View>
        </View>
      </RectButton>
    )
  }

  function areYouSure() {
    Alert.alert(
      'Are you sure?',
      'This action will update your inventory on Shopify and clear the scanned data from this app and cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'Update', onPress: () => updateShopify(true) },
      ],
      { cancelable: false }
    )
  }
}

const calculateAfter = (before, delta, overwrite) => {
  if (delta && delta !== 0) return before + delta
  return overwrite
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingTop: 15,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: '#ededed',
  },
  lastOption: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    fontSize: 15,
    marginTop: 1,
  },
  optionTitle: {
    fontSize: 15,
    marginTop: 1,
    textTransform: 'capitalize',
    textDecorationLine: 'underline',
  },

  optionCount: {
    fontSize: 15,
    marginTop: 1,
    textAlign: 'right',
  },
  optionCountDelta: {
    fontSize: 15,
    marginTop: 1,
    textAlign: 'right',
    color: Colors.tintColor,
  },
  optionTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  barcode: { flex: 26 },
  barcodeCount: { flex: 1, minWidth: 30 },
  goodBorder: {
    borderLeftColor: Colors.tintColor,
    borderLeftWidth: 4,
    paddingLeft: 8,
  },
  badBorder: {
    borderLeftColor: 'red',
    borderLeftWidth: 4,
    paddingLeft: 8,
  },
  title: {
    textTransform: 'capitalize',
  },
  buttonContainer: {
    marginTop: 14,
    marginBottom: 18,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
})
