const User = require("./User.model");
const Task = require("./Task.model");
const Project = require("./Project.model");
const ProjectEmployee = require("./ProjectEmployee.model");
const TaskLog = require("./TaskLog.model");
const Conversation = require("./Conversation.model");
const ConversationMember = require("./ConversationMember.model");
const Message = require("./Message.model");
const LeaveApplication = require("./LeaveApplication.model");
const Notification = require("./Notification.model");
const Notifies = require("./Notifies.model");
const Incentive = require("./Incentive.model");
const SalaryDetail = require("./SalaryDetail.model");
const Department = require("./Department.model");
const PaymentHead = require("./PaymentHead.model");
const Payment = require("./Payment.model");
const Question = require("./Qustion.model");
const Answer = require("./Answer.model");
const Test = require("./Test.model");
const TestQuestion = require("./TestQuestion.model");
const TestUser = require("./TestUser.model");
const PayOut = require("./PayOut.model");
const Role = require("./Role.model");
const Module = require("./Module.model");
const Designation = require("./Designation.model");
const Permission = require("./Permission.model");
const ProjectDocument = require("./ProjectDocument.model");
const ProjectEquipment = require("./ProjectEquipment.model");
const Status = require("./Status.model");
const Comment = require("./comments.model");
const Issue = require("./Issue.model");
const ProjectStatus = require("./ProjectStatus.model");
const Attendance = require("./Attendance.model");
const Experience = require("./Experience.model");
const Education = require("./EducationInformation.model");
const EmergencyContact = require("./EmergencyContact.model");
const LeaveApplicationStatus = require("./LeaveStatus.model");
const Holiday = require("./Holidays.model");
const LeaveSetting = require("./LeaveSetting.model");
const Expense = require("./Expense.model");
const ExpenseAttachment = require("./ExpenseAttachments.model");
const Quotation = require("./Quotation.model");
const QuotationItem = require("./QuotationItem.model");
const Invoice = require("./Invoice.model");
const InvoiceItem = require("./InvoiceItem.model");
const EmployeeSalary = require("./EmployeeSalary.model");
const EmployeeIncentive = require("./EmployeeIncentive.model");
const EmployeeSalarySlip = require("./EmployeeSalarySlip.model");
const MonthlySalaryIncentive = require("./MonthlySalaryIncentive.model");
const Ticket = require("./Ticket.model");
const ClientTask = require("./ClientTask.model");
const ClientBoardStatus = require("./ClientBoardStatus.model");
const Sprint = require("./Sprint.model");
const SprintLog = require("./SprintLog.model");
const Bug = require("./Bug.model");
const BugLog = require("./BugLog.model");
const TicketLog = require('./TicketLog.model')

User.hasMany(Project, { as: "projects", foreignKey: "clientId" });
Project.belongsTo(User, {
  foreignKey: "clientId",
  as: "client",
});
User.hasMany(Project, { as: "projectCreators", foreignKey: "createdBy" });
Project.belongsTo(User, {
  foreignKey: "createdBy",
  as: "projectCreator",
});

User.hasMany(ProjectEmployee, {
  //as: "projectEmployees",
  foreignKey: "employeeId",
});
ProjectEmployee.belongsTo(User, {
  foreignKey: "employeeId",
  //as: "employee"
});

User.hasMany(Task, {
  // as: "tasks",
  foreignKey: "employeeId",
});
Task.belongsTo(User, {
  as: "employee",
  foreignKey: "employeeId",
});

Project.hasMany(Task, {
  foreignKey: "projectId",
});

Task.belongsTo(Project, {
  foreignKey: "projectId",
});

User.hasMany(Task, { foreignKey: "createdby" });
Task.belongsTo(User, { foreignKey: "createdby", as: "taskCreator" });

Status.hasMany(Task, { foreignKey: "statusId" });
Task.belongsTo(Status, { foreignKey: "statusId" });

Task.hasMany(TaskLog, {
  // as: "logs",
  foreignKey: "taskId",
});
TaskLog.belongsTo(Task, {
  //  as: "task",
  foreignKey: "taskId",
});

User.hasMany(TaskLog, {
  foreignKey: "userId",
});
TaskLog.belongsTo(User, {
  foreignKey: "userId",
});

Status.hasMany(TaskLog, {
  foreignKey: "statusId",
});
TaskLog.belongsTo(Status, {
  foreignKey: "statusId",
});

Conversation.belongsTo(User, {
  //as: "member1",
  foreignKey: "conversationMember1",
});
Conversation.belongsTo(User, {
  //  as: "member2",
  foreignKey: "conversationMember2",
});

Conversation.hasMany(ConversationMember, {
  // as: "members",
  foreignKey: "conversationId",
});
ConversationMember.belongsTo(Conversation, {
  //as: "conversation",
  foreignKey: "conversationId",
});

User.hasMany(ConversationMember, {
  //  as: "groups",
  foreignKey: "memberId",
});
ConversationMember.belongsTo(User, {
  //as: "member",
  foreignKey: "memberId",
});

Conversation.hasMany(Message, {
  // as: "messages",
  foreignKey: "conversationId",
});
Message.belongsTo(Conversation, {
  //  as: "conversation",
  foreignKey: "conversationId",
});

User.hasMany(Message, {
  // as: "messages",
  foreignKey: "senderId",
});
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });

User.hasMany(LeaveApplication, {
  // as: "applications",
  foreignKey: "employeeId",
});
LeaveApplication.belongsTo(User, {
  //as: "employee",
  foreignKey: "employeeId",
});

User.hasMany(LeaveApplication, {
  as: "leaveApplication",
  foreignKey: "approvedBy",
});
LeaveApplication.belongsTo(User, {
  as: "acceptedBy",
  foreignKey: "approvedBy",
});

LeaveApplicationStatus.hasMany(LeaveApplication, {
  foreignKey: "leavestatus",
});
LeaveApplication.belongsTo(LeaveApplicationStatus, {
  foreignKey: "leavestatus",
});

//Notification, Notifies, User Associations
User.hasMany(Notifies, {
  foreignKey: "from",
  //as: "sentNofications",
});
Notifies.belongsTo(User, {
  foreignKey: "from",
  // as: "sender",
});

User.hasMany(Notifies, {
  foreignKey: "to",
  //  as: "receivedNotifications",
});
Notifies.belongsTo(User, {
  foreignKey: "to",
  // as: "receiver",
});

Notification.hasMany(Notifies, {
  foreignKey: "notificationId",
  //as: "notifies",
});
Notifies.belongsTo(Notification, {
  foreignKey: "notificationId",
  //  as: "notification",
});

Department.hasMany(Project, {
  foreignKey: "departmentId",
  // as: "projects",
});
Project.belongsTo(Department, {
  foreignKey: "departmentId",
  //  as: "department",
});

User.hasMany(SalaryDetail, {
  foreignKey: "salaryId",
  // as: "totalSalary",
});
SalaryDetail.belongsTo(User, {
  foreignKey: "salaryId",
  // as: "salary",
});

Incentive.hasOne(SalaryDetail, {
  foreignKey: "incentiveId",
  //  as: "incentiveinfo",
});
SalaryDetail.belongsTo(Incentive, {
  foreignKey: "incentiveId",
  // as: "incentive",
});

Project.hasMany(Payment, {
  foreignKey: "projectId",
  // as: "payments",
});
Payment.belongsTo(Project, {
  foreignKey: "projectId",
  // as: "project",
});
PaymentHead.hasMany(Payment, {
  foreignKey: "paymentHeadId",
  // as: "payments",
});
Payment.belongsTo(PaymentHead, {
  foreignKey: "paymentHeadId",
  // as: "paymentHead",
});

Department.hasMany(Question, {
  foreignKey: "departmentId",
  // as: "questions",
});
Question.belongsTo(Department, {
  foreignKey: "departmentId",
  // as: "department",
});

Department.hasMany(Test, {
  foreignKey: "departmentId",
  // as: "tests",
});
Test.belongsTo(Department, {
  foreignKey: "departmentId",
  //  as: "department",
});

Test.hasMany(TestQuestion, {
  foreignKey: "testId",
  //  as: "testQuestions",
});
TestQuestion.belongsTo(Test, {
  as: "test",
  // foreignKey: "testId",
});

Question.hasMany(TestQuestion, {
  as: "questions",
  //  foreignKey: "questionId",
});
TestQuestion.belongsTo(Question, {
  foreignKey: "questionId",
  //  as: "testIdQuestion",
});

Test.hasMany(TestUser, {
  foreignKey: "testId",
  // as: "testusers",
});
TestUser.belongsTo(Test, {
  foreignKey: "testId",
  // as: "testuser",
});

Test.hasMany(Answer, {
  foreignKey: "testId",
  // as: "testAnswer",
});
Answer.belongsTo(Test, {
  foreignKey: "testId",
  // as: "answers",
});

Question.hasMany(Answer, {
  foreignKey: "questionId",
  // as: "questionAnswers",
});
Answer.belongsTo(Question, {
  foreignKey: "questionId",
  // as: "question",
});

TestUser.hasMany(Answer, {
  foreignKey: "testUserId",
  // as: "testUserAnswers",
});
Answer.belongsTo(TestUser, {
  foreignKey: "testUserId",
  // as: "user",
});

Role.hasMany(Designation, {
  foreignKey: "roleId",
  // as: "designation",
});
Designation.belongsTo(Role, {
  foreignKey: "roleId",
  //  as: "role",
});

Role.hasMany(Permission, {
  foreignKey: "roleId",
  //  as: "rolePermissions",
});
Permission.belongsTo(Role, {
  foreignKey: "roleId",
  //  as: "permissionRole",
});

Module.hasMany(Permission, {
  foreignKey: "moduleId",
  //  as: "roleModules",
});
Permission.belongsTo(Module, {
  foreignKey: "moduleId",
  // as: "module",
});

Designation.hasMany(Permission, {
  foreignKey: "designationId",
  //  as: "roleDesignations",
});
Permission.belongsTo(Designation, {
  foreignKey: "designationId",
  // as: "designation",
});

Role.hasMany(User, {
  foreignKey: "roleId",
  // as: "users",
});
User.belongsTo(Role, {
  foreignKey: "roleId",
  // as: "userRole",
});

User.hasMany(Attendance, { foreignKey: "userId" });
Attendance.belongsTo(User, {
  foreignKey: "userId",
});

Designation.hasMany(User, {
  foreignKey: "designationId",
  // as: "users",
});
User.belongsTo(Designation, {
  foreignKey: "designationId",
  // as: "userDesignation",
});
Project.hasMany(ProjectEmployee, {
  foreignKey: "projectId",
});
ProjectEmployee.belongsTo(Project, {
  foreignKey: "projectId",
});
Project.hasMany(ProjectEquipment, {
  foreignKey: "projectId",
  // as:'projects'
});
ProjectEquipment.belongsTo(Project, {
  foreignKey: "projectId",
});
User.hasMany(ProjectDocument, {
  foreignKey: "userId",
});
ProjectDocument.belongsTo(User, {
  foreignKey: "userId",
});

Project.hasMany(ProjectDocument, { foreignKey: "projectId" });
ProjectDocument.belongsTo(Project, { foreignKey: "projectId" });

User.hasMany(Experience, { foreignKey: "userId" });
Experience.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Education, { foreignKey: "userId" });
Education.belongsTo(User, { foreignKey: "userId" });

User.hasMany(EmergencyContact, { foreignKey: "userId" });
EmergencyContact.belongsTo(User, { foreignKey: "userId" });

ProjectStatus.hasMany(Project, {
  foreignKey: "status",
});
Project.belongsTo(ProjectStatus, { foreignKey: "status" });

Task.hasMany(Issue, { foreignKey: "taskId" });
Issue.belongsTo(Task, { foreignKey: "taskId" });

Task.hasMany(Comment, { foreignKey: "taskId" });
Comment.belongsTo(Task, { foreignKey: "taskId" });

User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });


Expense.hasMany(ExpenseAttachment, {
  foreignKey: "expenseId",
});
ExpenseAttachment.belongsTo(Expense, {
  foreignKey: "expenseId",
});

Department.hasMany(Expense, {
  foreignKey: "purchasedBy",
});
Expense.belongsTo(Department, {
  foreignKey: "purchasedBy",
});

User.hasMany(Quotation, {
  foreignKey: "clientId",
});
Quotation.belongsTo(User, { foreignKey: "clientId" });

Project.hasMany(Quotation, {
  foreignKey: "projectId",
});
Quotation.belongsTo(Project, { foreignKey: "projectId" });

Quotation.hasMany(QuotationItem, {
  foreignKey: "quotationId",
});
QuotationItem.belongsTo(Quotation, {
  foreignKey: "quotationId",
});

User.hasMany(Invoice, {
  foreignKey: "clientId",
});
Invoice.belongsTo(User, { foreignKey: "clientId" });

Project.hasMany(Invoice, {
  foreignKey: "projectId",
});
Invoice.belongsTo(Project, { foreignKey: "projectId" });

Invoice.hasMany(InvoiceItem, {
  foreignKey: "invoiceId",
});
InvoiceItem.belongsTo(Invoice, {
  foreignKey: "invoiceId",
});

User.hasMany(EmployeeSalary, {
  foreignKey: "userId",
});
EmployeeSalary.belongsTo(User, { foreignKey: "userId" });

User.hasMany(EmployeeIncentive, {
  foreignKey: "userId",
});
EmployeeIncentive.belongsTo(User, { foreignKey: "userId" });

Incentive.hasMany(EmployeeIncentive, {
  foreignKey: "incentiveId",
});
EmployeeIncentive.belongsTo(Incentive, { foreignKey: "incentiveId" });

User.hasMany(EmployeeSalarySlip, {
  foreignKey: "userId",
});
EmployeeSalarySlip.belongsTo(User, { foreignKey: "userId" });

EmployeeSalarySlip.hasMany(MonthlySalaryIncentive, {
  foreignKey: "MonthlySalaryId",
});
MonthlySalaryIncentive.belongsTo(EmployeeSalary, {
  foreignKey: "MonthlySalaryId",
});

Project.hasMany(Ticket, { foreignKey: "projectId" });
Ticket.belongsTo(Project, { foreignKey: "projectId" });

User.hasMany(Ticket, { foreignKey: "employeeId" });
Ticket.belongsTo(User, { foreignKey: "employeeId" });

Ticket.hasMany(TicketLog, { foreignKey: "ticketId" });
TicketLog.belongsTo(Ticket, { foreignKey: "ticketId" });

User.hasMany(TicketLog, { foreignKey: "userId" });
TicketLog.belongsTo(User, { foreignKey: "userId" });

Project.hasMany(ClientTask, { foreignKey: "projectId" });
ClientTask.belongsTo(Project, { foreignKey: "projectId" });

ClientBoardStatus.hasMany(ClientTask, { foreignKey: "statusId" });
ClientTask.belongsTo(ClientBoardStatus, { foreignKey: "statusId" });

Sprint.hasMany(Task, { foreignKey: "sprintId" });
Task.belongsTo(Sprint, { foreignKey: "sprintId" });

Task.hasMany(SprintLog, { foreignKey: "taskId" });
SprintLog.belongsTo(Task, { foreignKey: "taskId" });

Project.hasMany(SprintLog, { foreignKey: "projectId" });
SprintLog.belongsTo(Project, { foreignKey: "projectId" });

User.hasMany(SprintLog, { foreignKey: "employeeId" });
SprintLog.belongsTo(User, { foreignKey: "employeeId" });

Sprint.hasMany(SprintLog, { foreignKey: "sprintId" });
SprintLog.belongsTo(Sprint, { foreignKey: "sprintId" });

User.hasMany(Bug, { foreignKey: "employeeId" });
Bug.belongsTo(User, { foreignKey: "employeeId", as: "employee" });

User.hasMany(Bug, { foreignKey: "createdby", as: "userBugs" });
Bug.belongsTo(User, { foreignKey: "createdby", as: "creator" });

Task.hasMany(Bug, { foreignKey: "taskId" });
Bug.belongsTo(Task, { foreignKey: "taskId" });

User.hasMany(BugLog, { foreignKey: "userId" });
BugLog.belongsTo(User, { foreignKey: "userId" });

Bug.hasMany(BugLog, { foreignKey: "bugId" });
BugLog.belongsTo(Bug, { foreignKey: "bugId" });



module.exports = {
  User,
  Task,
  TaskLog,
  Project,
  Message,
  Conversation,
  ProjectEmployee,
  LeaveApplication,
  ConversationMember,
  Notification,
  Notifies,
  SalaryDetail,
  Incentive,
  Department,
  PaymentHead,
  Payment,
  Question,
  Answer,
  Test,
  TestQuestion,
  TestUser,
  PayOut,
  Role,
  Designation,
  Module,
  Permission,
  ProjectDocument,
  ProjectEquipment,
  Status,
  Comment,
  Issue,
  ProjectStatus,
  Attendance,
  Experience,
  Education,
  EmergencyContact,
  LeaveApplicationStatus,
  Holiday,
  LeaveSetting,
  Expense,
  ExpenseAttachment,
  Quotation,
  QuotationItem,
  Invoice,
  InvoiceItem,
  EmployeeSalary,
  EmployeeIncentive,
  EmployeeSalarySlip,
  MonthlySalaryIncentive,
  Ticket,
  ClientTask,
  ClientBoardStatus,
  Sprint,
  SprintLog,
  Bug,
  BugLog,
  TicketLog
};
