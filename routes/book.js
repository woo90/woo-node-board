const express = require('express');
const router = express.Router();
const moment = require('moment');
const error = require('http-errors');
const { pool } = require('../modules/mysql-conn');
const { alert } = require('../modules/utill');

router.get(['/', '/list'], async(req, res, next) => {
	let connect, rs, sql, values, pug;
	try{
		sql = 'SELECT * FROM books ORDER BY id DESC LIMIT 0, 5';
		connect = await pool.getConnection();
		rs = await connect.query(sql);
		connect.release();
		for(let v of rs[0]) v.wdate = moment(v.wdate).format('YYYY-MM-DD');
		pug ={
			file: 'book-list',
			title: '도서 리스트',
			titleSub: '고전도서 리스트',
			lists: rs[0]
		}
		res.render('book/list', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(error(500, e.sqlMessage));
	}
});

router.get('/write',(req, res, next) => {
	pug ={
		file: 'book-write',
		title: '도서 작성',
		titleSub: '등록할 도서를 작성하세요.'
	}
	res.render('book/write', pug);
});

router.get( '/write/:id', async (req, res, next) => {
	let connect, rs, sql, values, pug;
	try {
		sql = 'SELECT * FROM books WHERE id = ?';
		values = [req.params.id];
		connect = await pool.getConnection();
		rs = await connect.query(sql, values);
		connect.release();
		rs[0][0].wdate = moment(rs[0][0].wdate).format('YYYY-MM-DD')
		pug ={
			file: 'book-update',
			title: '도서 수정',
			titleSub: '수정할 도서 내용를 작성하세요.',
			book: rs[0][0]
		}
		res.render('book/write', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(error(500, e.sqlMessage));
	}
});

router.post('/save', async (req, res, next) => {
	let connect, rs, sql, values, pug;
	try {
		const {title, writer, wdate, content} = req.body;
		values = [title, writer, wdate, content];
		sql = 'INSERT INTO books SET title=?, writer=?, wdate=?, content=?';
	
		connect = await pool.getConnection();
		const r = await connect.query(sql, values);
		connect.release();
	
		res.redirect('/book/list');
	}
	catch(e) {
		if(connect) connect.release();
		next(error(500, e.sqlMessage))
	}
});

// SELETE FROM books WHERE id=1 OR id=2 OR id=3;
router.get('/delete/:id', async (req, res, next) => {
	let connect, rs, sql, values, pug;
	try {
		sql=`DELETE FROM books WHERE id=${req.params.id}`;
		connect = await pool.getConnection();
		rs = await connect.query(sql);
		res.send(alert(rs[0].affectedRows > 0 ? '삭제되었습니다.' : '삭제에 실패하였습니다.', '/book'));
	}
	catch(e) {
		if(connect) connect.release();
		next(error(500, e.sqlMessage));
	}
});

router.post('/change', async (req, res, next) => {
	let connect, rs, sql, values, pug;
	try {
		var { title, writer, wdate, content, id } = req.body;
		sql = 'UPDATE books SET title=?, writer=?, wdate=?, content=? WHERE id=?';
		values = [title, writer, wdate, content, id];
		connect = await pool.getConnection();
		rs = await connect.query(sql, values);
		connect.release();
		res.send(alert(rs[0].affectedRows > 0 ? '수정되었습니다.' : '수정에 실패하였습니다.', '/book'));
	}
	catch(e) {
		if(connect) connect.release();
		next(error(500, e.sqlMessage));
	}
});

module.exports = router;