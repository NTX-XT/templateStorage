const { getDateTime } = require("../helpers");
const Template = require("../models/template");

module.exports = {
  index(req, res, next) {
    const page = req.params.page || 1;
    let sort = { dateUploaded: -1 }; 
    const limit = 10;
    const skip = limit * (page - 1);
    Template.find({}, {_id: 1, title: 1, description: 1, department: 1, capability: 1, tags: 1, friendlyUrl: 1}).sort(sort).skip(skip).limit(limit)
      .then((templates) => {
        res
          .status(200)
          .set({
            "X-Total-Count": templates.length            
          })
          .send({templates, page});
      })
      .catch(next);
  },
  getTemplateForSets(req, res, next) {
    const {limit, offset} = req.params;
    Template.find({}, {_id: 1, title: 1, friendlyUrl: 1, capability: 1}).skip(parseInt(offset)).limit(parseInt(limit) !== 0 && parseInt(limit))
      .then((templates) => {
        res
          .status(200)
          .set({
            "X-Total-Count": templates.length            
          })
          .send(templates);
      })
      .catch(next);
  },
  getFiltered(req, res, next) {
    const filters = req.params;
    const page = filters.page;
    const capability = filters.capability;
    const industry = filters.industry;
    const department = filters.department;
    const title = filters.title;
    const limit = parseInt(filters.limit) || 20;

    let sort = filters.sort || { title: 1 };
    let query = {};
    
    if (!!title && title !== "undefined" && title !== "NA")      
      query = { title: new RegExp(title, 'i') };
    if (!!capability && capability !== "undefined" && capability !== "All")
      query.capability = capability;
    if (!!industry && industry !== "undefined" && industry !== "All")
      query.tags = industry;
    if (!!department && department !== "undefined" && department !== "All")
      query.department = department;

    query.visible = true;

    let sortOrder = {};
    if (sort === "tASC") sortOrder.title = 1; // ASC
    if (sort === "tDESC") sortOrder.title = -1; // DESC
    if (sort === "dlASC") sortOrder.dlCounter = 1; //ASC
    if (sort === "dlDESC") sortOrder.dlCounter = -1; // DESC
    if (sort === "dtASC") sortOrder.dateUploaded = 1; // ASC
    if (sort === "dtDESC") sortOrder.dateUploaded = -1; // DESC

    // console.log(query);
    const skip = limit * (page - 1);    
    Template.aggregate([
      { $match: query },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          capability: 1,
          workflowVersion: 1,
          visible: 1,
          nwcToken: 1,
          gated: 1,
          downloadURL: 1,
          extension: 1,
          dlCounter: 1,
          rating: 1,
          dateUploaded: 1,
          friendlyUrl: 1
        },
      },
    ])
      .sort(sortOrder)
      .limit(page * limit)
      .then((templates) => {
        res.status(200).send(templates);
      })
      .catch(next);
  },
  totalCount(req, res, next) {
    const filters = req.params;
    const page = filters.page;
    const capability = filters.capability;
    const industry = filters.industry;
    const department = filters.department;
    const title = filters.title;

    let query = {};
    if (!!title && title !== "undefined" && title !== "NA")      
      query = { title: new RegExp(title, 'i') };
    if (!!capability && capability !== "undefined" && capability !== "NA")
      query.capability = capability;
    if (!!industry && industry !== "undefined" && industry !== "All")
      query.tags = industry;
    if (!!department && department !== "undefined" && department !== "All")
      query.department = department;    
    Template.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: { $add: ["$dlCounter"] } },
          totalTemplates: { $sum: 1 },
        },
      },
    ])
      .then((totalCount) => {        
        res.status(200).send(totalCount);
      })
      .catch(next);
  },
  create(req, res, next) {
    const templateProps = req.body;
    const {friendlyUrl} = templateProps;    
    Template.find({friendlyUrl: friendlyUrl}).then(template => {
      console.log(template);
      if(template.length > 0) {
        res.send({status: 1062, template: template})
      } else {
        Template.create(templateProps)
        .then((template) => res.send({status: 200, template: template}))
        .catch(next);
      }
    });    
  },
  getOne(req, res, next) {
    const friendlyUrl = req.params.id;
    Template.find({ friendlyUrl: friendlyUrl }).populate("partner").exec((err, template) => {
      if(err) {
        next();
        return;
      }
      res.send(template[0] || {});
    })
  },
  getPartnerTemplates(req, res, next) {
    const id = req.params.id;    
    let sort = { title: 1 }; 
    Template.find({ partner: id }).sort(sort)
    .then((template) => res.send(template)).catch(next);
  },
  edit(req, res, next) {
    // get template id to update
    const templateId = req.params.id;
    const templateProps = req.body;    
    const {friendlyUrl} = templateProps;    
    Template.find({friendlyUrl: friendlyUrl}).then(template => {
      console.log(template);
      if(template.length > 0) {        
        if(template[0]._id.toString() === templateId.toString()) {
          updateTemplate(req, res, next, templateId, templateProps);
        } else {
          res.send({status: 1062, template: template})
        }
      } else {
        updateTemplate(req, res, next, templateId, templateProps);
      }

    });      
  },
  delete(req, res, next) {
    const templateId = req.params.id;

    Template.findByIdAndRemove({ _id: templateId })
      .then((template) => res.status(200).send({status: 200, template: template}))
      .catch(next);
  },
  getAllOfType(req, res, next) {
    //get templates related to capability
    const templateCapability = req.params.capability;
    Template.find({ capability: templateCapability })
      .then((templates) =>
        res
          .status(200)
          .set({ "X-Total-Count": templates.length })
          .send(templates)
      )
      .catch(next);
  },
  getWorkflowVersions(req, res, next) {
    //get only NWC templates
    const templateCapability = req.params.capability;
    const wfVersion = req.params.workflowVersion;
    Template.find({
      capability: templateCapability,
      workflowVersion: wfVersion,
    })
      .then((templates) =>
        res
          .status(200)
          .set({ "X-Total-Count": templates.length })
          .send(templates)
      )
      .catch(next);
  },
  replaceAssetLinks(req, res, next) {
    Template.find({downloadURL: new RegExp('https://raw.githubusercontent.com/NTX-XT', 'i')}, {_id: 1, downloadURL: 1})
    .then(async (templates) => {       
      if(templates.length > 0) {
        for(var i = 0; i < templates.length; i++) {
          const replace = await replaceAssetsLink(templates[i]);        
        }
      }
      res.status(200).send({status: 200, message: 'Links Updated!'});      
    }).catch(next);
  },
  replaceImageLinks(req, res, next) {    
    Template.find({mapImageURL: new RegExp('https://raw.githubusercontent.com/NTX-XT', 'i')}, {_id: 1, mapImageURL: 1})
    .then(async (templates) => {      
      if(templates.length > 0) {
        for(var i = 0; i < templates.length; i++) {
          const replace = await replaceImagesLinks(templates[i]);        
        }
      }
      res.status(200).send({status: 200, message: 'Links Updated!'});      
    }).catch(next);
  },
  changeDateFormats(req, res, next) {
    Template.find({}, {_id: 1, dateUploaded: 1})
    .then(async (templates) => {      
      if(templates.length > 0) {
        for(var i = 0; i < templates.length; i++) {
          const replace = await changeDateFormat(templates[i]);        
        }
      }
      res.status(200).send({status: 200, message: 'Dates Updated!'});      
    }).catch(next);
  },
  addFriendlyURLs(req, res, next) {
    Template.find({}, {_id: 1, title: 1})
    .then(async (templates) => {      
      if(templates.length > 0) {
        for(var i = 0; i < templates.length; i++) {
          const replace = await addFriendlyURL(templates[i]);        
        }
      }
      res.status(200).send({status: 200, message: 'URLs Updated!'});      
    }).catch(next);
  },
  getTemplatesByDate(req, res, next) {
    Template.find({}, {_id: 1, dateUploaded: 1, dlCounter: 1, capability: 1, partner: 1}).populate("partner").exec((err, dateResult) => {
      if(err) {
        next();
        return;
      }
      res.status(200).send({status: 200, data: dateResult});  
    });
  }
};

const replaceAssetsLink = (template) => {
  return new Promise((resolve, reject) => {    
    const templateId = template._id;
    const downloadURL = 'https://ntxtemplatestorage.blob.core.windows.net/assets'+template.downloadURL.replace("https://raw.githubusercontent.com/NTX-XT/Nintex-Process-Gallery/master", "");
    Template.findByIdAndUpdate({ _id: templateId }, {downloadURL: downloadURL})
    .then(() => Template.findById({ _id: templateId }))
    .then((template) => {
      resolve(200);
    }).catch(error => {
      console.log(error);
      resolve(500);
    });
  });
}

const replaceImagesLinks = (template) => {
  return new Promise((resolve, reject) => {    
    const templateId = template._id;
    const imageName= template.mapImageURL.split("/")[template.mapImageURL.split("/").length - 1];
    const mapImageURL = 'https://ntxtemplatestorage.blob.core.windows.net/images/'+imageName;      
    Template.findByIdAndUpdate({ _id: templateId }, {mapImageURL: mapImageURL})
    .then(() => Template.findById({ _id: templateId }))
    .then((template) => {
      resolve(200);
    }).catch(error => {
      console.log(error);
      resolve(500);
    });
  });
}

const changeDateFormat = (template) => {
  return new Promise((resolve, reject) => {    
    const templateId = template._id;    
    let dateUploaded = getDateTime(template.dateUploaded);
    dateUploaded = dateUploaded.split(" ")[0];    
    if(dateUploaded) {
      Template.findByIdAndUpdate({ _id: templateId }, { dateUploaded: dateUploaded })
      .then(() => Template.findById({ _id: templateId }))
      .then((template) => {
        resolve(200);
      }).catch(error => {
        console.log(error);
        resolve(500);
      });
    }
  });
}

const addFriendlyURL = (template) => {  
  return new Promise((resolve, reject) => {
    const templateId = template._id;
    let title = template.title;
    if(title) {
      let friendlyUrl = title.trim().replace(/ /g, "-").toLowerCase();      
      Template.findByIdAndUpdate({ _id: templateId }, { title: title.trim(), friendlyUrl: friendlyUrl.trim() })
      .then(() => Template.findById({ _id: templateId }))
      .then((template) => {
        resolve(200);
      }).catch(error => {
        console.log(error);
        resolve(500);
      });
    }
  });
}

const updateTemplate = (req, res, next, templateId, templateProps) => {
  Template.findByIdAndUpdate({ _id: templateId }, templateProps)
  .then(() => Template.findById({ _id: templateId }))
  .then((template) => res.send({status: 200, template: template}))
  .catch(next);
}