require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

let pass = '1234' + process.env.BCRYPT_SALT;
// let sha512 = crypto.createHash('sha512').update(pass).digest('gase64');

const passMaker = async () => {
	const hash = await bcrypt.hash(pass, Number(process.env.BCRYPT_ROUND));
	console.log(hash);
	const compare = await bcrypt.compare(pass, hash);
	console.log(compare);
}

passMaker();