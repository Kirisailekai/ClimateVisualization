const WIDTH = 1400;
const HEIGHT = 800;

let svg, g, path, projection, colorScale, title, tooltip, tipCountry, tipData;
let hovered = false;
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

function initChart(canvasElement) {
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  g = svg.append("g");

  title = g
    .append("text")
    .attr("class", "x-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT - 100)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle");

  path = d3.geoPath();
  projection = d3
    .geoEqualEarth()
    .scale(250)
    .center([0, 0])
    .translate([WIDTH / 2, HEIGHT / 2]);

  colorScale = d3
    .scaleLinear()
    .domain([-30, 0, 35])
    .range(["#1788de", "#3C81B7", "#dc2f02"]);

  const legend = g
    .append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  legend
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#dc2f02")
    .attr("stop-opacity", 1);

  legend
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#3C81B7")
    .attr("stop-opacity", 1);

  const w = 110,
    h = 300;
  const y = d3.scaleLinear().domain([-30, 35]).range([h, 0]);
  g.append("rect")
    .attr("width", w - 100)
    .attr("height", h)
    .style("fill", "url(#gradient)")
    .attr("transform", "translate(0,200)");

  var yAxis = d3.axisRight(y).tickFormat((d) => d + "℃");

  g.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(10,200)")
    .call(yAxis);

  tooltip = d3.select(".tooltip");
}

function updateChart(topo, data, month) {
  const trans = d3.transition().duration(100);
  const currentYear = data.values().next().value[0].Year;
  title.text(`${monthNames[month]}, ${currentYear}`);

  const choroMap = g.selectAll("path").data(topo.features);

  choroMap.exit().remove();

  choroMap
    .enter()
    .append("path")
    .merge(choroMap)
    .attr("class", "Country")
    .transition(trans)
    .attr("d", path.projection(projection))
    .attr("fill", function (d) {
      d.total = data.get(d.properties["iso_a3"]);

      return d.total ? colorScale(d.total[month].Temperature) : 30;
    });

  choroMap
    .on("pointermove", function (event, d) {
      hovered = true;
      tipCountry = d.total ? d.total[0].ISO3 : null;
      tipData = tipCountry
        ? data.get(tipCountry)[month]
        : {Country: "No available data", Temperature: ""};
      tooltip.html(tipData.Country + "<br/>" + tipData.Temperature + "℃");
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .transition()
        .duration(100)
        .style("opacity", 0.9)
        .style("font-size", "10px");
      d3.selectAll(".Country").transition().duration(50).style("opacity", 0.5);
      d3.select(this)
        .transition()
        .duration(50)
        .style("opacity", 1)
        .style("stroke", "#0A0A0A")
        .style("stroke-width", "0.5px");
    })
    .on("pointerleave", function (event) {
      hovered = false;
      d3.selectAll(".Country").transition().duration(50).style("opacity", 1);
      d3.select(this).transition().duration(50).style("stroke", "none");
      tooltip.transition().duration(100).style("opacity", 0);
    });
  if (hovered) {
    tipData = tipCountry
      ? data.get(tipCountry)[month]
      : {Country: "No available data", Temperature: ""};
    tooltip.html(tipData.Country + "<br/>" + tipData.Temperature + "℃");
  }
}

export {initChart, updateChart};