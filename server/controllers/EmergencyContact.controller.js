const Models = require("../models");
const AppError = require("../utils/AppError");
const CatchAsync = require("../utils/CatchAsync");
const Helpers = require("../utils/Helpers");

module.exports.addEmergencyContact = CatchAsync(async (req, res, next) => {
  {
    const { id } = req.params;
    let { data } = req.body;

    const checkUserInDB = await Models.User.findOne({ where: { id } });
    if (!checkUserInDB)
      return next(new AppError("Invalid ID. User not found", 404));

    let emergencyContact = await Models.EmergencyContact.create({
      userId: id,
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      phone1: data.phone1 ? data.phone1 : null,
    });
    emergencyContact = Helpers.convertToPlainJSObject(emergencyContact);

    return res.status(201).json({
      status: "success",
      message: "Emergency Contact Information added successfully",
      data: {
        emergencyContact,
      },
    });
  }
});

module.exports.getEmergencyContact = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  let contacts = await Models.EmergencyContact.findAll({
    where: {
      userId: id,
    },
    order: [["createdAt", "asc"]],
  });

  return res.status(200).json({
    status: "success",
    message: "All Emergency Contacts of user is fecthed successfully",
    data: {
      contacts,
    },
  });
});

module.exports.deleteEmergencyContact = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const checkEducationInDB = await Models.Education.findOne({
    where: { id },
  });
  if (!checkEducationInDB)
    return next(new AppError("Invalid ID. Education not found", 404));

  await Models.Education.destroy({
    where: {
      id,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Education of user is deleted successfully",
    id,
  });
});

module.exports.updateEmergencyContact = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { contactId } = req.query;
  const { data } = req.body;

  const checkUserInDB = await Models.User.findOne({ where: { id } });
  if (!checkUserInDB)
    return next(new AppError("Invalid ID. User not found", 404));

  const checkContactInDB = await Models.EmergencyContact.findOne({
    where: { id: contactId },
  });

  if (!checkContactInDB)
    return next(new AppError("Invalid ID. EmergencyContact not found", 404));
  if (!data)
    return res.status(400).json({
      status: "Fail",
      message: "No data is given in body to update the Contact",
    });

  await Models.EmergencyContact.update(
    {
      ...data,
    },
    { where: { id: contactId, userId: id }, returning: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Contact Information of user is updated successfully",
    data: {
      contactId,
    },
  });
});
