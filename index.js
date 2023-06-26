const net = require("net")
require("dotenv").config()

const port = process.env.PORT || 0
let clients = []
let names = new Map()
let usedNames = []
let rooms = new Map()
const server = net.createServer()
let userNumber = 0

server.on("connection", stream => {
    clients.push(stream)
    names.set(stream, `<User-${++userNumber}>`)
    usedNames.push(names.get(stream))
    rooms.set(stream, "general")

    stream.on("data", data => {
        data = data.toString()

        data = data.replace(/\n$/g, "")


        if(data == "/rooms" || data == "/list-rooms") {
            let usedRooms = []
            rooms.forEach((userRoom, userStream) => {
                usedRooms.push(userRoom)
            })
            usedRooms = [...new Set(usedRooms)]
            stream.write(usedRooms.join(", ") + "\n")
        } else if(data == "/users" || data == "/list-users") {
            let usedRooms = {}
            rooms.forEach((userRoom, userStream) => {
                if(usedRooms[userRoom]) {
                    usedRooms[userRoom].push(names.get(userStream))
                } else {
                    usedRooms[userRoom] = [names.get(userStream)]
                }
            })
            let output = []
            for(let i = 0; i < Object.keys(usedRooms).length; i++) {
                let room = Object.keys(usedRooms)[i]
                output.push(`"${room}": `)
                usedRooms[room].forEach(user => {
                    output.push(`${user}, `)
                })
                output.push("\n")
            }
            output = output.join("")
            stream.write(output)
        } else if(data.startsWith("/join") || data.startsWith("/room")) {
            let room = data.split(" ")
            room.shift()
            room = room.join(" ")
            rooms.set(stream, room)
            stream.write(`Switched to room '${room}' \n`)
        } else if(data.startsWith("/nick ") || data.startsWith("/nickname ")) {
            let name = data.split(" ")
            name.shift()
            name = name.join(" ")
            if(usedNames.includes(`<${name}>`)) {
                stream.write(`The name '${name}' is already in use. Please choose a different name.\n`)
            } else if(name.includes(" ")) {
                stream.write(`The name '${name}' includes spaces, which makes it invalid. Names can't include spaces.\n`)
            } else {
                let oldNameIndex = usedNames.indexOf(names.get(stream))
                names.set(stream, `<${name}>`)
                usedNames[oldNameIndex] = names.get(stream)
                stream.write(`Your name was set to '${name}'\n`)
            }
        } else if(data.startsWith("/msg")) {
            let splitMsg = data.split(" ")
            let receiver = `<${splitMsg[1]}>`
            let message = splitMsg
            message.shift()
            message.shift()
            message = message.join(" ")
            for(let [receiverStream, receiverName] of names.entries()) {
                if(receiverName == receiver) {
                    receiverStream.write(`<DM from ${names.get(stream)} to ${receiver}> ${message}\n`)
                }
            }
        } else if(data == "/quit" || data == "/exit" || data == "/close") {
            stream.end()
            usedNames.splice(usedNames.indexOf(names.get(stream)), 1)
            if(clients.indexOf(stream) > -1) {
                clients.splice(clients.indexOf(stream), 1)
            }
        } else {
            let messageRoom = rooms.get(stream)
            clients.forEach(client => {
                if(messageRoom == rooms.get(client)) {
                    if(client != stream) client.write(`${names.get(stream)} ${data}\n`)
                }
            })
        }
    })

    stream.on("close", err => {
        usedNames.splice(usedNames.indexOf(names.get(stream)), 1)
        if(err) console.log(err)
        if(clients.indexOf(stream) > -1) {
            clients.splice(clients.indexOf(stream), 1)
        }
    })
})

server.listen(port)
server.on("listening", () => {
    console.log(`Listening on port ${server.address().port}`)
})