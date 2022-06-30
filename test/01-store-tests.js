'use strict'

/* eslint-env mocha */

const assert = require('assert')
const ThriveCoinRewardReceipt = artifacts.require('ThriveCoinRewardReceipt')

describe('ThriveCoinRewardReceipt', () => {
  contract('store tests', (accounts) => {
    let contract

    before(async () => {
      contract = await ThriveCoinRewardReceipt.deployed()
    })

    it('addReceipt should store new receipt', async () => {
      const recipient = accounts[2]
      const transferTx = '0x8f53e69ab059c1d1470278ef40a71762abe7211fc57d923fe046317402099ae0'
      const version = 'core-app@1.3.2'
      const timestamp = Math.floor(Date.now() / 1000)
      const metaDataURI = 'ipfs://my-receipt'

      await contract.addReceipt(recipient, transferTx, version, timestamp, metaDataURI, { from: accounts[0] })
      const receipt = await contract.getReceipt(1)
      const expected = [
        recipient,
        transferTx,
        version,
        timestamp.toString(),
        metaDataURI
      ]
      expected.recipient = recipient
      expected.transferTx = transferTx
      expected.version = version
      expected.timestamp = timestamp.toString()
      expected.metaDataURI = metaDataURI

      assert.deepStrictEqual(receipt, expected)
    })

    it('addReceipt should increment count', async () => {
      const recipient = accounts[2]
      const transferTx = '0x8f53e69ab059c1d1470278ef40a71762abe7211fc57d923fe046317402099ae0'
      const version = 'core-app@1.3.3'
      const timestamp = Math.floor(Date.now() / 1000)
      const metaDataURI = 'ipfs://my-receipt'

      await contract.addReceipt(recipient, transferTx, version, timestamp, metaDataURI, { from: accounts[0] })
      const count = await contract.count()
      assert.strictEqual(count.toNumber(), 2)
    })

    it('addReceipt should emit event', async () => {
      const recipient = accounts[2]
      const transferTx = '0x8f53e69ab059c1d1470278ef40a71762abe7211fc57d923fe046317402099ae0'
      const version = 'core-app@1.3.4'
      const timestamp = Math.floor(Date.now() / 1000)
      const metaDataURI = 'ipfs://my-receipt'

      const res = await contract.addReceipt(recipient, transferTx, version, timestamp, metaDataURI, { from: accounts[0] })
      const txLog = res.logs[0]

      assert.strictEqual(txLog.event, 'RewardReceiptStored')
      assert.strictEqual(txLog.args.id.toNumber(), 3)
      assert.strictEqual(txLog.args.recipient, recipient)
      assert.strictEqual(txLog.args.transferTx, transferTx)
      assert.strictEqual(txLog.args.version, version)
      assert.strictEqual(txLog.args.timestamp.toNumber(), timestamp)
      assert.strictEqual(txLog.args.metaDataURI, metaDataURI)
    })
  })
})
