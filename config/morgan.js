const morgan = require('morgan');
const logger = require('./winston'); // 위에서 만든 winston 설정을 가져옴

module.exports = function (app) {
    // Morgan이 기록하는 스트림을 Winston의 logger로 연결
    const stream = {
        write: (message) => {
            // message.trim()을 통해 morgan이 붙이는 마지막 줄바꿈 제거
            logger.info(`${message.trim()}`);
        },
    };

    // 운영환경이면 combined(자세히), 개발환경이면 dev 포맷 사용
    const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

    // morgan 로그를 winston 스트림을 통해 기록하도록 설정
    app.use(morgan(format, { stream }));
};