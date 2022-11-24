const { Pool, Client } = require('pg');
// const pg = new Client({
//     host: 'ec2-34-198-243-120.compute-1.amazonaws.com',
//     port: 5432,
//     user: 'yjtfrobgdtzjpu',
//     password: 'e1fc2b63c0d3f5ae1afeb12cec7e1c839d5f9a12c22339357375f7af977ac0eb',
//     database: 'd7rvebbnhmg03c'
// })

// const pg = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });

const pg = new Client({
    user: 'postgres',
    password: 'root',
    host: 'localhost',
    port: '5432',
    database: 'blog_nt'
})

// const pg = new Pool({
//     connectionString: "postgres://postgres:root@localhost:5432/blog_nt",
//     ssl: {
//         rejectUnauthorized: false
//     }
// });

pg.connect()
    .then(() => console.log('Postgresql connected successfully!'))
    .catch(e => console.log(e.message))

module.exports = pg;
