const TemplatesController = require("../controllers/templates_controller");
const ImpsController = require("../controllers/imports_controller");
const CampController = require("../controllers/campaign_controller");
const ConvertController = require("../controllers/convert_controller");
const PartnerController = require("../controllers/partner_controller");
const UsersController = require('../controllers/users_controller');
const Convert = require("../models/convert");
const TemplateSetController = require("../controllers/template_set_controller");

module.exports = (app) => {
  // Template based Routes
  app.get("/api/alltemplates/:page", TemplatesController.index);
  app.get("/api/alltemplates/:limit/:offset", TemplatesController.getTemplateForSets);
  app.get("/api/templates/:capability/:industry/:department/:title/:page/:sort/:limit", TemplatesController.getFiltered);
  app.get("/api/templates/:id", TemplatesController.getOne);
  app.get("/api/partnerTemplates/:id", TemplatesController.getPartnerTemplates);
  app.get("/api/:capability/", TemplatesController.getAllOfType);
  app.get("/api/:capability/:workflowVersion", TemplatesController.getWorkflowVersions);
  app.get("/totalCount/:capability/:industry/:department/:title/:page", TemplatesController.totalCount);
  app.get("/getTemplatesByDate", TemplatesController.getTemplatesByDate);  
  app.post("/api/templates", TemplatesController.create);  
  app.put("/api/templates/:id", TemplatesController.edit);
  app.put("/replaceLinks", TemplatesController.replaceAssetLinks);
  app.put("/replaceImageLinks", TemplatesController.replaceImageLinks);
  app.put("/changeDateFormats", TemplatesController.changeDateFormats);
  app.put("/addFriendlyURLs", TemplatesController.addFriendlyURLs);
  app.delete("/api/templates/:id", TemplatesController.delete);

  //Template Sets
  app.get("/templateSet/get", TemplateSetController.index);
  app.get("/templateSet/getOne/:id", TemplateSetController.getOne);
  app.post("/api/templateSet", TemplateSetController.create);
  app.put("/api/templateSet/:id", TemplateSetController.edit);
  app.delete("/api/templateSet/:id", TemplateSetController.delete);

  //Template Import based Routes
  app.get("/api/imports/all", ImpsController.index);
  app.get("/api/imps/:id", ImpsController.getOne);
  app.post("/api/imps/", ImpsController.create);
  app.put("/api/imps/:id", ImpsController.edit);
  app.delete("/api/imps/:id", ImpsController.delete);

  //Campaign based Routes
  app.get("/api/camp", CampController.index);
  app.get("/api/camp/:id", CampController.getOne);
  app.post("/api/camp/", CampController.create);
  app.put("/api/camp/:id", CampController.edit);
  app.delete("/api/camp/:id", CampController.delete);

  //Converter based Routes
  app.get("/api/convert", ConvertController.index);
  app.get("/api/convert/:id", ConvertController.getOne);
  app.post("/api/convert", ConvertController.create);
  app.put("/api/convert/:id", ConvertController.edit);

  //Partner based Routes
  app.get("/v1/api/partners", PartnerController.index);
  app.get("/v1/api/partners/:id", PartnerController.getOne);
  app.post("/api/partners/", PartnerController.create);
  app.put("/api/partners/:id", PartnerController.edit);
  app.delete("/api/partners/:id", PartnerController.delete);

  //User based Routes
  app.get("/user", UsersController.index);
  app.get("/user/:id", UsersController.getOne);
  app.get("/api/user/login/:email/:password", UsersController.login);
  app.post("/api/user/signup/:firstname/:lastname/:email/:password/:confirm_password", UsersController.signup);
  app.put("/user/reset-password", UsersController.resetPassword);
  app.put("/api/user/:id", UsersController.edit);
  app.delete("/api/user/:id", UsersController.delete);
};
