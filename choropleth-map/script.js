const w = 1000;
const h = 600;
const padding = { top: 10, right: 80, bottom: 50, left: 80 };

const promise1 = d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json');
const promise2 = d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json');
const section = d3.select('body').append('section');
const heading = section.append('heading');
heading.append('h1')
  .attr('id', 'title')
  .attr('text-anchor', 'middle')
  .attr('x', w / 2)
  .attr('y', 10)
  .text('United States Educational Attainment');
heading.append('h3')
  .attr('id', 'description')
  .attr('text-anchor', 'middle')
  .attr('x', w / 2)
  .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)');

const svg = d3.select('body').append('svg')
  .attr('width', w)
  .attr('height', h);
const path = d3.geoPath();
const tooltip = d3.select('body').append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

//legend
var colors = [];
var legendTicks = [];
for (var i = 0; i < 9; i++) {
  const scale = 10 / 8;
  var threshold = (i * 0.1).toFixed(1);
  colors = colors.concat(d3.interpolateOrRd(threshold * scale));
  legendTicks = legendTicks.concat(threshold);
}

const colorFunc = (t) => {
  const colorInd = legendTicks.findIndex((d) => d >= t) - 1;
  return colors[colorInd];
}
const legendRectW = 36;
const legendRectH = 8;
const legend = svg.append('g')
  .attr('transform', `translate(${w - padding.right - legendRectW * colors.length}, ${2 * legendRectH})`)
  .attr('id', 'legend')

legend.selectAll('rect')
  .data(colors)
  .enter()
  .append('rect')
  .attr('fill', (d) => d)
  .attr('width', legendRectW)
  .attr('height', legendRectH)
  .attr('x', (d, i) => i * legendRectW)
  .attr('stroke', 'gray');

legend.selectAll('text')
  .data(legendTicks)
  .enter()
  .append('text')
  .text((t, i) => {
    switch (i) {
      case 0:
        return '';
        break;
      case (legendTicks.length - 1):
        return t * 100 + '%';
        break;
      default:
        return t * 100;
    }
  })
  .attr('x', (d, i) => i * legendRectW - 6)
  .attr('y', -legendRectH / 3)
  .style("font-size", "12px")

Promise.all([promise1, promise2])
  .then(([edu, us]) => {

    // const section = d3.select('body').append('section');
    // const heading = section.append('heading');
    // heading.append('h1')
    //   .attr('id', 'title')
    //   .attr('text-anchor', 'middle')
    //   .attr('x', w / 2)
    //   .attr('y', 10)
    //   .text('United States Educational Attainment');
    // heading.append('h3')
    //   .attr('id', 'description')
    //   .attr('text-anchor', 'middle')
    //   .attr('x', w / 2)
    //   .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)');

    // const svg = d3.select('body').append('svg')
    //   .attr('width', w)
    //   .attr('height', h);
    // const path = d3.geoPath();
    // const tooltip = d3.select('body').append('div')
    //   .attr('id', 'tooltip')
    //   .style('opacity', 0);

    // //legend
    // var colors = [];
    // var legendTicks = [];
    // for (var i = 0; i < 9; i++) {
    //   const scale = 10 / 8;
    //   var threshold = (i * 0.1).toFixed(1);
    //   colors = colors.concat(d3.interpolateOrRd(threshold * scale));
    //   legendTicks = legendTicks.concat(threshold);
    // }

    // const colorFunc = (t) => {
    //   const colorInd = legendTicks.findIndex((d) => d >= t) - 1;
    //   return colors[colorInd];
    // }
    // const legendRectW = 36;
    // const legendRectH = 8;
    // const legend = svg.append('g')
    //   .attr('transform', `translate(${w - padding.right - legendRectW * colors.length}, ${2 * legendRectH})`)
    //   .attr('id', 'legend')

    // legend.selectAll('rect')
    //   .data(colors)
    //   .enter()
    //   .append('rect')
    //   .attr('fill', (d) => d)
    //   .attr('width', legendRectW)
    //   .attr('height', legendRectH)
    //   .attr('x', (d, i) => i * legendRectW)
    //   .attr('stroke', 'gray');

    // legend.selectAll('text')
    //   .data(legendTicks)
    //   .enter()
    //   .append('text')
    //   .text((t, i) => {
    //     switch (i) {
    //       case 0:
    //         return '';
    //         break;
    //       case (legendTicks.length - 1):
    //         return t * 100 + '%';
    //         break;
    //       default:
    //         return t * 100;
    //     }
    //   })
    //   .attr('x', (d, i) => i * legendRectW - 6)
    //   .attr('y', -legendRectH / 3)
    //   .style("font-size", "12px")

    svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
      .attr("class", "county")
      .attr('d', path)
      .attr('data-fips', (d) => d.id)
      .attr('fill', (d) => {
        const existData = edu.filter((obj) => obj.fips == d.id);
        const eduPercent = (existData[0]) ? existData[0].bachelorsOrHigher / 100 : 0;
        return colorFunc(eduPercent);
      })
      .attr('data-education', (d) => {
        const existData = edu.filter((obj) => obj.fips == d.id);
        return (existData[0]) ? existData[0].bachelorsOrHigher : NaN;
      })
      .on('mouseover', (d) => {
        tooltip.style('opacity', 0.6);
        tooltip.style('left', d3.event.pageX + 'px')
          .style('top', (d3.event.pageY + 15) + 'px');
        tooltip.attr('data-education', () => {
          const existData = edu.filter((obj) => obj.fips == d.id);
          return (existData[0]) ? existData[0].bachelorsOrHigher : NaN;
        })

        tooltip.html(() => {
          const existData = edu.filter((obj) => obj.fips == d.id);
          var percentage;
          var area;
          var state;
          if (existData[0]) {
            percentage = existData[0].bachelorsOrHigher;
            area = existData[0].area_name;
            state = existData[0].state;
            return `${area}, ${state}: ${percentage}%`
          } else {
            return 'No data';
          }
        })

      })
      .on('mouseout', () => tooltip.style('opacity', 0))
  })