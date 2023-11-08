// Create and export configuration variables

const ENVIROMENTS = {}

//Stats for the current enviroment
ENVIROMENTS.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsASecret",
}

ENVIROMENTS.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsAlsoSecret",
}
//Determine which enviroment was passed as a command-line argument
const currentEnviroment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase()
    : ""
//Check that the current enviroment is one of the enviroments above, if not, default to staging
const enviromentToExport =
  typeof ENVIROMENTS[currentEnviroment] === "object"
    ? ENVIROMENTS[currentEnviroment]
    : ENVIROMENTS.staging

//Export the module
module.exports = enviromentToExport
