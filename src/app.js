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

const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"; 
fetch(url, {
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
  // create a chart
  const chart = new frappe.Chart("#chart", {
    title: "Population Growth in Finland (2000-2021)",
    data: {
      labels: Object.values(data.dimension.Vuosi.category.label), 
      datasets: [
        {
          name: "Population",
          values: data.value  
        }
      ]
      },
    type: 'line',
    height: 450,  
    colors: ['#eb5146'] 
  });
}).catch(error => {
  console.error("Error fetching population data:", error);
});
