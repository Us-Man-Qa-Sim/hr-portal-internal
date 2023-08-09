const { check, param, query } = require("express-validator");

module.exports.validateAddProject = [
    check("data.ticketName").exists().withMessage("ticketName is required"),
    check("data.description").exists().withMessage("Description is required"),
    check("data.projectId").exists().withMessage("project id  is required"),
    check("data.priority")
        .exists()
        .withMessage("priority is required")
        .isIn(["High", "Low"])
        .withMessage("Ticket priority must be one of High and Low"),
];

module.exports.validateIDparam = [
    param("id").exists().withMessage("Id is required as param"),
];

module.exports.validateChangeStatus = [
    check("data.status")
        .exists()
        .withMessage("status is required")
        .isIn(["Pending", "In-Progress", "Resolved"])
        .withMessage("Ticket status must be one of Pending, In-Progress and Resolved"),
]
module.exports.validateQuery = [
    query("priority")
        .optional()
        .isIn(["High", "Low"])
        .withMessage("Ticket priority must be one of High and Low"),
    query("data.status")
        .optional()
        .isIn(["Pending", "In-Progress", "Resolved"])
        .withMessage("Ticket status must be one of Pending, In-Progress and Resolved"),
    query('projectId').optional().isUUID().withMessage('project id should be valid UUID')

]
