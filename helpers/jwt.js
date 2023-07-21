/**
 * Helper function for creating the token.
 */
const { expressjwt:jwt } = require("express-jwt")

function authJwt() {
    const secret = process.env.SECRET;
    const api = process.env.API_URL;

    return jwt({
        secret,
        algorithms: ["HS256"], // select the crypto algorithm
        isRevoked: isRevoked
    }).unless({
        path: [
            // Used to define routes for HTTP GET and OPTIONS methods that start with /api/v1/products.
            {url: /\/api\/v1\/products(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, method: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`
        ]
    });
}

/**
 * Judge for admin
 * @param req
 * @param token
 * @returns {Promise<undefined|boolean>}
 */
async function isRevoked(req, token) {
    if(!token.payload.isAdmin) {
        return true;
    }
    //User is not admin
    return undefined;
}

module.exports = authJwt;
