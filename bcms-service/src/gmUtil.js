const sm3 = require('sm-crypto').sm3
const sm2 = require('sm-crypto').sm2

const PUBLIC_KEY = '04d4f98fc6f24ccda81fe20c48dd78c121927da57c5aa0b438e41e77b053ed71be8fb7000f584867bd95b5014536d5a83de32e541d7a4c5e2b1f3adedc103d1ee3';
const PRIVATE_KEY = '66a19ee8f1a4a55a3b79caadbe23d3d4d484284a17d6c51fcbae9c02f8bd4633';

module.exports = {
    sm3_hash: function (msg){
        return sm3(msg);
    },

    sm2_encrypt: function (msg){
        return sm2.doEncrypt(msg, PUBLIC_KEY, 1);
    },
    
    sm2_decrypt: function (enc){
        return sm2.doDecrypt(enc.toLowerCase(), PRIVATE_KEY, 1);
    },

    sm2_sign: function (msg){
        return sm2.doSignature(msg, PRIVATE_KEY, {
            pointPool: [sm2.getPoint(), sm2.getPoint(), sm2.getPoint(), sm2.getPoint()],
        });
    },

    sm2_verify: function (msg, signature){
        return sm2.doVerifySignature(msg, signature, PUBLIC_KEY);
    }
}