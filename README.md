# bcms
基于区块链的证书认证系统

该系统是2021年的一个竞赛项目。

# 系统简介

该系统使用区块链作为学位学历认证管理系统的底层架构。将证书数据存储在区块链上，通过区块链本身的不可篡改性，来保障证书数据的完整性。并且在区块链上部署智能合约，处理证书生成、证书查询、证书核验的相关逻辑，使得该系统具有处理过程可追溯、处理逻辑不可篡改的特点。

使用以太坊搭建私有链部署智能合约进行测试，然后将智能合约部署在以太坊ropsten测试网上，使用Solidity语言的Truffle框架开发智能合约。

使用Node.js的Express框架搭建web服务器进行该系统的后端逻辑处理，同时使用web3.js与智能合约进行交互。

前端web页面使用Handlebars模板引擎，对html页面进行渲染，并且使用Ajax进行与后端的数据交互，jquery进行前端逻辑处理。

证书的加密与签名使用国密SM2算法，证书hash值的计算使用国密SM3算法。

## 需求模型

![图片](https://github.com/user-attachments/assets/91a2a6e8-df5e-46f3-8ee2-000ff394aa39)

## 数据流图

![图片](https://github.com/user-attachments/assets/9459b2d7-f3cb-4975-9539-ca184779efb3)

## 系统架构

系统分为三层架构，使用浏览器上的web页面作为前端，Node.js搭建的web服务器作为后端，后端服务器再与智能合约交互。

![图片](https://github.com/user-attachments/assets/3c899f5b-21ba-4a63-8b62-957257cf11b8)

# 系统演示

系统共有管理员与普通用户两种角色，管理员使用keystore文件登录，普通用户无需登录。

## 管理员

登录界面

![图片](https://github.com/user-attachments/assets/4fdd59c5-60ea-42f6-bad7-11fe4938d109)

证书颁发界面

![图片](https://github.com/user-attachments/assets/ea4d76bf-f6b9-4398-87cb-2b1e1d831718)

![图片](https://github.com/user-attachments/assets/dbf4e8d9-eadd-405b-a2e9-606225565374)

![图片](https://github.com/user-attachments/assets/4a412239-3dec-4da1-96c5-5a00bf68f82b)

证书查询界面

![图片](https://github.com/user-attachments/assets/aafdcfb1-fe46-4aeb-8c8e-b598973e741c)

![图片](https://github.com/user-attachments/assets/731b29ef-1169-4440-8d82-1082f947a23f)

证书核验界面

![图片](https://github.com/user-attachments/assets/099318c1-07db-49df-a578-ba46f0dd6942)

证书撤销界面

![图片](https://github.com/user-attachments/assets/e1720c18-f69e-4822-b97d-507aa5aed73c)

## 普通用户

用户可以进行证书查询与核验

![图片](https://github.com/user-attachments/assets/188b8788-4b7b-4c8d-a5e5-e6c33e922bf6)

## 以太坊智能合约交易

证书的创建或撤销都会生成一个与智能合约的交易。

![图片](https://github.com/user-attachments/assets/a47ad30e-ca50-4e2b-b17d-42b0f06aff6a)

# 版本过期

注意由于以太坊版本更新，该代码已无法正常连接以太坊网络，需要进行相应更新。
