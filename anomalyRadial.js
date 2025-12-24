const MARGIN = {LEFT: 0, RIGHT: 0, TOP: 0, BOTTOM: 30};
const WIDTH = 500 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;
const OUTERRADIUS = Math.min(WIDTH, HEIGHT, 500) / 2;
const INNERRADIUS = OUTERRADIUS * 0.1;

let svg,
  g,
  colorScale,
  distScale,
  radialScale,
  title,
  yearText,
  line,
  barWrapper,
  pathWrapper;

let currYear = 1901;

const domLow = -1.5,
  domHigh = 1.25, 
  axisTicks = [-1, 0, 1]; 

function initChart(canvasElement) {
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

  g = svg
    .append("g")
    .attr(
      "transform",
      "translate(" + WIDTH / 2 + "," + (HEIGHT / 2 + 20) + ")"
    );

  colorScale = d3
    .scaleLinear()
    .domain([domLow, (domLow + domHigh) / 2, domHigh])
    .range(["#1788de", "#ffff8c", "#CE241C"]);

  distScale = d3
    .scaleLinear()
    .range([INNERRADIUS, OUTERRADIUS])
    .domain([domLow, domHigh]);

  radialScale = d3
    .scaleLinear()
    .range([0, Math.PI * 2])
    .domain([1, 12]); 

  title = g
    .append("g")
    .attr("class", "title")
    .append("text")
    .attr("dy", HEIGHT / 2)
    .attr("text-anchor", "middle")
    .text("World Temperature Anomaly");

  barWrapper = svg
    .append("g")
    .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")");

  pathWrapper = barWrapper.append("g").attr("id", "pathWrapper");

  const axes = barWrapper
    .selectAll(".gridCircles")
    .data(axisTicks)
    .enter()
    .append("g");
  axes
    .append("circle")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("opacity", 0.2)
    .attr("class", "axisCircles")
    .attr("r", function (d) {
      return distScale(d);
    });
  axes
    .append("text")
    .attr("class", "axisText")
    .attr("y", function (d) {
      return distScale(d) - 8;
    })
    .attr("dy", "0.3em")
    .text(function (d) {
      return d + "°C";
    });

  barWrapper
    .append("text")
    .attr("class", "january")
    .attr("x", 7)
    .attr("y", -OUTERRADIUS)
    .attr("dy", "0.9em")
    .text("January");
  barWrapper
    .append("line")
    .attr("class", "yearLine")
    .attr("stroke", "black")
    .attr("opacity", 0.5)
    .attr("x1", 0)
    .attr("y1", -INNERRADIUS * 1.8) 
    .attr("x2", 0)
    .attr("y2", -OUTERRADIUS * 1.1);

  yearText = barWrapper
    .append("text")
    .attr("class", "yearText")
    .attr("text-anchor", "middle")
    .attr("y", 8);

  line = d3
    .lineRadial()
    .angle(function (d) {
      return radialScale(d.Month);
    })
    .radius(function (d) {
      return distScale(d.Anomaly);
    });
}

function updateChart(data, nextYear) {
  const trans = d3.transition().duration(400).ease(d3.easeCubicIn);

  if (nextYear < currYear) {
    const paths = document.getElementById("pathWrapper").children;
    const removeRange = paths.length - (currYear - nextYear);
    const removeElems = [];
    for (let i = removeRange; i < paths.length; i++) {
      removeElems.push(paths[i]);
    }
    removeElems.forEach((elem) => elem.parentNode.removeChild(elem));
  } else if (nextYear > currYear) {
    for (let year = currYear; year < nextYear; year++) {
      const yearData = data.get(String(year));
      const path = pathWrapper
            .append("path")
            .attr("class", "line")
            .attr("stroke-width", 5)
            .attr("fill", "none")
            .attr("d", line(yearData))
            .attr("x", -0.75)
            .style("stroke", colorScale(yearData[0].Anomaly));

      const totalLength = path.node().getTotalLength();

      if ((nextYear-currYear) == 1) {
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition(trans)
          .attr("stroke-dashoffset", 0);
      }
    }
  }
  yearText.text(nextYear);
  currYear = nextYear;
}

export {initChart, updateChart};