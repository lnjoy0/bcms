const Certificant = artifacts.require("Certificant");

module.exports = function(deployer) {
  deployer.deploy(Certificant);
};