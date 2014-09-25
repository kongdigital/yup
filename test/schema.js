var chai  = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , _      = require('lodash')
  , Schema = require('../lib/schema')
  , ft = require('../lib/fieldTypes')
  , v = require('../lib/util/validators');

chai.use(sinonChai);
chai.should();

describe( 'Schema', function(){


  it( 'should create fields correctly', function(){
    var schema = new Schema({
      fields: {
        number: new ft.Number,
        string: String,
        nested: {
          fields: { string: String }
        },
        arrayOfString: [ String ],
        withOpts: { type: String, validations: [ v.min(5) ]}
      }
    })

    var fields = schema.fields

    fields.should.have.property('number').that.is.an.instanceOf(ft.Number)
    fields.should.have.property('string').that.is.an.instanceOf(ft.String)

    fields.should.have.property('nested').that.is.an.instanceOf(Schema)
      .that.has.deep.property('fields.string')
      .that.is.an.instanceOf(ft.String)

    fields.should.have.property('arrayOfString').that.is.an.instanceOf(ft.Array)
      .and.has.property('subField').that.is.an.instanceOf(ft.String)

    fields.should.have.property('withOpts').that.is.an.instanceOf(ft.String)
      .and.has.deep.property('validations.length').that.equals(1)
  })

  it( 'should inherit fields', function(){
    var SchemaA = Schema.extend({
      fields: { number: new ft.Number }
    })

    var SchemaB = SchemaA.extend(
      { fields: { string: new ft.String }},
      { fields: { otherString: new ft.String} })

    var fields = (new SchemaB).fields

    fields.should.have.property('number').that.is.an.instanceOf(ft.Number)
    fields.should.have.property('string').that.is.an.instanceOf(ft.String)
    fields.should.have.property('otherString').that.is.an.instanceOf(ft.String)
  })

  it( 'should validate correctly', function(){
    var schema = new Schema({
      validate: function(obj){
        if( (obj.string.length + obj.number) < 15)
          return "bad combo"
      },
      fields: {
        number: { type: Number, validations: [ v.required(), v.range(7,10) ] },
        string: { type: String, validations: [ v.min(5) ]},
        nested: {
          fields: { 
            string: { type: String, validations: [ v.matches(/cool/)] } 
          }
        },
      }
    })

    schema.isValid({ number: 6, string: "huzzah"}).should.equal(false)

    schema.errors.length.should.equal(2)
    schema.errors[1].should.equal('bad combo')

    schema
      .isValid({ number: 7, string: "huzzahfdfdd", nested: { string: 'cool' }})
      .should.equal(true)

  })
})