// määritellään express
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

// Middlewaret
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', function (req, res) { if (req.method == "POST") {return JSON.stringify(req.body)} })

app.use(
    morgan(function (tokens, req, res) {
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'), '-',
          tokens['response-time'](req, res), 'ms',
          tokens.data(req, res)
        ].join(' ')
      })

)


// Määritellään yhteystiedot
let persons = [
      {
        "name": "Arto Hellas",
        "number": "321",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      },
      {
        "name": "Peppi",
        "number": "123",
        "id": 5
      }
]


// funktio joka luo uuden ID:n
const generateID = () => Math.floor(Math.random() * 1000)


// Määritellään API kutsut
app.get('/api/persons', (req, res) => { res.json(persons) })

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id) // Etsitään ID

    if(person == undefined) {res.status(404).end()}
    else { res.json(person) }
})

app.get('/info', (req, res) => {
    const message = `Phonebook has info for ${persons.length} people`
    const time = new Date();
    console.log(time)
    res.send(`<p> ${message}</p> <p> ${time}</p>`)
}) 

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    persons = persons.filter(person => person.id != id)
    res.status(204).end()
})

app.post("/api/persons", (req, res) => {
    const body = req.body
    const nameExists = persons.find(person => person.name == body.name)
    
    if (nameExists) return res.json({"error": "Person with that name already exists"})
    if (!body.name || !body.number) return res.json({"error": "missing data, check that you have name and number"})

    const newPerson = {
        "name": body.name,
        "number": body.number,
        "id": generateID()
    }

    // Lisätään uusi henkilö yhteystietoihin
    persons = persons.concat(newPerson)
    res.status(200).end()
})


// Käynnistetään serveri
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
