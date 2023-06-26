# telneet / ncat chat server
## run
To run the server go into the repos root directory. Use `npm i` to install all dependencies and run the server with `node .`

Optional: Set the `PORT` environment variable in the .env file to a specific port if you want to use a specific one.

## connect
connect using nc:
```bash
nc <server-ip> <port>
```
connect using telnet (don't, for some reason it currently messes up the server):
```bash
telnet <server-ip> <port>
```

in both occations replace `<server-ip>` with your servers ip address and `<port>` with the port that the server is running on(will be logged, when the server starts)