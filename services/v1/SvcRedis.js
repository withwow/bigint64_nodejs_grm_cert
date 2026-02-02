const logger = require('../../config/winston');
const redis = require('../../config/redis');

/**
 * Redis 관련 비즈니스 로직 및 세션 관리 서비스
 */
class SvcRedis {
    constructor(req, res) {
        this._req = req;
        this._res = res;
    }

    // --- Static Methods (Shared Logic) ---

    /**
     * 사용자의 로그인 토큰 저장 (중복 로그인 방지용)
     * @param {string} uid - 사용자 고유 ID
     * @param {string} token - 발급된 JWT 토큰
     * @param {number} ttl - 만료 시간 (기본값: 7일)
     */
    static async setUserToken(uid, token, ttl = 604800) {
        try {
            const key = redis.getKey('sess', uid);
            await redis.set(key, token, 'EX', ttl);
            logger.debug(`[Redis] Session saved for user: ${uid}`);
        } catch (err) {
            logger.error(`[Redis] Error saving session for user ${uid}: ${err.message}`);
            throw err;
        }
    }

    /**
     * 사용자의 현재 유효한 토큰 조회
     * @param {string} uid - 사용자 고유 ID
     * @returns {Promise<string|null>} 저장된 토큰
     */
    static async getUserToken(uid) {
        try {
            const key = redis.getKey('sess', uid);
            return await redis.get(key);
        } catch (err) {
            logger.error(`[Redis] Error getting session for user ${uid}: ${err.message}`);
            return null;
        }
    }

    // --- Instance Methods (API Handlers) ---

    /**
     * 중복 로그인 세션 키 전체 삭제 (관리자용 API)
     */
    async clearSessions() {
        try {
            await redis.clearSessions();
            logger.warn('⚠️ All user sessions cleared via API');

            this._res.json({
                code: 0,
                message: 'Sessions cleared successfully'
            });
        } catch (err) {
            logger.error(`Failed to clear sessions: ${err.message}`);
            this._res.status(500).json({
                code: 900,
                message: 'Failed to clear sessions'
            });
        }
    }
}

module.exports = SvcRedis;
