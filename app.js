var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http');
var dgram = require('dgram');
var csv = require('csv-parser');
var cookieParser = require('cookie-parser');
var indexRouter = require('./routes/index');
var app = express();

// UDP Socket
var udpSocketPort = 8080;
// var udpSocketHost = "192.168.1.133";
var udpSocketHost = "192.168.1.144";

var espIP = "192.168.1.141";
var espPort = 8080;
var udpSocket = dgram.createSocket('udp4');

// var monk = require('monk');
// var db = monk('127.0.0.1/quest6', function (err, db) {
//   if (err) {
//     console.log("Error", err);
//   }
//   else {
//     console.log("Got db", db);
//   }
// });

var level = require('level')
var db = level('laps')

// 2) Put a key & value
var obj = {
  "time": 2,
  "beacon": "b2"
}
db.put('name2', JSON.stringify(obj), function (err) {
  if (err) return console.log('Ooops!', err) // some kind of I/O error

  // // 3) Fetch by key
  // db.get('name', function (err, value) {
  //   if (err) return console.log('Ooops!', err) // likely the key was not found

  //   // Ta da!
  //   console.log('name=' + value)
  // })
})

db.createReadStream()
.on('data', function (data) {
  console.log(data.key, '=', JSON.parse(data.value))
})

// var LevelDB = require('node-leveldb');
// LevelDB.open('laps');

// LevelDB.set('lap1', 1);
// LevelDB.set('lap2', 2);

// LevelDB.list(function(key, val) {
//   console.log(key + ': ' + val);
// })



// To run be on -> http://192.168.1.133:8080/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const server = http.createServer(app)

// CommonJS require
const jsQR = require("jsqr");

var io = require('socket.io')(server);

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}


io.on('connection', function (socket) {

  /*
  // Old code from quest 3
  socket.on('flash', function (clientMessage) {
    // espPort: ESP32 Port Number
    // espIP: ESP32 IP Address
    udpSocket.send("r", espPort, espIP, function (error) {
      if (error) {
        console.log("Error sending to esp32: ", clientMessage);
      }
      else {
        console.log("Message to esp32 sent okay: ", clientMessage);
      }
    });

    socket.on('timer', function(clientMessage) {
      let messageToSend = "b " + clientMessage.value;
      console.log("Timer message to send: ", messageToSend);

      udpSocket.send(messageToSend, espPort, espIP, function(error) {
        if (error) {
          console.log("Error sending to esp32", clientMessage);
        }
        else {
          console.log("Message to esp32 sent okay", clientMessage);
        }
      })
    })
  })
  */

  // udpSocket.on('message', function (message, remote) {
  //   console.log(remote.address + ':' + remote.port + ' - ' + message);
  //   console.log("received a message");

  //   function notAllowed(fobItem, parsedData, hubItem) {
  //     console.log("hub item", hubItem);
  //     let data = parsedData;
  //     data['auth'] = false;
  //     data['time'] = new Date();
  //     data['name'] = fobItem.name;
  //     data['location'] = hubItem.location;
  //     udpSocket.send('r', espPort, fobItem.ip, function(error) {
  //       if (error) {
  //         console.log("Error sending to esp32: ");
  //       }
  //       else {
  //         console.log("Message to esp32 sent okay: 'r' \n");
  //       }
  //     })

  //     let entries = db.get('entries');
  //     entries.insert(data).then(function (res) {
  //       // console.log("posting new entry", res);
  //       entries.find().then(function (allItems) {
  //         // console.log("all new entries", allItems);
  //         socket.emit('db', allItems);
  //       })
  //     }).catch(function (err) {
  //       console.log("error posting", err)
  //     })
  //   }


  //   function postData(data) {
  //     let parsedData = {
  //       "fob_ID": data.fob_ID,
  //       "hub_ID": data.hub_ID,
  //       "code": data.code
  //     }

  //     let entries = db.get('entries');
  //     let fobCol = db.get('fob');
  //     let hubCol = db.get('hub')

      
  //     hubCol.find({"ID": parsedData.hub_ID}).then(hubItem => {
  //       let allowed = hubItem[0].allowed;
  //       if (allowed.includes(parsedData.fob_ID)) {
  //         // The fob id is allowed by the hub
  //         // console.log("Fob id is allowed", parsedData.fob_ID);
  //         // now check if the code key matches
  //         fobCol.find({"ID": parsedData.fob_ID}).then(fobItem => {
  //           if (fobItem[0].code.toString() === parsedData.code) {

  //             // console.log("Fob id matches code", parsedData.fob_ID);

  //             // code matches succes
              
  //             udpSocket.send('g', espPort, fobItem[0].ip, function(error) {
  //               if (error) {
  //                 console.log("Error sending to esp32: " );
  //               }
  //               else {
  //                 console.log("Message to esp32 sent okay: 'g'\n");
  //               }
  //             })

  //             let data = parsedData;
  //             data['auth'] = true;
  //             data['name'] = fobItem[0].name;
  //             data['location'] = hubItem[0].location;
  //             data['time'] = new Date();

  //             // console.log("posting data");
  //             entries.insert(data).then(function (res) {
  //               // console.log("posting new entry", res);
  //               entries.find().then(function (allItems) {
  //                 // console.log("all new entries", allItems);
  //                 socket.emit('db', allItems);
  //               })
  //             }).catch(function (err) {
  //               console.log("error posting", err)
  //             })


  //           }
  //           else {
  //             notAllowed(fobItem[0], parsedData, hubItem[0]);
  //           }
  //         })
  //       }
  //       else {
  //         fobCol.find({"ID": parsedData.fob_ID}).then(fobItem => {
  //           notAllowed(fobItem[0], parsedData, hubItem[0]);
  //         })
  //       }
  //     })
  //   }


  //   if (isJsonString(message)) {
  //     var parsedData = JSON.parse(message);
  //     // console.log("parsed data JSON", parsedData);
  //     // console.log("posting data");
  //     postData(parsedData)
  //   }
  //   else {
  //     console.log("Parsing errors with: ", message);
  //   }


  // });
  console.log('socket connected');

});

const port = process.env.PORT || 3000;

server.listen(port)
server.on("listening", () => {
  console.log('APIs are listening on port ' + port);
})

udpSocket.bind(udpSocketPort, udpSocketHost);

module.exports = app;
