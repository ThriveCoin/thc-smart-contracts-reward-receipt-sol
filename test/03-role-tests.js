'use strict'

/* eslint-env mocha */

const assert = require('assert')
const { keccak256 } = require('@ethersproject/keccak256')
const ThriveCoinRewardReceipt = artifacts.require('ThriveCoinRewardReceipt')

describe('ThriveCoinRewardReceipt', () => {
  contract('role tests', (accounts) => {
    let contract = null
    const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const WRITER_ROLE = keccak256(Buffer.from('WRITER_ROLE', 'utf8'))
    const DUMMY_ROLE = keccak256(Buffer.from('DUMMY_ROLE', 'utf8'))

    before(async () => {
      contract = await ThriveCoinRewardReceipt.deployed()

      await contract.grantRole(WRITER_ROLE, accounts[1], { from: accounts[0] })
    })

    it('hasRole should return true when user has role', async () => {
      const res = await contract.hasRole(ADMIN_ROLE, accounts[0])
      assert.strictEqual(res, true)
    })

    it('hasRole should return false when user does not have role', async () => {
      const res = await contract.hasRole(WRITER_ROLE, accounts[2])
      assert.strictEqual(res, false)
    })

    it('deployer should have all three roles by default', async () => {
      const res = await Promise.all([
        contract.hasRole.call(ADMIN_ROLE, accounts[0]),
        contract.hasRole.call(WRITER_ROLE, accounts[0])
      ])

      assert.strictEqual(res.every(r => r === true), true)
    })

    it('getRoleAdmin should return admin role for all three roles', async () => {
      const res = await Promise.all([
        contract.getRoleAdmin.call(ADMIN_ROLE),
        contract.getRoleAdmin.call(WRITER_ROLE)
      ])

      assert.strictEqual(res.every(r => r === ADMIN_ROLE), true)
    })

    it('only admin role can grant roles', async () => {
      await contract.grantRole(WRITER_ROLE, accounts[3], { from: accounts[0] })
      const hasRole = await contract.hasRole(WRITER_ROLE, accounts[3])
      assert.strictEqual(hasRole, true)

      try {
        await contract.grantRole(DUMMY_ROLE, accounts[3], { from: accounts[1] })
        throw new Error('Should not reach here')
      } catch (err) {
        assert.strictEqual(
          err.message.includes(`AccessControl: account ${accounts[1].toLowerCase()} is missing role ${ADMIN_ROLE}`),
          true
        )
      }
    })

    it('also admin role can be granted', async () => {
      await contract.grantRole(ADMIN_ROLE, accounts[4], { from: accounts[0] })
      const hasRole = await contract.hasRole(ADMIN_ROLE, accounts[4])
      assert.strictEqual(hasRole, true)
    })

    it('grantRole should emit RoleGranted event', async () => {
      const res = await contract.grantRole(DUMMY_ROLE, accounts[3], { from: accounts[0] })
      const txLog = res.logs[0]

      assert.strictEqual(txLog.event, 'RoleGranted')
      assert.strictEqual(txLog.args.role, DUMMY_ROLE)
      assert.strictEqual(txLog.args.account, accounts[3])
      assert.strictEqual(txLog.args.sender, accounts[0])
    })

    it('only admin role can revoke role', async () => {
      await contract.revokeRole(WRITER_ROLE, accounts[3], { from: accounts[0] })
      const hasRole = await contract.hasRole(WRITER_ROLE, accounts[3])
      assert.strictEqual(hasRole, false)

      try {
        await contract.revokeRole(DUMMY_ROLE, accounts[3], { from: accounts[1] })
        throw new Error('Should not reach here')
      } catch (err) {
        assert.strictEqual(
          err.message.includes(`AccessControl: account ${accounts[1].toLowerCase()} is missing role ${ADMIN_ROLE}`),
          true
        )
      }
    })

    it('revokeRole should emit RoleRevoked event', async () => {
      const res = await contract.revokeRole(DUMMY_ROLE, accounts[3], { from: accounts[0] })
      const txLog = res.logs[0]

      assert.strictEqual(txLog.event, 'RoleRevoked')
      assert.strictEqual(txLog.args.role, DUMMY_ROLE)
      assert.strictEqual(txLog.args.account, accounts[3])
      assert.strictEqual(txLog.args.sender, accounts[0])
    })

    it('account can renounce their role', async () => {
      await contract.grantRole(DUMMY_ROLE, accounts[3], { from: accounts[0] })
      const hasRoleBefore = await contract.hasRole(DUMMY_ROLE, accounts[3])
      assert.strictEqual(hasRoleBefore, true)

      await contract.renounceRole(DUMMY_ROLE, accounts[3], { from: accounts[3] })
      const hasRoleAfter = await contract.hasRole(DUMMY_ROLE, accounts[3])
      assert.strictEqual(hasRoleAfter, false)
    })

    it('renounce should emit RoleRevoked event', async () => {
      await contract.grantRole(DUMMY_ROLE, accounts[3], { from: accounts[0] })
      const res = await contract.renounceRole(DUMMY_ROLE, accounts[3], { from: accounts[3] })
      const txLog = res.logs[0]

      assert.strictEqual(txLog.event, 'RoleRevoked')
      assert.strictEqual(txLog.args.role, DUMMY_ROLE)
      assert.strictEqual(txLog.args.account, accounts[3])
      assert.strictEqual(txLog.args.sender, accounts[3])
    })

    it('account can renounce only their role', async () => {
      await contract.grantRole(DUMMY_ROLE, accounts[3], { from: accounts[0] })

      try {
        await contract.renounceRole(DUMMY_ROLE, accounts[3], { from: accounts[0] })
        throw new Error('Should not reach here')
      } catch (err) {
        assert.strictEqual(
          err.message.includes('AccessControl: can only renounce roles for self'),
          true
        )
      }
    })

    it('grantRole could work for any role', async () => {
      const res = await contract.grantRole(DUMMY_ROLE, accounts[4], { from: accounts[0] })
      const txLog = res.logs[0]

      assert.strictEqual(txLog.event, 'RoleGranted')
      assert.strictEqual(txLog.args.role, DUMMY_ROLE)
      assert.strictEqual(txLog.args.account, accounts[4])
      assert.strictEqual(txLog.args.sender, accounts[0])
    })

    it('role members must be enumerable', async () => {
      const minters = [accounts[0], accounts[1]]
      const length = await contract.getRoleMemberCount.call(WRITER_ROLE)

      for (let index = 0; index < length; index++) {
        const minter = await contract.getRoleMember(WRITER_ROLE, index)
        assert.strictEqual(minter, minters[index])
      }
    })

    it('addReceipt can be done only by WRITER_ROLE', async () => {
      const recipient = accounts[2]
      const transferTx = '0x8f53e69ab059c1d1470278ef40a71762abe7211fc57d923fe046317402099ae0'
      const version = 'core-app@1.3.2'
      const timestamp = Math.floor(Date.now() / 1000)
      const metaDataURI = 'ipfs://my-receipt'

      await contract.addReceipt(recipient, transferTx, version, timestamp, metaDataURI, { from: accounts[0] })
      await contract.addReceipt(recipient, transferTx, version, timestamp, metaDataURI, { from: accounts[1] })

      try {
        await contract.addReceipt(recipient, transferTx, version, timestamp, metaDataURI, { from: accounts[2] })
        throw new Error('Should not reach here')
      } catch (err) {
        assert.strictEqual(
          err.message.includes('ThriveCoinRewardReceipt: must have writer role to store receipt'),
          true
        )
      }
    })
  })
})
