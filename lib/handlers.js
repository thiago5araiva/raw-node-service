/**
 * Request handlers
 *
 *
 */

/*** Dependencies ***/
const _data = require("./data")
const helpers = require("./helpers")
/*** Define the handlers ***/
const handlers = {}

/*** Ping handler ***/
handlers.ping = function (data, callback) {
  callback(200)
}

/*** Users handler ***/
handlers.users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"]
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._user[data.method](data, callback)
  } else {
    callback(405)
  }
}

/*** Container for users submethods ***/
handlers._user = {}

/*** User /GET/ POST / PUT / DELETE ***/
handlers._user.get = (data, callback) => {
  /*** Check that phone number is valid */
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false
  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        /*** Remove the hashed password */
        delete data.hashedPassword
        callback(200, data)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { Error: "Missing required field" })
  }
}
handlers._user.post = (data, callback) => {
  /*** required fields: firstname, lastname, phone, password, tosAgreement ****/
  /*** optional fields: none ****/
  /*** check all required fields ***/
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 10
      ? data.payload.password.trim()
      : false
  const tosAgreement =
    typeof data.payload.tosAgreement === "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false
  if (firstName && lastName && phone && password && tosAgreement) {
    /*** Make sure that user doesnt already exist ***/
    console.log("payload is correct")
    _data.read("users", phone, (err, data) => {
      if (err) {
        /*** Hash the password ***/
        console.clear()
        console.log(password)
        const hashedPassword = helpers.hash(password)
        /*** Create the user object */
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true,
          }
          /*** Store the user ***/
          _data.create("users", phone, userObject, (err) => {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { error: "Could not create the new user" })
            }
          })
        } else {
          callback(500, { error: "Could not hash the user's password" })
        }
      } else {
        /*** User already existis ***/
        callback(400, {
          error: "A user with thate phone number already exists",
        })
      }
    })
  } else {
    callback(400, { Error: "Missing required fields" })
  }
}

handlers._user.put = (data, callback) => {
  //Check for the required field
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false
  //Check for the optional fields
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 10
      ? data.payload.password.trim()
      : false

  //error if the phone is invalid
  if (phone) {
    if (firstName || lastName || password) {
      //look up the user
      _data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          //Update the fields necessary
          if (firstName) userData.firstName = firstName
          if (lastName) userData.lastName = lastName
          if (password) userData.hashedPassword = helpers.hash(password)
          //Store the new updates
          _data.update("users", phone, userData, (err) => {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { Error: "Could not update the user" })
            }
          })
        } else {
          callback(400, { Error: "The specified user does not exist" })
        }
      })
    } else {
      callback(400, { Error: "Missing fields to update" })
    }
  } else {
    callback(400, { Error: "Missing required field" })
  }
}
handlers._user.delete = (data, callback) => {
  /*** Check that phone number is valid */
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false
  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        _data.delete("users", phone, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { Error: "Could not delete the specified user" })
          }
        })
      } else {
        callback(404, { Error: "Could not find the specified user" })
      }
    })
  } else {
    callback(400, { Error: "Missing required field" })
  }
}
/***  ***/

/*** Not found handler */
handlers.notFound = (data, callback) => {
  callback(404)
}

/*** Export handlers ***/
module.exports = handlers
