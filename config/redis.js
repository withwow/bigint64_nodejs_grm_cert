const logger = require('../config/winston');
const Redis = require('ioredis');

let redis;

// 클러스터 설정이 있는 경우
if (process.env.REDIS_NODES) {
    // 예: REDIS_NODES=172.18.0.101:6379,172.18.0.102:6379,172.18.0.103:6379
    const nodes = process.env.REDIS_NODES.split(',').map(node => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port) };
    });

    logger.info(`Connecting to Redis Cluster with ${nodes.length} nodes`);

    redis = new Redis.Cluster(nodes, {
        redisOptions: {
            password: process.env.REDIS_PASSWORD || undefined,
        }
    });
} else {
    // 단일 노드 설정
    logger.info(`Connecting to Redis Single Node: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);

    redis = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0
    });
}

/**
 * 클러스터 호환 키 생성 헬퍼
 * Hash Tag {}를 사용하여 동일한 사용자의 데이터가 같은 슬롯에 저장되도록 보장
 * 예: getKey('sess', 'uid123') -> sess:{uid123}
 */
redis.getKey = (prefix, uid, suffix) => {
    return suffix ? `${prefix}:{${uid}}:${suffix}` : `${prefix}:{${uid}}`;
};
/**
 * 특정 패턴의 세션 키만 선택적으로 삭제 (중복 로그인 방지 토큰만 초기화)
 */
redis.clearSessions = async () => {
    const pattern = 'sess:{*}';
    const nodes = redis.nodes ? redis.nodes('master') : [redis];
    let totalDeleted = 0;

    for (const node of nodes) {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await node.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                await node.del(...keys);
                totalDeleted += keys.length;
            }
        } while (cursor !== '0');
    }

    if (totalDeleted > 0) {
        logger.warn(`🧹 Cleaned up ${totalDeleted} active sessions.`);
    }
};

redis.on('connect', async () => {
    logger.info('Redis connected');
});

redis.on('error', (err) => {
    logger.error('Redis error:', err);
});

module.exports = redis;
