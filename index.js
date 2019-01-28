const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
var bodyParser = require('body-parser')
var path = require('path');
const port = process.env.PORT || 3000;

const app = express()
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  next();
});

app.use(bodyParser.urlencoded({ extended: false }))
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

  app.get("/api/dummy", function(req, res) {
    return res.send({a: 1, b:2});
  })

app.get("/api/clients", function(req, res) {
    const createdby=req.query.createdby;
    const clientinfo=req.query.clientinfo;
    const SELECT_ALL_CLIENTS = `SELECT * FROM clientmaster order by 'firmname'`

    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
          handleError(res, err.message, "Failed to get contacts.");
        } else {
          res.status(200).json(resultados);
        }
  });
});


app.get('/api/allactiveclients', (req, res) => {
    const clientinfo=req.query.clientinfo;
    const SELECT_ALL_CLIENTS = `SELECT * FROM clientmaster where clientinfo=${clientinfo} order by 'firmname'`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resultados);
        }
    })
})


// //get call
app.get('/api/clientInfo', (req, res) => {
    const filenumber=req.query.filenumber;
    const SELECT_ALL_CLIENTS = `CALL sp_get_all('${filenumber}')`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resultados);
        }
    })
})

//get call
app.get('/api/clientFee', (req, res) => {
    const filenumber=req.query.filenumber;
    const SELECT_ALL_CLIENTS = `SELECT * FROM efiling where filenumber = '${filenumber}'`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resultados);
        }
    })
})

//get call
app.get('/api/clientEFile', (req, res) => {
    const filenumber=req.query.filenumber;
    const SELECT_ALL_CLIENTS = `select Tb1.filenumber,Tb1.firmname,Tb1.year,Tb1.month,Tb1.returntype,Tb1.dateofreceipt,Tb1.comunicationmode,Tb1.personincaselatereturn,Tb1.typeofpendancy,Tb1.fillingdate,Tb1.filledby,Tb1.efillcategory,Tb1.gstr3bturnover,Tb1.correspondacedatepending,Tb1.personname,Tb1.feedue,Tb1.id,Tb2.receivedamount, Tb2.receiptnumber,Tb2.recieptdate from (select * from efiling where filenumber='${filenumber}') as Tb1
    left join (select filenumber, year, month, sum(receivedamount)receivedamount, receiptnumber, recieptdate from clientfee group by filenumber,year,month) Tb2 on Tb1.filenumber=Tb2.filenumber and Tb1.year=Tb2.year and Tb1.month=Tb2.month`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resultados);
        }
    })
})

//create call
app.put('/api/clients/addFee', (req, res) => {
    const body = req.body;
    let columns=Object.keys(req.body[0]);

    const serialize = body.map(data=>columns.map(key => `'${decodeURIComponent(data[key])}'`).join(','));
    let newArr=[];
    for(let i=0; i<serialize.length; i++){
        newArr.push(`(${serialize[i]})`);
    }
    let finalValues = newArr.join(',');
    const INSERT_USER_QUERY = `Delete from clientfee where filenumber=${body[0].filenumber} INSERT INTO clientfee(${columns.toString()}) VALUES ${finalValues}`
    connection.query(INSERT_USER_QUERY, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send('insert successful')
        }
    })
})

//create call
app.put('/api/clients/addEFile', (req, res) => {
    const body = req.body;
    let columns=Object.keys(req.body[0]);

    const serialize = body.map(data=>columns.map(key => `'${decodeURIComponent(data[key])}'`).join(','));
    let newArr=[];
    for(let i=0; i<serialize.length; i++){
        //newArr.push(`${serialize[i]}`);
        newArr.push(`(${serialize[i]})`);
    }
    let finalValues = newArr.join(',');
    const INSERT_USER_QUERY = `Delete from efiling where filenumber='${body[0].filenumber}'; INSERT INTO efiling(${columns.toString()}) VALUES ${finalValues}`
    //const INSERT_USER_QUERY = `CALL sp_insertEfile(${finalValues})`
    connection.query(INSERT_USER_QUERY, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send('insert successful')
        }
    })
})

//get call
app.get('/api/clientEFile/add', (req, res) => {
    const filenumber=req.query.filenumber;
    const SELECT_ALL_CLIENTS = `SELECT * FROM efiling where filenumber = '${filenumber}'`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resultados);
        }
    })
})

//create call
app.put('/api/clients/add', (req, res) => {
    const body = req.body;
    let columns=Object.keys(req.body);
    const serialize = columns.map(key => `'${decodeURIComponent(body[key])}'`).join(',');
    const INSERT_USER_QUERY = `INSERT INTO clientmaster(${columns.toString()}) VALUES(${serialize})`
    connection.query(INSERT_USER_QUERY, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send('insert successful')
        }
    })
})

//create call
app.put('/api/clients/addInfo', (req, res) => {
    const body = req.body;
    let columns=Object.keys(req.body);
    const serialize = columns.map(key => `'${decodeURIComponent(body[key])}'`).join(',');
    const INSERT_USER_QUERY = `INSERT INTO clientinfo(${columns.toString()}) VALUES(${serialize})`
    connection.query(INSERT_USER_QUERY, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send('insert successful')
        }
    })
})



//update call
app.post('/api/clients/updateclientInfo', (req, res) => {
    const body = req.body;
    const SELECT_ALL_CLIENTS = `UPDATE clientmaster set clientinfo=true where filenumber='${body.filenumber}'`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            let resp = res.json({data: resultados});
            return resp
        }
    })
})

app.listen(port, () => {
    console.log(`server started at port: ${port}`)
})
module.exports={app};
