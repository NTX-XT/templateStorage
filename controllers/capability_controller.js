const Capability = require("../models/capability");

module.exports = {
  index(req, res, next) {
    Capability.find()
      .then(capabilities => res.status(200).set({"X-Total-Count" : capabilities.length}).send(capabilities))
      .catch(next);
  },
  create(req, res, next) {
    console.log(req.body,"req.bod");
    const {title, description, content, fileName} = req.body;
    let data = {title, description, content, icon_image: fileName != undefined ? "thumb_"+fileName : null, banner_image: fileName != undefined ? fileName : null}
    let slash = new RegExp("/","g");
    let date = new Date().toLocaleDateString().toString().replace(slash, "-");
    Capability.create({...data, createdAt: date,
      updatedAt: date}).then(capability => res.status(200).send({status:200}))
      .catch(error => {
        console.log("Erros is ", error);
      });
  },
  getOne(req, res, next) {
    const capabilityId = req.params.id;
    Capability.findById({_id: capabilityId})
    .then(capability => res.status(200).send(capability))
    .catch(next);
  },
  edit(req, res, next) {
    // get capability id to update
    const capabilityId = req.params.id;
    // const {title, description, fileName} = req.body;
    // let capabilityProps = {title, description, icon_image: "thumb_"+fileName, banner_image: fileName}
    const capabilityProps = req.body;
    if(req.body.fileName){
      capabilityProps.icon_image = req.body.fileName;
      capabilityProps.banner_image = req.body.fileName;
    }    
    let slash = new RegExp("/","g");
    let date = new Date().toLocaleDateString().toString().replace(slash, "-");
    capabilityProps.updatedAt = date;
    Capability.findByIdAndUpdate({ _id: capabilityId }, capabilityProps)
      .then(() => Capability.findById({ _id: capabilityId }))
      .then(capability => res.status(200).send({status:200}))
      .catch(next);
  },
  delete(req, res, next) {
    const capabilityId = req.params.id;
    Capability.findByIdAndRemove({ _id: capabilityId })
      .then(capability => res.status(200).send({status:200}))
      .catch(next);
  }

};