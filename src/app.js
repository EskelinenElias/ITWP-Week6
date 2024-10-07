// sources: see file README.md

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
  console.log(data); 
  municipalityCodes = data.variables[1].values; 
  municipalityNames = data.variables[1].valueTexts; 
  console.log(municipalityCodes); 
  console.log(municipalityNames);
}).catch(error => {
  console.error("Error fetching municipality data:", error); 
});

// fetch data
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
  // prepare chart data
  const chartData = {
    labels: Object.values(data.dimension.Vuosi.category.label), 
    datasets: [
      {
        //name: "Population",
        values: data.value  
      }
    ]
  }
  // create a chart
  const chart = new frappe.Chart("#chart", {
    title: "Population Growth in Finland (2000-2021)",
    data: chartData,
    type: 'line',
    height: 450,  
    colors: ['#eb5146'] 
  });
}).catch(error => {
  console.error("Error fetching population data:", error);
});

document.getElementById("input-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const inputArea = document.getElementById("input-area").value.trim().toLowerCase();
  
  // search for the matching municipality code
  let matchedCode = null;
  if (!inputArea) {
    matchedCode = "SSS";
    console.log(`Municipality code for whole country is ${matchedCode}`)
  } else {
    for (let i = 0; i < municipalityNames.length; i++) {
      if (municipalityNames[i].toLowerCase() === inputArea) {
        matchedCode = municipalityCodes[i];
        break;
      }
    }
    if (!matchedCode) {
      alert("Municipality not found. Please try again.");
      return;
    }
    console.log(`Municipality code for ${inputArea} is ${matchedCode}`)
  }
  
  // modify the POST request body
  requestBody.query[1].selection.values = [matchedCode];

  // fetch population data of the selected municipality
  fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Error fetching population data. Response status: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    const chartData = {
      labels: Object.values(data.dimension.Vuosi.category.label), 
      datasets: [
        {
          name: "Population",
          values: data.value  
        }
      ]
    }
    // create a chart
    const chart = new frappe.Chart("#chart", {
      title: "Population Growth in Finland (2000-2021)",
      data: chartData,
      type: 'line',
      height: 450,  
      colors: ['#eb5146'] 
    });
  })
  .catch(error => {
    console.error("Error fetching population data:", error);
  });
});
