var process = require('process');
const randToken = require('rand-token');
const jwt = require('jsonwebtoken');
const secretKey = process.env.ACCESS_TOKEN_SECRET;
const options = require('../config/jwtconfig').options;
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

module.exports = {
    sign: async (uid, pf) => {
        const payload = {
            uid: uid,
            pf: pf,
        };
        const accessToken = jwt.sign(payload, secretKey, options);
        return accessToken;
    },
    verify: async token => {
        let decoded;
        try {
            // verify를 통해 값 decode!
            decoded = await jwt.verify(token, secretKey);
        } catch (err) {
            if (err.message === 'jwt expired') {
                return TOKEN_EXPIRED;
            } else if (err.message === 'invalid token') {
                console.log(TOKEN_INVALID);
                return TOKEN_INVALID;
            } else {
                return TOKEN_INVALID;
            }
        }
        return decoded;
    },
};
