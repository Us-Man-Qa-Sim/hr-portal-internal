# !/usr/bin/bash
npx sequelize-cli db:migrate

npx sequelize db:seed --seed 20220703105827-roles
npx sequelize db:seed --seed 20220721073649-designations
npx sequelize db:seed --seed 20220301092602-Users
npx sequelize db:seed --seed 20220703105748-modules
npx sequelize db:seed --seed 20220703111632-departments
npx sequelize db:seed --seed 20220706055035-Statuses
npx sequelize db:seed --seed 20220720064326-NewModules
npx sequelize db:seed --seed 20220720115647-projectStatuses
npx sequelize db:seed --seed 20220810092633-leaveStatuses
npx sequelize db:seed --seed 20220810104236-UserModulePermissions
npx sequelize db:seed --seed 20220810105535-ProjectModulePermissions
npx sequelize db:seed --seed 20220810110110-TaskModulePermissions
npx sequelize db:seed --seed 20220810115155-TaskCommunicationModulePermissons
npx sequelize db:seed --seed 20220815073440-userInfo
npx sequelize db:seed --seed 20220815074332-userInfoModulePermissions
npx sequelize db:seed --seed 20220817123846-attendanceModule
npx sequelize db:seed --seed 20220817123858-attendanceModulePermissions
npx sequelize db:seed --seed clientPermissions
npx sequelize db:seed --seed clientBoardStatus
npx sequelize db:seed --seed clientBoardModule
npx sequelize db:seed --seed clientBoardPermissions
npx sequelize db:seed --seed interneeDesignation
npx sequelize db:seed --seed interneePermission
npx sequelize db:seed --seed ticketModule
npx sequelize db:seed --seed ticketPermissions