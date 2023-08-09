// const Models = require("../models");
// const { roleIds, moduleIds } = require("../configs/Constants");
// const { Op, fn, where, col } = require("sequelize");

// module.exports.projectWhereClause = async (user) => {
//   let whereClause = { deleted: false };

//   if (user.designationId) {
//     let permission = await Models.Permission.findOne({
//       where: {
//         moduleId: moduleIds[1],
//         roleId: user.roleId,
//         designationId: user.designationId,
//       },
//       attributes: ["read", "write", "update", "delete"],
//     });

//     permission = JSON.parse(JSON.stringify(permission));

//     let isCRUD = Object.values(permission).every((val) => val === true);

//     if (!isCRUD) {
//       let projects = await Models.ProjectEmployee.findAll({
//         where: {
//           employeeId: user.id,
//         },
//         attributes: ["projectId"],
//       });

//       let projectList = [];

//       projects?.map((data) => projectList.push(data.projectId));

//       whereClause["id"] = { [Op.in]: projectList };
//     }
//   }

//   if (user.roleId === roleIds[2]) whereClause["clientId"] = user.id;

//   return whereClause;
// };

const Models = require("../models");
const { roleIds, moduleIds, designationIds } = require("../configs/Constants");
const { Op, fn, where, col } = require("sequelize");

module.exports.projectWhereClause = async (user) => {
  let whereClause = { deleted: false };

  if (user.designationId) {
    let permission = await Models.Permission.findOne({
      where: {
        moduleId: moduleIds[1],
        roleId: user.roleId,
        designationId: user.designationId,
      },
      attributes: ["read", "write", "update", "delete"],
    });

    permission = JSON.parse(JSON.stringify(permission));

    let isCRUD = Object.values(permission).every((val) => val === true);

    if (isCRUD && user.designationId !== designationIds.teamLead) return whereClause;

    let projectList = await getProjects(user);
    whereClause["id"] = { [Op.in]: projectList };
  }

  if (user.roleId === roleIds[2]) whereClause["clientId"] = user.id;

  return whereClause;
};

const getProjects = async (user) => {
  let projects = await Models.ProjectEmployee.findAll({
    where: {
      employeeId: user.id,
    },
    attributes: ["projectId"],
  });

  let projectList = [];

  projects?.map((data) => projectList.push(data.projectId));

  return projectList;
};

// module.exports.updatePagination = (pagination, record) => {
//   const { currentPage, limit } = pagination;

//   pagination["start"] = currentPage == 1 ? 1 : currentPage * limit - limit;

//   if (nextPage === null) {
//     pagination["end"] = pagination.start + record.length
//     return pagination
//   }




//   pagination["end"] =
//     record.length === limit   
//       ? limit
//       : pagination.start === 1
//       ? 0 + record.length
//       : pagination.start + record.length;

//   return pagination;
// };


module.exports.updatePagination = (pagination, record) => {
  let { currentPage, limit, nextPage } = pagination;

  pagination["start"] = currentPage == 1 ? 1 : currentPage * limit - limit;

  if (record.length <= limit && pagination.start === 1) {
    pagination["end"] = 0 + record.length
    return pagination
  }

  if (nextPage === null && record.length === limit) {
    pagination["end"] = pagination.start + record.length
    return pagination
  }

  if (record.length === limit && pagination.start === 1) {
    pagination["end"] = 0 + record.length
    return pagination
  }

  pagination["end"] = pagination.start + record.length;

  return pagination;
};

// "pagination": {
//   "limit": 4,
//     "offset": 4,
//       "nextPage": null,
//         "prevPage": 1,
//           "totalRecords": 8,
//             "totalPages": 2,
//               "currentPage": 2,
//                 "start": 4,
//                   "end": 4
// },