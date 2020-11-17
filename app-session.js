/** 전역변수 **********************/
const express = require('express');
const app = express();
const path = require('path');
const error = require('http-errors');
const session = require('express-session')

/** 라우터 등록 **********************/


/** 서버실행 **********************/
app.listen(3000, () => {
	console.log('=====================');
	console.log('http://127.0.0.1:3000');
	console.log('=====================');
});

/** 초기설정 **********************/
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));
app.locals.pretty = true;

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

/** 라우터설정 **********************/
app.use('/', express.static(path.join(__dirname, './public')));

/** 에러 처리 **********************/
app.use((req, res, next) => {
	next(error(404, 'Page Not Found - 페이지를 찾을 수 없습니다.'));
});

app.use((err, req, res, next) => {
	const pug = {
		img : err.status == 404 ? err.status : 500, 
		code : err.status || 500,
		msg	: err.message || 'Unexpected Error'
	}
	res.render('error/error.pug', pug);
});





// Callback Version : 앞으로 쓰지 않는다.

/* app.get('/book/list', (req, res) => {
	connection.query('SELECT * FROM books', function(err, r) {
		for(let v of r) v.wdate = moment(v.wdate).format('YYYY-MM-DD');
		const pug ={
			css: 'book-list',
			js: 'book-list',
			title: '도서 리스트',
			titleSub: '고전도서 리스트',
			lists: r
		}
		res.render('book/list', pug);
		console.log(r);
	});
}); */