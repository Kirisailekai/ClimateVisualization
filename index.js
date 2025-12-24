import * as areaChart from "./areaChart.js";
import * as polarArea from "./polarArea.js";
import * as choroplethMap from "./choroplethMap.js";
import * as anomalyRadial from "./anomalyRadial.js";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const firstYear = 1901;
const lastYear = 2020;
let country = "KGZ";
let year = firstYear;
let month = 0;

const slider = document.getElementById("yearSlider");
slider.min = firstYear;
slider.max = lastYear;

areaChart.initChart("#areaChart");
polarArea.initChart("#polarArea");
anomalyRadial.initChart("#anomalyRadial");
choroplethMap.initChart("#choroplethMap");

const dataPromises = [
  d3.csv("data/temp-1901-2020-all.csv"),
  d3.csv("data/HadCRUT4.csv"),
  d3.json("data/world.geo.json"),
];

Promise.all(dataPromises).then(function (data) {
  const topoData = data[2];
  const tempData = d3.group(
    data[0],
    (d) => d.Year,
    (d) => d.ISO3
  );
  const anomalyData = d3.group(
    data[1],
    (d) => d.Year
  );

  function updateCharts() {
    const yearData = tempData.get(String(year));
    const countryData = yearData.get(country);
    polarArea.updateChart(countryData);
    areaChart.updateChart(countryData);
    anomalyRadial.updateChart(anomalyData, year);
    choroplethMap.updateChart(topoData, yearData, month);
  }
  updateCharts();

  let interval = d3.interval(() => {
    year = year < lastYear ? year + 1 : firstYear;
    slider.value = year;
    updateCharts();
  }, 400);

  let moving = true;
  slider.addEventListener("input", (event) => {
    if (moving) {
      interval.stop();
    }
    year = +slider.value;
    updateCharts();
  });
  slider.addEventListener("pointerup", (event) => {
    if (moving) {
      interval = d3.interval(() => {
        year = year < lastYear ? year + 1 : firstYear;
        slider.value = year;
        updateCharts();
      }, 400);
    }
  });
  const playButton = d3.select("#play-button");
  playButton.on("click", function () {
    const button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      interval.stop();
      button.text("Play");
    } else {
      moving = true;
      interval = d3.interval(() => {
        year = year < lastYear ? year + 1 : firstYear;
        slider.value = year;
        updateCharts();
      }, 400);
      button.text("Pause");
    }
  });
  monthNames.forEach((month, i) => {
    document.getElementById(
      "month-list"
    ).innerHTML += `<li><a class="dropdown-item" value=${i}>${month}</a></li>`;
  });
  document.querySelectorAll("#month-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      month = event.target.getAttribute("value");
      updateCharts();
    })
  );

  for (let year of tempData.keys()) {
    document.getElementById(
      "year-list"
    ).innerHTML += `<li><a class="dropdown-item">${year}</a></li>`;
  }
  document.querySelectorAll("#year-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      year = +event.target.innerHTML;
      slider.value = year;
      updateCharts();
    })
  );

  for (let [iso, isoData] of tempData.get(String(firstYear))) {
    const countryName = isoData[0].Country;
    document.getElementById(
      "country-list"
    ).innerHTML += `<li><a class="dropdown-item" value=${iso}>${countryName}</a></li>`;
  }
  document.querySelectorAll("#country-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      country = event.target.getAttribute("value");
      updateCharts();
    })
  );
});