const c = require('chai')
const assert = c.assert, expect = c.expect
const m = require('mocha')
const describe = m.describe, it=m.it

global.console.info('Testing with settings: NODE_ENV=' + process.env.NODE_ENV + ' BUILD_TYPE=' + process.env.BUILD_TYPE);

const cfg = require('../')

describe('webpack-config-universal', function(){
  it('has production and development flavors', function(){
    expect(cfg).to.have.a.property('production')
    expect(cfg).to.have.a.property('development')
  })

  it('is itself a webpack config ', function(){
    expect(cfg).to.have.a.property('entry')
  })

  it('is a production or development flavor based on NODE_ENV', function(){
    expect(cfg).to.have.a.property('devtool')
    expect(cfg.devtool == (process.env.NODE_ENV != 'production'))
  })

  it('is a server or client config based on BUILD_TYPE', function(){
    expect(cfg).to.have.a.property('target')
    expect(cfg.target).to.equal((process.env.BUILD_TYPE || 'server') == 'server' ? 'node' : 'web')
  })

  describe('production', function(){
    it('has server and client configs', function(){
      expect(cfg.production).to.have.a.property('server')
      expect(cfg.production).to.have.a.property('client')
    })
  })

  describe('development', function(){
    it('has server and client configs', function(){
      expect(cfg.development).to.have.a.property('server')
      expect(cfg.development).to.have.a.property('client')
    })
  })
})
