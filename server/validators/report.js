const { check, param, query } = require("express-validator");
const moment = require("moment");

module.exports.validateAttendanceSummaryQuery = [
    query('startDate').optional()
        .isDate().withMessage('startDate should be valid Date')
        .custom((startDate, { req }) => {

            if (req.query.endDate && startDate) {
                if (moment(req.query.endDate).isBefore(startDate)) throw new Error('start date must be before end date');
                return true

            }
            else {
                throw new Error('start Date and end Date both are required');
            }
        }),
    query('endDate').optional()
        .isDate().withMessage('endDate should be valid Date')
        .custom((endDate, { req }) => {
            if (req.query.startDate && endDate) return true

            throw new Error('start Date and end Date both are required');
        }),
]
