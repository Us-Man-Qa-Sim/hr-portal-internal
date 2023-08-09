const { Op, where, fn, col } = require("sequelize");
const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");
const Services = require("../Services/Ticket.service");
const Paginate = require("../utils/Paginate");
const { email } = require("../email/sendPaySlip");
const { designationIds } = require("../configs/Constants");
const paginationServices = require("../Services/Project.service");

module.exports.getTickets = CatchAsync(async (req, res, next) => {
    const { params, user, query } = req;

    let whereClause = await Services.makeWhereClause(user, query,)

    whereClause['projectId'] = query?.projectId ? query?.projectId :
        whereClause.projectId ? whereClause.projectId : undefined

    whereClause['status'] = query?.status ? query?.status : undefined
    whereClause['priority'] = query?.priority ? query?.priority : undefined

    Object.keys(whereClause).forEach((item) => {
        if (whereClause[item] === undefined) delete whereClause[item];
    });

    console.log('whereClause---->', whereClause)

    let pagination = await Paginate(
        Models.Ticket,
        whereClause,
        query.page,
        query.limit
    );

    let tickets = await Models.Ticket.findAll({
        where: whereClause,
        include: [{ model: Models.TicketLog, attributes: ['userId', 'log'] },
        { model: Models.Project, attributes: ['title'] }],
        order: [["createdAt", "desc"]],
        limit: pagination.limit,
        offset: pagination.offset,

    })

    tickets = Helpers.convertToPlainJSObject(tickets)
    pagination = paginationServices.updatePagination(pagination, tickets);
    let ticketCount = await Services.countTickets(whereClause)

    tickets.map((ticket) => {
        ticket['ticketId'] = `#TKT-${('00' + (ticket.ticketNumber)).slice(-3)}`
    })
    res.status(200).json({
        status: "Success",
        message: "Project tickets are fetched successfully",
        data: {
            tickets, pagination, ticketCount

        },
    });
});

module.exports.addTicket = CatchAsync(async (req, res, next) => {
    const { user } = req;
    const { data } = req.body;
    data['date'] = new Date();

    const project = await Models.Project.findOne({
        where: { id: data.projectId, deleted: false },
    });

    if (!project)
        return next(new AppError("Project not found or incorrect Project ID", 400));

    let ticket = await Models.Ticket.create({ ...data });

    ticket = Helpers.convertToPlainJSObject(ticket);

    ticket && await Models.TicketLog.create({
        ticketId: ticket.id, userId: user.id, log: `${user.name} created ticket ${ticket.ticketName}`
    })

    let leads = await getProjectLead(data.projectId)
    leads = leads.filter((lead) => { if (lead.designationId == designationIds.teamLead) return lead })

    ticket && leads.length > 0 && await email({
        to: leads.map((lead) => lead.email),
        subject: "New Tick",
        html: `${user.name} added <strong>${ticket.ticketName}</strong> into ${project.title}.`,
        attachments: null,
    })

    res.status(200).json({
        status: "Success",
        message: "ticket created successfully",
        data: {
            ticket,
        },
    });
});

module.exports.deleteTicket = CatchAsync(async (req, res, next) => {
    const { id } = req.params;

    const checkTicketInDB = await Models.Ticket.findOne({ where: { id } });
    if (!checkTicketInDB)
        return next(new AppError("Invalid ID. Ticket not found", 404));

    let ticket = await Models.Ticket.destroy({
        where: {
            id,
        },
    });
    if (ticket === 1) return res.status(200).json({
        status: "success",
        message: "Ticket deleted successfully",
    });

    return res.status(404).json({
        status: "fail",
        message: "unable to delete ticket",
    });
});

module.exports.updateTicket = CatchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { user, body: { data }, } = req;

    const checkTicketInDB = await Models.Ticket.findOne({ where: { id } });
    if (!checkTicketInDB)
        return next(new AppError("Invalid ID. Ticket not found", 404));

    let [, [ticket]] = await Models.Ticket.update(
        { ...data },
        { where: { id }, returning: true }
    );

    ticket = Helpers.convertToPlainJSObject(ticket);

    ticket && await Models.TicketLog.create({
        ticketId: ticket.id, userId: user.id, log: `${user.name} updated ticket ${ticket.ticketName}`
    })

    return res.status(200).json({
        status: "success",
        message: "Ticket updated successfully",
        data: {
            id,
            ticket
        },
    });
});

module.exports.assignedEmployeeToTicket = CatchAsync(async (req, res, next) => {

    const { id } = req.params;
    const { user, body: { data }, } = req;

    const checkEmployeeInDB = await Models.User.findOne({ where: { id: data.employeeId, deleted: false } });

    if (!checkEmployeeInDB)
        return next(new AppError("Invalid ID. user not found", 404));

    const checkTicketInDB = await Models.Ticket.findOne({ where: { id } });

    if (!checkTicketInDB)
        return next(new AppError("Invalid ID. Ticket not found", 404));

    const checkProjectEmployee = await Models.ProjectEmployee.findOne(
        { where: { employeeId: data.employeeId, projectId: checkTicketInDB.projectId } })

    if (!checkProjectEmployee)
        return next(new AppError("Invalid Employee ID. This employee is not assigned to that project", 404));

    let allowed = await Services.addEmployee(user, checkTicketInDB)

    if (!allowed)
        return next(new AppError("Invalid ID. you can not assign employee to that project", 404));

    let [, [ticket]] = await Models.Ticket.update(
        { employeeId: data.employeeId },
        { where: { id }, returning: true }
    );

    ticket = Helpers.convertToPlainJSObject(ticket);

    ticket && await Models.TicketLog.create({
        ticketId: ticket.id, userId: user.id, log: `${user.name} assigned ${checkEmployeeInDB.name} to ticket ${ticket.ticketName}`
    })


    return res.status(200).json({
        status: "success",
        message: "Employee assigned to the task successfully",
        data: {
            ticket,
        },
    });
});

module.exports.changeTicketStatus = CatchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { user, body: { data }, } = req;

    const checkTicketInDB = await Models.Ticket.findOne({ where: { id } });
    if (!checkTicketInDB)
        return next(new AppError("Invalid ID. Ticket not found", 404));

    let [, [ticket]] = await Models.Ticket.update(
        { status: data.status },
        { where: { id }, returning: true }
    );

    ticket && ticket.status !== checkTicketInDB.status && await Models.TicketLog.create({
        ticketId: ticket.id, userId: user.id, log: `${user.name} changed ticket ${ticket.ticketName} from ${checkTicketInDB.status} to ${ticket.status}`
    })

    res.status(200).json({
        status: "Success",
        message: "Ticket status updated successfully",
        data: {
            ticket,
        },
    });
});

const getProjectLead = async (projectId) => {

    let leads = await Models.User.findAll({
        include: [{ model: Models.ProjectEmployee, where: { projectId, isLead: true } }],
        attributes: ['id', 'name', 'email', 'deviceToken', 'designationId']
    })

    leads = Helpers.convertToPlainJSObject(leads)
    return leads
}