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

		it('#remove deve ser uma função', () => {
			expect(feeder.remove).to.be.a('function');
		});

		it('#on deve ser uma função', () => {
			expect(feeder.on).to.be.a('function');
		});

		it('#emit deve ser uma função', () => {
			expect(feeder.emit).to.be.a('function');
		});
		
		it('#list deve ser uma função', () => {
			expect(feeder.list).to.be.a('function');
		});
		
		it('#destroy deve ser uma função', () => {
			expect(feeder.destroy).to.be.a('function');
		});
		
	})

	describe('#add', () => {

		it('deve ser uma função', () => {

			let feeder = new RssFeedEmitter();
			expect(feeder.add).to.be.a('function');

		});

		it('deve retornar erro quando chamado sem objeto de configuração', () => {

			let feeder = new RssFeedEmitter();
			expect( () => feeder.add() ).to.throw(Error);

		});

		it('deve retornar erro quando objeto de configuração não possui "url"', () => {

			let feeder = new RssFeedEmitter();
			expect( () => {
				feeder.add({
					refresh: 60000
				})
			}).to.throw(Error);

		});

		it('deve retornar erro quando objeto de configuração possui "url" mas não é uma string', () => {

			let feeder = new RssFeedEmitter();

			expect( () => { 
				feeder.add({
					url: [1, 2, 3]
				}) 
			}).to.throw(Error);

		});

		it('deve retornar erro quando objeto de configuração possui "refresh" mas não um número', () => {

			let feeder = new RssFeedEmitter();

			expect( () => { 
				feeder.add({
					url: 'http://www.nintendolife.com/feeds/latest',
					refresh: 'quickly'
				});
			}).to.throw(Error);

		});

		it('deve adicionar corretamente feeds quando possuir somente "url"', () => {

			let feeder = new RssFeedEmitter();

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
			});

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/news',
			});

			expect( feeder.list() ).to.have.property('length', 2);
			expect( feeder.list()[0] ).to.have.property('refresh', 60000);
			expect( feeder.list()[1] ).to.have.property('refresh', 60000);
		});

		it('deve substituir a taxa de atualização padrão quando possuir "refresh"', () => {

			let feeder = new RssFeedEmitter();

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 120000
			});

			expect( feeder.list()[0] ).to.have.property('refresh', 120000);
		});

		it('deve atualizar o feed quando "url" já existir na lista de feeds', () => {

			let feeder = new RssFeedEmitter();

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 120000
			});

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('refresh', 120000);

			feeder.add({
				url: 'http://www.nintendolife.com/feeds/latest',
				refresh: 240000 
			});

			expect( feeder.list() ).to.have.property('length', 1);
			expect( feeder.list()[0] ).to.have.property('refresh', 240000);
		});

	})

})
