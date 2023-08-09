const express = require("express");

const ticketController = require("../controllers/Ticket.controller");
const { Authenticate, CheckPermission } = require("../middlewares/Auth");
const Models = require("../models");
const {
    validateAddProject,
    validateIDparam, validateChangeStatus, validateQuery
} = require("../validators/ticket");
const { validateInputData } = require("../utils/Helpers");
const router = express.Router();

router.use(Authenticate);

router.post('/',
    CheckPermission("TicketMangament"),
    validateAddProject,
    validateInputData,
    ticketController.addTicket
);

router.patch(
    "/assigned-employee/:id",
    CheckPermission("TicketMangament"),
    validateIDparam,
    validateInputData,
    ticketController.assignedEmployeeToTicket
);

router.get('/',
    CheckPermission("TicketMangament"),
    validateQuery,
    validateInputData,
    ticketController.getTickets)

router
    .route("/:id")
    .delete(
        CheckPermission("TicketMangament"),
        validateIDparam,
        validateInputData,
        ticketController.deleteTicket
    )
    .patch(
        CheckPermission("TicketMangament"),
        validateIDparam,
        validateInputData,
        ticketController.updateTicket)
    .put(
        CheckPermission("TicketMangament"),
        validateIDparam,
        validateChangeStatus,
        validateInputData,
        ticketController.changeTicketStatus)

module.exports = router;
