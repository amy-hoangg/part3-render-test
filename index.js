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


// Create a token function for morgan to log request data
morgan.token('postData', (req, res) => {
  if (req.method === 'POST') {
    console.log('Custom token function called');
    console.log('Request body:', req.body);
    return JSON.stringify(req.body);
  }
  return null;
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :postData')
);

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

app.post('/api/persons', (request, response, next) => {
  const newPerson = request.body;

  if (!newPerson.name || newPerson.name.length < 3 || !newPerson.number) {
    return response.status(400).json({ error: 'Name must be at least three characters long and number is required' });
  }

  Person.findOne({ name: newPerson.name })
    .then(person => {
      if (person) {
        // Person already exists, update their number
        person.number = newPerson.number;

        person.save()
          .then(updatedPerson => {
            response.json(updatedPerson);
          })
          .catch(error => {
            console.log('Error updating person:', error.message);
            next(error);
          });
      } 
      else {
        // Person doesn't exist, create a new entry
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
            next(error);
          });
      }
    })
    .catch(error => {
      console.log('Error checking person:', error.message);
      next(error);
    });
});


app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const updatedPerson = request.body;

  Person.findByIdAndUpdate(id, updatedPerson, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).json({ error: 'Person not found' });
      }
    })
    .catch(error => {
      if (error.name === 'CastError') {
        response.status(400).json({ error: 'Malformatted id' });
      } else {
        console.log('Error updating person:', error.message);
        response.status(500).json({ error: 'Error updating person' });
      }
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