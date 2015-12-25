/// <reference path="typings/tsd.d.ts" />

var makerjs: typeof MakerJs = require('makerjs');

var arc = makerjs.paths.Arc;
var line = makerjs.paths.Line;
var point = makerjs.point;

class PolygonRimboxInside implements MakerJs.IModel {
	public paths: MakerJs.IPathMap;
	
	constructor(angle: number, radius: number, holeRadius: number, rimThickness: number) {
 		var rim = Math.min(rimThickness, holeRadius);	
		
		var innerFilletCenter = point.rotate([radius + 2 * holeRadius + rim, 0], 90 + angle, [radius, 0]);
		var innerFilletTop = new arc(innerFilletCenter, holeRadius, 270 + angle, angle);
		var innerFilletTopPoints = point.fromArc(innerFilletTop);		
		var innerFilletBottomPoint = [innerFilletTopPoints[1][0], -innerFilletTopPoints[1][1]]; 
		
		this.paths = {
			innerFilletTop: innerFilletTop,
			innerFilletBottom: makerjs.path.mirror(innerFilletTop, false, true),
			innerLine: new line(innerFilletTopPoints[1], point.rotate(innerFilletBottomPoint, angle * 2, [0,0])),
			innerFillet: new arc([radius, 0], holeRadius + rim, 90 + angle, 270 - angle)
		};
	}
}

class PolygonRimboxOutside implements MakerJs.IModel {
	public paths: MakerJs.IPathMap;
	
	constructor(angle: number, radius: number, holeRadius: number, rimThickness: number) {
		var outerFillet = new arc([radius, 0], holeRadius + rimThickness, -angle, angle);
		var outerFilletPoints = point.fromArc(outerFillet);
		var endPoint = point.rotate(outerFilletPoints[0], angle * 2, [0, 0]);
		
		this.paths = {
			outerFillet: outerFillet,
			outerLine: new line(outerFilletPoints[1], endPoint)
		};
	}
}

class PolygonRimbox implements MakerJs.IModel {
	public models: MakerJs.IModelMap;
	
	constructor(sides: number, radius: number, holeRadius: number, rimThickness: number) {
		if (arguments.length == 0) {
			var defaultValues = makerjs.kit.getParameterValues(PolygonRimbox);
			sides = defaultValues.shift();
			radius = defaultValues.shift();
			holeRadius = defaultValues.shift();
			rimThickness = defaultValues.shift();
		}
		
		var mm = makerjs.models;
	
		this.models = {
			bolts: new mm.BoltCircle(radius, holeRadius, sides),
			inner: { models: {}},
			outer: { models: {}}
		};
		
		var angle = 180 / sides;
		var a2 = angle * 2;
			
		for (var i = 0; i < sides; i++) {
			var inside = makerjs.model.rotate(new PolygonRimboxInside(angle, radius, holeRadius, rimThickness), a2 * i, [0, 0]);
			var outside = makerjs.model.rotate(new PolygonRimboxOutside(angle, radius, holeRadius, rimThickness), a2 * i, [0, 0]);
			this.models['inner'].models['side' + i] = inside;
			this.models['outer'].models['side' + i] = outside;
		}
	}	
}

(<MakerJs.IKit>PolygonRimbox).metaParameters = [
    { title: "sides", type: "range", min: 3, max: 25, value: 6 },
	{ title: "radius", type: "range", min: 10, max: 500, value: 50 },
	{ title: "holeRadius", type: "range", min: 1, max: 20, value: 3 },
	{ title: "rimThickness", type: "range", min: 1, max: 20, value: 2 }
];


export = PolygonRimbox;
