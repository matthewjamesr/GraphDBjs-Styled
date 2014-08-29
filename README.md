GraphDBjs
=========

####A simple implementation of a graph database on the client side using javascript
The database provides two lists, entities and edges, and allows for _**CRUD**_ actions on the database. Since this database is designed for use on the client in the browser, it is not designed to be _**ACID**_ and is not _**transactional**_. 

####ToDo:

+ Add default hashCode algorithm
+ Implement `.byKey(key)` method on edges to return list of edges based on entitiy or relationship type
+ Implement `.areLinked(entity1, entitiy2)` method to determine if two entities are linked
+ Add feature to allow the database to call methods when the database changes

Datasource
----------
A default datasource can be specified at construction, or can be ingested later when it becomes available. This allows for AJAX/JSON(P) calls to update the database in bulk rather than individul creations. The datasource is written to localStorage for faster load times through caching the last viewed datasource. If no datasource is specified at construction, the database will check localStorgae for a cached datasource. This allows for faster load and display times while waiting on AJAX/JSON(P) calls to return current datasource.  
**Format:**  
`{ entities:[], edges: [] } `  

Datasources are objects w/two keys, `entities` & `edges` (both are arrays of objects).  
`entities` array contains objects with mandatory keys `name` & `type`.  
`edges` array contains objects with mandatory keys `source`, `target`, `rel`.  

Usage
-----
###Initilization
Databases can be created with the `GraphDatabase` constructor. At creation, the database can be initialized with data from a supplied datasource, or from a datasource cached in `localStorage`. If the default datasource is supplied, reading cached data from localStorage is skipped and the cache will be overwritten with the  supplied datasource.

_**With datasource:**_  
Create new database with supplied datasource with the `GraphDatabase` constructor an supplying both the `cacheName` and `datasource` parameters.
  
```javascript  
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

_**Without datasource:**_  
Create new database without datasource with the `GraphDatabase` constructor omitting the `datasource` parameter.

```javascript
  var testDB = new GraphDatabase('testData');
```

###Ingesting a Datasource
New datasources can be ingested into the database using the `.ingest()` method. Ingesting a datasource will add the entities to the database, creating new entities if they do not exist or updating the exisiting ones. It will also create links between two entities if they are not already linked.  
_**Note:** two entities can be linked multiple times with different relationships._

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

###Creating an new entitiy
New entities can be created by calling the `.create()` method. If the entity already exists, no new entity is created.

```javascript
  testDB.create({
    name: 'Sam',
    type: 'person'
  });
```

###Reading entities
Entities can be read by calling the `.read()` method which returns all matching entities in an object array. Each object contains arrays for edges in and out, i.e. `{uid: 'personJill', name: 'Jill', type: 'person', ins: [], outs: []}`.

```javascript
  // returns object array of all entities with name key, indexed by name
  testDB.read('name');
  
  // returns only entities with name matching 'Jill' by supplying value as the second parameter
  testDB.read('name', 'Jill');
  
  // alternatively, return all entities, then select 'Jill' by key
  testDB.read('name')['Jill'];
```

Alternatively, entities can be read using the `.entities()` method. This method will return an object array containing all entities, indexed by uid. The entities do not contain edges, i.e. `{uid: 'personJill', name: 'Jill', type: 'person'}`.

```javascript
  // read entity named 'Jill'
  var person = testDB.read('name', 'Jill');
  
  // get 'Jill' entity
  testDB.entities()[person.uid]
```
_**Note:** The object returned from the_ `.read()` _method contains ins & outs arrays as keys, creating circular referencing, and preventing the use of_ `JSON.stringify()`. _If the use of_ `JSON.stringify` _is needed, then the_ `.entities()` _method must be used._

###Updating an entitiy
Entities can be updated by calling the `.update()` method.

```javascript
  // read entity named 'Sam'
  var person = testDB.read('name', 'Sam');
  
  // change the age for 'Sam'
  person.age = 25;
  
  // update 'Sam' in the database
  testDB.update(person.uid, person);
```

###Deleting an entitiy
Entities can be deleted by calling the `.delete()` method.

```javascript
  // read entity named 'Sam'
  var person = testDB.read('name', 'Sam');
  
  // delete 'Sam'
  testDB.delete(person.uid);
```

###Linking two entities
Edges can be created by calling the `.link()` method.

```javascript
  // create 'Sam'
  testDB.create({
    name: 'Sam',
    type: 'person'
  });
  
  // read entity named 'Sam'
  var person = testDB.read('name', 'Sam');
  
  // read entity named 'Tom'
  var second = testDB.read('name', 'Tom');
  
  // link: (Tom)-[:knows]->(Sam)
  testDB.link(second.uid, person.uid, 'knows');
```

###Delinking two entities
Edges can be deleted by calling the `.delink()` method.

```javascript  
  // read entity named 'Sam'
  var person = testDB.read('name', 'Sam');
  
  // read entity named 'Tom'
  var second = testDB.read('name', 'Tom');
  
  // delink: (Tom)-[:knows]->(Sam)
  testDB.delink(second.uid, person.uid, 'knows');
```



Methods
-------
###constructor(name [, datasource])
Creates a new `GraphDatabase` instance and initializes with data from `datasource` or `localStorage[name]`.  
  
_**Params:**_  

+ `name` - the `localStorage` key to use for caching database on the client.  
+ `datasource` *(optional)* - datasource object to be used to initialize the database.  

###.ingest(datasource)
Ingests a new dataset into the database.  
  
_**Params:**_  

+ `datasource` - datasource object to be added to the database.  

_**Returns:**_  
Success/fail as boolean.

###.create(object)
Creates a new entity in the database.  
  
_**Params:**_  

+ `object` - entity object to be added to the database. Mandatory keys *name* & *type*  

_**Returns:**_  
Unique identifier `.uid` for entity if successful, -1 if unsucessful.

###.read(key *[,values]*)
Reads entities from the database, indexed and filtered by the `key` & `value` parameters  
  
_**Params:**_  

+ `key` - the desired index key for returned object array  
+ `value` *(optional)* - the desired value of returned object array. If ommited the returned object array will contain all entities with a key matching the key param, indexed by the key param  

_**Returns:**_  
Object array indexed by `key` param. If `value` param is supplied, the object array is filtered to only return matching entities. If the object array contains more than a single entity, it has a `.byKey()` method for further filtering.

###.update(uid, object)
Updates an entity in the database.  
  
_**Params:**_  

+ `uid` - the uniquie identifier of the entity to be updated
+ `object` - the new entity as an object  

_**Returns:**_  
Success/fail as boolean.

###.delete(uid)
Deletes an entity in the database.  
  
_**Params:**_  

+ `uid` - the uniquie identifier of the entity to be deleted  

_**Returns:**_  
Success/fail as boolean.

###.link(source, target, rel)
Creates edge from `source` entity to `target` entity with `rel` relationship. Entities can be linked by multiple edges with different realtionships.  
  
_**Params:**_  

+ `source` - unique identifier of the source entity
+ `target` - unique identifier of the target entity
+ `rel` - type of relationship

_**Returns:**_  
Success/fail as boolean.

###.delink(source, target, rel)
Deletes edge from `source` entity to `target` entity with `rel` relationship. If the two entities are linked by multiple edges, only the edge with the `rel` realtionship will be deleted.  
  
_**Params:**_  

+ `source` - unique identifier of the source entity
+ `target` - unique identifier of the target entity
+ `rel` - type of relationship

_**Returns:**_  
Success/fail as boolean.
