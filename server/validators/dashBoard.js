const { check, param, query } = require("express-validator");

module.exports.validateQuery = [
    query('projectId').optional().isUUID().withMessage('project id should be valid UUID'),
    query('sprintId').optional().isUUID().withMessage('sprint id should be valid UUID')
]