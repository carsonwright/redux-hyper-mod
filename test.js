/*
 * SETUP
 */
const ReduxHyperMod = require("./index")

const messages = (state, [type], payload)=>{
  switch(type){
    case "say":
      return state.unshift(payload)
    case "takeBack":
      return state.filter((message)=> message !== payload)
    case "initialize":
      return []
  }
}

const currentMessageID = (state, [type], payload)=>{
  switch(type){
    case "set":
      return payload
    case "initialize":
      return 0
  }
}

const remoteType = (state, [type, remoteType], payload)=>{
  if(type === "initialize"){
    return 0
  }

  if(remoteType === "messages.say"){
    return state + 1
  }
}

_store = {
  messages,
  currentMessageID,
  remoteType
}


const store = ReduxModules(_store)
const {modules} = store

store.remapState((state)=>{
  state = {...state}
  state.currentMessage = state.messages.get(state.currentMessageID)
  return state
})

let errors = []

/*
 * TESTS
 */

const action = {
  type: "messages.say",
  payload: "Hello"
}

store.dispatch(action)

test = "Global action should Dispatch"
if(store.getState().messages.get(0) !== "Hello"){
  errors.push(test)
  console.log(`${test} - failed`)
}else{
  console.log(`${test} - passed`)
}

modules.messages.dispatch("say", "Goodbye")


test = "Module action should Dispatch"
if(store.getState().messages.get(0) !== "Goodbye"){
  errors.push(test)
  console.log(`${test} - failed`)
}else{
  console.log(`${test} - passed`)
}

test = "Action should be placed in actions"
if(store.getActionHistory().get(0) !== action){
  errors.push(test)
  console.log(`${test} - failed`)
}else{
  console.log(`${test} - passed`)
}


test = "reMap should return Goodbye before change message id"

if(store.getState().currentMessage !== "Goodbye" ){
  errors.push(test)
  console.log(`${test} - failed`)
}else{
  console.log(`${test} - passed`)
}

modules.currentMessageID.dispatch("set", 1)

test = "reMap should return Hello after change message id"
if(store.getState().currentMessage !== "Hello" ){
  errors.push(test)
  console.log(`${test} - failed`)
}else{
  console.log(`${test} - passed`)
}

test = "remoteType should return 2"
if(store.getState().remoteType !== 2 ){
  errors.push(test)
  console.log(`${test} - failed`)
}else{
  console.log(`${test} - passed`)
}

test = "Subscribe should work"
let good = false
store.subscribe((action)=>{
  if(action.type === "messages.say"){
    good = true
  }  
})
store.dispatch({type: "messages.say", payload: "yes!"})

if(!good){
  errors.push(test)
  console.log(`${test} - failed`)
}else{
  console.log(`${test} - passed`)
}

if(errors.length !== 0){
  console.error(`${errors.join(". ")}`)
  throw false;
}else{
  console.log("ALL TESTS PASSED")
}