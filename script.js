const countyURL = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const educationURL = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

Promise.all([d3.json(countyURL), d3.json(educationURL)])
  .then(data => callback(data[0], data[1]))
  .catch(err => console.log(err));

function callback(us, education) {

// Define section
let section = d3.select('body').append('section');

// Define heading
let heading = section.append('heading');
  heading
      .append('h1')
      .attr('id', 'title')
      .text('United States Educational Attainment');
  heading
      .append('h3')
      .attr('id', 'description')
      .html(`Percentage of adults age 25 and older with a bachelor's degree or higher
      (2010-2014)`);

// Define svg
let svg = d3.select('body').append('svg');

// Define tooltip
let tooltip = d3.select('body')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')

// Define path
let path = d3.geoPath();

// Legend
let bachelorsOrHigherArray = education.map((item) => {
    return item.bachelorsOrHigher
})

let max = d3.max(bachelorsOrHigherArray)
let min = d3.min(bachelorsOrHigherArray)

let x = d3.scaleLinear()
        .domain([min, max])
        .rangeRound([500, 900]);

let color = d3
  .scaleThreshold()
  .domain(d3.range(min, max, (max - min) / 8))
  .range(d3.schemeOranges[9]);

let g = svg
  .append('g')
  .attr('class', 'key')
  .attr('id', 'legend')
  .attr('transform', 'translate(0,20)');

  g.selectAll('rect')
  .data(
    color.range().map(function (d) {
      d = color.invertExtent(d);
      if (d[0] === undefined) {
        d[0] = x.domain()[0];
      }
      if (d[1] === undefined) {
        d[1] = x.domain()[1];
      }
      return d;
    })
  )
  .enter()
  .append('rect')
  .attr('height', 15)
  .attr('x', function (d) {
    return x(d[0]);
  })
  .attr('width', function (d) {
    return d[0] && d[1] ? x(d[1]) - x(d[0]) : x(null);
  })
  .attr('fill', function (d) {
    return color(d[0]);
  });

g.call(
  d3
    .axisBottom(x)
    .tickSize(25)
    .tickFormat(function (x) {
      return Math.round(x) + '%';
    })
    .tickValues(color.domain())
)
  .select('.domain')
  .remove();

// Counties drawing
  svg
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', function (d) {
        let tipData = education.filter(function (obj) {
          return obj.fips === d.id
        });
          return color(tipData[0].bachelorsOrHigher);
      })
      .on('mouseover', function (event, d) {
        tooltip.style('opacity', 0.9);
        tooltip
          .html(function () {
            let tipData = education.filter(function (obj) {
              return obj.fips === d.id;
            });
            let str = `${tipData[0].area_name}, ${tipData[0].state}: ${tipData[0].bachelorsOrHigher}%`
            return str
          })
          .attr('data-education', function () {
            let tipData = education.filter(function (obj) {
              return obj.fips === d.id;
            });
            return tipData[0]
          })
          .style('left', event.pageX + 15 + 'px')
          .style('top', event.pageY - 15 + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('opacity', 0);
      });

  //States drawing
  svg
  .append('path')
  .datum(
    topojson.mesh(us, us.objects.states, function (a, b) {
      return a !== b;
    })
  )
  .attr('class', 'states')
  .attr('d', path);
}
