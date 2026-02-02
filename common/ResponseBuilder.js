/**
 * ResponseBuilder 팩토리
 * 버전별 ResponseBuilder를 제공하는 중앙 진입점
 */

const ResponseBuilderV1 = require('../proto/builders/ResponseBuilderV1');

class ResponseBuilder {
    /**
     * 버전별 ResponseBuilder 인스턴스 반환
     * @param {string} version - API 버전 ('v1', 'v2', etc.)
     * @returns {Object} 해당 버전의 ResponseBuilder 클래스
     */
    static getBuilder(version = 'v1') {
        switch (version) {
            case 'v1':
                return ResponseBuilderV1;
            // case 'v2':
            //     return ResponseBuilderV2;
            default:
                throw new Error(`Unsupported API version: ${version}`);
        }
    }

    /**
     * v1 빌더에 대한 직접 접근 (하위 호환성)
     */
    static get v1() {
        return ResponseBuilderV1;
    }

    /**
     * v2 빌더에 대한 직접 접근 (하위 호환성)
     */
    // static get v2() {
    //     return ResponseBuilderV2;
    // }
}

module.exports = ResponseBuilder;
