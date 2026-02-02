const express = require('express');
const router = express.Router();
const logger = require('../../config/winston');

const ProtoUtil = require('../../common/ProtoUtil');
const protoAuth = require('../../common/protoAuthMiddleware');

const SvcAuth = require('../../services/v1/SvcAuth');


/**
 * [POST] /version
 * 버전 체크
 */
router.post('/version', function (req, res) {
    const requestProtoType = 'api.v1.VersionRequest';

    // 1. v1 패키지명에 맞춰 디코딩
    const decodedBody = ProtoUtil.decode(req, requestProtoType);

    // 2. 서비스 호출 - 응답 타입은 서비스에서 자동 결정
    const svc = new SvcAuth(req, res, decodedBody);
    svc.version();
});

/**
 * [POST] /login
 * 로그인
 */
router.post('/login', function (req, res) {
    const requestProtoType = 'api.v1.LoginRequest';

    // 1. v1 패키지명에 맞춰 디코딩
    const decodedBody = ProtoUtil.decode(req, requestProtoType);

    // 2. 서비스 호출 - 응답 타입은 서비스에서 자동 결정
    const svc = new SvcAuth(req, res, decodedBody);
    svc.login();
});


/**
 * [POST] /authcheck
 * 인증 테스트용 (미들웨어 적용 예시)
 */
router.post('/authcheck', protoAuth, function (req, res) {
    // 미들웨어를 통과하면 req.uid, req.pf가 설정되어 있음
    logger.debug(`Auth Check Passed: uid=${req.uid}, pf=${req.pf}`);

    // 임시 응답
    ProtoUtil.send(res, 'api.v1.ResponseHeader', { code: 0, message: `Authenticated: ${req.uid}` });
});

module.exports = router;