const express = require('express')
const app = express()
const path = require('path')

// Устанавливаем middleware для статических файлов
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.listen(3500)
