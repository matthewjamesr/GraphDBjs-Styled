GraphDBjs
=========

####A simple implementation of a graph database on the client side using javascript
The database provides two lists, entities and edges, and allows for CRUD actions on the database. Since this database is designed for use on the client in the browser, it is not designed to be ACID and does not rely on transactional modifications. 

####Datasource:
A default datasource can be specified at instantiation, and/or can ingest datasources later when they become available. This allows for AJAX/JSON(P) calls to update the database in bulk rather than individul creations. The datasource is written to localStorage for faster load times through caching the last viewed datasource. If no datasource is specified at instantiation, the database will check localStorgae for a cached datasource. This allows for faster load and display times while waiting on AJAX/JSON(P) calls to return current datasource.  
**Format:**  
{entities:[{}], edges: [{}]}  
Datasources are objects w/two keys, *entities* & *edges* (both are arrays of objects)  
*entities* contains objects with mandatory keys *name* & *type*  
*edges* contains objects with keys *source*, *target*, *rel*

####ToDo:
+ Add default hashCode algorithm
+ Implement byKey method on edges to return list of edges based on entitiy or relationship type
+ Implement areLinked method to determine if two entities are linked
