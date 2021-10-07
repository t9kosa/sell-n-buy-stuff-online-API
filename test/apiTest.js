const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../server');
const chaiJsonSchemaAjv = require('chai-json-schema-ajv');
chai.use(chaiJsonSchemaAjv);

const serverAddress = "http://localhost:3000";
const postSchema = require('../schemas/post.schema.json');


describe('get users', function() {

  before(function() {
    server.start();
  });

  after(function() {
    server.close();
  })

  describe('Add new user', function() {

    it('should accept userinfo when data is correct', function(done) {
      chai.request(serverAddress)
        .post('/users')
        .send({
            username: "matti85",
            firstName: "matti",
            lastName: "meikalainen",
            email: "matti.m@gmail.com",
            password: "matti",
            dateOfBirth: "1985-05-10"
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          done();
        })
    })
    it('should reject request with missing fields from data structure', function(done) {
      chai.request(serverAddress)
        .post('/users')
        .send({
          username: "matti85",
          firstName: "matti",
          lastName: "meikalainen",
          email: "matti.m@gmail.com",
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        })
    })
    it('should reject request with incorrect data types', function(done) {
      chai.request(serverAddress)
        .post('/users')
        .send({
          username: "matti85",
          firstName: "matti",
          lastName: "meikalainen",
          email: "matti.m@gmail.com",
          password: 12312,
          dateOfBirth: "1985-05-10"
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        })
    })
  })
})