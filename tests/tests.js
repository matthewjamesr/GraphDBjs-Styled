var testDB, 
  startData = { 
    entities : [
      { name: "Tom", type: "person", age: "28", image: "http://img3.wikia.nocookie.net/__cb20120329233907/alcatraztv/images/2/22/2002_mugshot.jpg"},
      { name: "Bob", type: "person", image: "http://images.amcnetworks.com/blogs.amctv.com/wp-content/uploads/2010/04/Krazy-8-Mugshot-760.jpg"},
      { name: "Tom\'s house", type: "place", location: "1234 1st St"},
      { name: "Tom\'s motorcycle", type: "thing", brand: "Honda"}
    ], edges : [
      { source: {type: 'person', name:'Tom'}, target: {name: "Tom\'s house", type: "place"}, rel: "residence"},
      { source: {type: 'place', name:'Tom\'s house'}, target: {name: "Tom", type: "person"}, rel: "residence of"},
      { source: {type: 'person', name:'Bob'}, target: {name: "Tom\'s house", type: "place"}, rel: "painted"}
    ]},
  newData = { 
    entities : [
      { name: "Jill", type: "person"}
    ], edges : [
      { source: {type: 'person', name:'Tom'}, target: {name: "Bob", type: "person"}, rel: "paid"},
      { source: {type: 'person', name:'Tom'}, target: {name: "Tom\'s motorcycle", type: "thing"}, rel: "owns"},
      { source: {type: 'thing', name:'Tom\'s motorcycle'}, target: {name: "Tom", type: "person"}, rel: "owned by"},
      { source: {type: 'person', name:'Tom'}, target: {name: "Jill", type: "person"}, rel: "married to"},
      { source: {type: 'person', name:'Jill'}, target: {name: "Tom", type: "person"}, rel: "married to"}
    ]},
	localStoreName = 'testDB';

QUnit.config.reorder = false;

QUnit.test('Create Database w/o Datasource', function(assert){
  delete localStorage['localStoreName']; //start with clean localStorage
  testDB = new GraphDatabase('localStoreName'); // create the new empty database
  assert.ok(testDB instanceof GraphDatabase, 'Construct Success'); // if the object is succesfully created
  assert.ok(Object.keys(testDB.entities()).length === 1, 'Database empty'); // if the database is created empty
});

QUnit.test('Create Database w/ Datasource', function(assert){
  testDB = new GraphDatabase('localStoreName', startData); // create the database with startData
  assert.ok(testDB instanceof GraphDatabase, 'Construct Success'); // if the object is succesfully created
  assert.ok(Object.keys(testDB.entities()).length === 5, 'Database not empty'); // if the database is created empty
});

QUnit.test('Ingest new datasource', function(assert){
  testDB.ingest(newData);
  assert.equal(Object.keys(testDB.entities()).length, 6, 'Ingest Success');
});

QUnit.test('Create new entity \'Sam\'', function(assert){
  var newPerson = {
    name: 'Sam',
    type: 'person'};
  testDB.create(newPerson, function(entity){
    newPerson.uid = 'personSam';
    assert.ok(true, 'Callback Success');
    assert.deepEqual(JSON.stringify(newPerson), JSON.stringify(entity),'Database Create Success');
  });
});

QUnit.test('Read by Unique Identifier', function(assert){
  expect(2);
  var sam = {
    name: 'Sam',
    type: 'person',
    uid: 'personSam'};
  testDB.read({
    key: 'uid',
    value: 'personSam',
    callback: function (recordSet){
      assert.ok(true, 'Callback Success');
      assert.deepEqual(JSON.stringify(recordSet), JSON.stringify(sam), 'Read Success');
    }
  });
});

QUnit.test('Read by Name', function(assert){
  expect(2);
  var sam = {
    name: 'Sam',
    type: 'person',
    uid: 'personSam'};
  testDB.read({
    key: 'name',
    value: 'Sam',
    callback: function (recordSet){
      assert.ok(true, 'Callback Success');
      assert.deepEqual(JSON.stringify(recordSet), JSON.stringify(sam), 'Read Success');
    }
  });
});

QUnit.test('Read by Type', function(assert){
  expect(2);
  var sam = {
    name: 'Sam',
    type: 'person',
    uid: 'personSam'};
  testDB.read({
    key: 'type',
    value: 'person',
    callback: function (recordSet){
      assert.ok(true, 'Callback Success');
      console.log(recordSet);
      assert.deepEqual(JSON.stringify(recordSet.byKey('name', 'Sam')), JSON.stringify(sam), 'Read Success');
      console.log(recordSet.byKey('name', 'Sam'));
    } 
  });
});
