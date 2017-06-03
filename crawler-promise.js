/**
 * Created by Cho To Xau Tinh on 12-Oct-16.
 */
var Promise = require('bluebird');
var Crawler = require('crawler');

module.exports = function (options, payload, responseType) {
    var c = new Crawler(options);

    function promise_crawler(crawler, data) {
        return new Promise(function (fulfill, reject) {
            crawler.queue(Object.assign(data, {
                callback: function (err, result) {
                    if (err)
                        return reject(err);
                    if (responseType == 'json') {
                        try {
                            return fulfill(JSON.parse(result.body));
                        } catch (error) {
                            return reject(error);
                        }
                    }
                    return fulfill(result.body);
                }
            }));
        });
    }

    if (Array.isArray(payload)) {
        return Promise.all(payload.map(function (data) {
            return promise_crawler(c, data);
        }));
    }
    return promise_crawler(c, payload);
}