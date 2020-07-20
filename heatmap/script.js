const w = 1200;
const h = 600;
const padding = { top: 10, left: 100, right: 50, bottom: 100 };

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(response => response.json())
  .then((data) => {
    const baseTemp = data.baseTemperature;
    const section = d3.select('body').append('section');
    const heading = section.append('heading');

    const yScale = d3.scaleLinear().domain([-0.5, 11.5]).range([padding.top, h - padding.bottom]);
    const yAxis = d3.axisLeft(yScale);
    yAxis.tickFormat((m) => {
      var date = new Date(0);
      date.setUTCMonth(m);
      return date.toLocaleString('default', { month: 'long' });
    })
    const svg = d3.select('body')
      .append('svg')
      .attr('width', w)
      .attr('height', h)

    const minX = d3.min(data.monthlyVariance, (d) => {
      return d.year;
    })

    const maxX = d3.max(data.monthlyVariance, (d) => {
      return d.year;
    })

    const xScale = d3.scaleLinear().domain([minX - 1, maxX]).range([padding.left, w - padding.right]);
    const xAxis = d3.axisBottom(xScale);
    xAxis.tickFormat((year) => year);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding.left}, 0)`)
      .call(yAxis)

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h - padding.bottom})`)
      .call(xAxis)

    const minTemp = d3.min(data.monthlyVariance, (d) => {
      return d.variance + baseTemp;
    })

    const maxTemp = d3.max(data.monthlyVariance, (d) => {
      return d.variance + baseTemp;
    })

    const myColor = function (temp) {
      const t = (maxTemp - minTemp) / 10;
      if (temp < minTemp + t) {
        return '#4575b4';
      } else if (temp < minTemp + 2 * t) {
        return '#74add1';
      } else if (temp < minTemp + 3 * t) {
        return '#abd9e9';
      } else if (temp < minTemp + 4 * t) {
        return '#e0f3f8';
      } else if (temp < minTemp + 5 * t) {
        return '#ffffbf';
      } else if (temp < minTemp + 6 * t) {
        return '#fee090';
      } else if (temp < minTemp + 7 * t) {
        return '#fdae61';
      } else if (temp < minTemp + 8 * t) {
        return '#f46d43';
      } else if (temp < minTemp + 9 * t) {
        return '#d73027';
      } else {
        return '#a50026';
      }
    };

    const tooltip = d3.select('body').append('div')
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);
    const rectHeight = (h - padding.top - padding.bottom) / 12;
    svg.selectAll('rect')
      .data(data.monthlyVariance)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.year))
      .attr('y', (d) => yScale(d.month - 1) - rectHeight / 2) // adjust to 0 index and center rect
      // .attr('y', (d) => yScale(d.month - 1)) // adjust to 0 index
      .attr('width', (w - padding.left - padding.right) / (maxX - minX))
      .attr('height', rectHeight)
      .attr('fill', (d) => myColor(d.variance + baseTemp))
      .attr('class', 'cell')
      .attr('data-month', (d) => d.month - 1)
      .attr('data-year', (d) => d.year)
      .attr('data-temp', (d) => baseTemp + d.variance)
      .on('mouseover', function (d) {
        tooltip.style('opacity', 0.6);
        tooltip.attr('data-year', d.year)
        tooltip.html(`${d.year}/${d.month}<br/>Variance: ${d.variance.toFixed(2)}℃<br/>Temp: ${(d.variance + baseTemp).toFixed(2)}℃`)
          .style('left', d3.event.pageX + 'px')
          .style('top', (d3.event.pageY + 15) + 'px')
      })
      .on('mouseout', () => tooltip.style('opacity', 0))

    const legend = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${h - padding.bottom * (1 / 3)})`)
      .attr('id', 'legend')

    const RdYlBu = ['#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'];
    const legendRectW = 50;

    legend.selectAll('rect')
      .data(RdYlBu)
      .enter()
      .append('rect')
      .attr('fill', (d) => d)
      .attr('x', (d, i) => i * legendRectW)
      .attr('width', legendRectW)
      .attr('height', 10)

    const t = (maxTemp - minTemp) / 10;
    var legendTicks = [];
    for (var i = 0; i <= 10; i++) {
      legendTicks = legendTicks.concat(minTemp + i * t);
    }

    legend.selectAll('text')
      .data(legendTicks)
      .enter()
      .append('text')
      .text((d, i) => {
        return (i == 0 || i == (legendTicks.length - 1)) ? '' : d.toFixed(2);
      })
      .attr('x', (d, i) => i * legendRectW - 15)
      .attr('y', -5)

    heading.append('h1')
      .attr('id', 'title')
      .text('Monthly Global Land-Surface Temperature');
    heading.append('h3')
      .attr('id', 'description')
      .text(`${minX} - ${maxX}: base temperature ${baseTemp}℃`);

    // legends for axes
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', padding.left / 5)
      .attr('x', -h / 2)
      .attr("dy", "1em")
      .text('Month')

    svg.append('text')
      .attr('x', w / 2)
      .attr('y', h - padding.bottom * (2 / 3))
      .text('Year')
  })