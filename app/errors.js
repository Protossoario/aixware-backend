function respondWithFileError (response, error) {
    response.status(400).json({
        'error': {
            'code': 400,
            'messages': [ error.message ]
        }
    });
}

function respondWithMongooseError (response, error) {
    response.status(400).json({
        'error': {
            'code': 400,
            'messages': Object.keys(error.errors).map(function (prop) {
                return error.errors[prop].message;
            })
        }
    });
}

function respondWithAuthenticationError (response, message) {
    response.status(401).json({
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
