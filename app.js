var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var protobuf = require('protobufjs');
var logger = require('./config/winston');

var app = express();
require('./config/morgan')(app);

// Handle raw body for protobuf
app.use(express.raw({ type: 'application/x-protobuf', limit: '10mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 버전별 모든 프로토 파일을 배열로 전달하여 로드
const protoFiles = [
    path.join(__dirname, 'proto', 'service_v1.proto')
];

// 하나의 root 객체에 v1, v2가 모두 포함됨
const root = protobuf.loadSync(protoFiles);
app.set('proto', root);

// 라우터 임포트
const indexRouter = require('./routes/index');
const authV1Router = require('./routes/v1/authapi');

// 라우터 마운트 (버전별 프리픽스 부여)
app.use('/', indexRouter);
app.use('/api/v1', authV1Router);

// Error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Log the error
    logger.error(`${req.method} ${req.url} - ${err.message}`);
    if (err.stack) {
        logger.error(err.stack);
    }

    // return JSON error
    res.status(err.status || 500);
    res.json({ error: err.message });
});

module.exports = app;
