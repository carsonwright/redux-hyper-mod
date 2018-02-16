const { createStore, combineReducers } = require("redux")
const Immutable = require("immutable")

module.exports = (__store)=>{
  const modules = {};
  let actionHistory = Immutable.List();
  const events = [];
  const remaps = []


  const getName = (type)=>(
    type.slice(0, type.indexOf("."))
  )

  const getType = (type)=>(
    type.slice(type.indexOf(".") + 1, type.length)
  )


  const _store = Object.keys(__store).reduce((acc, name)=>{
    let initialState = __store[name](undefined, ["initialize"])
    if(initialState === undefined){
      console.error(`You must return a valid response for the initialize type for ${name}`)
    }else{
      initialState = Immutable.fromJS(initialState)
    }

    if(__store[name](undefined, []) !== undefined){
      console.error(`Your reducer MUST return undefined if given an invalid action type! ${name}`)
    }

    acc[name] = (state, action)=>{
      const actionName = getName(action.type)
      const actionType = name == actionName ? getType(action.type) : null
      const {payload} = action

      const value = __store[name](state, [actionType, action.type], payload, action)

      if(value){
        return value
      }else{
        if(name == actionName){
          console.warn(`Module ${actionName} does not respond ${actionType}`)
        }
        if(state == undefined){
          return initialState;
        }else{
          return state
        }
      }
    }

    return acc
  }, {})

  const combined = combineReducers(_store)

  Object.keys(_store).forEach((name)=>{
    modules[name] = {
      dispatch: (type, payload)=>{
        response.dispatch({
          type: `${name}.${type}`,
          payload: Immutable.fromJS(payload)
        })
      }
    }
  })

  const devtools = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

  let store;

  if(devtools){
    store = createStore(
        combined,
        typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
  }else{
    store = createStore(
      combined
    );
  }


  store.subscribe(()=>{
    const state = store.getState()
  })

  const remapState = (_remap)=>{
    remaps.push(_remap)
  }

  const getState = (value)=>{
    const state = store.getState()
    if(value === false){
      return state
    }else{
      return remaps.reduce((acc, reducer)=>(
        reducer(acc)
      ), state)
    }
  }

  const dispatch = (action)=>{
    const errors = []
    const name = getName(action.type)
    const actionType = getType(action.type)
    if(modules[name] === undefined){
      errors.push(`Module ${name} does not exist`)
    }
    
    actionHistory = actionHistory.push(action)
    
    if(!action.payload){
      errors.push("Action must have a payload")
    }

    if(errors.length == 0){
      store.dispatch(action)
      events.forEach((callback)=>{
        callback(action)
      })
    }else{
      console.error(errors.join(". "))
    }
  }
  
  const subscribe = (callback)=>{
    events.push(callback)
  }

  const getActionHistory = ()=>(actionHistory)
  const response = {
    remapState,
    getState,
    dispatch,
    getActionHistory,
    subscribe,
    modules
  }
  
  Object.keys(store).forEach((key)=>{
    if(typeof key == "function" && !["dispatch", "getState", "subscribe"].includes(key)){
      response[key] = ()=>{
        response[key](...arguments)
      }
    }
  })

  return response
}
