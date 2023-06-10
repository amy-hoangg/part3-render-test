const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json()) //dung json parser
app.use(morgan('tiny'))
app.use(express.static('build'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    { 
        "id": 5,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]
app.get('/', (request, response) => {
  response.send('Welcome to the Phonebook API'); // Update with your desired message or HTML content
});

app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

app.get('/info', (request, response) => {
    const currentTime = new Date()
    const numberOfEntries = persons.length // o day sao lai dung duoc cai phone book nhi

    const html = `
    <p>Phonebook has info for ${numberOfEntries} people</p>
    <p>${currentTime}</p>`

    response.send(html)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person) 
    {
        response.json(person)
    }
    else 
    {
        response.status(404).send('Person not found')
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const new_person = request.body
    if(!new_person.name || !new_person.number)
    {
        return response.status(400).json({error: 'Name or number is missing'})
    }

    const nameExists = persons.some(person => person.name === new_person.name)
    if (nameExists) {
        return response.status(400).json({ error: 'Name must be unique' })
    }

    const newPersonObject = {
        id: Math.floor(Math.random() * 10000) +1,
        name: new_person.name,
        number: new_person.number
    }

    persons= persons.concat(newPersonObject)

    response.json(newPersonObject)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})