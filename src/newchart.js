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

async function fetchBDData(requestBody) {
  try {
    const response = await fetch(
      "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    )
    if (!response.ok) {
      throw new Error(
        `Error fetching birth/death data. Response status: ${response.status}`,
      );
    }
    const data = await response.json();
    return data;
  } catch(error) {
    console.error("Error fetching birth/death data:", error);
  }
}

async function main() {
  // get municipality details
  let municipalityName = localStorage.getItem("municipalityName");
  let municipalityCode = localStorage.getItem("municipalityCode");
  if (!municipalityName || !municipalityCode) {
    municipalityName = "Finland";  
    municipalityCode = "SSS"; 
  }
  // fetch birth data
  requestBody.query[1].selection.values = [municipalityCode];
  requestBody.query[2].selection.values = ["vm01"];
  let birthData = await fetchBDData(requestBody); 
  // fetch death data  
  requestBody.query[2].selection.values = ["vm11"];
  let deathData = await fetchBDData(requestBody); 
  // construct chart data
  let chartData = {
    labels: Object.values(birthData.dimension.Vuosi.category.label),
    datasets: [
      {
        name: "Births",
        values: birthData.value,
      },
      {
        name: "Deaths",
        values: deathData.value,
      }
    ]
  };
  // create chart
  chart = new frappe.Chart("#bd-chart", {
    title: `Births and deaths in ${ municipalityName.charAt(0).toUpperCase() + municipalityName.slice(1)}`,
    data: chartData,
    type: "bar",
    height: 450,
    colors: ['#63d0ff', '#363636'],
  });
}

main(); 