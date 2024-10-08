// sources: see file README.md

// POST request body
const requestBody = {
  "query": [
    {
      "code": "Vuosi",
      "selection": {
        "filter": "item",
        "values": [
          "2000", "2001", "2002", "2003", "2004", 
          "2005", "2006", "2007", "2008", "2009", 
          "2010", "2011", "2012", "2013", "2014", 
          "2015", "2016", "2017", "2018", "2019", 
          "2020", "2021"
        ]
      }
    },
    {
      "code": "Alue",
      "selection": {
        "filter": "item",
        "values": [
          "SSS"  
        ]
      }
    },
    {
      "code": "Tiedot",
      "selection": {
        "filter": "item",
        "values": [
          "vaesto" 
        ]
      }
    }
  ],
  "response": {
    "format": "json-stat2" 
  }
};

function predictNext(values) {
  // calculate the deltas for successive values
  let deltas = [];
  for (let i = 1; i < values.length; i++) {
      deltas.push(values[i] - values[i - 1]);
  }
  // calculate mean delta
  let meanDelta = deltas.reduce((accumalator, current) => {
    return accumalator + current;
  }, 0) / deltas.length;
  // predict the next value by adding mean delta to the last value
  let lastValue = values[values.length - 1];
  let predictedValue = lastValue + meanDelta; 
  return predictedValue;
}

// function for matching municipality name to municipality code
function getMunicipalityCode(municipalityName) {
  // if municipality name is empty, return municipality code for whole country
  if (!municipalityName) {
    return "SSS"; 
  } 
  // find the municipality code matching the municipality name
  let municipalityCode = ""; 
  for (let i = 0; i < municipalityNames.length; i++) {
    if (municipalityNames[i].toLowerCase() === municipalityName) {
      municipalityCode = municipalityCodes[i];
      break;
    }
  }
  // return the matching municipality code
  // if a matching municipality code is not found, an empty string is returned
  return municipalityCode
}

// add event listener to search form
document.getElementById("input-form").addEventListener("submit", function(event) {
  event.preventDefault();
  // match the given municipality name to a municipality code
  let municipalityName = document.getElementById("input-area").value.trim().toLowerCase();
  let municipalityCode = getMunicipalityCode(municipalityName); 
  // if a matching municipality code is not found, alert the user and return
  if (!municipalityCode) {
    alert("Municipality not found. Please try again.");
    return; 
  }
  // save the municipality details to local storage for newchart.js
  localStorage.setItem("municipalityCode", municipalityCode);
  if (!municipalityName) { municipalityName = "Finland";  } 
  localStorage.setItem("municipalityName", municipalityName); 
  // modify the POST request body with the municipality code
  requestBody.query[2].selection.values = ["vaesto"]
  requestBody.query[1].selection.values = [municipalityCode];
  // fetch population data of the selected municipality
  fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  }).then(response => {
    // check response
    if (!response.ok) {
      throw new Error(`Error fetching population data. Response status: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    // update data in the container
    chartData.labels = Object.values(data.dimension.Vuosi.category.label); 
    chartData.datasets = [{ name: "Population", values: data.value }]
    // add the updated data to the chart
    chart = new frappe.Chart("#chart", {
      ...chart, 
      title: `Population Growth in ${municipalityName.charAt(0).toUpperCase() + municipalityName.slice(1)}`,
      data: chartData,
      /* type: 'line',
      height: 450,  
      colors: ['#eb5146'] */ 
    });
  })
  .catch(error => {
    console.error("Error fetching population data:", error);
  });
});

// add event listener for the prediction button
document.getElementById("add-data").addEventListener("click", function () {
  // predict next value 
  let values = chartData.datasets[0].values;
  let predictedValue = predictNext(values);
  // label the predicted datapoint for next year
  let predictedLabel = parseInt(chartData.labels[chartData.labels.length-1]) + 1;
  // update the data in the container with the predicted datapoint
  chartData.datasets[0].values.push(predictedValue);
  chartData.labels.push(predictedLabel.toString());
  // add the predicted datapoint to the chart
  chart.addDataPoint(predictedLabel.toString(), [predictedValue]);
}); 





// get municipality codes and names
let municipalityCodes = [];
let municipalityNames = [];
fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
}).then((response) => {
  if (!response.ok) {
    throw new Error(`Error fetching municipality data. Response status: ${response.status}`);
  }
  return response.json();
}).then(data => {
  municipalityCodes = data.variables[1].values; 
  municipalityNames = data.variables[1].valueTexts; 
}).catch(error => {
  console.error("Error fetching municipality data:", error); 
});

// container for chart data
let chartData = {
  labels: [],
  datasets: []
}

// create a chart
let chart = null; 

// get municipality details
if (!localStorage.getItem("municipalityCode")) {
  localStorage.setItem("municipalityCode", "SSS"); 
  localStorage.getItem("municipalityName", "Finland"); 
}
let municipalityCode = localStorage.getItem("municipalityCode"); 
let municipalityName = localStorage.getItem("municipalityName")

// fetch dataa
requestBody.query[1].selection.values = [municipalityCode]; 
fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(requestBody)
}).then((response) => {
  if (!response.ok) {
    throw new Error(`Error fetching population data. Response status: ${response.status}`);
  }
  return response.json();
}).then((data) => {
  // update data in the container
  chartData.labels = Object.values(data.dimension.Vuosi.category.label); 
  chartData.datasets = [{ name: "Population", values: data.value }]
  // create chart 
  chart = new frappe.Chart("#chart", {
    title: `Population Growth in ${municipalityName.charAt(0).toUpperCase() + municipalityName.slice(1)}`,
    data: chartData,
    type: 'line',
    height: 450,  
    colors: ['#eb5146'] 
  });
}).catch(error => {
  console.error("Error fetching population data:", error);
});