import Colors from '../constants/Colors'
import React, { useState, useEffect } from 'react'

import { ButtonGroup, CheckBox, Button } from 'react-native-elements'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import { MonoText } from '../components/StyledText'
import { RectButton, ScrollView } from 'react-native-gesture-handler'
import { sharedStyles } from '../constants/Styles'
import { StyleSheet, Text, View, Link, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import {
  prepareApplyListReducer,
  removeScannedItemReducer,
  saveButtonIndexReducer,
  toggleIncludeSiblingsReducer,
  updateDeltaReducer,
  updateShopifyReducer,
} from '../redux/reducers'

export default function ApplyScreen({ navigation }) {
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const prepareApplyList = () => dispatch(prepareApplyListReducer())
  const saveButtonIndex = (index) => dispatch(saveButtonIndexReducer(index))
  const toggleIncludeSiblings = () => dispatch(toggleIncludeSiblingsReducer())
  const updateShopify = (status) => dispatch(updateShopifyReducer(status))
  const removeScannedItem = (barcode) =>
    dispatch(removeScannedItemReducer(barcode))
  const updateDelta = (barcode, delta) => {
    dispatch(updateDeltaReducer(barcode, delta))
  }

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

  useEffect(() => {
    if (state.serverError) {
      navigation.navigate('ErrorScreen')
    } else if (!state.token) {
      navigation.navigate('AuthScreen')
    } else if (!state.locationName) {
      navigation.navigate('LocationScreen')
    } else if (!state.inventory) {
      navigation.navigate('InventoryScreen')
    } else if (state.updateShopify) {
      navigation.navigate('UpdateScreen')
    }
  })

  if (
    state.serverError ||
    !state.token ||
    !state.locationName ||
    !state.inventory ||
    state.updateShopify
  ) {
    return null
  }

  return (
    <View style={sharedStyles.lightContainer}>
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
        style={sharedStyles.lightContainer}
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
    const [adjust, setAdjust] = useState(null)
    return state.applyList.map((item) => {
      const barcode = item.barcode
      return (
        <CountItem
          key={barcode}
          item={state.inventory[barcode]}
          delta={item.delta}
          overwrite={item.overwrite}
          sibling={!state.scannedGood.hasOwnProperty(barcode)}
        />
      )
    })

    function CountItem({ isLastOption, item, delta, overwrite, sibling }) {
      const [adjustDelta, setAdjustDelta] = useState(0)

      const before = item && item.available
      let newDelta = delta + adjustDelta

      const after = calculateAfter(
        before,
        delta,
        newDelta,
        overwrite,
        buttonIndex,
        sibling
      )

      const Identifier = () => {
        return (
          <View style={[styles.barcode]}>
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
        )
      }

      if (adjust === item.barcode)
        return (
          <>
            <RectButton
              onPress={() => {
                setAdjustDelta(0)
                setAdjust(!adjust)
              }}
              style={[
                styles.option,
                isLastOption && styles.lastOption,
                styles.active,
              ]}
            >
              <View style={[{ flexDirection: 'row' }, styles.goodBorder]}>
                <View style={styles.optionTextContainer}>
                  <Identifier />
                  <CountPreview />
                </View>
              </View>
            </RectButton>

            <View style={[styles.optionAdjust, styles.actions]}>
              <View style={[{ flexDirection: 'row' }]}>
                <View style={styles.optionTextContainer}>
                  <Adjuster item={item} />
                </View>
              </View>
            </View>
          </>
        )

      return (
        <>
          <RectButton
            onPress={() => {
              setAdjust(item.barcode)
            }}
            style={[styles.option, isLastOption && styles.lastOption]}
          >
            <View
              style={[
                { flexDirection: 'row' },
                state.scannedGood.hasOwnProperty(item.barcode)
                  ? styles.goodBorder
                  : styles.siblingBorder,
              ]}
            >
              <View style={styles.optionTextContainer}>
                <Identifier />
                <CountPreview />
              </View>
            </View>
          </RectButton>
        </>
      )

      function CountPreview() {
        const formattedDelta = `${delta > 0 ? '+' : ''} ${delta}`
        const formattedNewDelta = `${newDelta > 0 ? '+' : ''} ${newDelta}`

        const displayDelta =
          formattedNewDelta !== 0 ? formattedNewDelta : formattedDelta

        return (
          <>
            {buttonIndex === 2 || (sibling && !newDelta) ? null : (
              <View style={styles.barcodeCount}>
                <Text style={styles.optionCount}>{before}</Text>
              </View>
            )}

            {buttonIndex === 2 || (sibling && !newDelta) ? null : (
              <View style={styles.barcodeCount}>
                <Text style={styles.optionCountDelta}>{displayDelta}</Text>
              </View>
            )}

            <View style={styles.barcodeCount}>
              {buttonIndex === 2 ? (
                <Text style={styles.optionCountDelta}>
                  {sibling ? newDelta : after}
                </Text>
              ) : (
                <Text
                  style={sibling ? styles.optionCountDelta : styles.optionCount}
                >
                  {sibling && overwrite !== 0 ? newDelta : after}
                </Text>
              )}
            </View>
          </>
        )
      }

      function Adjuster(item) {
        const notSibling = state.scannedGood.hasOwnProperty(item.item.barcode)
        return (
          <View style={styles.adjustHolder}>
            <View style={styles.adjust}>
              {notSibling && (
                <Button
                  onPress={() => deleteOrCancel(item.item.barcode)}
                  buttonStyle={[
                    styles.smallButton,
                    { backgroundColor: Colors.dullRed },
                  ]}
                  icon={
                    <AntDesign
                      name="delete"
                      size={16}
                      color={Colors.lightest}
                    />
                  }
                />
              )}
              <Button
                onPress={() => {
                  updateDelta(item.item.barcode, newDelta + overwrite)
                  setAdjustDelta(0)
                  prepareApplyList()
                  setAdjust(!adjust)
                }}
                buttonStyle={[
                  styles.smallButton,
                  notSibling && styles.buttonSpacing,
                  { backgroundColor: Colors.lightGreen },
                ]}
                title={'Save'}
              />
            </View>
            <View style={styles.adjustRight}>
              <Button
                onPress={() => {
                  switch (buttonIndex) {
                    case 0:
                      setAdjustDelta(
                        newDelta - 1 >= 0 ? adjustDelta - 1 : adjustDelta
                      )
                      break
                    case 1:
                      setAdjustDelta(
                        newDelta + 1 <= 0 ? adjustDelta + 1 : adjustDelta
                      )
                      break
                    case 2:
                      setAdjustDelta(
                        overwrite + newDelta - 1 >= 0
                          ? adjustDelta - 1
                          : adjustDelta
                      )
                  }
                }}
                buttonStyle={styles.smallButton}
                icon={
                  <AntDesign name="minus" size={16} color={Colors.lightest} />
                }
              />
              <Button
                onPress={() => {
                  switch (buttonIndex) {
                    case 0:
                      setAdjustDelta(adjustDelta + 1)
                      break
                    case 1:
                      setAdjustDelta(adjustDelta - 1)
                      break
                    case 2:
                      setAdjustDelta(adjustDelta + 1)
                      break
                  }
                }}
                buttonStyle={[styles.smallButton, styles.buttonSpacing]}
                icon={
                  <AntDesign name="plus" size={16} color={Colors.lightest} />
                }
              />
            </View>
          </View>
        )
      }
    }
  }

  function toggleDisplay() {
    if (display < 2) setDisplay(display + 1)
    else setDisplay(0)
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
            <View style={[styles.barcode, styles.row]}>
              <Text
                style={[
                  styles.optionCount,
                  { textDecorationLine: 'underline' },
                ]}
              >
                {buttonIndex === 2 ? null : 'Before'}
              </Text>
              <Text
                style={[
                  styles.optionCount,
                  { textDecorationLine: 'underline', marginLeft: 20 },
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

  function deleteOrCancel(barcode) {
    Alert.alert(
      'Are you sure?',
      `This will remove barcode ${barcode} from your scan history.`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            removeScannedItem(barcode)
            prepareApplyList()
          },
        },
      ],
      { cancelable: false }
    )
  }
}

const calculateAfter = (
  before,
  delta,
  adjustDelta,
  overwrite,
  buttonIndex,
  sibling
) => {
  if (buttonIndex === 2) {
    return overwrite + adjustDelta
  }
  if (sibling && adjustDelta === 0) return overwrite
  return before + adjustDelta
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: Colors.lightGrey,
  },
  actions: {
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.lightest,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  adjustHolder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adjust: { flex: 1, flexDirection: 'row' },
  adjustRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  smallButton: {
    paddingTop: 2,
    paddingBottom: 2,
    minWidth: 70,
    height: 50,
  },
  buttonSpacing: {
    marginLeft: 8,
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
  optionAdjust: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingBottom: 12,
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
    borderLeftColor: Colors.red,
    borderLeftWidth: 4,
    paddingLeft: 8,
  },
  siblingBorder: {
    borderLeftColor: Colors.middleLightGrey,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})
