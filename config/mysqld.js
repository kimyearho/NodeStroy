/**
 * Created by kim on 2016-11-04.
 */
var mysql = require('mysql');

var pool  = mysql.createPool({
    host            : '150.95.137.151',
    user            : 'kimyearho',
    password        : '1851617k@',
    database        : 'nodestory'
});

module.exports = pool;