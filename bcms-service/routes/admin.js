const express = require('express');
const session = require('express-session');
const multer = require('multer');
const uuidv4 = require('uuid').v4;
const uuidv1 = require('uuid').v1;
const EthereumTx = require('ethereumjs-tx');
const fs = require('fs');
const gmUtil = require('../src/gmUtil');
const web3Util = require('../src/web3Util');
const Logger = require('../src/logger');
const router = express.Router();

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../keystore');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: storage });

const sessionid = 'sessionid';

router.use(session({
  name: sessionid,
  secret: "e1aa6e412b60aecbe3dcae31c7bcbe05e56415f158109fc56907177e3a8e6776",
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 30*60*1000}
}));

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/logout', (req, res) => {
  fs.unlink(req.session.keystore_path, (err, data) => {
    if(err){
      Logger.error(err);
    }
    req.session.destroy(err => {
      if(err){
        Logger.error(err);
        res.end();
      }else{
        res.clearCookie(sessionid);
        res.redirect('../');
      }
    });
  });
});

router.get('/issue', (req, res) => {
  if(req.session.logged){
    res.render('issue');
  }else{
    res.redirect('login');
  }
});

//证书下载
//参数：filename
router.get('/download', (req, res) => {
  if(req.session.logged){
    res.download('../download/'+req.query.filename, req.query.filename , err => {
      if(err){
        res.json({flag:2, msg:'证书文件下载错误'});
        return;
      }
    })
  }else{
    res.redirect('login');
  }
});

router.get('/revoke', (req, res) => {
  if(req.session.logged){
    res.render('revoke');
  }else{
    res.redirect('login');
  }
});

// 管理员登陆
// 参数：(keystore, password)
router.post('/login', upload.single('file'), (req, res) => {
  let keystore = req.file;
  let password = req.body.password;
  let captcha = req.body.captcha;
  if(!keystore || !password){
    res.json({flag:2, msg:"未上传文件或密码为空"});
    return;
  }else if(!captcha){
    res.json({flag:2, msg:"请输入验证码"})
    return;
  }
  if(captcha.toLowerCase() !== req.session.captcha){
    res.json({flag:2, msg:"验证码不正确"})
    return;
  }
  let keystore_data = fs.readFileSync(keystore.path, 'utf8');
  setTimeout(() => {
    fs.unlink(req.session.keystore_path, (err, data) => {
      if(err){
        Logger.error(err);
      }
    })
  }, 30*60*1000);
  try{
    var account = web3Util.web3.eth.accounts.decrypt(JSON.parse(keystore_data), password);
  }catch(error){
    res.json({flag:2,msg:"证书文件或密码错误"});
    return;
  }
  req.session.keystore_path = keystore.path;
  req.session.address = account.address;
  req.session.password = password;
  req.session.logged = true;
  res.json({flag:1});
});

// 证书颁发
// 学位证书参数：(cert_type, id, degree_type, name, sex, birthday, university, major, discipline, president, issuedate)
// 学历证书参数：(cert_type, id, name, sex, birthday, start_end, schoole, major, len_schooling, education, header, issuedate)
router.post('/issue', (req, res) => {
  if(req.session.logged){
    if(req.body.cert_type === "1"){
      var id = req.body.id;
      let degree_type = req.body.degree_type;
      let name = req.body.name;
      let sex = req.body.sex;
      let birthday = req.body.birthday;
      let university = req.body.university;
      let major = req.body.major;
      let discipline = req.body.discipline;
      let president = req.body.president;
      let issuedate = req.body.issuedate;
      let timestamp = Date.now();
      let nonce = uuidv4().replace(/-/g, '') + uuidv1().replace(/-/g, '');
      if(!id || !degree_type || !name || !sex || !birthday || !university || !major || !discipline || !president || !issuedate){
        res.json({flag:2,msg:"证书信息不完整"});
        return;
      }
      var cert = {
        cert_type: req.body.cert_type,
        id: id,
        degree_type: degree_type,
        name: name,
        sex: sex,
        birthday: birthday,
        university: university,
        major: major,
        discipline: discipline,
        president: president,
        issuedate: issuedate,
        timestamp: timestamp,
        nonce: nonce
      };
    }else if(req.body.cert_type === "2"){
      var id = req.body.id;
      let name = req.body.name;
      let sex = req.body.sex;
      let birthday = req.body.birthday;
      let start_end = req.body.start_end;
      let schoole = req.body.schoole;
      let major = req.body.major;
      let len_schooling = req.body.len_schooling;
      let education = req.body.education;
      let header = req.body.header;
      let issuedate = req.body.issuedate;
      let timestamp = Date.now();
      let nonce = uuidv4().replace(/-/g, '') + uuidv1().replace(/-/g, '');
      if(!id || !name || !sex || !birthday || !start_end || !schoole || !major || !len_schooling || !education || !header || !issuedate){
        res.json({flag:2,msg:"证书信息不完整"});
        return;
      }
      var cert = {
        cert_type: req.body.cert_type,
        id: id,
        name: name,
        sex: sex,
        birthday: birthday,
        start_end: start_end,
        schoole: schoole,
        major: major,
        len_schooling: len_schooling,
        education: education,
        header: header,
        issuedate: issuedate,
        timestamp: timestamp,
        nonce: nonce
      };
    }else{
      res.json({flag:2,msg:"参数错误"});
      return;
    }

    let serialize_cert = JSON.stringify(cert);
    let sm3_cert = gmUtil.sm3_hash(serialize_cert);
    let enc_cert = gmUtil.sm2_encrypt(serialize_cert);

    let privatekey = web3Util.getPrivateKey(req.session.address, req.session.password);
    web3Util.web3.eth.getTransactionCount(req.session.address).then(nonce => {
        var txParams = {
            chainId: web3Util.chainId,
            nonce: web3Util.web3.utils.toHex(nonce),
            gasPrice: web3Util.gasPrice,
            gasLimit: 3000000,
            to: web3Util.address,
            data: web3Util.Certificant.methods.store(id, enc_cert, sm3_cert).encodeABI(),
        }
        const tx = new EthereumTx(txParams)
        tx.sign(privatekey)
        var serializedTx = tx.serialize()
        web3Util.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).then(result => {
          let base64_cert = Buffer.from(serialize_cert, 'utf-8').toString('base64');
          let signature = gmUtil.sm2_sign(base64_cert);
          fs.writeFile('../download/BCMS-'+id, base64_cert+'.'+signature, err => {
            if(err){
              res.json({flag:2,msg:"证书文件写入失败"});
            }else{
              res.json({flag:1,msg:"证书创建成功，请前往下一步下载证书文件"});
              setTimeout(() => {
                fs.unlink('../download/BCMS-'+id, (err, data) => {
                  if(err){
                    Logger.error(err);
                  }
                })
              }, 60*60*1000);
            }
          });
        }).catch(error => {
          Logger.error(error.message);
          res.json({flag:2,msg:"合约调用出错：证书已存在或无权限访问"});
          return;
        })
    }).catch(error => {
      Logger.error(error.message);
      res.json({flag:2,msg:"服务器错误"});
      return;
    });
  }else{
    res.status(404).render('404', {url:req.originalUrl});
  }
});

// 证书撤销
// 参数：id
router.post('/revoke', (req, res) => {
  if(req.session.logged){
    let id = req.body.id;
    if(!id){
      res.json({flag:2,msg:"证书编号不能为空"});
      return;
    }
    let privatekey = web3Util.getPrivateKey(req.session.address, req.session.password);
    web3Util.web3.eth.getTransactionCount(req.session.address).then(nonce => {
        var txParams = {
            chainId: web3Util.chainId,
            nonce: web3Util.web3.utils.toHex(nonce),
            gasPrice: web3Util.gasPrice,
            gasLimit: 3000000,
            to: web3Util.address,
            data: web3Util.Certificant.methods.revoke(id).encodeABI(),
        }
        const tx = new EthereumTx(txParams)
        tx.sign(privatekey)
        var serializedTx = tx.serialize()
        web3Util.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).then(result => {
          res.json({flag:1,msg:"证书撤销成功"});
        }).catch(error => {
          Logger.error(error.message);
          res.json({flag:2,msg:"证书撤销失败：证书不存在或无权限访问"});
          return;
        })
    }).catch(error => {
      Logger.error(error.message);
      res.json({flag:2,msg:"证书撤销失败：证书不存在或无权限访问"});
      return;
    });
  }else{
    res.status(404).render('404', {url:req.originalUrl});
  }
});

module.exports = router;