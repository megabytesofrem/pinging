const admin = require("./data/admin")
const responses = require("./data/response")

const commandModules = {
  maintenance: require("./commands/maintenance"),
  aesthetics: require("./commands/aesthetics"),
  admin: require("./commands/admin"),
  dialog: require("./commands/dialog")
}

function Command(description, func, admin) {
  this.description = description
  this.func = func
  this.admin = admin
}

const commands = {
  "help": new Command("List avaiable commands", commandModules.maintenance.help, false),
  "ping": new Command("Test if the bot is running", commandModules.maintenance.ping, false),
  "nick": new Command("Set the bot's nickname", commandModules.aesthetics.nick, true),
  "add-admin": new Command("Add an admin", commandModules.admin.add, true),
  "list-admins": new Command("List admins", commandModules.admin.list, true),
  "simon-says": new Command("Repeat what you say", commandModules.dialog.simonSays, true),
  "gif": new Command("Return a random GIF from Giphy", commandModules.dialog.gif, false),
  "user-info": new Command("Return information on user or another user (must be admin to return others info)", commandModules.maintenance.userInfo, false),
  "coin-flip": new Command("Flip a coin", commandModules.dialog.coinFlip, false)
}
exports.commands = commands

responses.list()
.then(responseList => {
  exports.handleCommand = (msg, client) => {
    if (msg.content.slice(0, 1) == "*") {
      const commandText = msg.content.split(" ")[0].slice(1)

      if (!Object.keys(commands).includes(commandText)) {
        msg.reply(responseList["InvalidCommand"])
        return
      }

      const command = commands[commandText]
      const arg = msg.content.split(" ").slice(1).join(" ")

      admin.check(msg.author.id)
      .then(isAdmin => {
        if (command.admin && !isAdmin) {
          msg.reply(responseList["NotAdmin"])
          return
        }

        command.func(msg, client, arg, responseList, isAdmin)
      })
      .catch(err => {
        console.log(err)
        process.exit(1)
      })
    }
  }
})
.catch(err => {
  console.log(err)
  process.exit(1)
})