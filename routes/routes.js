const TemplatesController = require("../controllers/templates_controller");
const ImpsController = require("../controllers/imports_controller");
const CampController = require("../controllers/campaign_controller");
const ConvertController = require("../controllers/convert_controller");
const PartnerController = require("../controllers/partner_controller");
const UsersController = require('../controllers/users_controller');
const Convert = require("../models/convert");
const TemplateSetController = require("../controllers/template_set_controller");
const CapabilityController = require("../controllers/capability_controller");
const BuildController = require("../controllers/build_controller");
var path = require('path');
var fs = require('fs');
const multer  = require('multer')
const resizeImg = require('resize-img');
// const upload = multer({ dest: 'uploads/' });
const imageStorage = multer.diskStorage({
  // Destination to store image     
  destination: 'uploads/capability', 
    filename: (req, file, cb) => {
      var fileExt = file.originalname.split('.').pop();
      let fileName = req.body.title + '.' + fileExt;
      req.body.fileName = fileName; 
        cb(null, fileName)
          // file.fieldname is name of the field (image)
          // path.extname get the uploaded file extension
  }
});

const imageUpload = multer({
  storage: imageStorage,
  // limits: {
  //   fileSize: 1000000 // 1000000 Bytes = 1 MB
  // },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) { 
      // upload only png and jpg format
      return cb(new Error('Please upload a Image'))
    }    
   cb(undefined, true)
  }
}) 
const resize = async (req, res, next) => {
  console.log(req.file, 'req.file');
  if (req.file == undefined) {
    next()
  } else {
    let imagedata = req.file.filename;
    const image = await resizeImg(fs.readFileSync("uploads/capability/" + imagedata), {
      width: 80,
      height: 80
    });

    fs.writeFileSync("uploads/capability/" + "thumb_" + imagedata, image);
    next();
  }
}

module.exports = (app) => {
  // Template based Routes
  app.get("/api/alltemplates/:page", TemplatesController.index);
  app.get("/api/alltemplates/:limit/:offset", TemplatesController.getTemplateForSets);
  app.get("/api/templates/:capability/:industry/:department/:title/:page/:sort/:limit", TemplatesController.getFiltered);
  app.get("/api/templates/:id", TemplatesController.getOne);
  app.get("/search/templates/:search", TemplatesController.search);
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
  app.get("/templateSet/getOneByName/:id", TemplateSetController.getOneByName);
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

  // Build Version Routes
  app.post("/generate_build", BuildController.createBuild);
  app.get("/get_build_versions", BuildController.getBuilds);

  //Capability based Routes
  app.get("/all_capabilities", CapabilityController.index);
  app.get("/capability/getOne/:id", CapabilityController.getOne);
  app.post("/api/capability", imageUpload.single('image'), resize, CapabilityController.create);
  app.put("/api/capability/:id", imageUpload.single('image'), resize, CapabilityController.edit);
  app.delete("/api/capability/:id", CapabilityController.delete);
};
