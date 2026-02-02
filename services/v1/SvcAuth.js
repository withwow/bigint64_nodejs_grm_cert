const logger = require('../../config/winston');
const ProtoUtil = require('../../common/ProtoUtil');
const ResponseBuilder = require('../../common/ResponseBuilder');
var Code = require('../../common/Code');
var MysqlConn = require('../../common/MysqlConn.js');
var _SqlFormat = { language: 'sql', indent: '  ' };

const util = require('util');
const Jwt = require('../../common/Jwt');
const redis = require('../../config/redis');
const SvcRedis = require('./SvcRedis');

class SvcAuth {
    constructor(req, res, body) {
        this._req = req;
        this._res = res;
        this._body = body;
    }

    async version() {
        let updateFlag = 0;
        let header = Code.OK;

        const param = this._body;

        let connection = null;
        try {
            connection = await MysqlConn.pool.getConnection(async conn => conn);

            var sql = MysqlConn.MAKESQL('auth', 'appversion', param, _SqlFormat);
            const [rows] = await connection.query(sql);

            if (rows.length > 0) {
                // 있으면 로그인
                let dbversion = rows[0].appversion;
                let reviewversion = rows[0].reviewversion;

                if (param.appVersion == undefined) {
                    updateFlag = 2; // 버전이 비었다
                } else if (param.appVersion == reviewversion) {
                    updateFlag = 3; // 리뷰 버전
                } else {
                    updateFlag = 0;

                    // 현재 버전 문자열을 '.'을 기준으로 분할합니다.
                    const currentVersionParts = param.appVersion.split('.'); // 앱 버전
                    const targetVersionParts = dbversion.split('.'); // DB에 저장된 버전

                    // 각 부분을 정수로 변환하여 비교합니다.
                    for (let i = 0; i < Math.max(currentVersionParts.length, targetVersionParts.length); i++) {
                        const currentPart = parseInt(currentVersionParts[i] || 0);
                        const targetPart = parseInt(targetVersionParts[i] || 0);

                        if (currentPart < targetPart) {
                            if (i === 0) {
                                // major
                                updateFlag = 2;
                            } else if (i === 1) {
                                // major
                                updateFlag = 2;
                            } else {
                                // minor
                                updateFlag = 1;
                            }
                            break;
                        } else if (currentPart > targetPart) {
                            if (i === 0) {
                                updateFlag = 0;
                            } else if (i === 1) {
                                updateFlag = 0;
                            } else {
                                updateFlag = 0;
                            }
                            break;
                        } else if (i === 2 && currentPart === targetPart) {
                            updateFlag = 0;
                        }
                    }
                }
            } else {
                // 없으면
                header = Code.NOT_FOUND;
            }
        } catch (err) {
            header = Code.EXCEPTION;
            logger.error(err.stack);
        } finally {
            if (connection) connection.release();
        }

        // ResponseBuilder를 사용하여 일관된 응답 생성
        const response = ResponseBuilder.v1.createVersionResponse(updateFlag, header);
        const protoType = ResponseBuilder.v1.getProtoType('VersionResponse');
        ProtoUtil.send(this._res, protoType, response);
    }

    async login() {
        let nickname = '';
        let accessToken = '';
        let skipTutorial = false;
        let property = { gold: 0, gem: 0 };
        let header = Code.OK;

        const param = this._body;
        logger.debug(util.inspect(param));

        let connection = null;
        try {
            connection = await MysqlConn.pool.getConnection(async conn => conn);
            // transaction
            connection.beginTransaction();

            let validCheck = true;
            var sql = MysqlConn.MAKESQL('auth', 'login', param, _SqlFormat);
            const [rows] = await connection.query(sql);

            if (rows.length > 0) {
                // 기존 회원
                if (rows[0].accesscode != 0) {
                    header = Code.CANT_ACCESS_14;
                    validCheck = false;
                } else {
                    skipTutorial = rows[0].skip_tutorial == 'Y' ? true : false;
                    nickname = rows[0].nickname;

                    // 회원 테이블에 업데이트
                    var uptsql = MysqlConn.MAKESQL('member', 'uptMember', param, _SqlFormat);
                    await connection.query(uptsql);
                }
            } else {
                // 신규 회원
                skipTutorial = false;

                // 회원 테이블에 등록
                var inssql = MysqlConn.MAKESQL('member', 'insMember', param, _SqlFormat);
                await connection.query(inssql);

                // 기본 재화 등록
                var insprop = MysqlConn.MAKESQL('member', 'insMemberProp', param, _SqlFormat);
                await connection.query(insprop);
            }

            if (validCheck) {

                // 로그인 히스토리
                var histsql = MysqlConn.MAKESQL('auth', 'hist_login', param, _SqlFormat);
                await connection.query(histsql);

                // 중복 로그인 체크 (기존 세션 존재 여부 확인)
                const existingToken = await SvcRedis.getUserToken(param.uid);
                if (existingToken) {
                    logger.info(`[Login] Duplicate login detected for user: ${param.uid}. Previous session will be invalidated.`);
                }

                // 토큰 생성 및 로그인 처리
                const jwtToken = await Jwt.sign(param.uid, param.pf);
                accessToken = jwtToken;

                // Redis에 토큰 저장 (중복 로그인 방지용 - Latest Token Wins)
                await SvcRedis.setUserToken(param.uid, accessToken);

                // 플레이어 재화 정보
                var propSql = MysqlConn.MAKESQL('member', 'selMemberProp', param, _SqlFormat);
                const [propRs] = await connection.query(propSql);
                if (propRs.length > 0) {
                    property = propRs[0];
                }
            }

            // commit
            connection.commit();
        } catch (err) {
            // rollback
            if (connection) connection.rollback();

            header = Code.EXCEPTION;
            logger.error(err.stack);
        } finally {
            if (connection) connection.release();
        }

        // ResponseBuilder를 사용하여 일관된 응답 생성
        const response = ResponseBuilder.v1.createLoginResponse(nickname, accessToken, skipTutorial, property, header);
        const protoType = ResponseBuilder.v1.getProtoType('LoginResponse');
        ProtoUtil.send(this._res, protoType, response);
    }
}

module.exports = SvcAuth;