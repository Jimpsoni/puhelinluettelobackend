// Connect to DB
const Person = require('./models/person')


// määritellään express
const express = require('express')
const app = express()

require('dotenv').config()

app.use(express.static('dist'))

const morgan = require('morgan')
const cors = require('cors')

// Middlewaret
app.use(express.json())
app.use(cors())

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

// Määritellään API kutsut
app.get('/api/persons', (req, res) => { 
  Person.find({}).then(person => {
  res.json(person) })
})


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
    
    if (!body.name || !body.number) return res.json({"error": "missing data, check that you have name and number"})

    const newPerson = new Person({
        "name": body.name,
        "number": body.number,
    })

    // Lisätään uusi henkilö yhteystietoihin
    newPerson.save().then(person => {
      res.json(person)
    })
})




// Käynnistetään serveri
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
