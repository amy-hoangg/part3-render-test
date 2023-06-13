require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const Person = require('./models/person');
const mongoose = require('mongoose');

// Connect to the MongoDB database
const url = process.env.MONGODB_URI;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('build'));

app.get('/', (request, response) => {
  response.send('Welcome to the Phonebook API');
});

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(error => {
      console.log('Error fetching persons:', error.message);
      response.status(500).json({ error: 'Error fetching persons' });
    });
});

app.get('/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      const currentTime = new Date();
      const html = `
        <p>Phonebook has info for ${count} people</p>
        <p>${currentTime}</p>
      `;
      response.send(html);
    })
    .catch(error => {
      console.log('Error fetching count:', error.message);
      response.status(500).json({ error: 'Error fetching count' });
    });
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).json({ error: 'Person not found' });
      }
    })
    .catch(error => {
      if (error.name === 'CastError') {
        response.status(400).json({ error: 'Malformatted id' });
      } else {
        console.log('Error fetching person:', error.message);
        response.status(500).json({ error: 'Error fetching person' });
      }
    });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch(error => {
      if (error.name === 'CastError') {
        response.status(400).json({ error: 'Malformatted id' });
      } else {
        console.log('Error deleting person:', error.message);
        response.status(500).json({ error: 'Error deleting person' });
      }
    });
});

app.post('/api/persons', (request, response) => {
  const newPerson = request.body;

  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({ error: 'Name or number is missing' });
  }

  const person = new Person({
    name: newPerson.name,
    number: newPerson.number
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => {
      console.log('Error saving person:', error.message);
      response.status(500).json({ error: 'Error saving person' });
    });
});

// Error handler middleware
app.use((error, request, response, next) => {
  console.error(error); // Log the error for debugging purposes

  // Handle specific errors
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Malformatted id' });
  }

  // General error handling
  response.status(500).json({ error: 'Internal server error' });
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})