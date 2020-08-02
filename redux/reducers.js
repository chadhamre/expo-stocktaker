// Action Types
export const SAVE_AUTH = 'SAVE_AUTH'
export const SAVE_SERVER_ERROR = 'SAVE_SERVER_ERROR'
export const SAVE_LOCATION = 'SAVE_LOCATION'
export const SAVE_INVENTORY = 'SAVE_INVENTORY'
export const ADD_GOOD_SCAN = 'ADD_GOOD_SCAN'
export const ADD_BAD_SCAN = 'ADD_BAD_SCAN'
export const ADD_SIBLINGS = 'ADD_SIBLINGS'
export const PREPARE_APPLY_LIST = 'PREPARE_APPLY_LIST'
export const INCLUDE_SIBLINGS = 'INCLUDE_SIBLINGS'
export const SAVE_BUTTON_INDEX = 'SAVE_BUTTON_INDEX'
export const CLEAR_SIBLINGS = 'CLEAR_SIBLINGS'
export const CLEAR_INVENTORY = 'CLEAR_INVENTORY'
export const CLEAR_SCANNED = 'CLEAR_SCANNED'
export const CLEAR_LOCATION = 'CLEAR_LOCATION'
export const CLEAR_SERVER_ERROR = 'CLEAR_SERVER_ERROR'
export const UPDATE_SHOPIFY = 'UPDATE_SHOPIFY'
export const UPDATE_DELTA = 'UPDATE_DELTA'
export const LOGOUT = 'LOGOUT'

// Action Creators
export const saveAuthReducer = (response) => {
  return {
    type: SAVE_AUTH,
    response: response,
  }
}

export const saveServerErrorReducer = (error) => {
  return {
    type: SAVE_SERVER_ERROR,
    error,
  }
}

export const saveLocationReducer = (selection) => {
  return {
    type: SAVE_LOCATION,
    selection: selection,
  }
}

export const saveInventoryReducer = (inventory) => {
  return {
    type: SAVE_INVENTORY,
    inventory: inventory,
  }
}

export const saveGoodScanReducer = (barcode) => {
  return {
    type: ADD_GOOD_SCAN,
    barcode,
  }
}

export const saveBadScanReducer = (barcode) => {
  return {
    type: ADD_BAD_SCAN,
    barcode,
  }
}

export const addSiblingsReducer = (barcodes) => {
  return {
    type: ADD_SIBLINGS,
    barcodes,
  }
}

export const saveButtonIndexReducer = (buttonIndex) => {
  return {
    type: SAVE_BUTTON_INDEX,
    buttonIndex,
  }
}

export const prepareApplyListReducer = () => {
  return {
    type: PREPARE_APPLY_LIST,
  }
}

export const toggleIncludeSiblingsReducer = () => {
  return {
    type: INCLUDE_SIBLINGS,
  }
}

export const clearLocationReducer = () => {
  return {
    type: CLEAR_LOCATION,
  }
}

export const clearInventoryReducer = () => {
  return {
    type: CLEAR_INVENTORY,
  }
}

export const clearScannedReducer = () => {
  return {
    type: CLEAR_SCANNED,
  }
}

export const clearSiblingsReducer = () => {
  return {
    type: CLEAR_SIBLINGS,
  }
}

export const clearServerErrorReducer = () => {
  return {
    type: CLEAR_SERVER_ERROR,
  }
}

export const updateShopifyReducer = (status) => {
  return {
    type: UPDATE_SHOPIFY,
    status,
  }
}

export const updateDeltaReducer = (barcode, delta) => {
  return {
    type: UPDATE_DELTA,
    barcode,
    delta,
  }
}

export const logoutReducer = () => {
  return {
    type: LOGOUT,
  }
}

// Reducer
const initialState = {
  applyList: [],
  buttonIndex: 0,
  email: null,
  includeSiblings: false,
  inventory: null,
  locationId: null,
  locationName: null,
  scannedBad: {},
  scannedBadTotal: 0,
  scannedGood: {},
  scannedGoodTotal: 0,
  serverError: null,
  shop: null,
  siblings: {},
  token: null,
  updateShopify: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SAVE_AUTH:
      return {
        ...state,
        shop: action.response.shop.shop,
        email: action.response.shop.email,
        token: action.response.token,
      }

    case SAVE_LOCATION:
      return {
        ...state,
        locationName: action.selection.name,
        locationId: action.selection.id,
      }

    case SAVE_SERVER_ERROR:
      return {
        ...state,
        serverError: action.error,
      }

    case SAVE_INVENTORY:
      return {
        ...state,
        inventory: action.inventory,
      }

    case UPDATE_SHOPIFY:
      return {
        ...state,
        updateShopify: action.status,
      }

    case CLEAR_LOCATION:
      return {
        ...state,
        locationName: null,
        locationId: null,
        inventory: null,
      }

    case CLEAR_SCANNED:
      return {
        ...state,
        applyList: [],
        scannedGood: {},
        scannedGoodTotal: 0,
        scannedBad: {},
        scannedBadTotal: 0,
      }

    case CLEAR_INVENTORY:
      return {
        ...state,
        inventory: null,
      }

    case CLEAR_SIBLINGS:
      return {
        ...state,
        siblings: {},
      }

    case ADD_GOOD_SCAN:
      const newGoodState = {
        ...state,
        scannedGood: { ...state.scannedGood },
        scannedGoodTotal: state.scannedGoodTotal + 1,
      }

      if (
        newGoodState.scannedGood &&
        newGoodState.scannedGood[action.barcode]
      ) {
        newGoodState.scannedGood[action.barcode]++
      } else newGoodState.scannedGood[action.barcode] = 1

      return newGoodState

    case ADD_BAD_SCAN:
      const newBadState = {
        ...state,
        scannedBad: { ...state.scannedBad },
        scannedBadTotal: state.scannedBadTotal + 1,
      }

      if (newBadState.scannedBad && newBadState.scannedBad[action.barcode]) {
        newBadState.scannedBad[action.barcode]++
      } else newBadState.scannedBad[action.barcode] = 1

      return newBadState

    case PREPARE_APPLY_LIST:
      const barcodes = Object.keys(state.scannedGood)

      const siblings = []
      if (state.includeSiblings) {
        const products = barcodes.map(
          (barcode) => state.inventory[barcode].product
        )

        Object.keys(state.inventory).forEach((barcode) => {
          if (
            products.includes(state.inventory[barcode].product) &&
            !barcodes.includes(barcode)
          ) {
            siblings.push(barcode)
          }
        })
      }

      barcodes.push.apply(barcodes, siblings)

      const applyList = barcodes.map((barcode) => {
        const applyItem = state.inventory[barcode]

        if (state.buttonIndex === 0 && state.scannedGood[barcode] > 0) {
          applyItem.delta = state.scannedGood[barcode]
          applyItem.overwrite = 0
        } else if (state.buttonIndex === 1 && state.scannedGood[barcode] > 0) {
          applyItem.delta = -state.scannedGood[barcode]
          applyItem.overwrite = 0
        } else {
          applyItem.overwrite = state.scannedGood[barcode] ?? 0
          applyItem.delta = 0
        }
        return applyItem
      })

      applyList.sort((a, b) => {
        if (a.product === b.product) {
          return a.delta - a.delta
        }
        return a.product > b.product
      })

      return { ...state, applyList }

    case INCLUDE_SIBLINGS:
      return {
        ...state,
        includeSiblings: !state.includeSiblings,
      }

    case UPDATE_DELTA:
      const newGoodStateUpdated = {
        ...state,
        scannedGood: { ...state.scannedGood },
      }

      newGoodStateUpdated.scannedGood[action.barcode] = Math.abs(action.delta)

      return newGoodStateUpdated

    case SAVE_BUTTON_INDEX:
      return {
        ...state,
        buttonIndex: action.buttonIndex,
      }

    case CLEAR_SERVER_ERROR:
      return {
        ...state,
        serverError: null,
      }

    case LOGOUT:
      return initialState

    default:
      return state
  }
}
