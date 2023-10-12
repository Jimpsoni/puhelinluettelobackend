// Connect to DB
const Person = require('./models/person')

// määritellään express
const express = require('express')
const app = express()

require('dotenv').config()

app.use(express.static('dist'))
const cors = require('cors')

// Middlewaret
app.use(express.json())
app.use(cors())


const morgan = require('morgan')
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
app.get('/api/persons', (req, res, next) => { 
  Person.find({}).then(person => {
  res.json(person) })
  .catch(error => next(error))
})


// TODO
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id) // Etsitään ID

    if(person == undefined) {res.status(404).end()}
    else { res.json(person) }
})

// TODO
app.get('/info', (req, res) => {
    const message = `Phonebook has info for ${2} people`
    const time = new Date();
    console.log(time)
    res.send(`<p> ${message}</p> <p> ${time}</p>`)
}) 


app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
      .then( result => res.status(204).end() )
      .catch( error => next(error) )
})


app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    'name': body.name,
    'number': body.number
  }

  Person.findByIdAndUpdate(body.id, person, { new: true })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error))
})


app.post("/api/persons", (req, res, next) => {
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
    .catch(error => next(error))
})


// Error handler middleware
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ServerError') {
    return response.status(500).send({error: 'Internal Server error'})
  }

  next(error)
}

app.use(errorHandler)



// Käynnistetään serveri
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
