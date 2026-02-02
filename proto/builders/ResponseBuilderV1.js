const Code = require('../../common/Code');

/**
 * API v1 전용 Protobuf 응답 빌더
 */
class ResponseBuilderV1 {

    /**
     * 응답 타입 이름을 proto 타입 문자열로 변환
     * @param {string} responseName - 응답 이름 (예: 'VersionResponse', 'LoginResponse')
     * @returns {string} proto 타입 문자열 (예: 'api.v1.VersionResponse')
     */
    static getProtoType(responseName) {
        return `api.v1.${responseName}`;
    }

    /**
     * VersionResponse 생성
     * @param {number} updateFlag - 업데이트 플래그 (0: 없음, 1: 마이너, 2: 메이저, 3: 리뷰)
     * @param {Object} header - 응답 헤더 (기본값: Code.OK)
     * @returns {Object} api.v1.VersionResponse 형식의 객체
     */
    static createVersionResponse(updateFlag = 0, header = Code.OK) {
        return {
            header: header,
            updateFlag: updateFlag
        };
    }

    /**
     * LoginResponse 생성
     * @param {string} nickname - 닉네임
     * @param {string} accessToken - 접근 토큰
     * @param {boolean} skipTutorial - 튜토리얼 스킵 여부
     * @param {Object} property - 재화 정보 객체 ({gold, gem})
     * @param {Object} header - 응답 헤더 (기본값: Code.OK)
     * @returns {Object} api.v1.LoginResponse 형식의 객체
     */
    static createLoginResponse(nickname, accessToken, skipTutorial, property, header = Code.OK) {
        return {
            header: header,
            nickname: nickname,
            accessToken: accessToken,
            skipTutorial: skipTutorial,
            property: property
        };
    }


}

module.exports = ResponseBuilderV1;
