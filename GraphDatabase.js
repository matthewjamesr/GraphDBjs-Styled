function GraphDatabase(_name, ds){
  /*
  *  ToDo: implement hashCode to get true unique identifier
  *  --- for now it simply checks if there is a hashCode already
  *  --- and if not then it creates one that simply returns the string
  */
  window.String.prototype.hashCode = window.String.prototype.hashCode || function(){
    return this;
  }
  
  /*
  *  Gets hashCode based on entity type & name
  */
  var _getHash = function(o){ return (o.type && o.name) ? (o.type + o.name).hashCode() : null; }

  /*
  *  Checks if user supplied datasource
  *  --- if so, make it the datasource
  *  --- if not, create blank datasource
  *  Note: datasource is an Object with 2 properties
  *  --- entities & edges. Both are arrays of objects
  */
  var _datasource = ds || {entities:[], edges:[]};
  
  var byKey = function(key, value){
    var result = {},
        dups = [];
    for (e in this){
      if (this[e][key] && !result[this[e][key]])
        result[this[e][key]] = this[e];
      else if (this[e][key] && $.inArray(this[e][key], dups) > -1)
        result[this[e][key]][this[e].uid] = this[e];
      else if (this[e][key]){
        var first = result[this[e][key]];
        delete result[this[e][key]];
        result[this[e][key]] = {};
        result[this[e][key]]['byKey'] = byKey;
        result[this[e][key]][first.uid] = first;
        result[this[e][key]][this[e].uid] = this[e];
        dups.push(this[e][key]);
      }
    }
    return typeof value === 'undefined' ? result : result[value];
  }
  
  /*
  *  Parses entities to object
  *  --- indexed by Unique Identifier
  *  @Params:
  *  --- @e: array of objects
  */
  var _parseEntities = function(e){
        var data = { uid: {}, name: {}, types: {}};
        for (var j = 0; j < e.length; j++){
          e[j].uid = _getHash(e[j]);
          data[e[j].uid] = e[j];
        }
        data.read = byKey;
        return data;
      },
  /*
  *  Sets private entities to returned object
  */
      _entities = _parseEntities(_datasource.entities),
  /*
  *  Parses edges to object
  *  --- indexed by Source and Target
  *  @Params:
  *  --- @e: array of objects
  */
      _parseEdges = function(e){
        var edges = {ins: {}, outs: {}};
        for (var i = 0; i < e.length; i++){
          var tid = _getHash(e[i].target),
              sid = _getHash(e[i].source);
          if (!edges.ins[tid]) edges.ins[tid] = [];
          edges.ins[tid].push({source: _entities[sid], rel: e[i].rel});
          if (!edges.outs[sid]) edges.outs[sid] = [];
          edges.outs[sid].push({target: _entities[tid], rel: e[i].rel});
        }
        return edges;
      },
      _edges = _parseEdges(_datasource.edges),
      _read = function(name){
        if (!localStorage || !localStorage[name]) return false
        _datasource = $.parseJSON(localStorage[name]);
        _entities =_parseEntities(_datasource.entities);
        _edges = _parseEdges(_datasource.edges);
      },
      _write = function(name){localStorage[name] = JSON.stringify(_datasource); };
      
  if (typeof ds === 'undefined') _read(_name);
  
  this.entities = function(){return _entities; };
  this.edges = function(){ return _edges; }; 
  this.create = function(o){
    //o.uid = _datasource.entities.length; _getHash(e[j])
    //add to datasource entities
    if (!o.name || !o.type) return -1;
    o.uid = _getHash(o);
    if ($.grep(_datasource.entities, function(e){ return e.uid == o.uid; }).length > 0) return -1;
    _datasource.entities.push(o);
    
    //add to _entities    
    _entities[o.uid] = o;
    
    //return success
    _write(_name);
    return o.uid;
    
  };
  this.read = function(key, value){
    var matches = _entities.read(key, value);
    return matches;
  }
  this.update = function (uid, o){
    o.uid = uid;
    //edit in datasource entities
    if (!o.name || !o.type) return false;
    var e = $.grep(_datasource.entities, function(e){ return e.uid == uid; });
    if (e.length !== 1) return false;
    _datasource.entities[uid] = o;
    
    //edit in _entities  
    _entities.uid[uid] = o; 
    
    //return success
    _write(_name);
    return true;
  };
  this.delete = function(uid){
    //remove from datasource entities
    _datasource.entities = $.grep(_datasource.entities, function(e){ return e.uid == uid; }, true);
    
    //remove from _entities
    delete _entities[uid]; 
    
    //return success/fail
    _write(_name);
    return true;
  };
  // Links entities
  // @params:
  //   s: source object 
  //    props:  name & type
  //   t: target object 
  //    props:  name & type
  //   rel: relationship
  this.link = function(s, t, r){
    //get hash codes
    var tid = _getHash(t),
        sid = _getHash(s);
    //add to datasource.edges
    _datasource.edges.push({source: sid, target: tid, rel: r});
    
    //add to _edges.ins
    if (!_edges.ins[tid]) _edges.ins[tid] = [];
    _edges.ins[tid].push({source: _entities[sid], rel: r});
    
    //add to _edges.outs
    if (!_edges.outs[sid]) _edges.outs[sid] = [];
    _edges.outs[sid].push({target: _entities[tid], rel: r});
    
    //return success/fail
    return true;
    _write(_name);
  };
  this.delink = function(sid, tid, r){
    //remove from datasource.edges
    _datasource.edges = $.grep(_datasource.edges, function(e){ return (e.source == sid && e.target == tid && e.rel == r); }, true);
    
    //remove from to _edges.ins
    _edges.ins[t] = $.grep(_edges.ins[t], function(e){ return (e.source.uid == sid && e.rel == r); }, true);
    
    //remove from to _edges.outs
    _edges.outs[s] = $.grep(_edges.outs[s], function(e){ return (e.target.uid == tid && e.rel == r); }, true);
    
    //return success/fail
    _write(_name);
    return true;
  };
  this.refresh = function(ds){
    _datasource = ds;
    _entities = _parseEntities(_datasource.entities);
    _edges = _parseEdges(_datasource.edges);
  };
  this.ingest = function(ds){
    var db = this;
    ds.entities.forEach(function(v, i, a){
      if (_entities.read('type',[v.type]) && _entities.read('type', [v.type]).byKey('name', [v.name])){
        var cur = _entities.read('type',[v.type]);
        db.update(cur.uid, v);
      }else{
        db.create(v);
      }
    });
    ds.edges.forEach(function(v, i, a){
      //get hash codes
      var tid = _getHash(v.target),
          sid = _getHash(v.source);
      //ins
      if (_edges.ins[tid]){
        var exists = false,
            ins = _edges.ins[tid];
        for (var i = 0; i < ins.length; i++){
          if (ins[i].source === sid && ins[i].rel === v.rel) exists = true;
        }
        if (!exists) db.link(v.source, v.target, v.rel);
      }else{
        db.link(v.source, v.target, v.rel);
      }
      //outs
    });
  };
}
