const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
var bodyParser = require('body-parser')
const app = express()

const SELECT_ALL_USER_QUERY = 'SELECT * FROM user'

app.get('/', (req, res) => {
    res.send('get users')
})

const connection = mysql.createConnection({
    host: '182.50.133.77:3306',  //182.50.133.77:3306 //localhost
    port: 3306,
    user: 'craadvocate',       //craadvocate // cradb //root
    password: 'Cra@2019', //Welcome123#
    database: 'cradb'           //cradb
})

connection.connect(err => {
    if (err) {
        return err;
    }
})

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
app.use(cors())


//clients calls
//get call
app.get('/clients', (req, res) => {
    const createdby=req.query.createdby;
    const clientinfo=req.query.clientinfo;
    const SELECT_ALL_CLIENTS = `SELECT * FROM clientmaster where createdby in ('${createdby}', '') and clientinfo=${clientinfo} order by 'firmname'`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resultados);
        }
    })
})

app.get('/allactiveclients', (req, res) => {
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


//get call
app.get('/clientInfo', (req, res) => {
    const filenumber=req.query.filenumber;
    const SELECT_ALL_CLIENTS = `SELECT * FROM clientinfo where filenumber = '${filenumber}'`
    connection.query(SELECT_ALL_CLIENTS, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resultados);
        }
    })
})

//get call
app.get('/clientFee', (req, res) => {
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
app.put('/clients/add', (req, res) => {
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
app.put('/clients/addInfo', (req, res) => {
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

//create call
app.put('/clients/addFee', (req, res) => {
    const body = req.body;
    let columns=Object.keys(req.body[0]);

    const serialize = body.map(data=>columns.map(key => `'${decodeURIComponent(data[key])}'`).join(','));
    let newArr=[];
    for(let i=0; i<serialize.length; i++){
        newArr.push(`(${serialize[i]})`);
    }
    let finalValues = newArr.join(',');
    const INSERT_USER_QUERY = `Delete from efiling where filenumber=${body[0].filenumber} INSERT INTO efiling(${columns.toString()}) VALUES ${finalValues}`
    connection.query(INSERT_USER_QUERY, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send('insert successful')
        }
    })
})

//update call
app.post('/clients/updateclientInfo', (req, res) => {
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

app.get('/user', (req, res) => {
    connection.query(SELECT_ALL_USER_QUERY, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            let resp = res.json({data: resultados});
            return resp
        }
    })
})

app.get('/user/add', (req, res) => {
    const { id, username } = req.query
    const INSERT_USER_QUERY = `INSERT INTO user(userid, username) VALUES('${id}', '${username}')`
    connection.query(INSERT_USER_QUERY, (err, resultados) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send('insert successful')
        }
    })
})


app.listen(4000, () => {
    console.log('server started at port 4000')
})
