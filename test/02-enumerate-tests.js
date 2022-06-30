'use strict'

/* eslint-env mocha */

const assert = require('assert')
const ThriveCoinRewardReceipt = artifacts.require('ThriveCoinRewardReceipt')

describe('ThriveCoinRewardReceipt', () => {
  contract('enumerate tests', (accounts) => {
    let contract

    before(async () => {
      contract = await ThriveCoinRewardReceipt.deployed()
    })

    it('count should be zero by default', async () => {
      const count = await contract.count()
      assert.strictEqual(count.toNumber(), 0)
    })

    it('all added entries can be enumerated', async () => {
      for (let i = 0; i < accounts.length; i++) {
        const recipient = accounts[i]
        const transferTx = '0x8f53e69ab059c1d1470278ef40a71762abe7211fc57d923fe046317402099ae0'
        const version = `v1.${i}`
        const timestamp = Math.floor(Date.now() / 1000)
        const metaDataURI = `ipfs://my-receipt-${i}`
        await contract.addReceipt(recipient, transferTx, version, timestamp, metaDataURI, { from: accounts[0] })
      }

      const count = await contract.count()
      assert.strictEqual(count.toNumber(), accounts.length)

      for (let i = 1; i <= count.toNumber(); i++) {
        const receipt = await contract.getReceipt(i)
        assert.strict(receipt.recipient, accounts[i])
      }
    }).timeout(30000)

    it('cannot access item with index 0', async () => {
      try {
        await contract.getReceipt(0)
        throw new Error('Should not reach here')
      } catch (err) {
        assert.ok(err.message.includes('ThriveCoinRewardReceipt: receipt not found'))
      }
    })

    it('cannot access item with index greater than count', async () => {
      try {
        const count = await contract.count()
        await contract.getReceipt(count.toNumber() + 1)
        throw new Error('Should not reach here')
      } catch (err) {
        assert.ok(err.message.includes('ThriveCoinRewardReceipt: receipt not found'))
      }
    })
  })
})
