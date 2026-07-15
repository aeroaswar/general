const topo = require('./node_modules/world-atlas/countries-10m.json');
const { feature } = require('./node_modules/topojson-client');
const fc = feature(topo, topo.objects.countries);
const idn = fc.features.find(f => f.properties.name === 'Indonesia');

// crop bbox (lon/lat) for Sulawesi + Halmahera
const LON0=118.4, LON1=129.6, LAT0=2.9, LAT1=-6.2;   // lat0 top, lat1 bottom
const SCALE=64; // px per degree
const W=(LON1-LON0)*SCALE, H=(LAT0-LAT1)*SCALE;
const px = (lon,lat)=>[ +(( (lon-LON0)*SCALE )).toFixed(1), +(((LAT0-lat)*SCALE)).toFixed(1) ];
const inBox=(lon,lat)=> lon>LON0-1 && lon<LON1+1 && lat<LAT0+1 && lat>LAT1-1;

function ringPath(ring){
  // include ring only if any vertex in expanded box
  if(!ring.some(([lo,la])=>inBox(lo,la))) return null;
  let d='';
  for(let i=0;i<ring.length;i++){
    const [x,y]=px(ring[i][0],ring[i][1]);
    d += (i===0?'M':'L')+x+' '+y;
  }
  return d+'Z';
}
let paths=[];
const g=idn.geometry;
const polys = g.type==='MultiPolygon'? g.coordinates : [g.coordinates];
for(const poly of polys){ for(const ring of poly){ const p=ringPath(ring); if(p) paths.push(p);} }
console.log('VIEWBOX', 0,0,Math.round(W),Math.round(H));
console.log('NPATHS', paths.length);
require('fs').writeFileSync('map_coast.txt', paths.join('\n'));

// project nodes
const nodes = {
  sulteng_gara:[122.0,-4.05], sulteng:[121.95,-2.72], halmahera:[128.35,0.35],
  imip:[122.1,-2.85], konawe_smelt:[122.45,-4.02], wedabay:[127.95,0.47],
  kolaka:[121.6,-4.05], morowali_town:[121.95,-2.7]
};
for(const k in nodes){ const [x,y]=px(nodes[k][0],nodes[k][1]); console.log('NODE',k,x,y); }
