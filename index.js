require('dotenv').config()

const
    TelegramBot = require('node-telegram-bot-api'),
    {gameOptions, playAgainOptions} = require('./options'),
    token = process.env.TELEGRAM_TOKEN,
    bot = new TelegramBot(token, {polling: true}),
    chats = []

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `I'll make a number from 0 to 9. Can you guess my number?`)
    chats[chatId] = {number: Math.floor(Math.random() * 10), isNewGame: true}
    await bot.sendMessage(chatId, `I made a number`, gameOptions)
}

const start = async () => {
    await bot.setMyCommands([
        {command: '/start', description: 'Greetings!'},
        {command: '/info', description: 'Get information about you'},
        {command: '/game', description: 'Play a plain game'},
    ])

    bot.on('message', async msg => {
        const
            text = msg.text,
            chatId = msg.chat.id

        switch (text)
        {
            case '/start':
                await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/bd3/b69/bd3b69e3-6b68-4ee4-ad38-50c432fb1b43/192/6.webp')
                await bot.sendMessage(chatId, 'Welcome to my first bot!')
                break
            case '/info':
                await bot.sendMessage(chatId, `Your name is ${msg.from.first_name}`)
                break
            case '/game':
                await startGame(chatId)
                break
            default:
                await bot.sendMessage(chatId, `I don't understand you. Try again!`)
                break
        }
    })

    bot.on('callback_query', async msg => {
        const
            data = msg.data,
            chatId = msg.message.chat.id,
            number = Number(chats[chatId].number),
            isNewGame = chats[chatId].isNewGame

        if (data === '/again' || !isNewGame)
        {
            return await startGame(chatId)
        }

        chats[chatId].isNewGame = false

        if (Number(data) === number)
        {
            await bot.sendMessage(chatId, `Yes! I selected this number!`, playAgainOptions)
        } else {
            await bot.sendMessage(chatId, `No! It's not my number! My number was ${number}`, playAgainOptions)
        }
    })
}

start()