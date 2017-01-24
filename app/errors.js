function respondWithFileError (response, error) {
    return response.status(400).json({
        'error': {
            'code': 400,
            'messages': [ error.message ]
        }
    });
}

function respondWithMongooseError (response, error) {
    return response.status(400).json({
        'error': {
            'code': 400,
            'messages': Object.keys(error.errors).map(function (prop) {
                return error.errors[prop].message;
            })
        }
    });
}

function respondWithAuthenticationError (response, message) {
    return response.status(401).json({
        'error': {
            'code': 401,
            'messages': [ message ]
        }
    });
}

module.exports = {
    respondWithFileError: respondWithFileError,
    respondWithMongooseError: respondWithMongooseError,
    respondWithAuthenticationError: respondWithAuthenticationError
};
