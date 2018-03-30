
index = [];
data = {};
gem_names = [];
max_data = 0;
graph_width = 640;
graph_height = 420;
bar_width = 20;
ruby_advisory_stats = [];
ruby_advisory_stats.sort(function(a, b) { return a.year > b.year });
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    graph_width = graph_width - margin.left - margin.right,
    graph_height = graph_height - margin.top - margin.bottom;



function select_all(all) {
  if (all == true) {
    d3.selectAll("input").property("checked", true);
    get_initial_gem_list();
  } else {
    d3.selectAll("input").property("checked", false);
    gem_names = [];
  }
  get_data();
  print_chart();
}

function get_initial_gem_list() {
  for (i = 0; i < ruby_advisory_stats.length; i++) {
    name =  ruby_advisory_stats[i].name;
    if (gem_names.indexOf(name) < 0) {
      gem_names.push(name);
    }
  }
  gem_names.sort();
}

function get_data() {
  index = [];
  data = {};
  for (i = 0; i < ruby_advisory_stats.length; i++) {
    name =  ruby_advisory_stats[i].name;
    year = ruby_advisory_stats[i].year;
    new_data = parseInt(ruby_advisory_stats[i].issues);
    if  (year in data) {
      new_data = data[year] + new_data;
    }
    else {
      data[year] = 0;
      index.push(year);
    }
    if (gem_names.indexOf(name) >= 0)
      data[year] = new_data;
    if (data[year] > max_data) {
      max_data = data[year];
    }
  }
}



function print_chart() {
  //clean
  d3.select(".chart").selectAll("g").remove()
  bar_width = graph_width / index.length;

  var x = d3.scaleBand()
    .range([0, graph_width])
    .domain(index);

  var y = d3.scaleLinear()
      .domain([0, max_data])
      .range([graph_height, 0]);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var chart = d3.select(".chart")
      .attr("width", graph_width + margin.left + margin.right)
      .attr("height", graph_height + margin.top + margin.bottom)
    .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = chart.selectAll("g")
      .data(index)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + i * bar_width + ",0)"; });

  chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + graph_height + ")")
    .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  bar.append("rect")
      .attr("y", function(d) { return y(data[d]);})
      .attr("height", function(d) { return graph_height - y(data[d]); })
      .attr("width", bar_width - 1)
      .attr("class", "bar");

  bar.append("text")
      .attr("x", bar_width / 2)
      .attr("y", function(d) { return y(data[d]) + 3; })
      .attr("dy", ".75em")
      .text(function(d) { return data[d]; });

}

function update(input) {
  if (input.checked) {
    if (gem_names.indexOf(input.value) < 0) {
      gem_names.push(input.value);
    }
  } else {
     index = gem_names.indexOf(input.value);
     if (index >= 0) {
       gem_names.splice(index, 1);
     }
  }
  get_data();
  print_chart();
}

function add_gem_list() {
  // add gem list
  d3.select(".gem_list")
    .selectAll("ul")
    .data(gem_names)
      .enter()
      .append("li")
      .append("label")
      .text(function(d) { return d; })
      .append("input")
      .attr("type", "checkbox")
      .attr("checked",  "true")
      .attr("name", function(d) { return d; })
      .attr("value", function(d) { return d; })
      .attr("onClick", "update(this)")

}

function type(d) {
    d.value = +d.value; // coerce to number
      return d;
}

d3.csv("stats.csv", function(data) {
  ruby_advisory_stats = data;
  get_initial_gem_list();
  get_data();
  print_chart();
  add_gem_list();
});

