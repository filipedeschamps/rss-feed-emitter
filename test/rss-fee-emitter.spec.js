'use strict';

import chai from 'chai';
import RssFeedEmitter from '../src/rss-feed-emitter.js';

let expect = chai.expect;

describe('RssFeedEmitter', () => {

	describe('quando instanciado', () => {
		let feeder = new RssFeedEmitter();

		it('deve retornar um objeto', () => {
			expect(feeder).to.be.an('object');
		});

		it('#add deve ser uma função', () => {
			expect(feeder.add).to.be.a('function');
		});

		it('#remove deve ser uma função', () => {
			expect(feeder.remove).to.be.a('function');
		});

		it('#on deve ser uma função', () => {
			expect(feeder.on).to.be.a('function');
		});

		it('#emit deve ser uma função', () => {
			expect(feeder.emit).to.be.a('function');
		});
	})

})
