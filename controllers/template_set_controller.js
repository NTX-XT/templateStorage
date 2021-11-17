const TemplateSet = require("../models/templateSet");

module.exports = {
    index(req, res, next) {
        let sort = { dateUploaded: -1 }; 
        TemplateSet.find({}).sort(sort)
        .then((templateSet) => {
          res
            .status(200)
            .set({
              "X-Total-Count": templateSet.length            
            })
            .send({templateSet});
        })
        .catch(next);
    },
    create(req, res, next) {        
        const templateSetProps = req.body;
        TemplateSet.create(templateSetProps)
        .then((template) => res.send({status: 200, message: 'Template Set Created Successfully.', error: false}))
        .catch(err => {
            console.log("Template Set Error ", err);
            if(err) {
                if(err.keyPattern) {
                    if(err.keyPattern.templateSetTitle === 1) {
                        res.status(200).send({status: 1062, message: 'Template set already exists with this title.', error: true});
                        return;
                    }
                } else {
                    res.status(200).send({status: 500, message: 'Unexpected Error', error: true});
                }
            } else {
                res.status(200).send({status: 500, message: 'Unexpected Error', error: true});
            }
        });
    },
    getOne(req, res, next) {
        const templateSetId = req.params.id;
        TemplateSet.findById({ _id: templateSetId })
        .then((templateSet) => res.send(templateSet))
          .catch(next);
    },
    getOneByName(req, res, next) {
        let templateSetId = req.params.id;
        templateSetId = templateSetId.replace(/-/g, " ");        
        let query = { templateSetTitle: new RegExp(templateSetId, 'i') };
        TemplateSet.aggregate([
            { $match: query }
        ])
        .then((ts) => {        
            res.status(200).send(ts[0] || {});
        })
        .catch(next);
    },
    edit(req, res, next) {
        // get template id to update
        const templateSetId = req.params.id;
        const templateSetProps = req.body;    

        TemplateSet.findByIdAndUpdate({ _id: templateSetId }, templateSetProps)
            .then(() => TemplateSet.findById({ _id: templateSetId }))
            .then((templateSet) => res.send({status: 200, templateSet: templateSet}))
            .catch(next);
    },
    delete(req, res, next) {
        const templateSetId = req.params.id;

        TemplateSet.findByIdAndRemove({ _id: templateSetId })
            .then((templateSet) => res.status(200).send({status: 200, templateSet: templateSet}))
            .catch(next);
    },
}