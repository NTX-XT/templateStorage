const aes256 = require('aes256');
const { ENCRYPTION_KEY } = process.env;

const encrypt = (value) => {
    return aes256.encrypt(ENCRYPTION_KEY, value);
}

const decrypt = (value) => {
    return aes256.decrypt(ENCRYPTION_KEY, value);
}

const getDateTime = (date) => {
    var datetime = new Date(date);
    datetime = datetime.getFullYear()
        + "-"
        + ('0' + (datetime.getMonth() + 1)).slice(-2)
        + "-"
        + ('0' + datetime.getDate()).slice(-2) + " "
        + ('0' + datetime.getHours()).slice(-2) + ":"
        + ('0' + datetime.getMinutes()).slice(-2) + ":"
        + ('0' + datetime.getSeconds()).slice(-2);
    return datetime;
}

module.exports = {
    encrypt,
    decrypt,
    getDateTime
}