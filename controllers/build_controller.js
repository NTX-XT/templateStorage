const fs = require('fs');
const md2json = require('md-2-json');
const axios = require('axios');
const BuildVersion = require('../models/buildVersion');
const DB = require("../config/connection");
module.exports = {
    createBuild(req, res, next){
        fs.readFile('./build.md', "utf-8", async function (err, content) {                   
            if (err && err.code === "ENOENT") {
                var metadata = {
                    version: {
                        raw: 0
                    }
                };
                let version;
                await axios({ url: "http://localhost:4100/get_build_versions", method: "GET", headers: { 'Content-Type': 'application/json' } }).then(res => {
                    if(res.data) {
                        metadata.version.raw = Number(res.data.version);
                    } else {
                        metadata.version.raw = Number(0);
                    }
                    version = metadata.version.raw;
                    metadata = md2json.toMd(metadata);                    
                    fs.writeFile('./build.md', metadata, function (err) {});
                }).catch(err => {                    
                    metadata.version.raw = Number(0);
                    fs.writeFile('./build.md', metadata, function (err) {});
                });                
                let data = {
                    version: String(version),
                    date: new Date().toISOString()                    
                }
                BuildVersion.create(data)
                .then((build) => {
                    res.status(200).send({status: 200, data: build});                    
                }).catch(next);                
            } else {
                var metadata = md2json.parse(content);            
                metadata.version.raw = Number(metadata.version.raw) + 1;
                let version = metadata.version.raw;
                metadata = md2json.toMd(metadata);                              
                fs.writeFile('./build.md', metadata, function (err) {
                    if (err) throw err;                
                    let data = {
                        version: String(version),
                        date: new Date().toISOString()                    
                    }
                    BuildVersion.create(data)
                    .then((build) =>{
                        res.status(200).send({status: 200, data: build})})
                    .catch(next);
                })
            }
        });         
    },
    getBuilds(req, res, next) {
        BuildVersion.findOne({}, { _id: 1, version: 1, date: 1, active: 1 }, { sort: { 'date' : -1 } })
        .then((builds) =>
          res.status(200).send({status: 200, data: builds})
        )
        .catch(next);
    },
    mongoBuildToMysql(req, res, next) {
        const buildForMysql = [];
        BuildVersion.find().then(builds => {          
          for(var i=0; i<builds.length;i++) {
            const build = builds[i];
            const datetime = (new Date().toLocaleString()).replace(/\//g, "-");
            let [date, time] = datetime.split(", ");            
            date = date.split("-")[2] + "-" + date.split("-")[1] + "-" + date.split("-")[0];
            buildForMysql.push(new Array(Number(build.version), date + " " + time, build._id));
          }
          DB.query(`INSERT INTO build_versions(version, date, mongo_build_id) VALUES ? ON DUPLICATE KEY UPDATE mongo_build_id = mongo_build_id`, [buildForMysql], (error, insertResponse) => {
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
}