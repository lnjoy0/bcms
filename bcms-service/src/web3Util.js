const Web3 = require('web3');
const fs = require('fs');
const keythereum = require('keythereum');
const path = require('path');

const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/1186eeafd46f4fc08dbf99f50a76869a"));

const abi = JSON.parse(fs.readFileSync('../abi/Certificant_abi.json', 'utf-8'));
const address = "0x27CC94b1c2Fc8d6e45DF30858B727456BFD735Fc"; //合约地址
const Certificant = new web3.eth.Contract(abi, address);

const keystore_path = path.resolve(__dirname,'..'); //keystore文件夹所在的绝对目录
const chainId = 3; //ropsten是3
const gasPrice = 1000000000;

module.exports = {
    Certificant: Certificant,
    web3: web3,
    chainId: chainId,
    address: address,
    gasPrice: gasPrice,

    getPrivateKey: function (address, password){
        let keyobject =  keythereum.importFromFile(address, keystore_path);
        return keythereum.recover(password,keyobject);
    }
}