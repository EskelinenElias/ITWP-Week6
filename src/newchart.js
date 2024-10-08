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

// get current area data
let municipalityName = localStorage.getItem("municipalityName");
let municipalityCode = localStorage.getItem("municipalityCode");

// fetch birth data
requestBody.query[1].selection.values = [municipalityCode];
requestBody.query[2].selection.values = ["vm01"];
fetch(
  "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  },
).then((response) => {
  if (!response.ok) {
    throw new Error(
      `Error fetching birth data. Response status: ${response.status}`,
    );
  }
  return response.json();
}).then((data) => {
  // add birth data to chart data
  let chartData = {
    labels: Object.values(data.dimension.Vuosi.category.label),
    datasets: [{
      name: "Births",
      values: data.value,
    }]
  };
  // fetch death data
  requestBody.query[2].selection.values = ["vm11"];
  fetch(
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(
        `Error fetching death data. Response status: ${response.status}`,
      );
    }
    return response.json();
  }).then((data) => {
    // add death data to chart data
    chartData.datasets.push({
      name: "Deaths",
      values: data.value,
    });
    // create chart
    chart = new frappe.Chart("#bd-chart", {
      title: `Births and deaths in ${ municipalityName.charAt(0).toUpperCase() + municipalityName.slice(1)}`,
      data: chartData,
      type: "bar",
      height: 450,
      colors: ['#63d0ff', '#363636'],
    });
  })
  .catch((error) => {
    console.error("Error fetching death data:", error);
  });
}).catch((error) => {
  console.error("Error fetching birth data:", error);
});
