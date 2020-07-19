// set the dimensions and margins of the graph
const margin = { top: 10, right: 10, bottom: 60, left: 10 },
  w = 1200 - margin.left - margin.right,
  h = 800 - margin.top - margin.bottom;

// read json data
fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json')
  .then(result => result.json())
  .then(data => {

    const section = d3.select('body').append('section');
    const heading = section.append('heading');
    heading.append('h1')
      .attr('id', 'title')
      .text('Movie Sales');
    heading.append('h3')
      .attr('id', 'description')
      .text('Top Movies Sold Grouped by Genre');

    // append the svg object to the body of the page
    const svg = d3.select("body")
      .append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom);
    const tooltip = d3.select('body').append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);
    const treemapLayout = d3.treemap();
    treemapLayout.size([w, h]).padding(1);
    // Here the size of each leave is given in the 'value' field in input data
    // This traverses the tree and sets .value on each node to the sum of its children
    const root = d3.hierarchy(data).sum(function (d) { return d.value })
    // adds 4 properties x0, x1, y0 and y1 to each node which specify the dimensions of each rectangle in the treemap.
    treemapLayout(root);
    const categories = [... new Set(root.leaves().map((d) => d.data.category))];

    const g = svg.append('g').attr('id', 'g-for-tree')
      .attr('transform', `translate(${(margin.left + margin.right) / 2}, ${margin.top})`);
    const rectOpacity = 0.7;
    function myColor(t) { return d3.interpolateRainbow(t) };

    const cell = g.selectAll('g')
      .data(root.leaves())
      .enter()
      .append("g")
      .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);

    const tile = cell.append("rect")
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .style("fill", (d) => {
        const t = (categories.indexOf(d.data.category) + 1) / categories.length;
        return myColor(t);
      })
      .attr('opacity', rectOpacity)
      .attr('class', 'tile')
      .attr('data-name', (d) => d.data.name)
      .attr('data-category', (d) => d.data.category)
      .attr('data-value', (d) => d.data.value)
      .on('mouseover', (d) => {
        tooltip.style('opacity', rectOpacity);
        tooltip.attr('data-value', d.data.value);
        tooltip.html(`Name: ${d.data.name}<br/>Category:${d.data.category}<br/>Value:${d.data.value}`)
          .style('left', d3.event.pageX + 'px')
          .style('top', (d3.event.pageY + 15) + 'px')
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    cell.append('text')
      .attr('font-size', '8px')
      .attr('id', 'tile-title')
      .selectAll('tspan')
      .data((d) => d.data.name.split(/\s(?=[A-Z])/g))
      .enter().append("tspan")
      .text((d) => d)
      .attr('x', 2)
      .attr('y', (d, i) => 10 + i * 10)


    const legend = svg.append('g').attr('id', 'legend');
    const legendItemWidth = 150;
    const legendSquareSide = 10;
    const row = 3;
    legend.selectAll('rect')
      .data(categories)
      .enter()
      .append('rect')
      .attr('fill', (d, i) => myColor((i + 1) / categories.length))
      .attr('opacity', rectOpacity)
      .attr('width', legendSquareSide)
      .attr('height', legendSquareSide)
      .attr('x', (d, i) => {
        const baseX = margin.left * 2;
        const col = Math.floor(i / row);
        return baseX + col * legendItemWidth;
      })
      .attr('y', (d, i) => {
        const baseY = margin.top + h;
        return baseY + margin.bottom * ((i % row) / row)
      })
      .attr('class', 'legend-item')

    legend.selectAll('text')
      .data(categories)
      .enter()
      .append('text')
      .text((d) => d)
      .attr('x', (d, i) => {
        const baseX = margin.left * 2;
        const col = Math.floor(i / row);
        return baseX + legendSquareSide * 1.5 + col * legendItemWidth;
      })
      .attr('y', (d, i) => {
        const baseY = margin.top + h + legendSquareSide;
        return baseY + margin.bottom * ((i % row) / row)
      })
  })