module.exports = function send(desc, data) {
    var res = this.res;
    var req = this.req;
    var response = {
        code: responseCode.getCode(desc),
        desc: desc,
        message: req.__(desc),
        data: _.isEmpty(data) ? "" : data
    };

    res.status(200);
    res.json(response);
};
