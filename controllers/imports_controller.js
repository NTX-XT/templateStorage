const Imp = require('../models/importCheck');
const DB = require("../config/connection");

module.exports = {
    index(req, res, next) {
        Imp.find()
        .then(imports => res.status(200).set({"X-Total-Count" : imports.length}).send(imports))
        .catch(next);
    },
    create(req, res, next) {
        const impProps = req.body;

        Imp.create(impProps)
        .then(imp => res.send(imp))
        .catch(next);
    },
    getOne(req, res, next) {
        const impId = req.params.id;
        Imp.findById({_id: impId})
        .then(imp => res.send(imp))
        .catch(next)
    },
    edit(req, res, next) {
        const impId = req.params.id;
        const impProps = req.body;

        Imp.findByIdAndUpdate({_id: impId}, impProps)
        .then(() => Imp.findById({_id: impId}))
        .then(imp => res.send(imp))
        .catch(next);
    },
    delete(req, res, next) {
        const impId = req.params.id;

        Imp.findByIdAndRemove({_id: impId})
        .then(imp => res.status(204).send(imp))
        .catch(next);
    },
    mongoImportsToMysql(req, res, next) {
        const importsForMysql = [];
        Imp.find().then(imports => {          
          for(var i=0; i<imports.length;i++) {
            const currentImport = imports[i];
            importsForMysql.push(new Array(currentImport.tenantName, currentImport.templateId, currentImport._id));
          }
          DB.query(`INSERT INTO import_checks(tenant_name, template_id, mongo_imports_id) VALUES ? ON DUPLICATE KEY UPDATE mongo_imports_id = mongo_imports_id`, [importsForMysql], (error, insertResponse) => {
            if(error) {
              res.send({status: 500, message: error});
              console.log("Insert Error is ", error);
              return;
            }
            res.send({status: 200, message: 'Success'});
            console.log(insertResponse);
          });
        })
    }
};