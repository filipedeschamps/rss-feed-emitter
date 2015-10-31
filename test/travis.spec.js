'use strict';

let chai = require('chai');
let expect = chai.expect;

describe('Primeiro teste do Travis', function() {
	it('deve passar', function() {
		expect(true).to.be.equal(true);
	});

	it('antes falhava, mas agora deve passar', function() {
		expect(1).to.be.equal(1);
	});
})
