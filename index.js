const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
var bodyParser = require('body-parser')
var path = require('path');

const app = express()

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.static(path.join(__dirname, '../')));
app.options('*', cors()); 
//app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

var db_config = {
    host: "182.50.133.77",
    user: "craadvocate",
    password: "Cra@2019",
    database: 'cradb'     
  };
  
  var connection;
  
  function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }
  
  handleDisconnect();


app.get("/api/clients", function(req, res) {
    const createdby=req.query.createdby;
    const clientinfo=req.query.clientinfo;
    const SELECT_ALL_CLIENTS = `SELECT * FROM clientmaster where createdby in ('${createdby}', '') and clientinfo=${clientinfo} order by 'firmname'`

    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
          handleError(res, err.message, "Failed to get contacts.");
        } else {
          res.status(200).json(resultados);
        }
  });
});

app.listen(7000, () => {
    console.log('server started at port 7000')
})
