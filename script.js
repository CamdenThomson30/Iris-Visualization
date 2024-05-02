// Load the Iris dataset
d3.csv("iris.csv").then(function(data) {
    // Convert numerical values to numbers
    data.forEach(function(d) {
        d.SepalLengthCm = +d.SepalLengthCm;
        d.SepalWidthCm = +d.SepalWidthCm;
        d.PetalLengthCm = +d.PetalLengthCm;
        d.PetalWidthCm = +d.PetalWidthCm;
    });

    // Create Scatterplot
    var scatterplotData = data.map(function(d) {
        return { 
            species: d.Species,
            petalLength: d.PetalLengthCm,
            petalWidth: d.PetalWidthCm
        };
    });

    var scatterplotMargin = {top: 20, right: 20, bottom: 50, left: 50},
        scatterplotWidth = 600 - scatterplotMargin.left - scatterplotMargin.right,
        scatterplotHeight = 400 - scatterplotMargin.top - scatterplotMargin.bottom;

    var scatterplotSvg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", scatterplotWidth + scatterplotMargin.left + scatterplotMargin.right)
        .attr("height", scatterplotHeight + scatterplotMargin.top + scatterplotMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + scatterplotMargin.left + "," + scatterplotMargin.top + ")");

    var scatterplotX = d3.scaleLinear().range([0, scatterplotWidth]).domain([0, d3.max(scatterplotData, function(d) { return d.petalLength; })]);
    var scatterplotY = d3.scaleLinear().range([scatterplotHeight, 0]).domain([0, d3.max(scatterplotData, function(d) { return d.petalWidth; })]);

    scatterplotSvg.append("g")
        .attr("transform", "translate(0," + scatterplotHeight + ")")
        .call(d3.axisBottom(scatterplotX));

    scatterplotSvg.append("g")
        .call(d3.axisLeft(scatterplotY));

    scatterplotSvg.selectAll("dot")
        .data(scatterplotData)
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return scatterplotX(d.petalLength); })
        .attr("cy", function(d) { return scatterplotY(d.petalWidth); })
        .style("fill", function(d) { return color(d.species); });


    // Create Grouped Bar Chart
    var species = d3.nest()
        .key(function(d) { return d.Species; })
        .entries(data);

    var sepalPetalDimensions = ["SepalLengthCm", "SepalWidthCm", "PetalLengthCm", "PetalWidthCm"];

    var groupedBarData = [];

    species.forEach(function(speciesData) {
        var obj = {species: speciesData.key};
        sepalPetalDimensions.forEach(function(dim) {
            obj[dim] = d3.mean(speciesData.values, function(d) { return d[dim]; });
        });
        groupedBarData.push(obj);
    });

    var groupedBarMargin = {top: 20, right: 20, bottom: 50, left: 50},
        groupedBarWidth = 600 - groupedBarMargin.left - groupedBarMargin.right,
        groupedBarHeight = 400 - groupedBarMargin.top - groupedBarMargin.bottom;

    var groupedBarSvg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", groupedBarWidth + groupedBarMargin.left + groupedBarMargin.right)
        .attr("height", groupedBarHeight + groupedBarMargin.top + groupedBarMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + groupedBarMargin.left + "," + groupedBarMargin.top + ")");

    var x0 = d3.scaleBand().rangeRound([0, groupedBarWidth]).paddingInner(0.1);
    var x1 = d3.scaleBand().padding(0.05);
    var y = d3.scaleLinear().rangeRound([groupedBarHeight, 0]);

    x0.domain(groupedBarData.map(function(d) { return d.species; }));
    x1.domain(sepalPetalDimensions).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(groupedBarData, function(d) { return d3.max(sepalPetalDimensions, function(key) { return d[key]; }); })]);

    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    groupedBarSvg.append("g")
        .selectAll("g")
        .data(groupedBarData)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x0(d.species) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return sepalPetalDimensions.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")});

