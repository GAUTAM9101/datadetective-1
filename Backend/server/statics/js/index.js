var crime_labels = ["Assault", "Burglary", "Larceny", "Robbery"];
var date;
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

function handler(e) {
  date = e.target.value;
}

$(document).ready(function () {
  getDate();
  var ctx = document.getElementById("chart-area").getContext("2d");
  window.chart = new Chart(ctx, config);

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

  function getData(location) {
    let latitude = location.lat;
    let longitude = location.lng;
    let currentDate = date || getDate();

    let json = {
      Date: currentDate,
      Lat: latitude,
      Long: longitude,
    };

    $.post("/api/v1/crime_classifier/predict?version=0.2", json)
      .then((response) => {
        displayData(response, location);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function displayData(response, location) {
    let crimes = [];
    let counts = {};
    let data = [];
    let label = [];
    let forcast = response.forcast;
    console.log(response);
    // For All Day
    for (let i = 0; i < forcast.length; i++) {
      crimes.push(forcast[i]["Crime"]);
    }
    // count each categories of crimes
    for (let i = 0; i < crimes.length; i++) {
      let crime = crimes[i];
      counts[crime] = counts[crime] ? counts[crime] + 1 : 1;
    }

    // to find unique categories of crimes
    let uniqueCrimes = Array.from(new Set(crimes));

    uniqueCrimes.forEach((element) => {
      data.push(counts[element]);
      label.push(crime_labels[element]);
    });

    config.data.datasets[0].data = data;
    config.data.labels = label;
    config.options.title.text = `24H Crime Prediction for ${location.toString()}`;
    document.getElementById("searchbar").value = location.toString();
    window.chart.update();
  }
});

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
