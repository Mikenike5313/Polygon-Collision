//line segment intersection math
/*

General Variables:
  x = x-value
  y = y-value
  ep = endpoint (indexed 1 & 2)
  p = point
  t = proportion along line segment (0 <= t <= 1)

Equation of line segment:
  p = ep1 + t(ep2 - ep1)

  px = ep1_x + t(ep2_x - ep1_x)
  py = ep1_y + t(ep2_y - ep1_y)


Specific Variables:
  Line segment 1 (LS1)-
    ep1 = endpoint 1
    ep2 = endpoint 2
    tA = proportion along LS1 (0 <= tA <= 1)

  Line segment 2 (LS2)-
    ep3 = endpoint 1
    ep4 = endpoint 2
    tB = proportion along LS2 (0 <= tB <= 1)

Find Intersection:
--> Intersect @ p where:
      ep1 + tA(ep2 - ep1) = ep3 + tB(ep4 - ep3)
    as long as:
      0 <= tA, tB <= 1

    if (tA, tB > 1) || (tA, tB < 0) => they would intersect if full lines
                                       rather than segments
    if tA, tB cannot be determined => they either intersect 0 or infinitely
                                      many times

    Solve for tA & tB
      ep1_x + tA(ep2_x - ep1_x) = ep3_x + tB(ep4_x - ep3_x)
      ep1_y + tA(ep2_y - ep1_y) = ep3_y + tB(ep4_y - ep3_y)
      ...
      ep1_x - ep3_x = tB(ep4_x - ep3_x) - tA(ep2_x - ep1_x)
      ep1_y - ep3_y = tB(ep4_y - ep3_y) - tA(ep2_y - ep1_y)
      ...
      |‾ (ep1_x - ep3_x) ‾| _ |‾ (ep4_x - ep3_x), -(ep2_x - ep1_x) ‾||‾ tB ‾|
      |_ (ep1_y - ep3_y) _| ‾ |_ (ep4_y - ep3_y), -(ep2_y - ep1_y) _||_ tA _|
      ...
      |‾ tB ‾| _ |‾ (ep4_x - ep3_x)  (ep1_x - ep2_x) ‾|-1|‾ (ep1_x - ep3_x) ‾|
      |_ tA _| ‾ |_ (ep4_y - ep3_y)  (ep1_y - ep2_y) _|  |_ (ep1_y - ep3_y) _|

      Compute Inverse:
        A = |‾ a  b ‾|
            |_ c  d _|
        det(A) = ad-bc
        A^(-1) = (___1̲___)|‾ d  -b ‾|
                 ( det(A))|_ -c  a _|

      |‾ tB ‾| _ (_______________________________1̲_______________________________)|‾ (ep1_y - ep2_y)  (ep2_x - ep1_x) ‾||‾ (ep1_x - ep3_x) ‾|
      |_ tA _| ‾ ((ep4_x - ep3_x)(ep1_y - ep2_y) - (ep1_x - ep2_x)(ep4_y - ep3_y))|_ (ep3_y - ep4_y)  (ep4_x - ep3_x) _||_ (ep1_y - ep3_y) _|
      ...

    Solution:

      tA = ((ep3_y - ep4_y)(ep1_x - ep3_x) + (ep4_x - ep3_x)(ep1_y - ep3_y))/
           ((ep4_x - ep3_x)(ep1_y - ep2_y) - (ep1_x - ep2_x)(ep4_y - ep3_y))

      tB = ((ep1_y - ep2_y)(ep1_x - ep3_x) + (ep2_x - ep1_x)(ep1_y - ep3_y))/
           ((ep4_x - ep3_x)(ep1_y - ep2_y) - (ep1_x - ep2_x)(ep4_y - ep3_y))

*/

function polygon(vertices, stroke, fill) {
  if(!vertices || !vertices.length) {
    console.log('No vertices provided.');
    return;
  }
  ctx.strokeStyle = stroke ? stroke : 'white';
  ctx.fillStyle = fill ? fill : 'rgba(0, 0, 0, 0)';

  ctx.beginPath();
  ctx.moveTo(vertices[0][0], vertices[0][1]);
  for(var p = 1; p < vertices.length; p++) {
    ctx.lineTo(vertices[p][0], vertices[p][1]);
  }
  ctx.lineTo(vertices[0][0], vertices[0][1]);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

  return vertices;
}

function regularPolygon(x, y, n, a) {
  if(!n) {
    console.log('n !> 0');
    return;
  }
  var ca = 2*Math.PI/n;
  var r = a/Math.cos(ca/2);

  var points = [];
  for(var v = 0; v < n; v++) {
    points[v] = [r*Math.cos(v*ca - Math.PI/2) + x, r*Math.sin(v*ca - Math.PI/2) + y];
  }

  return polygon(points);
}

function intersectLS(ep1, ep2, ep3, ep4) {
  if(((ep4[0] - ep3[0])*(ep1[1] - ep2[1]) - (ep1[0] - ep2[0])*(ep4[1] - ep3[1])) === 0) {
    return 'collinear';
  }
  var tA = ((ep3[1] - ep4[1])*(ep1[0] - ep3[0]) + (ep4[0] - ep3[0])*(ep1[1] - ep3[1]))/
           ((ep4[0] - ep3[0])*(ep1[1] - ep2[1]) - (ep1[0] - ep2[0])*(ep4[1] - ep3[1]));
  var tB = ((ep1[1] - ep2[1])*(ep1[0] - ep3[0]) + (ep2[0] - ep1[0])*(ep1[1] - ep3[1]))/
           ((ep4[0] - ep3[0])*(ep1[1] - ep2[1]) - (ep1[0] - ep2[0])*(ep4[1] - ep3[1]));
  return [tA, tB];
}

function collidePoint(x, y, polygon) {
  var ep2H = [canvas.width/2, y];

  var collisions = 0;
  for(var v = 0; v < polygon.length; v++) {
    var t = v === polygon.length-1 ? intersectLS([x, y], ep2H, polygon[v], polygon[0]) : intersectLS([x, y], ep2H, polygon[v], polygon[v+1]);
    if(t === 'collinear') {
      continue;
    }
    else if((t[0] <= 1 && t[0] >= 0) && (t[1] <= 1 && t[1] >= 0)) {
      collisions++;
    }
  }
  return (collisions%2 === 1);
}

function collidePolygon(poly1, poly2) {
  //arrays of sides, stored as an array of line segments [[ep1_x, ep1_y], [ep2_x, ep2_y]]
  //S for sides
  var p1S = [];
  var p2S = [];

  //v for vertex
  for(var v1 = 1; v1 < poly1.length; v1++) {
    p1S.push([[poly1[v1-1][0], poly1[v1-1][1]], [poly1[v1][0], poly1[v1][1]]]);
  }
  p1S.push([[poly1[poly1.length-1][0], poly1[poly1.length-1][1]], [poly1[0][0], poly1[0][1]]]);

  for(var v2 = 1; v2 < poly2.length; v2++) {
    p2S.push([[poly2[v2-1][0], poly2[v2-1][1]], [poly2[v2][0], poly2[v2][1]]]);
  }
  p2S.push([[poly2[poly2.length-1][0], poly2[poly2.length-1][1]], [poly2[0][0], poly2[0][1]]]);

  //E for edge
  for(var pE1 = 0; pE1 < p1S.length; pE1++) {
    for(var pE2 = 0; pE2 < p2S.length; pE2++) {
      var t = intersectLS(p1S[pE1][0], p1S[pE1][1], p2S[pE2][0], p2S[pE2][1]);
      if(t === 'collinear') {
        continue;
      }
      else if((t[0] <= 1 && t[0] >= 0) && (t[1] <= 1 && t[1] >= 0)) {
        return true;
      }
    }
  }
  return false;
}

function boundPoly(poly) {
  var min = [Infinity, Infinity];
  var max = [0, 0];
  for(var v = 0; v < poly.length; v++) {
    min[0] = Math.min(min[0], poly[v][0]);
    min[1] = Math.min(min[1], poly[v][1]);
    max[0] = Math.max(max[0], poly[v][0]);
    max[1] = Math.max(max[1], poly[v][1]);
  }

  return [min, max];
}

function pointMode() {
  for(var p = 0; p < polygons.length; p++) {
    if(collidePoint(mouseX, mouseY, polygons[p])  ) {
      polygon(polygons[p], 'red');
      continue;
    }
    polygon(polygons[p]);
  }
}

function polyMode() {
  for(var p = 0; p < polygons.length; p++) {
    var a2 = parseInt(controls.querySelector('#a2 > input').value);
    var n2 = parseInt(controls.querySelector('#n2 > input').value);
    mPolygon = regularPolygon(mouseX, mouseY, n2, a2);

    var boundP = boundPoly(polygons[p]);
    var boundMP = boundPoly(mPolygon);

    console.log(boundP, boundMP);

    var within = (boundMP[0][0] > boundP[0][0] && boundMP[1][0] < boundP[1][0] && boundMP[0][1] > boundP[0][1] && boundMP[1][1] < boundP[1][1] && collidePoint(mouseX, mouseY, polygons[p])) ||
                 (boundP[0][0] > boundMP[0][0] && boundP[1][0] < boundMP[1][0] && boundP[0][1] > boundMP[0][1] && boundP[1][1] < boundMP[1][1] && collidePoint(polygons[p][0][0], polygons[p][0][1], mPolygon));
                 console.log(within);
    if(collidePolygon(mPolygon, polygons[p]) || within) {
      polygon(polygons[p], 'red');
      continue;
    }
    polygon(polygons[p]);
  }
}

function clear() {
  ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
  polygons = [];
}

function update() {
  var controls = document.getElementById('controls');

  cMode = controls.querySelector('#cMode > \:checked').value;
  pMode = controls.querySelector('#pMode > \:checked').value;

  var a = parseInt(controls.querySelector('#a > input').value);
  var n = parseInt(controls.querySelector('#n > input').value);
  var v = controls.querySelector('#v > textarea').value.split(' ');

  clear();

  if(pMode === 'regular') {
    polygons.push(regularPolygon(0, 0, n, a));
  }
  if(pMode === 'custom') {
    for(var p = 0; p < v.length; p++) {
      v[p] = v[p].split(',');
    }
    polygons.push(polygon(v));
  }
}

function mousemove(event) {
  var offsetX = 0;
  var offsetY = 0;

  var el = canvas;
  while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      offsetX += el.offsetLeft - el.scrollLeft;
      offsetY += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
  }

  mouseX = event.clientX - offsetX - canvas.width/2;
  mouseY = event.clientY - offsetY - canvas.height/2;

  ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
  if(cMode === 'point') {
    pointMode();
  }
  else if(cMode === 'polygon') {
    polyMode();
  }
  else {
    console.log('Could not resolve collision mode.')
  }

}


var canvas = document.getElementById('plane');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

var ctx = canvas.getContext('2d');
ctx.save();
ctx.translate(canvas.width/2, canvas.height/2);

var cMode = 'point';
var pMode = 'regular';

var polygons = [];
var mPolygon = [];

var mouseX = null;
var mouseY = null;


window.onresize = function() {
  polygons = [];
  ctx.restore();
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
}
