GraphDBjs
=========

####A simple implementation of a graph database on the client side using javascript
The database provides two lists, entities and edges, and allows for CRUD actions on the database. Since this database is designed for use on the client in the browser, it is not designed to be ACID and does not rely on transactional modifications. 

####ToDo:
+ Finish README
+ Add default hashCode algorithm
+ Implement byKey method on edges to return list of edges based on entitiy or relationship type
+ Implement areLinked method to determine if two entities are linked

Datasource
----------
A default datasource can be specified at instantiation, and/or can be ingested later when they become available. This allows for AJAX/JSON(P) calls to update the database in bulk rather than individul creations. The datasource is written to localStorage for faster load times through caching the last viewed datasource. If no datasource is specified at instantiation, the database will check localStorgae for a cached datasource. This allows for faster load and display times while waiting on AJAX/JSON(P) calls to return current datasource.  
**Format:**  
{entities:[{}], edges: [{}]}  
Datasources are objects w/two keys, *entities* & *edges* (both are arrays of objects)  
*entities* contains objects with mandatory keys *name* & *type*  
*edges* contains objects with keys *source*, *target*, *rel*

Usage
-----
###Instantiation
_**With datasource**_
  
```language-javascript  
  // setup starting datasource named startData
  var startData = { 
  entities : [
    { name: "Tom", type: "person", age: "28"},
    { name: "Bob", type: "person"},
    { name: "Tom\'s house", type: "place", location: "1234 1st St"},
    { name: "Tom\'s motorcycle", type: "thing", brand: "Honda"}
  ], edges : [
    { source: {type: 'person', name:'Tom'}, target: {name: "Tom\'s house", type: "place"}, rel: "residence"},
    { source: {type: 'place', name:'Tom\'s house'}, target: {name: "Tom", type: "person"}, rel: "residence of"},
    { source: {type: 'person', name:'Bob'}, target: {name: "Tom\'s house", type: "place"}, rel: "painted"}
  ]};
  
  //create graph database with default datasource startData
  var testDB = new GraphDatabase('testData', startData); 
```

_**Without datasource**_  
Creating database without datasource will read cached from localStorage, if available.

```javascript
  var testDB = new GraphDatabase('testData');
```

###Ingest Datasource

```javascript
  // create new datasource
  var newData = { 
    entities : [
      { name: "Jill", type: "person"}
    ], edges : [
      { source: {type: 'person', name:'Tom'}, target: {name: "Bob", type: "person"}, rel: "paid"},
      { source: {type: 'person', name:'Tom'}, target: {name: "Tom\'s motorcycle", type: "thing"}, rel: "owns"},
      { source: {type: 'thing', name:'Tom\'s motorcycle'}, target: {name: "Tom", type: "person"}, rel: "owned by"},
      { source: {type: 'person', name:'Tom'}, target: {name: "Jill", type: "person"}, rel: "married to"},
      { source: {type: 'person', name:'Jill'}, target: {name: "Tom", type: "person"}, rel: "married to"}
  ]};
  
  // ingest the new datasource
  testDB.ingest(newData);
```

Methods
-------
###*constructor(name [, datasource])*
_**Params:**_  
+ *name* - the localStorage key to use for caching database on the client.
+ *datasource* - datasource object to be added to the database.  

_**Returns:**_  
Success/fail as boolean.

###ingest(datasource)
_**Params:**_  
+ *datasource* - datasource object to be added to the database.  

_**Returns:**_  
Success/fail as boolean.

###create(object)
Creates a new entity in the database from o.  
_**Params:**_  
+ *object* - entity object to be added to the database. Mandatory keys *name* & *type*  

_**Returns:**_  
Unique identifier for entity if successful, -1 if unsucessful.

###read(key *[,values]*)
_**Params:**_  
+ key - the desired index key for returned object array
+ value *(optional)* - the desired value of returned object array. If ommited the returned object array will contain all entities with a key matching the key param, indexed by the key param  

_**Returns:**_  
Object array indexed by key param. If value param is supplied, only entities with key param value matcing the value param are included in the object array.

###update(uid, object)
_**Params:**_  
_**Returns:**_  

###delete(uid)
_**Params:**_  
_**Returns:**_  

###link(source, target, rel)
_**Params:**_  
_**Returns:**_  

###delink(source, target, rel)
_**Params:**_  
_**Returns:**_  
