const express = require('express');
const session = require('express-session');
const multer = require('multer');
const svgCaptcha = require('svg-captcha');
const hbs = require('hbs');
const gmUtil = require('../src/gmUtil');
const web3Util = require('../src/web3Util');
const Logger = require('../src/logger');
const fs = require('fs');
const router = express.Router();
var upload = multer({ dest: '../upload/' });

router.use(session({
  name: "sessionid",
  secret: "e1aa6e412b60aecbe3dcae31c7bcbe05e56415f158109fc56907177e3a8e6776",
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 30*60*1000}
}));

router.get('/', (req, res) => {
  if(req.session.logged){
    res.render('query', {logged:true});
  }else{
    res.render('query', {logged:false});
  }
});

router.get('/index', (req, res) => {
  if(req.session.logged){
    res.render('query', {logged:true});
  }else{
    res.render('query', {logged:false});
  }
})

router.get('/query', (req, res) => {
  if(req.session.logged){
    res.render('query', {logged:true});
  }else{
    res.render('query', {logged:false});
  }
});

router.get('/verify', (req, res) => {
  if(req.session.logged){
    res.render('verify', {logged:true});
  }else{
    res.render('verify', {logged:false});
  }
});

// 证书查询
// 参数：(id, name, captcha)
router.post('/query', (req, res) => {
  let id = req.body.id;
  let name = req.body.name;
  let captcha = req.body.captcha;
  if(!id || !name){
    res.json({flag:2, msg:"证书编号与姓名不能为空"});
    return;
  }else if(!captcha){
    res.json({flag:2, msg:"请输入验证码"})
    return;
  }
  if(captcha.toLowerCase() !== req.session.captcha){
    res.json({flag:2, msg:"验证码不正确"})
    return;
  }
  web3Util.Certificant.methods.query(id).call().then(result => {
    let serialize_cert = gmUtil.sm2_decrypt(result);
    let cert = JSON.parse(serialize_cert);
    let tpl_data = '';
    if(name === cert.name){
      if(cert.cert_type === "1"){
        tpl_data = fs.readFileSync('../views/template/degree_info_tpl.hbs', 'utf8');
      }else if(cert.cert_type === "2"){
        tpl_data = fs.readFileSync('../views/template/diploma_info_tpl.hbs', 'utf8');
      }else{
        res.json({flag:2, msg:"服务器错误"});
        return;
      }
      var tplSpec = hbs.handlebars.precompile(tpl_data);
      res.json({flag:1, cert:cert, tplSpec:tplSpec});
    }else{
      res.json({flag:2, msg:"合约调用出错：证书不存在"});
    }
  }).catch(error =>{
    Logger.error(error.message);
    res.json({flag:2, msg:"合约调用出错：证书不存在"});
    return;
  })
})

// 证书核验
// 参数：cert_file
router.post('/verify', upload.single('file'), (req, res) => {
  let cert_file = req.file;
  let captcha = req.body.captcha;
  if(!cert_file){
    res.json({flag:2, msg:"未上传文件"});
    return;
  }else if(!captcha){
    res.json({flag:2, msg:"请输入验证码"})
    return;
  }
  if(captcha.toLowerCase() !== req.session.captcha){
    res.json({flag:2, msg:"验证码不正确"})
    return;
  }
  let cert_file_data = fs.readFileSync(cert_file.path, 'utf8');
  fs.unlink(req.file.path, (err, data) => {
    if(err){
      Logger.error(err);
      res.json({flag:2, msg:"服务器出错"});
      return;
    }
  })
  try{
    var cert_file_parse = cert_file_data.split('.');
    if(gmUtil.sm2_verify(cert_file_parse[0],cert_file_parse[1])){
      let serialize_cert = Buffer.from(cert_file_parse[0], 'base64').toString('utf-8');
      let sm3_cert = gmUtil.sm3_hash(serialize_cert);
      let cert = JSON.parse(serialize_cert);
      web3Util.Certificant.methods.verify(cert.id, sm3_cert).call().then(result => {
        if(result){
          if(cert.cert_type === "1"){
            tpl_data = fs.readFileSync('../views/template/degree_info_tpl.hbs', 'utf8');
          }else if(cert.cert_type === "2"){
            tpl_data = fs.readFileSync('../views/template/diploma_info_tpl.hbs', 'utf8');
          }else{
            res.json({flag:2, msg:"证书核验不通过"});
            return;
          }
          var tplSpec = hbs.handlebars.precompile(tpl_data);
          res.json({flag:1, cert:cert, tplSpec:tplSpec});
        }else{
          res.json({flag:2, msg:"证书核验不通过"});
        }
      }).catch(error => {
        Logger.error(error.message);
        res.json({flag:2, msg:"合约调用出错：证书不存在"});
        return;
      })
    }else{
      res.json({flag:2, msg:"证书核验不通过"});
    }
  }catch(err){
    res.json({flag:2, msg:"证书核验不通过"});
    return;
  }
})

router.get('/getCode', (req,res) => {
  let codeConfig = {
    size: 5,
    ignoreChars: '0o1i1',
    noise: 2,
    fontSize:42,
    color:true,
    background:"#cc9966",
    width:150,
    height: 44
  }
  let captcha = svgCaptcha.create(codeConfig);
  req.session.captcha = captcha.text.toLowerCase();
  res.type('svg');
  res.status(200).send(captcha.data);
});

module.exports = router;