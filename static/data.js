async function loadData() {
    let response = await fetch("/data");
    let data = await response.json();

    let consumption = [];
    let price = [];
    let cost = [];

    for (let row of data) {
      let x = new Date(row.t);
      row.consumption && consumption.push({x, y: row.consumption});
      row.price && price.push({x, y: row.price});
      row.cost && cost.push({x, y: row.cost});
    };

    return {
        consumption,
        price,
        cost,
    };
}

async function loadAverage() {
  let response = await fetch("/average");
  let data = await response.json();
  return data.average;
}

window.data = loadData();
window.average = loadAverage();
