const chai = require('chai')

const PlasmaMerkleSumTree = require('../../src/sum-tree/plasma-sum-tree')
const Transaction = require('../../src/serialization').models.Transaction
const txutils = require('../tx-utils')

const should = chai.should()

const accounts = [
  '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
  '0xa12bcf1159aa01c739269391ae2d0be4037259f3',
  '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8'
]

const tx1 = new Transaction({
  block: 0,
  transfers: [
    {
      sender: accounts[0],
      recipient: accounts[1],
      token: 0,
      start: 2,
      end: 3
    }
  ]
})
const tx2 = new Transaction({
  block: 0,
  transfers: [
    {
      sender: accounts[2],
      recipient: accounts[1],
      token: 0,
      start: 6,
      end: 7
    }
  ]
})
const tx3 = new Transaction({
  block: 0,
  transfers: [
    {
      sender: accounts[2],
      recipient: accounts[1],
      token: 1,
      start: 100,
      end: 108
    }
  ]
})

describe('PlasmaMerkleSumTree', () => {
  describe('construction', () => {
    it('should return undefined for an empty tree', () => {
      const tree = new PlasmaMerkleSumTree()

      should.not.exist(tree.root())
    })

    it('should generate a single-leaf tree correctly', () => {
      const tree = new PlasmaMerkleSumTree([tx1])

      tree.root().data.should.equal('fc06a463e3d920cce96b4e5385fc4c7063d515a861ccb79ce0c49699a7685ee4' + 'ffffffffffffffffffffffffffffffff')
    })

    it('should generate an even tree correctly', () => {
      const tree = new PlasmaMerkleSumTree([tx1, tx2])

      tree.root().data.should.equal('f415c586263ae5bff92d841121f0de1fea5e0b51d44d0bfb60b8e596f50292b7' + 'ffffffffffffffffffffffffffffffff')
    })

    it('should generate an odd tree w/ multiple types correctly', () => {
      const tree = new PlasmaMerkleSumTree([tx1, tx2, tx3])
      tree.root().data.should.equal('257dbda67d08ac131f9304e3122ba0d821676acec8c0e3f3ea3b77c641d817e8' + 'ffffffffffffffffffffffffffffffff')
    })
  })

  describe('checkProof', () => {
    const txs = txutils.getSequentialTxs(100)
    const tree = new PlasmaMerkleSumTree(txs)
    const index = Math.floor(Math.random() * 100)
    const proof = tree.getInclusionProof(index)

    it('should verify a random proof', () => {
      const isValid = PlasmaMerkleSumTree.checkInclusion(index, txs[index], 0, proof, tree.root().data)

      isValid.should.be.true
    })

    it('should not verify a proof with an invalid index', () => {
      const isValid = PlasmaMerkleSumTree.checkInclusion(index + 1, txs[index], 0, proof, tree.root().data)

      isValid.should.be.false
    })

    it('should not verify a proof with an invalid element', () => {
      let invalidProof = tree.getInclusionProof(index)
      invalidProof.pop() // Remove an element
      const isValid = PlasmaMerkleSumTree.checkInclusion(index, txs[index], 0, invalidProof, tree.root().data)

      isValid.should.be.false
    })
  })
})
