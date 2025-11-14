const express = require("express")
const path = require("node:path")

const app = express()

app.use((req,res,next) =>
{
    console.info(`${req.method} ${req.url} -> ${res.statusCode}: ${res.statusMessage}`)
    next()
})

app.use(express.static(path.join(__dirname,"..","tests","browser")))
app.use(express.static(path.join(__dirname,"..","dist")))

app.listen(43434)