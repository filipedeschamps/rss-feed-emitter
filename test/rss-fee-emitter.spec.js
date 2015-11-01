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
	})

})
