const mysql = require("mysql");
const express = require("express");

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = app.listen(3001, () => console.log("Serveri valmiina"));

// First you need to create a connection to the database
// Be sure to replace 'user' and 'password' with the correct values
const con = mysql.createConnection({
  host: "localhost",
  user: "riina",
  password: "kt123456",
  database: "puhelinluettelo",
  multipleStatements: true, //out parametria varten aliohjelmassa
});

con.connect((err) => {
  if (err) {
    console.log("Error connecting to Db");
    return;
  }
  console.log("Connection established");
});

/*CORS isn’t enabled on the server, this is due to security reasons by default,
 so no one else but the webserver itself can make requests to the server.*/
// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  res.setHeader("Content-type", "application/json");

  // Pass to next layer of middleware
  next();
});

app.get("/henkilot", (req, res) => {
  con.query("SELECT * FROM henkilot", (err, rows) => {
    if (err) throw err;
    return res.status(200).json(rows);
  });
});

// const henkilo = { nimi: 'Ankka Roope', puhelin: '050-1231232' };
// con.query('INSERT INTO henkilot SET ?', henkilo, (err, res) => {
//   if(err) throw err;

//   console.log('Last insert ID:', res.insertId);
// });

app.post("/henkilot", (req, res) => {
    let henkilo = req.body;
    con.query("INSERT INTO henkilot SET ?", henkilo, (err, res) => {
     if (err) throw err;

     console.log("Last insert ID:", res.insertId);
    });
});


app.post("/lisaa", (req, res) => {
    let henkilo = req.body;
    console.log(henkilo);
    if (henkilo) {
        return res
        .status(400)
        .send({error: true, message: "Henkilo -objektia ei muodostunut" });
    }

    con.query(
        "INSERT INTO henkilot SET ? ",
        henkilo,
        function (error, results, fields) => {
            if (error) throw error;
            return res.send(JSON.stringify({ id: results.insertId, ...henkilo }));
        }
        );
    });

    app.put("/henkilot/:id", (req, res) => {
        const id = Number(req.params.id); // otetaan parametri id:n arvo talteen numerona
        // otetaan talteen JSON muodossa oleva päivitetty henkilön tieto
        const paivitettyHlo = req.body;
 con.query(
     'UPDATE henkilot SET = ? Where ID = ?',
     [paivitettyHlo, id],
     (err, result) => {
       if (err) throw err;
       con.query("SELECT * FROM henkilot WHERE id=?", id, (err, rows) => {
        if (err) throw err;
       res.end(JSON.stringify(rows[0]));
     });
    }
  };
});


app.delete("/henkilot/:id", (req, res) => {
  const id = Number(req.params.id);
  con.query("DELETE FROM henkilot WHERE id = ?", [id], (err, result) => {
   if (err) throw err;
   return res.send({ 
    error: false, 
    data: result, 
    message: "Henkilo poistettu ok",
   });

//   console.log(`Deleted ${result.affectedRows} row(s)`);
  });
});

// con.query("CALL sp_get_henkilot()", function (err, rows) {
//   if (err) throw err;

//   rows[0].forEach( (row) => {
//     console.log(`${row.nimi},  puhelin: ${row.puhelin}`);
//   });
//   console.log(rows);
// });

// con.query("CALL sp_get_henkilon_tiedot(1)", (err, rows) => {
//   if (err) throw err;

//   console.log("Data received from Db:\n");
//   console.log(rows[0]);
// });

// con.query(
//     "SET @henkilo_id = 0; CALL sp_insert_henkilo(@henkilo_id, 'Matti Miettinen', '044-5431232'); SELECT @henkilo_id",
//     (err, rows) => {
//       if (err) throw err;

//       console.log('Data received from Db:\n');
//       console.log(rows);
//     }
//   );
// const userSubmittedVariable =
//   "1"; /*ettÃƒÂ¤ kukaan ei voi syÃƒÂ¶ttÃƒÂ¤ÃƒÂ¤ tÃƒÂ¤tÃƒÂ¤:
// const userSubmittedVariable = '1; DROP TABLE henkilot';*/

// con.query(
//   `SELECT * FROM henkilot WHERE id = ${mysql.escape(userSubmittedVariable)}`,
//   (err, rows) => {
//     if (err) throw err;
//     console.log(rows);
//   }
// );

//con.end((err) => {
  // The connection is terminated gracefully
  // Ensures all remaining queries are executed
  // Then sends a quit packet to the MySQL server.
});
