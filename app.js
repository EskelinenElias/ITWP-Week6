// sources: see file README.md

// a function for fetching data from an address
async function fetchData(address) {
  try {
    const response = await fetch(address);
    if (!response.ok) {
      throw new Error("Something went wrong while attempting to fetch data.");
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("Something else went wrong while attempting to fetch data: ", error);
  }
}

// a function for fetching GeoJSON data
async function fetchGeoJSON() {
  const address = 'https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326';
  geoJSONData = await fetchData(address); 
  return geoJSONData;
}

// a function for fetching positive migration data
async function fetchPositiveMigrationData() {
  const address = 'https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f';
  geoJSONData = await fetchData(address); 
  return geoJSONData;
}

// a function for fetching negative migration data
async function fetchNegativeMigrationData() {
  const address = 'https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e';
  geoJSONData = await fetchData(address); 
  return geoJSONData;
}

function getPositiveMigrationData(municipalityName) {
  // parse migration data
  const migrationLabels = posMigData.dataset.dimension.Tuloalue.category.label;
  const migrationIndices = posMigData.dataset.dimension.Tuloalue.category.index;
  const migrationData = posMigData.dataset.value; 
  // find data with municipality name
  for (let key in migrationLabels) {
    label = migrationLabels[key].replace("Arrival - ", "").trim();
    if (label == municipalityName) {
      index = migrationIndices[key];
      data = migrationData[index]; 
      return data; 
    }
  }
  return "Not available"; 
}

function getNegativeMigrationData(municipalityName) {
  // parse migration data
  const migrationLabels = negMigData.dataset.dimension.Lähtöalue.category.label;
  const migrationIndices = negMigData.dataset.dimension.Lähtöalue.category.index;
  const migrationData = negMigData.dataset.value; 
  // find data with municipality name
  for (let key in migrationLabels) {
    label = migrationLabels[key].replace("Departure - ", "").trim();
    if (label == municipalityName) {
      index = migrationIndices[key];
      data = migrationData[index]; 
      return data; 
    }
  }
  return "Not available"; 
}

// function to calculate the color based on the migration data
function calculateColor(positive, negative) {
    if (negative === 0) return 'hsl(120, 75%, 50%)'; 
    // calculate hue
    let hue = Math.min(Math.pow(positive / negative, 3) * 60, 120);
    return `hsl(${hue}, 75%, 50%)`;
}

// function that returns the styling options for each municipality
function style(feature) {
  // check that the necessary properties exist
  if (!(feature.properties && feature.properties.name)) {
    return; 
  }
  const municipalityName = feature.properties.name;
  const positive = getPositiveMigrationData(municipalityName) || 0; 
  const negative = getNegativeMigrationData(municipalityName) || 1;
  const fillColor = calculateColor(positive, negative);
  return {
      weight: 2,
      color: '#666',
      fillOpacity: 0.7,
      fillColor: fillColor
  };
}

// function to show municipality name on hower
function onEachFeature(feature, layer) {
  // check that the necessary properties exist
  if (!(feature.properties && feature.properties.name)) {
    return; 
  }
  // show the municipality name on hower
  layer.bindTooltip(feature.properties.name, {
      permanent: false,  
      direction: 'center', 
  });
  // show migration data on popup
  municipalityName = feature.properties.name; 
  positiveMigration = getPositiveMigrationData(municipalityName);
  negativeMigration = getNegativeMigrationData(municipalityName);
  popupContent = 
    `<ul>
      <li>Municipality name: ${municipalityName}</li>
      <li>Positive migration data: ${positiveMigration}</li>
      <li>Negative migration data: ${negativeMigration}</li>
    </ul>`
  layer.bindPopup(popupContent)
}

// 
async function main() {
  // load migration data
  posMigData = await fetchPositiveMigrationData();
  negMigData = await fetchNegativeMigrationData(); 
  console.log(negMigData)
  
  // initialize the map
  var map = L.map('map', {
      center: [51.505, -0.09],
      minZoom: -3
  });
  
  // fetch the GeoJSON data
  let geoJSONData = await fetchGeoJSON(); 
  
  // add GeoJSON layer to the map
  let geoJsonLayer = L.geoJSON(geoJSONData, {
      style: style,
      onEachFeature: onEachFeature
  }).addTo(map);
  
  // add OpenStreetMap layer
  let OSMapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
  }).addTo(map);
  
  // fit the map to the GeoJSON data bounds
  map.fitBounds(geoJsonLayer.getBounds());
}

// run app 
var posMigData = {};
var negMigData = {};
main()

