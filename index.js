/*
 * Primary file for the api
 *
 * *
 */

//Dependencies
const http = require("http")
const https = require("https")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder
const config = require("./lib/config")
const fs = require("fs")
// const _data = require("./lib/data.js")
const handlers = require("./lib/handlers")
const helpers = require("./lib/helpers")

//testing
// @TODO delete this
/**
 * create a file
 * _data.create("test", "newfile", { foo: "bar" }, (err) => {
 * console.log("this was the error", err)
 * })
 */

/**
 * read a file
 * _data.read("test", "newfile1", (err, data) => {
 * console.log("this was the error", err, "and this was the data ", data)
 * })
 * */

/**
 * _data.update("test", "newfile", { fizz: "buzz" }, (err) => {
 * console.log("this was the error", err)
 * })
 */

/**
 * _data.delete("test", "newfile", (err) => {
 * console.log("this was the error", err)
 * })
 */

/*** Instantiate the http server ***/
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res)
})

/*** start the server ***/
httpServer.listen(config.httpPort, () => {
  console.log(
    `The server is listening on port ${config.httpPort} in ${config.envName} now`
  )
})

/*** instatiate the https server ***/
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res)
})

/*** start the https server ***/
httpsServer.listen(config.httpsPort, () => {
  console.log(
    `The server is listening on port ${config.httpsPort} in ${config.envName} now`
  )
})

/*** All the server logic for both the http and https server ***/
const unifiedServer = function (req, res) {
  /*** Get the url and parse it ***/
  const parsedUrl = url.parse(req.url, true)
  /*** Get the path ***/
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, "")
  /*** Get the query string as an object ***/
  const queryStringObject = parsedUrl.query
  /*** Get the http method ***/
  const method = req.method.toLowerCase()
  /*** Get the headers as an object ***/
  const headers = req.headers

  /*** Get the payload, if any ***/
  const decoder = new StringDecoder("utf-8")
  let buffer = ""
  req.on("data", (data) => (buffer += decoder.write(data)))
  req.on("end", () => {
    buffer += decoder.end()
    /*** Choose the handler this request should go to. If one is not found, use the not found handler ***/

    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound
    /***  ***/

    /*** Construct the data object to send to the handler ***/
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    }
    /***  ***/

    /*** Route the request to the handler specified in the router ***/
    chosenHandler(data, (statusCode, payload) => {
      /*** Use the status code called back by the handler, or default to 200 ***/
      statusCode = typeof statusCode === "number" ? statusCode : 200
      /***  ***/

      /*** Use the payload called back by the handler, or default to an empty object ***/
      payload = typeof payload === "object" ? payload : {}
      /***  ***/

      /*** Convert the payload to a string ***/
      const payloadString = JSON.stringify(payload)
      /***  ***/

      /*** Return response ***/
      res.setHeader("Content-Type", "application/json")
      res.writeHead(statusCode)
      res.end(payloadString)
      console.log("Returning this response : ", statusCode, payloadString)
      /***  ***/
    })
    /***  ***/
  })
}

/*** Define router */
const router = {
  ping: handlers.ping,
  users: handlers.users,
}
