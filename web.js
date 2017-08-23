/* 모듈 로드 */
let compression = require('compression');
let cluster = require('cluster');
let express = require('express');
let net = require('net');
let session = require('express-session'); // 세션정보는 메모리에 저장함
let db = require('./config/mysqld');
let domain = require('cors')();
let methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let num_processes = require('os').cpus().length;
let path = require('path');
let ip = require('ip');

let port = 8001;

/* Express 서버 설정 */
let app = express();

// encoding gzip
app.use(compression());

/* View Engine 설정 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* App Config */
app.use(domain);
app.use(cookieParser());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true }));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));  // '모듈' 경로 지정
app.use(express.static(path.join(__dirname, 'public')));                 // '정적' 파일 경로 지정 (images / assets)
app.use('/template', express.static(__dirname + '/views'));                           //  Angular template 경로 지정
app.use(express.static(__dirname + '/routes'));                          //  Angular Core script 경로 지정

// 서버기동
let server = app.listen(port, function() {
    console.log("======================================================");
    console.log("   Express Web server has started on port " + 8001);
    console.log("======================================================");
});

// 소켓서버 기동
let socket = require('socket.io')(server);

// 메인 라우터 지정
require('./routes/server/main/system')(app, db);

// POST 라우터 지정
require('./routes/server/main/post')(app, db);

// 소켓 라우터 및 기동
require('./routes/server/main/socket')(app, db, socket);

// FF14 API
require('./routes/server/ff14/ff14')(app, db);

// 라우터 지정
require('./routes/main')(app);



