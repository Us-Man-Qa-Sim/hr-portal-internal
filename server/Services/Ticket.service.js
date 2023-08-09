const Models = require("../models");
const { roleIds, moduleIds, designationIds } = require("../configs/Constants");
const { Op, fn, where, col } = require("sequelize");

module.exports.checkTicketUpdate = async (user) => {

    let permission = await Models.Permission.findOne({
        where: {
            // moduleId: moduleIds[2], 8b137f05 - a830 - 49e2 - a1e3 - b734bcee8562
            moduleId: "8b137f05-a830-49e2-a1e3-b734bcee8562",
            roleId: user.roleId,
            designationId: user.designationId,
        },
        attributes: ["read", "write", "update", "delete"],
    });
    permission = JSON.parse(JSON.stringify(permission));

    if (permission?.write) return true;

    return false
};

module.exports.makeWhereClause = async (user, query) => {
    // if user is admin

    if (!user.isClient && !user.designationId) return {}

    // if user is client

    if (user.isClient && !user.designationId) {
        let projects = await Models.Project.findAll({ where: { clientId: user.id, deleted: false } })
        projects = JSON.parse(JSON.stringify(projects));
        let ids = projects.map((item) => { return item.id })
        console.log(ids.length)
        return {
            projectId: { [Op.in]: ids }
        }
    }


    let permission = await Models.Permission.findOne({
        where: {
            moduleId: moduleIds[1],
            //moduleId: "8a6fe9f9-d685-464d-8569-b9627b064f18",
            roleId: user.roleId,
            designationId: user.designationId,
        },
        attributes: ["read", "write", "update", "delete"],
    });

    permission = JSON.parse(JSON.stringify(permission));

    let isCRUD = Object.values(permission).every((val) => val === true);

    if (isCRUD && user.designationId !== designationIds.teamLead) return {}

    // if user is technical lead or project employee


    let projects = await Models.ProjectEmployee.findAll({ where: { employeeId: user.id, isLead: true } })
    projects = JSON.parse(JSON.stringify(projects));
    let ids = projects.map((item) => { return item.projectId })

    return {
        projectId: { [Op.in]: ids },
        employeeId: user.designationId === designationIds.teamLead ? undefined : user.id
    }
}

module.exports.addEmployee = async (user, ticket) => {

    console.log(user)

    let permission = await Models.Permission.findOne({
        where: {
            moduleId: moduleIds[1],
            //moduleId: "8a6fe9f9-d685-464d-8569-b9627b064f18",
            roleId: user.roleId,
            designationId: user.designationId,
        },
        attributes: ["read", "write", "update", "delete"],
    });

    permission = JSON.parse(JSON.stringify(permission));

    let isCRUD = Object.values(permission).every((val) => val === true);

    if (isCRUD && user.designationId !== designationIds.teamLead) return true

    let isProjectTechnicalLead = await Models.ProjectEmployee.findOne(
        { where: { employeeId: user.id, projectId: ticket.projectId, isLead: true } })

    isProjectTechnicalLead = JSON.parse(JSON.stringify(isProjectTechnicalLead))
    if (isCRUD && isProjectTechnicalLead) return true

    return false
}

module.exports.countTickets = async (whereClause) => {

    delete whereClause.status;
    let tickets = await Models.Ticket.findAll({ where: whereClause });


    let total = tickets.length

    let pendingTickets = tickets.filter((ticket) => {
        if (ticket.status == "Pending") return ticket
    }).length

    let inProgressTickets = tickets.filter((ticket) => {
        if (ticket.status == "In-Progress") return ticket
    }).length

    let resolvedTickets = tickets.filter((ticket) => {
        if (ticket.status == "Resolved") return ticket
    }).length

    return {
        total,
        pending: pendingTickets,
        progress: inProgressTickets,
        resolved: resolvedTickets
    }

}