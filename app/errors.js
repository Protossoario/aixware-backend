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

module.exports = {
    respondWithFileError: respondWithFileError,
    respondWithMongooseError: respondWithMongooseError
};
