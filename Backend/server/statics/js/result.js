var date;

window.onload = function () {
  getDate();
  var ctx = document.getElementById("myChart").getContext("2d");
  window.chart = new Chart(ctx, config);
};

var config = {
  // The type of chart we want to create
  type: "line",
  data: {
    labels: [0],
    datasets: [
      {
        label: "Boston Crime Foracast",
        borderColor: "#2E5BFF",
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#8C54FF",
        pointBorderWidth: 3,
        pointRadius: 5,
        data: [0],
      },
    ],
  },
  // Configuration options go here
  options: {
    responsive: true,
    legend: {
      display: true,
      labels: {
        fontColor: "#20B2AA",
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Hour",
            fontColor: "#20B2AA",
          },
          gridLines: {
            color: "#20B2AA",
            borderDash: [3],
          },
          ticks: {
            fontColor: "#20B2AA",
          },
        },
      ],
      yAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Crime",
            fontColor: "#20B2AA",
          },
          gridLines: {
            color: "#20B2AA",
            borderDash: [3],
          },
          ticks: {
            beginAtZero: true,

            min: 0,
            max: 4,
            stepSize: 1,
            callback: function (label, index, labels) {
              switch (label) {
                case 0:
                  return " Assault";
                case 1:
                  return "Bulglary";
                case 2:
                  return "Larceny";
                case 3:
                  return "Robbery";
                case 4:
                  return " ";
              }
            },
            fontColor: "#20B2AA",
          },
        },
      ],
    },
  },
};

function handler(e) {
  date = e.target.value;
  initMap();
}

function displayData(json) {
  let crimes = [];
  let hours = [];
  let morning_crimes = [];
  let afternoon_crimes = [];
  let evening_crimes = [];
  let overnight_crimes = [];

  let morning_prediction = document.getElementById("morning");
  let afternoon_prediction = document.getElementById("afternoon");
  let evening_prediction = document.getElementById("evening");
  let overnight_prediction = document.getElementById("overnight");

  let forcast = json.forcast;
  console.log(forcast);

  let crime_labels = ["Larceny", "Burglary", "Assault", "Robbery"];

  const getCrime = (myArray) =>
    myArray.reduce(
      (a, b, i, arr) =>
        arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
          ? a
          : b,
      null
    );

  // For All Day
  for (let i = 0; i < forcast.length; i++) {
    crimes.push(forcast[i]["Crime"]);
  }
  for (let i = 0; i < forcast.length; i++) {
    hours.push(forcast[i]["Hour"]);
  }

  // For Morning
  for (let i = 5; i < 12; i++) {
    morning_crimes.push(forcast[i]["Crime"]);
  }
  morning_prediction.innerText = crime_labels[getCrime(morning_crimes)];

  // For Afternoon
  for (let i = 12; i < 16; i++) {
    afternoon_crimes.push(forcast[i]["Crime"]);
  }
  afternoon_prediction.innerText = crime_labels[getCrime(afternoon_crimes)];

  // For Evening
  for (let i = 16; i < 20; i++) {
    evening_crimes.push(forcast[i]["Crime"]);
  }
  evening_prediction.innerText = crime_labels[getCrime(evening_crimes)];

  // For Overnight
  for (let i = 20; i < 23; i++) {
    overnight_crimes.push(forcast[i]["Crime"]);
  }

  for (let i = 0; i < 5; i++) {
    overnight_crimes.push(forcast[i]["Crime"]);
  }

  overnight_prediction.innerText = crime_labels[getCrime(overnight_crimes)];

  window.chart.options.elements.line.tension = 0;
  config.data.datasets[0].data = crimes;
  config.data.labels = hours;
  window.chart.update();
}

function xhrError() {
  console.error(this.statusText);
}

function getPredictions(data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onerror = xhrError;
    var url = "/api/v1/crime_classifier/predict?version=0.2";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send(data);
  });
}

async function callback(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
    latitude = results[0].geometry.location.lat();
    longitude = results[0].geometry.location.lng();

    var data = JSON.stringify({
      Date: date || getDate(),
      Lat: latitude,
      Long: longitude,
    });

    json = await getPredictions(data);
    json = JSON.parse(json);
    displayData(json);
  }
}

function initMap() {
  const geocoder = new google.maps.Geocoder();
  var address = document.getElementById("address").innerText;
  geocoder.geocode(
    {
      address: address,
    },
    callback
  );
}

function getDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  today = yyyy + "-" + mm + "-" + dd;
  document.getElementById("calender").value = today;
  return today;
}
