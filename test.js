'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var collapse = require('./');
var expand = require('expand-object');

describe('collapse', function () {
  it('should collapse an object:', function () {
    collapse({a: 'b'}).should.equal('a:b');
    expand('a:b').should.eql({a: 'b'});
  });

  it('should collapse objects with number values:', function () {
    collapse({a: 0}).should.equal('a:0');
    collapse({a: 1}).should.equal('a:1');

    expand('a:0').should.eql({a: 0});
    expand('a:1').should.eql({a: 1});
  });

  it('should collapse objects with boolean values:', function () {
    collapse({a: false}).should.equal('a:false');
    collapse({a: true}).should.equal('a:true');

    expand('a:false').should.eql({a: false});
    expand('a:true').should.eql({a: true});
  });

  it('should collapse arrays with boolean values:', function () {
    collapse({a: [1, 2, 3]}).should.equal('a:1,2,3');
    collapse({a: {b: [1, 2, 3]}, c: 'd'}).should.equal('a.b:1,2,3|c:d');

    expand('a:1,2,3').should.eql({a: [1, 2, 3]});
    expand('a.b:1,2,3|c:d').should.eql({a: {b: [1, 2, 3]}, c: 'd'});
  });

  it('should collapse nested objects and arrays with boolean values:', function () {
    collapse({a: {b: true}}).should.equal('a.b:true');
    collapse({a: {b: [true]}}).should.equal('a.b:true,');
    collapse({a: {b: [true, false]}}).should.equal('a.b:true,false');
    collapse({a: {b: [true, false], c: {d: 'e'}}}).should.equal('a.b:true,false|a.c.d:e');

    expand('a.b:true').should.eql({a: {b: true}});
    expand('a.b:true').should.eql({a: {b: true}});
    expand('a.b:true,').should.eql({a: {b: [true]}});
    expand('a.b:true,false').should.eql({a: {b: [true, false]}});
    expand('a.b:true,false|a.c.d:e').should.eql({a: {b: [true, false], c: {d: 'e'}}});
  });

  it('should collapse nested objects:', function () {
    collapse({a: {b: 'c', d: 'e'}, f: 'g'}).should.equal('a.b:c|a.d:e|f:g');
    collapse({a: 'b', c: 'd', e: {f: 'g', h: 'i', j: {k: {l: 'm'}}}}).should.equal('a:b|c:d|e.f:g|e.h:i|e.j.k.l:m');
    collapse({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k']}}).should.equal('a:b|c:d|e.f:g|e.h:i,j,k');
    collapse({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k', {one: 'two'}]}}).should.equal('a:b|c:d|e.f:g|e.h:i,j,k,one:two');

    expand('a.b:c|a.d:e|f:g').should.eql({a: {b: 'c', d: 'e'}, f: 'g'});
    expand('a:b|c:d|e.f:g|e.h:i|e.j.k.l:m').should.eql({a: 'b', c: 'd', e: {f: 'g', h: 'i', j: {k: {l: 'm'}}}});
    expand('a:b|c:d|e.f:g|e.h:i,j,k').should.eql({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k']}});
    expand('a:b|c:d|e.f:g|e.h:i,j,k,one:two').should.eql({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k', {one: 'two'}]}});
  });

  it('should collapse nested objects with function values:', function () {
    collapse({a: 'b', c: 'd', e: {f: function foo() {}}}).should.equal('a:b|c:d|e.f:[function foo]');
  });

  it('should collapse nested objects with regex values:', function () {
    collapse({a: 'b', c: /foo|bar/gmi, e: 'f'}).should.equal('a:b|c:/foo|bar/gim|e:f');
    collapse({a: 'b', c: /foo|bar/gi, e: 'f'}).should.equal('a:b|c:/foo|bar/gi|e:f');
    collapse({a: 'b', c: /foo|bar/, e: 'f'}).should.equal('a:b|c:/foo|bar/|e:f');

    expand('a:b|c:/foo|bar/gim|e:f').should.eql({a: 'b', c: /foo|bar/gmi, e: 'f'});
    expand('a:b|c:/foo|bar/gi|e:f').should.eql({a: 'b', c: /foo|bar/gi, e: 'f'});
    expand('a:b|c:/foo|bar/|e:f').should.eql({a: 'b', c: /foo|bar/, e: 'f'});
  });

  it('should collapse nested objects with regex and function values:', function () {
    collapse({a: 'b', c: /foo|bar/gmi, e: {f: function foo() {}}}).should.equal('a:b|c:/foo|bar/gim|e.f:[function foo]');
    collapse({a: 'b', c: /foo|bar/gi, e: {f: function bar() {}}}).should.equal('a:b|c:/foo|bar/gi|e.f:[function bar]');
    collapse({a: 'b', c: /foo|bar/, e: {f: function baz() {}}}).should.equal('a:b|c:/foo|bar/|e.f:[function baz]');
  });

  it('should collapse complex object:', function () {
    collapse({a: {b: [1, 2, 3], c: 'd'}, e: 'f'}).should.equal('a.b:1,2,3|a.c:d|e:f');
    collapse({a: {b: [1, 2, 3]}, c: 'd', e: 'f'}).should.equal('a.b:1,2,3|c:d|e:f');
    collapse({a: false}).should.equal('a:false');
    collapse({a: true}).should.equal('a:true');
    collapse({a: {b: true}}).should.equal('a.b:true');
    collapse({a: {b: [true]}}).should.equal('a.b:true,');

    expand('a.b:1,2,3|a.c:d|e:f').should.eql({a: {b: [1, 2, 3], c: 'd'}, e: 'f'});
    expand('a.b:1,2,3|c:d|e:f').should.eql({a: {b: [1, 2, 3]}, c: 'd', e: 'f'});
    expand('a:false').should.eql({a: false});
    expand('a:true').should.eql({a: true});
    expand('a.b:true').should.eql({a: {b: true}});
    expand('a.b:true,').should.eql({a: {b: [true]}});
    expand('a.b:true,false').should.eql({a: {b: [true, false]}});
    expand('a.b:true,false').should.eql({a: {b: [true, false]}});

    collapse({a: {b: [true, false], c: {d: 'e'}}}).should.equal('a.b:true,false|a.c.d:e');
    collapse({a: {b: 'c', d: 'e'}, f: 'g'}).should.equal('a.b:c|a.d:e|f:g');
    collapse({a: 'b', c: 'd', e: {f: 'g', h: 'i', j: {k: {l: 'm'}}}}).should.equal('a:b|c:d|e.f:g|e.h:i|e.j.k.l:m');
    collapse({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k']}}).should.equal('a:b|c:d|e.f:g|e.h:i,j,k');
    collapse({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k', {one: 'two'}]}}).should.equal('a:b|c:d|e.f:g|e.h:i,j,k,one:two');


    expand('a.b:true,false|a.c.d:e').should.eql({a: {b: [true, false], c: {d: 'e'}}});
    expand('a.b:c|a.d:e|f:g').should.eql({a: {b: 'c', d: 'e'}, f: 'g'});
    expand('a:b|c:d|e.f:g|e.h:i|e.j.k.l:m').should.eql({a: 'b', c: 'd', e: {f: 'g', h: 'i', j: {k: {l: 'm'}}}});
    expand('a:b|c:d|e.f:g|e.h:i,j,k').should.eql({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k']}});
    expand('a:b|c:d|e.f:g|e.h:i,j,k,one:two').should.eql({a: 'b', c: 'd', e: {f: 'g', h: ['i', 'j', 'k', {one: 'two'}]}});


    collapse({a: 'b', c: 'd', e: {f: function foo() {}}}).should.equal('a:b|c:d|e.f:[function foo]');
    collapse({a: 'b', c: /foo|bar/gmi, e: {f: function foo() {}}}).should.equal('a:b|c:/foo|bar/gim|e.f:[function foo]');
    collapse({a: 'b', c: /foo|bar/gi, e: {f: function bar() {}}}).should.equal('a:b|c:/foo|bar/gi|e.f:[function bar]');
    collapse({a: 'b', c: /foo|bar/, e: {f: function baz() {}}}).should.equal('a:b|c:/foo|bar/|e.f:[function baz]');
  });

  it('should throw an error:', function () {
    (function () {
      collapse();
    }).should.throw('expected an object.');
  });
});
