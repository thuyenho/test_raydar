module.exports = function send(desc, data) {
    var res = this.res;
    var req = this.req;
    var response = {
        code: responseCode.getCode(desc),
        desc: desc,
        message: req.__(desc),
        data: data || '',
    };

    res.status(400);
    res.json(response);
};
