const mysql = require('mysql2/promise');

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// SELECT * FROM books
// SELECT title, writer FROM books
// SELECT * FROM books WHERE id=3
// SELECT * FROM books WHERE id=3 ORDER BY id DESC
// SELECT * FROM books WHERE id=3 ORDER BY id DESC LIMIT 0, 3
// SELECT * FROM users WHERE userid='woo';
// SELECT * FROM users WHERE userid LIKE '%woo%';
// SELECT * FROM users WHERE userid='woo' AND id=3; <= 미구현
// SELECT * FROM users WHERE userid='woo' OR id=3; <= 미구현
// where: ['userid', 'woo'];
// where: ['userid', 'woo', 'LIKE'];
// where: {op: 'AND', fields: [ ['userid', 'woo', 'LIKE'], ['userpw', '000000'] ] };
// where: {op: 'OR', fieds: [ ['userid', 'woo'], ['userpw', '000000'] ] };

// let field= ['title', 'writer'];
// Object.entries({title: "제", writer: "자", wdate: "11-16"}).filter(v => field.includes(v[0]));

const sqlGen = async (table, mode, obj) => {
	let { field=[], data={}, file=null, where=null, order=[], limit=[]  } = obj;
	let sql=null, values=[], connect=null, rs=null;
	let temp = Object.entries(data).filter(v => field.includes(v[0]));
	
	if(mode == 'I' || mode == 'i') 
		sql = `INSERT INTO ${table} SET `;
	if(mode == 'U' || mode == 'u') 
		sql = `UPDATE ${table} SET `;
	if(mode == 'D' || mode == 'd') 
		sql = `DELETE FROM ${table} `;
	if(mode == 'S' || mode == 's') 
		sql = `SELECT ${field.length == 0 ? '*' : field.toString()} FROM ${table} `;

	if(file) {
		temp.push(['savefile', file.filename]); 
		temp.push(['realfile', file.originalname]); 
		temp.push(['filesize', file.size]); 
	}
	for(var v of temp) {
		sql += v[0] + '=?,';
		values.push(v[1]);
	}
	sql = sql.substr(0, sql.length - 1);
	if(Array.isArray(where)) {
		if(where[2] && where[2].toUpperCase() == 'LIKE')
			sql += ` WHERE ${where[0]} LIKE '%${where[1]}%' `;
		else
			sql += ` WHERE ${where[0]} = '${where[1]}' `;
	}
	if(where && where.op && where.fields && (where.op.toUpperCase() == 'AND' || where.op.toUpperCase() == 'OR')) {
		for(let i in where.fields) {
			if(i == 0) sql += ` WHERE `;
			else sql += ` ${where.op} `;
			if(where.fields[i][2] && where.fields[i][2].toUpperCase() == 'LIKE')
				sql += ` ${where.fields[i][0]} LIKE '%${where.fields[i][1]}%' `;
			else
				sql += ` ${where.fields[i][0]} = '${where.fields[i][1]}' `;
		}
	}
	if(order.length > 1) sql += ` ORDER BY ${order[0]} ${order[1]} `;
	if(limit.length > 1) sql += ` LIMIT ${limit[0]}, ${limit[1]} `;

	if((mode == 'D' || mode == 'U') && sql.indexOf('WHERE') == -1) {
		throw new Error('수정, 삭제는 where절이 필요합니다.');
	}
	console.log(sql);
	try {
		connect = await pool.getConnection();
		rs = await connect.query(sql, values); 
		connect.release();
		return rs;
	}
	catch(e) {
		if(connect) connect.release();
		throw new Error(e);
	}
}

module.exports = { pool, mysql, sqlGen };