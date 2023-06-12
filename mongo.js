const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Give password as an argument.');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://amyishere0602:${password}@cluster0.glogh2t.mongodb.net/mydatabase?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  // Fetch all persons from the database and print them
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  // Create a new person and save it to the database
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({
    name,
    number,
  });

  person.save().then((result) => {
    console.log(`Added ${result.name} number ${result.number} to phonebook.`);
    mongoose.connection.close();
  });
}
