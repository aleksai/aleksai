const express = require("express")

const config = require("./config")
const controllers = require("./controllers")

const app = express()

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({ extended: true, limit: "2mb" }))
app.use(express.json())

controllers.pass(app)

app.listen(config.port, () => {
	console.log("Listening at http://localhost:" + config.port)
})