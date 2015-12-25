var makerjs = require('makerjs');
var PolygonRimbox = require('./index.js');

var model = new PolygonRimbox(100, 100, 3, 2);

console.log(makerjs.exporter.toSVG(model));

