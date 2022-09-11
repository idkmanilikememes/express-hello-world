//this is database shit, initiallisign ing it
const { Client } = require('pg');
const database = new Client({
  connectionString: 'postgres://keffkefffart_user:ifXjxZHNg8mkhKiQ1UxT39NWaAENCABY@dpg-ccdhjhcgqg4d3o4v56sg-a.oregon-postgres.render.com/keffkefffart?ssl=true',
})
database.connect(err => { //connect to db
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

const query = {
  text: `SELECT * FROM ips`,
}

database.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log(res.rows)
  }
})