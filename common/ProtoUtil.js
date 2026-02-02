const logger = require('../config/winston');
var util = require('util');

const ProtoUtil = {
    /**
     * 바이너리 요청 디코딩
     */
    decode: (req, typeName) => {
        try {
            const root = req.app.get('proto');
            const ProtoType = root.lookupType(typeName);

            logger.debug(`>>>>>>>>> ProtoUtil] Decoding ${typeName}, Content-Type: ${req.headers['content-type']}`);

            if (!Buffer.isBuffer(req.body)) {
                logger.error(`  Request body is not a Buffer. Type: ${typeof req.body}`);
                return null;
            }

            logger.debug(`  Buffer Length: ${req.body.length}, Hex: ${req.body.toString('hex')}`);

            try {
                // 1. Try decoding as Protobuf binary
                const message = ProtoType.decode(req.body);
                // toObject converts Message to plain object, applying defaults
                const result = ProtoType.toObject(message, { defaults: true });
                logger.debug(`  Decoded Result: ${util.inspect(result, { depth: null })}`);
                return result;
            } catch (e) {
                logger.error(`  Protobuf decode failed: ${e.message}`);
                throw e;
            }
        } catch (e) {
            logger.error(`  Decode Error (${typeName}): ${e.message}`);
            return null;
        }
    },

    /**
     * 정상 응답 전송
     */
    send: (res, typeName, data) => {
        const root = res.app.get('proto');
        const ProtoType = root.lookupType(typeName);

        logger.debug(`<<<<<<<<<< ProtoUtil] Sending ${typeName}`);
        logger.debug(`  Response Data: ${util.inspect(data, { depth: null })}`);

        const buffer = ProtoType.encode(ProtoType.create(data)).finish();

        logger.debug(`  Response Buffer Length: ${buffer.length}, Hex: ${buffer.toString('hex')}`);

        res.set('Content-Type', 'application/x-protobuf');
        res.send(buffer);
    },

    /**
     * 에러 응답 전송
     */
    sendError: (res, httpStatus, code, message) => {
        const root = res.app.get('proto');
        const ErrorType = root.lookupType('api.v1.ResponseHeader');
        const buffer = ErrorType.encode(ErrorType.create({ code, message })).finish();

        logger.debug(`<< ProtoUtil ERROR] HTTP ${httpStatus}, Code: ${code}, Msg: ${message}`);

        res.status(httpStatus)
        res.set('Content-Type', 'application/x-protobuf')
            .send(buffer);
    }
};

module.exports = ProtoUtil;