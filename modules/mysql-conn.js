const mysql = requrie('mysql2/promise');

const pool = mysql.createPool({
	host: '127.0.0.1',
	port: 3306,
	user: 'woo',
	password: '000000',
	database: 'woo',
	waitForConnections: true,
	connectionLimit:10,
	queueLimit:0
});

module.exports ={ pool, mysql};