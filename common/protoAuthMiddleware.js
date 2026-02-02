const logger = require('../config/winston');
const ProtoUtil = require('./ProtoUtil');
const Jwt = require('./Jwt');
const Code = require('./Code');
const SvcRedis = require('../services/v1/SvcRedis');

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

/**
 * Protobuf API용 JWT 인증 미들웨어
 * 
 * 기능:
 * 1. JWT 토큰 검증
 * 2. Redis를 통한 중복 로그인 방지
 * 3. Protobuf 에러 응답 전송
 * 4. 디코딩된 uid, pf를 req에 추가
 */
const protoAuthMiddleware = async (req, res, next) => {
    try {
        // 1. 헤더에서 AccessToken 추출
        const token = req.headers['accesstoken'];

        if (!token) {
            logger.warn('No AccessToken provided in headers');
            return ProtoUtil.sendError(res, 401, Code.UNAUTHORIZED.code, Code.UNAUTHORIZED.message);
        }

        // 2. JWT 토큰 검증
        const decoded = await Jwt.verify(token);

        // 토큰 만료
        if (decoded === TOKEN_EXPIRED) {
            logger.warn('Token expired');
            return ProtoUtil.sendError(res, 401, Code.EXPIRED_TOKEN.code, Code.EXPIRED_TOKEN.message);
        }

        // 토큰 무효
        if (decoded === TOKEN_INVALID) {
            logger.warn('Invalid token');
            return ProtoUtil.sendError(res, 401, Code.INVALID_TOKEN.code, Code.INVALID_TOKEN.message);
        }

        // uid, pf 확인
        if (!decoded.uid || !decoded.pf) {
            logger.warn('Token missing uid or pf');
            return ProtoUtil.sendError(res, 401, Code.INVALID_TOKEN.code, Code.INVALID_TOKEN.message);
        }

        // 3. Redis를 통한 중복 로그인 체크 (Latest Token Wins)
        const latestToken = await SvcRedis.getUserToken(decoded.uid);

        if (!latestToken) {
            logger.warn(`No token found in Redis for user: ${decoded.uid}`);
            return ProtoUtil.sendError(res, 401, Code.EXPIRED_TOKEN.code, 'Session expired');
        }

        if (latestToken !== token) {
            logger.warn(`Duplicate login detected for user: ${decoded.uid}`);
            return ProtoUtil.sendError(res, 409, Code.DUPLICATE_LOGIN.code, Code.DUPLICATE_LOGIN.message);
        }

        // 4. 인증 성공 - uid, pf를 req에 추가
        req.uid = decoded.uid;
        req.pf = decoded.pf;

        logger.debug(`Auth success: uid=${decoded.uid}, pf=${decoded.pf}`);

        next();
    } catch (err) {
        logger.error(`Auth middleware error: ${err.message}`);
        return ProtoUtil.sendError(res, 500, Code.EXCEPTION.code, Code.EXCEPTION.message);
    }
};

module.exports = protoAuthMiddleware;
