const h = 600;
const w = 800;
const padding = { left: 60, top: 10, right: 60, bottom: 60 };

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  .then(response => response.json())
  .then((data) => {

    const section = d3.select('body').append('section');
    const heading = section.append('heading');

    const minX = d3.min(data, function (d) {
      const parser = d3.timeParse('%Y');
      return parser(d.Year);
    });
    const parser = d3.timeParse('%Y');
    const maxX = d3.max(data, function (d) {
      const parser = d3.timeParse('%Y');
      return parser(d.Year);
    });

    const xScale = d3.scaleUtc().domain([minX, maxX]).range([padding.left, w - padding.right]);
    const xAxis = d3.axisBottom(xScale);

    const minY = d3.min(data, function (d) {
      const parser = d3.timeParse('%M:%S');
      return parser(d.Time);
    })
    const maxY = d3.max(data, function (d) {
      const parser = d3.timeParse('%M:%S');
      return parser(d.Time);
    })
    const yScale = d3.scaleUtc().domain([minY, maxY]).range([padding.top, h - padding.bottom]);

    const yAxis = d3.axisLeft(yScale).ticks(d3.timeSecond.every(15));
    yAxis.tickFormat(d3.timeFormat("%M:%S"));

    console.log(minY, maxY);

    const svg = d3.select('body')
      .append('svg')
      .attr('width', w)
      .attr('height', h)
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h - padding.bottom})`)
      .call(xAxis);
    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding.left}, 0)`)
      .call(yAxis);

    const tooltip = d3.select('body').append('div')
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => {
        const parser = d3.timeParse('%Y');
        return xScale(parser(d.Year));
      })
      .attr('cy', (d) => {
        const parser = d3.timeParse('%M:%S');
        return yScale(parser(d.Time));
      })
      .attr('r', 6)
      .attr('class', 'dot')
      .attr('data-xvalue', (d) => d.Year)
      .attr('data-yvalue', (d) => {
        const parser = d3.timeParse('%M:%S');
        return parser(d.Time).toISOString()
      })
      .attr('fill', (d) => {
        return (d.Doping) ? 'orange' : '#35a09b';
      })
      .attr('stroke', 'gray')
      .on('mouseover', function (d) {
        tooltip.style('opacity', 0.6);
        tooltip.attr('data-year', d.Year);
        tooltip.html(`Name: ${d.Name}<br/>Nationality: ${d.Nationality}<br/>Year: ${d.Year}<br/>Time:${d.Time}<br/>Dopping: ${(d.Doping) ? d.Doping : 'None'}`)
          .style('left', d3.event.pageX + 'px')
          .style('top', (d3.event.pageY + 15) + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0))

    // // tooltip made by follwoing the lessons, but this does not pass the last 2 tests
    // svg.selectAll('.dot')
    //     .append('title')
    //     .text((d) => `Name: ${d.Name}\nNationality: ${d.Nationality}\nYear: ${d.Year}\nTime:${d.Time}\nDopping: ${(d.Doping)?d.Doping:'None'}`)
    //     .attr('id', 'tooltip')
    //     .attr('data-xvalue', (d) => d.Year)
    //     .attr('data-yvalue', (d) => {
    //       const parser = d3.timeParse('%M:%S');
    //       return parser(d.Time).toISOString()
    // })

    svg.append("circle")
      .attr("cx", w * (2 / 3))
      .attr("cy", w / 8)
      .attr("r", 5)
      .attr('class', 'legend-dot')
      .style("fill", 'orange');

    svg.append("text")
      .attr("x", w * (2 / 3) + 10)
      .attr("y", w / 8)
      .text("Riders with doping allegations")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    svg.append("circle")
      .attr("cx", w * (2 / 3))
      .attr("cy", w / 8 + 30)
      .attr("r", 5)
      .attr('class', 'legend-dot')
      .style("fill", '#35a09b');

    svg.append("text")
      .attr("x", w * (2 / 3) + 10)
      .attr("y", w / 8 + 30)
      .text("No doping allegations")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -h / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Time in Minutes")
      .attr('id', 'legend');

    svg.append("text")
      .attr("x", w / 2)
      .attr("y", h - padding.bottom + 20)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Year")
      .attr('id', 'legend');

    heading.append('h1')
      .attr('id', 'title')
      .attr("text-anchor", "middle")
      .attr('x', w / 2)
      .attr('y', 50)
      .text("Doping in Professional Bicycle Racing");
  })