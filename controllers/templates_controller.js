const Template = require("../models/template");

module.exports = {
  index(req, res, next) {        
    Template.find()
    .then((templates) => {
      res
        .status(200)
        .set({
          "X-Total-Count": templates.length,
          "total-templates": Template.count(),
        })
        .send(templates);
    }).catch(next);
  },
  getFiltered(req, res, next) {
    const filters = req.params;
    const page = filters.page;
    const capability = filters.capability;
    const industry = filters.industry;
    const department = filters.department;
    let sort = filters.sort || {title: 1};
    sort = JSON.parse(sort);
    let query = {};
    if (!!capability && capability !== "undefined")
      query.capability = capability;
    if (!!industry && industry !== "undefined" && industry !== 'All') query.tags = industry;
    if (!!department && department !== "undefined" && department !== 'All') query.department = department;
    console.log(sort);
    let sortOrder = {};
    if(sort.name === 'asc') sortOrder.title = 1;
    if(sort.name === 'desc') sortOrder.title = -1;
    if(sort.name === 'dlcounter') sortOrder.dlCounter = -1;
    if(sort.name === 'date' && sort.value === true) 
      sortOrder.dateUploaded = 1;
    else
      sortOrder.dateUploaded = -1;

    const skip = 11 * (page - 1);
    Template.find(query).sort(sortOrder).skip(skip).limit(11)
    .then((templates) => {
      res
        .status(200)
        .set({
          "X-Total-Count": templates.length,
          "total-templates": Template.count(),
        })
        .send(templates);
    }).catch(next);
    // Template.aggregate([
    //   {$match: query},
    //   {$lookup: {
    //     from: 'partners',
    //     localField: '_id',
    //     foreignField: 'templates',
    //     as: "partner"
    //   }}
    // ]).sort(sortOrder).skip(skip).limit(11).then((totalCount) => {
    //   res
    //     .status(200)
    //     .send(totalCount);
    // }).catch(next);

  },
  totalCount(req, res, next) {
    const filters = req.params;
    const page = filters.page;
    const capability = filters.capability;
    const industry = filters.industry;
    const department = filters.department;

    let query = {};
    if (!!capability && capability !== "undefined")
      query.capability = capability;
    if (!!industry && industry !== "undefined" && industry !== 'All') query.tags = industry;
    if (!!department && department !== "undefined" && department !== 'All') query.department = department;
    Template.aggregate([
      {$match: query},
      {$group: {
        _id: null,
        totalDownloads: { $sum: { $add: [ "$dlCounter" ] } },
        totalTemplates: { $sum: 1 }
      }}
    ]).then((totalCount) => {
      res
        .status(200)
        .send(totalCount);
    }).catch(next);
  },
  create(req, res, next) {
    const templateProps = req.body;

    Template.create(templateProps)
      .then((template) => res.send(template))
      .catch(next);
  },
  getOne(req, res, next) {
    const templateId = req.params.id;
    Template.findById({ _id: templateId })
      .then((template) => res.send(template))
      .catch(next);
  },
  edit(req, res, next) {
    // get template id to update
    const templateId = req.params.id;
    const templateProps = req.body;

    Template.findByIdAndUpdate({ _id: templateId }, templateProps)
      .then(() => Template.findById({ _id: templateId }))
      .then((template) => res.send(template))
      .catch(next);
  },
  delete(req, res, next) {
    const templateId = req.params.id;

    Template.findByIdAndRemove({ _id: templateId })
      .then((template) => res.status(204).send(template))
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
};
