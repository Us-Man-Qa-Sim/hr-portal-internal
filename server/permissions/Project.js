const { roles } = require("../configs/Constants");
const AppError = require("../utils/AppError");

const formatEmployees = (arr, single = false) => {
  const result = Array.isArray(arr) ? [...arr] : [arr];
  const start = Array.isArray(arr) ? [...arr] : [arr];

  start.forEach((item, indexItem) => {
    const emps = [];
    item.employees.forEach((employee) => {
      const row = {
        ...employee.employee,
      };
      emps.push(row);
    });
    result[indexItem].employees = emps;
  });

  return single ? (result.length === 1 ? result[0] : {}) : result;
};

module.exports.scopedProjects = (user, projects) => {
  if (user.role === roles.ADMIN) return formatEmployees(projects);

  if (user.role === roles.CLIENT)
    return formatEmployees(
      projects.filter((project) => project.client.id === user.id),
      single
    );

  if (user.role === roles.EMPLOYEE)
    return formatEmployees(
      projects.filter((project) => {
        for (i = 0; i < project.employees.length; i++) {
          if (project.employees[i].employee.employeeId === user.id) return true;
        }
        return false;
      })
    );
};

module.exports.scopedProject = (user, project, next) => {
  if (user.role === roles.ADMIN) return formatEmployees(project, true);

  if (user.role === roles.CLIENT)
    return formatEmployees(
      project.client.clientId === user.id ? project : [],
      true
    );

  if (user.role === roles.EMPLOYEE) {
    const data = project.employees.find(
      (item) => item.employee.employeeId === user.id
    );
    return formatEmployees(data ? project : [], true);
  }
};
