//jQuery Actions below//


var startData = {
  entities : [
    { name: "Tom", type: "person", age: "28", image: "http://img3.wikia.nocookie.net/__cb20120329233907/alcatraztv/images/2/22/2002_mugshot.jpg"},
    { name: "Bob", type: "person", image: "http://images.amcnetworks.com/blogs.amctv.com/wp-content/uploads/2010/04/Krazy-8-Mugshot-760.jpg"},
    { name: "Tom\'s house", type: "place", location: "1234 1st St"},
    { name: "Tom\'s motorcycle", type: "thing", brand: "Honda"}
  ], edges : [
    { source: {type: 'person', name:'Tom'}, target: {name: "Tom\'s house", type: "place"}, rel: "residence"},
    { source: {type: 'place', name:'Tom\'s house'}, target: {name: "Tom", type: "person"}, rel: "residence of"},
    { source: {type: 'person', name:'Bob'}, target: {name: "Tom\'s house", type: "place"}, rel: "painted"}
  ]};
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

//test construtor
var testDB = new GraphDatabase('testData', startData);
$('#main').append($('<div>', {id: 'graph'}));
$('#main').append($('<div>', {id: 'output'}));
//testDB.ingest(startData);
testDB.ingest(newData);

//************Display Entity********************
var person_tmpl = '\
<div class="selectedContainer"><img class="mugshot" src="{{image}}" alt="mugshot"></img>\
<span class="selectedEntity"><strong>ID: </strong>{{uid}}<br/>\
<strong>Name: </strong>{{name}}<br/>\
<strong>Type: </strong>{{type}}<br/>\
<strong>Age: </strong>{{age}}</span></div>';
var place_tmpl = '\
<div class="selectedContainer"><strong>ID: </strong>{{uid}}<br/>\
<strong>Name: </strong>{{name}}<br/>\
<strong>Type: </strong>{{type}}<br/>\
<strong>Location: </strong>{{location}}<br/></div>';
var thing_tmpl = '\
<div class="selectedContainer"><strong>ID: </strong>{{uid}}<br/>\
<strong>Name: </strong>{{name}}<br/>\
<strong>Type: </strong>{{type}}<br/>\
<strong>Brand: </strong>{{brand}}<br/></div>';
ich.addTemplate('person_tmpl', person_tmpl);
ich.addTemplate('place_tmpl', place_tmpl);
ich.addTemplate('thing_tmpl', thing_tmpl);

function display(s){
  testDB.read({key: 'uid', value: s }, function(current){
    switch (current.type){
      case 'person':
        $('#output').html(ich.person_tmpl(testDB.entities()[current.uid]));
        break;
      case 'place':
        $('#output').html(ich.place_tmpl(testDB.entities()[current.uid]));
        break;
      case 'thing':
        $('#output').html(ich.thing_tmpl(testDB.entities()[current.uid]));
        break;
    }
  });
}

testDB.read({ key: 'name', value: 'Tom' }, function(Tom){
  buildTree(Tom.uid, '#graph');
  display(Tom.uid);
});

//*************D3 Tree******************
function buildTree(id, container){
  var margin = {top: 70, right: 100, bottom: 0, left: 100},
      width = 300 - margin.right - margin.left,
      height = 500 - margin.top - margin.bottom;

  var i = 0,
      duration = 750,
      root;

  var tree = d3.layout.tree()
      .size([height, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select(container).append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function buildFlare(flare) {
    root = flare;
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    update(root);
  };

  testDB.read({key: 'uid', value: id}, function(current){
    var out = [];
    for (var i = 0; i < current.outs.length; i++){
      out.push({
        name: '-[:' + current.outs[i].rel + ']->' + current.outs[i].target.name,
        uid: current.outs[i].target.uid,
        children: []});
    }
    buildFlare({
      name: current.name,
      uid: current.uid,
      children: out});
  });

  d3.select(self.frameElement).style("height", "800px");

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    testDB.read({ key: 'uid', value: d.uid}, function(current){
      var out = [];
      display(current.uid);
      for (var i = 0; i < current.outs.length; i++){
        var name = '-[:' + current.outs[i].rel + ']->' + current.outs[i].target.name;
        out.push({
          name: name,
          uid: current.outs[i].target.uid,
          children: []});
      }
      buildFlare({
        name: current.name,
        uid: current.uid,
        children: out});

      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    });
  }
}
