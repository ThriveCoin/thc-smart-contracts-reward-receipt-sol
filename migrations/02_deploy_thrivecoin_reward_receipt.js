'use strict'

const ThriveCoinRewardReceipt = artifacts.require('ThriveCoinRewardReceipt')

module.exports = async function (deployer, network, accounts) {
  if (['development', 'test', 'private', 'goerli', 'mumbai'].includes(network)) {
    const owner = accounts[0]
    await deployer.deploy(ThriveCoinRewardReceipt, { from: owner })
  }
}
