const jwt = require('jsonwebtoken');
const UserService = require('../services/user.service');

//access token 생성
exports.generate_access_token = async (email) => {
    const jwt_token = jwt.sign({
        type: 'JWT',
        email: email
    }, process.env.JWT_TOKEN_SECRET, {
        expiresIn: '1d'
    });
    return jwt_token;
}

exports.generate_refresh_token = async (email) => {
    const jwt_token = jwt.sign({
        type: 'JWT',
        email: email
    }, process.env.JWT_TOKEN_SECRET, {
        expiresIn: '180d'
    });

    return jwt_token
}
//access token verify
exports.verify_access_token = async (token) => {
    let decoded = null;
    try {
        decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

//get refresh token && verify
exports.verify_refresh_token = async (email) => {
    try {
        const data = await UserService.getUser(email);
        const get_refresh_token = data.token;
        try {
            jwt.verify(get_refresh_token, process.env.JWT_TOKEN_SECRET);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }

    } catch (err) {
        console.log(err);
        return false;
    }
}
