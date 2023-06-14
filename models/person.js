const mongoose = require("mongoose")

// Set "strictQuery" option to false
mongoose.set("strictQuery", false)

// Get the MongoDB URI from environment variables
const url = process.env.MONGODB_URI

// Log the URL to which the application is connecting
console.log("connecting to", url)

mongoose.connect(url)
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch(error => {
    console.log("error connecting to MongoDB:", error.message)
  })


// Define the schema for the "Person" collection
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^\d{2,3}-\d+$/.test(value)
      },
      message: "Invalid phone number format",
    },
  },
})


// Configure the "toJSON" option for the schema
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// Export the Person model based on the schema
module.exports = mongoose.model("Person", personSchema)
