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


app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id

    Person.findById(id)
      .then( result => res.status(200).send(result))
      .catch( error => next(error) )
})


app.get('/api/persons/ping', (req, res, next) => {
    res.status(200).send('pong'))
})


app.get('/info', (req, res, next) => {
    Person.countDocuments({})
    .then(
      result => {
        const message = `Phonebook has info for ${result} people`
        const time = new Date();
        res.send(`<p> ${message}</p> <p> ${time}</p>`)
      }
    )
    .catch( error => next(error))
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

  Person.findByIdAndUpdate(body.id, person, { 
    new: true,
    runValidators: true, 
    context: 'query'
  })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error))
})


app.post("/api/persons", (req, res, next) => {
    const body = req.body
    
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

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)



// Käynnistetään serveri
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
