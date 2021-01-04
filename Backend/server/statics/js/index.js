var crime_labels = ["Larceny", "Burglary", "Assault", "Robbery"];
var date;

window.onload = function () {
  getDate();
  var ctx = document.getElementById("chart-area").getContext("2d");
  window.chart = new Chart(ctx, config);
};

function handler(e) {
  date = e.target.value;
}

var mymap = L.map("mapid").setView([42.3145186, -71.1103698], 11);
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: "mapbox/dark-v10",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1Ijoiemtlc2FyYW5pIiwiYSI6ImNrZG9vMnVtNDFsMmsyc2w1bmE3Z2g1emcifQ.ftZN_U9my7qqZ7HVDR7LSQ",
  }
).addTo(mymap);

L.marker([42.3145186, -71.1103698])
  .addTo(mymap)
  .bindPopup("<b>Boston, Massachusetts USA</b>")
  .openPopup();

function onMapClick(e) {
  getData(e.latlng);
  document.getElementById("chartBox").style.visibility = "visible";
}
mymap.on("click", onMapClick);

var config = {
  type: "doughnut",
  data: {
    datasets: [
      {
        hoverBorderWidth: 5,
        borderColor: "rgba(0, 0, 0, 0.1)",
        data: [0],
        backgroundColor: ["#2E5BFF", "#8C54FF", "#FAD050", "#00C1D4"],
        label: "crimes",
      },
    ],
    labels: ["No DATA"],
  },
  options: {
    responsive: true,
    legend: {
      position: "right",
      labels: {
        fontSize: 12,
        usePointStyle: true,
        fontColor: "#20B2AA",
      },
    },
    title: {
      display: true,
      text: `24H Crime Prediction for `, // ${location.toString()}
      fontColor: "#20B2AA",
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  },
};

function displayData(json, location) {
  let crimes = [];
  let forcast = json.forcast;
  console.log(forcast);

  // For All Day
  for (let i = 0; i < forcast.length; i++) {
    crimes.push(forcast[i]["Crime"]);
  }

  updateChart(crimes, location);
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

async function getData(location) {
  latitude = location.lat;
  longitude = location.lng;

  var data = JSON.stringify({
    Date: date || getDate(),
    Lat: latitude,
    Long: longitude,
  });

  json = await getPredictions(data);
  json = JSON.parse(json);
  displayData(json, location);
}

function updateChart(crimes, location) {
  Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === v) return true;
    }
    return false;
  };

  Array.prototype.unique = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
      if (!arr.contains(this[i])) {
        arr.push(this[i]);
      }
    }
    return arr;
  };

  var counts = {};

  function count(arr) {
    for (var i = 0; i < arr.length; i++) {
      var num = arr[i];
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
  }

  count(crimes);

  data = [];

  crimes.unique().forEach((element) => {
    data.push(counts[element]);
  });

  label = [];

  crimes.unique().forEach((element) => {
    label.push(crime_labels[element]);
  });

  config.data.datasets[0].data = data;
  config.data.labels = label;
  config.options.title.text = `24H Crime Prediction for ${location.toString()}`;
  document.getElementById("searchbar").value = location.toString();
  window.chart.update();
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
