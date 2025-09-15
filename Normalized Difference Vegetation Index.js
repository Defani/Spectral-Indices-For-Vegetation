var maskSCL = function(image) {
  var scl = image.select('SCL');
  var mask = scl.neq(3)
              .and(scl.neq(8))
              .and(scl.neq(9))
              .and(scl.neq(10))
              .and(scl.neq(1))
              .and(scl.neq(0));
  return image.updateMask(mask);
};

var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2024-01-01', '2025-03-01')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskSCL)
  .median()
  .clip(table)
  .multiply(0.0001);

Map.centerObject(table);

var visParams_1182 = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.0,
  max: 0.3,
  gamma: 1.2
};

Map.addLayer(sentinel2, visParams_1182, 'Band 11-8-2');

var Red = sentinel2.select('B4');
var NIR = sentinel2.select('B8');
var NDVI = NIR.subtract(Red).divide(NIR.add(Red)).rename('NDVI');
var NDVI_param = {
  min: -1,
  max: 1,
  palette: ['a50026','d73027','f46d43','fdae61','fee08b','ffffbf','d9ef8b','a6d96a','66bd63','1a9850','006837']
};

Map.addLayer(NDVI, NDVI_param, 'NDVI');

Export.image.toDrive({
  image: NDVI,
  description: 'NDVI_Export',
  folder: 'EarthEngine',
  fileNamePrefix: 'NDVI_2022',
  region: table,
  scale: 10,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
