const TemplateSet = require("../models/templateSet");

module.exports = {
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
    }
}