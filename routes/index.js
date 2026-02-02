var express = require('express');
var router = express.Router();

const SvcRedis = require('../services/v1/SvcRedis');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('Bigint64 Node.js Template API');
});

/**
 * [GET] /clearsession
 * 세션 정보 강제 초기화 (관리자용)
 */
router.get('/clearsession', function (req, res) {
    const svc = new SvcRedis(req, res);
    svc.clearSessions();
});

module.exports = router;
