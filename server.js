const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')

// Устанавливаем middleware для статических файлов
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.listen(3500, ()=>{
	console.log('Server starts on http://localhost:3500')
})
