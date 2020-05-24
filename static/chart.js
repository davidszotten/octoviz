let chartColors = {
  red: "rgb(255, 99, 132)",
  blue: "rgb(54, 162, 235)",
  grey: "rgb(201, 203, 207)",
};
  var ctx = document.getElementById("canvas").getContext("2d");
  fetch("/data").then((response) => {
    response.json().then((data) => {
      let consumption = [];
      let price = [];
      let cost = [];
      for (let row of data) {
        let x = new Date(row.t);
        row.consumption && consumption.push({x, y: row.consumption});
        row.price && price.push({x, y: row.price});
        row.cost && cost.push({x, y: row.cost});
      };
      window.chart = new Chart(ctx, {
        type: "bar",
        data: {
          datasets: [
            {
              label: "consumption",
              data: consumption,
              yAxisID: "y-axis-1",
              backgroundColor: Chart.helpers
                .color(chartColors.blue)
                .alpha(0.5)
                .rgbString(),
            },
            { label: "price", data: price, yAxisID: "y-axis-2" },
            {
              label: "cost",
              data: cost,
              yAxisID: "y-axis-2",
              backgroundColor: Chart.helpers
                .color(chartColors.red)
                .alpha(1)
                .rgbString(),
              borderColor: chartColors.red,
            },
          ],
        },
        options: {
          scales: {
            xAxes: [
              {
                type: "time",
                time: {
                  unit: "hour",
                },
                categoryPercentage: 1.0,
                barPercentage: 1.0
              },
            ],
            yAxes: [
              {
                type: "linear",
                display: true,
                position: "left",
                ticks: {
                    suggestedMax: 1.4,
                    suggestedMin: -0.6,
                },
                id: "y-axis-1",
              },
              {
                type: "linear",
                display: true,
                position: "right",
                ticks: {
                    suggestedMax: 35,
                    suggestedMin: -15,
                },
                id: "y-axis-2",

                // grid line settings
                gridLines: {
                  drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
              },
            ],
          },

          plugins: {
            zoom: {
              zoom: {
                enabled: true,
                drag: true,
                mode: "x",

                // Speed of zoom via mouse wheel
                // (percentage of zoom on a wheel event)
                speed: 0.1,

                // Minimal zoom distance required before actually applying zoom
                threshold: 2,

                // On category scale, minimal zoom level before actually applying zoom
                sensitivity: 3,
              },
            },
          },
        },
      });
    });
  });

  fetch("/average").then((response) => {
    response.json().then((data) => {
    document.getElementById("average").innerHTML = `Average: ${data.average.toPrecision(3)}p/kWh`;
    });
  });
