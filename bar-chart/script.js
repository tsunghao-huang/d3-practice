const w = 1200;
const h = 600;
const padding = { top: 10, right: 80, bottom: 50, left: 80 };

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  .then(response => response.json())
  .then((data) => {

    const section = d3.select('body').append('section');
    const heading = section.append('heading');

    const minX = d3.min(data.data, function (d) {
      var parser = d3.timeParse("%Y-%m-%d");
      return parser(d[0]);
    })
    const maxX = d3.max(data.data, function (d) {
      var parser = d3.timeParse("%Y-%m-%d");
      return parser(d[0]);
    })


    const minY = 0;
    const maxY = d3.max(data.data, (d) => d[1]);
    const xScale = d3.scaleTime().domain([minX, maxX]).range([padding.left, w - padding.right]);
    const yScale = d3.scaleLinear().domain([minY, maxY]).range([h - padding.bottom, padding.top]);
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    const oneStep = 2;

    const svg = d3.select('body')
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0,${h - padding.bottom})`)
      .call(xAxis)

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding.left}, 0)`)
      .call(yAxis)

    const tooltip = d3.select('body').append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0)

    svg.selectAll('rect')
      .data(data.data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => {
        var parser = d3.timeParse("%Y-%m-%d");
        return xScale(parser(d[0]));
      })
      .attr('y', (d) => yScale(d[1]))
      .attr('width', (w - (padding.right + padding.left)) / data.data.length)
      .attr('height', (d) => h - padding.bottom - yScale(d[1]))
      .attr('class', 'bar')
      .attr('data-date', (d) => d[0])
      .attr('data-gdp', (d) => d[1])
      .attr('fill', '#35a09b')
      .on('mouseover', (d) => {
        tooltip.style('opacity', 0.6);
        tooltip.attr('data-date', d[0]);
        tooltip.html(`Date: ${d[0]} <br/> \$${d[1]} Billion`)
          .style('left', d3.event.pageX + 'px')
          .style('top', (h - padding.top) * (9 / 10) + 'px')
      })
      .on('mouseout', () => tooltip.style('opacity', 0))

    // // tooltip made by follwoing the lessons, but this does not pass the last 2 tests
    // svg.selectAll('rect')
    //    .append('title')
    //    .text((d) => `Date: ${d[0]} \n \$${d[1]} Billion`)
    //    .attr('id', 'tooltip')
    //    .attr('data-date', (d) => `${d[0]}`)
    //    .attr('data-gdp', (d) => `${d[1]}`)

    heading.append('h1')
      .attr('id', 'title')
      .attr("text-anchor", "middle")
      .attr('x', w / 2)
      .attr('y', 10)
      .text("USA GDP");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", padding.left / 5)
      .attr("x", -h / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Gross Domestic Product (Billion $)")
      .attr('id', 'legend');

    svg.append("text")
      .attr("x", w / 2)
      .attr("y", h - padding.bottom + 20)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Year")
      .attr('id', 'legend');

  })