import express from 'express'
import { scrypt, randomBytes, randomUUID } from 'node:crypto'

const app = express()

const users = [{
	username: 'admin',
	name: 'Gustavo Alfredo Marín Sáez',
	password: '1b6ce880ac388eb7fcb6bcaf95e20083:341dfbbe86013c940c8e898b437aa82fe575876f2946a2ad744a0c51501c7dfe6d7e5a31c58d2adc7a7dc4b87927594275ca235276accc9f628697a4c00b4e01' // certamen123
}]
const todos = []

app.use(express.static('public'))

// Su código debe ir aquí...

app.use(express.json())
const validTk = (req, res, next) => {
	const tkFind = users.find((e) => e.token === req.headers['x-authorization'])
	if (tkFind === undefined) return res.sendStatus(401)
	next()
}

app.get('/api', (req, res) => {
	return res.status(200).send('Hello World!')
});

app.post('/api/login', (req, res) => {
	if (req.body.username === '' || req.body.password === '') return res.sendStatus(400)
	const usIdx = users.findIndex(e => e.username === req.body.username)
	if (usIdx === -1) return res.sendStatus(401)
	const [salt, key] = users[usIdx].password.split(':')
	const token = randomBytes(48).toString('hex')
	scrypt(req.body.password, salt, 64, (err, derivedkey) => {
		if (key !== derivedkey.toString('hex')) return res.sendStatus(401)
		users[usIdx].token = token
		delete users[usIdx].password
		return res.status(200).send(users[usIdx])
	})
})

app.get('/api/todos', validTk, (req, res) => {
	return res.status(200).send(todos)
})

app.get('/api/todos/:id', validTk, (req, res) => {
	const elFind = todos.find(e => e.id === req.params.id)
	if (elFind === undefined) return res.sendStatus(404)
	return res.status(200).send(elementFind)
})

app.post('/api/todos', validTk, (req, res) => {
	if (req.body.title === undefined) return res.sendStatus(400)
	const newTd = {}
	newTd.id = randomUUID()
	newTd.title = req.body.title,
		newTd.completed = false,
		todos.push(newTd)
	return res.status(201).send(newTd)
})

app.put('/api/todos/:id', validTk, (req, res) => {
	if (req.params.id === undefined) return
	const elFind = todos.find(e => e.id === req.params.id);
	if (elFind === undefined) return res.sendStatus(404)
	if (req.body.title === undefined) return res.sendStatus(404)
	if (req.body.completed === undefined) return res.sendStatus(404)
	if (req.body.title !== undefined) return res.status(200).send(elFind.title = req.body.title)
	if (req.body.completed === true) return res.status(200).send(elFind.completed = true)
	if (req.body.completed === false) return res.status(200).send(elFind.completed = false)
})

app.delete('/api/todos/:id', validTk, (req, res) => {
	const tdIdx = todos.findIndex(e => e.id === req.params.id)
	if (tdIdx === -1) return res.sendStatus(404)
	todos.splice(tdIdx, 1)
	return res.status(204).send(todos)
})


// ... hasta aquí

export default app