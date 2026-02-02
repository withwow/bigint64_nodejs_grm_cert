var logger = require('../config/winston');

var mysql = require('mysql2/promise');
var mysqlconfig = require('../config/mysql.js');
var pool = mysql.createPool(mysqlconfig);
var mybatismapper = require('mybatis-mapper');

var path = require('path');

// create the myBatisMapper from xml file
mybatismapper.createMapper([
    path.join(__dirname, '../xml/auth.xml'),
    path.join(__dirname, '../xml/member.xml'),
]);

function MAKESQL(namespace, id, param, _sqlformat) {
    var sql = mybatismapper.getStatement(namespace, id, param, _sqlformat);
    SQL(namespace, id, sql);
    return sql;
}

function SQL(namespace, id, query) {
    if (id != '') {
        logger.debug(`== SQL ${namespace}:${id}`);
        logger.debug(`\n${query}`);
    }
}

module.exports = {
    mapper: mybatismapper,
    pool: pool,
    MAKESQL: MAKESQL,
    SQL: SQL,
};
