const moment = require('moment');

exports.formatDate = (date, format) => 
    date ? moment(date).format(format || 'D MMM YYYY') : '';