# Redux Hyper Mod
## A simplified modular approach to reducers
This library is designed to create a more simplified standard for redux reducers.

# Warning Immutable by Default!
All payloads and reducer responses are converted to immutable objects. You can force a non immutable state by returning a non immutable object with an action triggered after initialization. This however is not a good practice, the immutable state prevents your data from becoming malformed during use in different areas and makes key based access easier and faster.

## Using Redux Modules
```javascript
import Modules from 'redux-modules'
import yourModules from './modules'

const store = Modules(yourModules)
```

## Modules (Reducers)
Reducers are a little different with redux modules because it is assumed you are targetting a specific module, and you are following the payload scheme.
### Basic Usage
#### Rules
1. Your reducer must respond to the "initialize" type with a valid response (not undefined).
2. Your reducer must respond with undefined when given an invalid action.

### INVALID Example
```javascript
const Say = (state="THIS IS BAD", [type], payload)=>{
  ...
})
```

### VALID Example
```javascript
const Say = (state, [type], payload)=>{
  switch(type){
    case "HELLO":
      return `Hello ${payload}`
    case "GOODBYE":
      return `Goodbye ${payload}`
    case "INITIALIZE":
      return ""
  }
}
```

### Remote Module Usage
Action Types are scoped by default to your module / reducer but you can catch other reducer's events by using the remoteType.
(not undefined)
```javascript
const Say = (state, [type, remoteType], payload)=>{
  switch(type){
    case "HELLO":
      return `Hello ${payload}`
    case "GOODBYE":
      return `Goodbye ${payload}`
    case "INITIALIZE":
      return ""
    case "TWEETS.CREATE":
      return `Welcome to twitter ${payload.get("firstName")}`
  }
}
```

## Using Modules reMap
You can create a shortcut from store data purely for the purpose of reading via the reMap function.
```javascript
store.reMap((state)=>(
  state.set("CurrentTweets", state.Tweets.get(state.CurrentTwitterID))
))
```


## Using a Module to dispatch action
You can dispatch an action via a module and circumvent the longhand "Say.HELLO" with the following.

### Module Dispatch
```javascript
const {Say} = store.Modules
Say.dispatch("HELLO", "Carson")
```

### Global Dispatch Equivelant
```javascript
store.dispatch({type: "Say.HELLO", payload: "Carson"})
```




# Immutable
### Reducer Example:
```javascript
const UsersReducer = (state, [type], payload)=>{
  switch(type){
    case "CREATE":
      return Users.set(payload.get("id"), payload)
    case "UPDATE_EMAIL":
      return Users.setIn([payload.get("id"), "email"], payload.get("email"))
    case "INITIALIZE":
      return {}
  }
}
```


### Module Usage Example:
#### Note that you do not have to give the dispatcher an immutable object instead it will convert the object when you pass it in.
```javascript
const {Users} = store.Modules
Users.dispatch("CREATE", {
  id: "some uuid",
  firstName: "John",
  lastName: "doe",
  email: "john@example.com"
})
```
