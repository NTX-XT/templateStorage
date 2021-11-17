const Partner = require("../models/partner");

module.exports = {
  index(req, res, next) {
    Partner.find({}, { _id: 1, name: 1, description: 1, email: 1, smallIcon: 1, templates: 1, isActive: 1 })
    .then((partners) =>
      res.status(200).set({ "X-Total-Count": partners.length }).send(partners)
    )
    .catch(next);
  },
  create(req, res, next) {
    const partnerProps = req.body;
    Partner.create(partnerProps)
      .then((partner) => res.send({status: 200, partner: partner}))
      .catch(next);
  },
  getOne(req, res, next) {
    let partnerId = req.params.id;
    partnerId = partnerId.replace(/-/g, " ");
    // Partner.findById({ _id: partnerId })
    //   .then((partner) => res.send(partner))
    //   .catch(next);
    let query = { name: new RegExp(partnerId, 'i') };
    Partner.aggregate([
      { $match: query },
    ])
    .then((partner) => {        
      res.status(200).send(partner[0] || {});
    })
    .catch(next);
  },
  edit(req, res, next) {
    // get partner id to update
    const partnerId = req.params.id;
    const partnerProps = req.body;    

    Partner.findByIdAndUpdate({ _id: partnerId }, partnerProps)
      .then(() => Partner.findById({ _id: partnerId }))
      .then((partner) => res.status(200).send({status: 200, data: partner}))
      .catch(next);
  },
  delete(req, res, next) {
    const partnerId = req.params.id;
    Partner.findByIdAndRemove({ _id: partnerId })
      .then((partner) => res.status(200).send({status: 200, data: partner}))
      .catch(next);
  },
};
