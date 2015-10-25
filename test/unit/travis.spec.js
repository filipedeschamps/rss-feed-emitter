'use strict';

let chai = require('chai');
let expect = chai.expect;

describe('Primeiro teste do Travis', function() {
	it('deve passar', function() {
		expect(true).to.be.equal(true);
	});

	it('deve falhar', function() {
		expect(false).to.be.equal(true);
	});
})
