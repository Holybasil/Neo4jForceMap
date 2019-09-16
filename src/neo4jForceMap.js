import * as d3 from "d3";

const colors = [
  "#1E78B4",
  "#32A02C",
  "#E3191C",
  "#FF7F00",
  "#6A3D9A",
  "#B15928"
];
const colorsLighter = [
  "#A6CEE3",
  "#B2DF8A",
  "#FB9A99",
  "#FDBF6F",
  "#CAB2D6",
  "#FFFF99"
];
class holyNeo4j {
  constructor(selector, options = {}) {
    this.svg = null;
    this.nodes = []; // 数据
    this.links = []; // 数据
    this.node = null; // g.node 数组
    this.link = null; // g.link 数组
    this.nodeSvg = null;
    this.linkSvg = null;
    this.myLink = null;
    this.svgTranslate = null;
    this.svgScale = null;
    this.justLoaded = false;
    this.timer = 0;
    this.delay = 200;
    this.prevent = false;
    this.options = {
      arrowSize: 10,
      nodeRadius: 16,
      nodeTextColor: "#333",
      noseTextSize: "14px",
      nodeTextKey: "labels",
      linkColor: "#a5abb6",
      linkTextColor: "#333",
      linkTextSize: "12px",
      linkHighlightColor: "#66B1FF",
      linkKey: "id",
      linkTextRotate: false,
      linkTextKey: "type",
      linkTextMap: undefined,
      data: undefined,
      zoomFit: false
    };

    this.init(selector, options);
  }
  init(selector, options) {
    this.mergeOption(options);
    this.appendSVGGraph(selector);
    this.initSimulation();
    this.loadData();
  }
  appendSVGGraph(selector) {
    this.width = document.querySelector(selector).offsetWidth;
    this.height = document.querySelector(selector).offsetHeight;
    this.svg = d3
      .select(selector)
      .html("")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .call(
        d3.zoom().on("zoom", () => {
          const scale = d3.event.transform.k;
          const translate = [d3.event.transform.x, d3.event.transform.y];
          this.svg.attr(
            "transform",
            `translate(${translate[0]}, ${translate[1]}) scale(${scale})`
          );
        })
      )
      .on("dblclick.zoom", null)
      .append("g")
      .attr("class", "graph")
      .attr("width", "100%")
      .attr("height", "100%");

    this.linkSvg = this.svg.append("g").attr("class", "links");
    this.nodeSvg = this.svg.append("g").attr("class", "nodes");

    var arrowMarker = this.svg
      .append("marker")
      .attr("id", "arrow")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", this.options.arrowSize) 
      .attr("markerHeight", this.options.arrowSize)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", this.options.arrowSize + this.options.nodeRadius) // arrowSize + nodeRadius
      .attr("refY", "0")
      .attr("orient", "auto");
    var arrow_path = "M0,-5L10,0L0,5"; // 定义箭头形状
    arrowMarker
      .append("path")
      .attr("d", arrow_path)
      .attr("fill", this.options.linkColor);
  }
  initSimulation() {
    this.simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-700))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      // .force("collide", d3.forceCollide())
      .force(
        "radial",
        d3
          .forceRadial(
            Math.min(this.width / 2, this.height / 2) / 2,
            this.width / 2,
            this.height / 2
          )
          .strength(0.3)
      )
      .on("tick", () => {
        this.tickNode();
        this.tickLink();
      });
  }
  
  appendNode() {
    const _this = this;
    return (
      this.node
        .enter()
        .append("g")
        // .join("g")
        .attr("class", "node")
        .on("dblclick", d => {
          if (
            this.options.onNodeDBClick &&
            typeof this.options.onNodeDBClick === "function"
          ) {
            clearTimeout(this.timer);
            this.prevent = true;
            this.options.onNodeDBClick(d);
          } 
        })
        .on("click", function(d) {
          if (
            _this.options.onNodeDBClick &&
            typeof _this.options.onNodeDBClick === "function"
          ) {
            this.timer = setTimeout(() => {
              if (!_this.prevent) {
                _this.selectNodeAndNot(_this, this);
                _this.onNodeClick(d);
              }

              _this.prevent = false;
            }, _this.delay);
          } else {
            _this.node
              .selectAll(".selected")
              .style("stroke", "none")
              .style("stroke-width", "unset")
              .attr("r", _this.options.nodeRadius);
            _this.node.selectAll(".selected").classed("selected", false);
            d3.select(this)
              .select("circle")
              .classed("selected", true);
            d3.select(".selected")
              .style("stroke", d => colors[d.type - 1])
              .style("stroke-width", _this.options.nodeRadius / 4)
              .attr("r", _this.options.nodeRadius * 1.2);
            _this.onNodeClick(d);
          }
        })
        .on("mouseenter", d => {
          if (typeof this.options.onNodeMouseenter === "function") {
            this.options.onNodeMouseenter(d);
          }
        })
        .on("mouseleave", d => {
          if (typeof this.options.onNodeMouseleave === "function") {
            this.options.onNodeMouseleave(d);
          }
        })

        .call(this.drag(this.simulation))
    );
  }
  selectNodeAndNot(_this, __this) {
    _this.node
      .selectAll(".selected")
      .style("stroke", "none")
      .style("stroke-width", "unset")
      .attr("r", _this.options.nodeRadius);
    _this.node.selectAll(".selected").classed("selected", false);
    d3.select(__this)
      .select("circle")
      .classed("selected", true);
    d3.select(".selected")
      .style("stroke", d => colors[d.type - 1])
      .style("stroke-width", _this.options.nodeRadius / 4)
      .attr("r", _this.options.nodeRadius * 1.2);
  }
  onNodeClick(d) {
    if (typeof this.options.onNodeClick === "function") {
      this.options.onNodeClick(d);
    }
  }
  appendCircleToNode(node) {
    node
      .append("circle")
      .attr("r", this.options.nodeRadius)
      .attr("fill", d => colorsLighter[d.type - 1]);
  }
  appendTextToNode(node) {
    this.nodeText = node
      .append("text")
      .attr("class", 'text')
      .attr("text-anchor", "middle")
      .attr("font-size", this.options.nodeTextSize)
      .attr("fill", this.options.nodeTextColor)
      .attr("pointer-events", "none")
      .attr("y", this.options.nodeRadius / 3)
      .text(d => {
        return d[this.options.nodeTextKey];
      });
  }
  appendNodeGroup() {
    const node = this.appendNode();
    this.appendCircleToNode(node);
    this.appendTextToNode(node);
    return node;
  }
  appendLink() {
    const _this = this;
    return this.link
      .enter()
      .append("g")
      .attr("class", "link")
      .on("click", function(d) {
        _this.link
          .selectAll(".pathSelected")
          .style("stroke", _this.options.linkColor);
        _this.link
          .selectAll(".textSelected")
          .style("fill", _this.options.linkTextColor);
        _this.link.selectAll(".pathSelected").classed("pathSelected", false);
        _this.link.selectAll(".textSelected").classed("textSelected", false);
        d3.select(this)
          .select("path")
          .classed("pathSelected", true)
          .style("stroke", _this.options.linkHighlightColor);
        d3.select(this)
          .select("text")
          .classed("textSelected", true)
          .style("fill", _this.options.linkHighlightColor);

        if (typeof _this.options.onLinkClick === "function") {
          _this.options.onLinkClick(d);
        }
      });
  }
  onLinkClick(d) {
    if (typeof this.options.onLinkClick === "function") {
      this.options.onLinkClick(d);
    }
  }
  appendTextToLink(link) {
    return (
      link
        .append("text")
        .attr("class", "text")
        .attr("fill", this.options.linkTextColor)
        .append("textPath")
        .attr("class", "textPath")
        .attr(
          "href",
          d => "#" + d.source + d[this.options.linkTextKey] + d.target
        )
        .attr("startOffset", "50%")
        .attr("font-size", this.options.linkTextSize)
        .text(d => {
          return this.options.linkTextMap
            ? this.options.linkTextMap[d[this.options.linkTextKey]]
            : d[this.options.linkTextKey];
        })
    );
  }
  appendLineToLink(link) {
    return (
      link
        .append("path")
        .attr("class", "path")
        .attr("id", d => d.source + d[this.options.linkTextKey] + d.target)
        .attr("fill", "none")
        .attr("marker-end", "url(#arrow)")
        .attr("stroke", this.options.linkColor)
        .attr("stroke-width", "1")
    );
  }
  appendLinkGroup() {
    const link = this.appendLink();
    const linkText = this.appendTextToLink(link);
    const linkPath = this.appendLineToLink(link);
    return {
      link,
      linkText,
      linkPath
    };
  }
  updateNodes(nodes) {
    this.nodes.push(...nodes);
    this.node = this.nodeSvg
      .selectAll("g.node")
      .data(this.nodes, d => d[this.options.linkKey]);
    const nodeSet = this.appendNodeGroup();
    this.node = nodeSet.merge(this.node);
  }
  loadData() {
    const { nodes, links } = this.handleNeoDataToD3Data(this.options.data);
    this.updateNodeAndLink(nodes, links);
  }
  handleNeoDataToD3Data(data) {
    const nodes = data.graph.nodes.map(d => Object.create(d));
    const relationships = data.graph.relationships;
    relationships.forEach(relationship => {
      const sameAll = relationships.filter(link => {
        return (
          (relationship.source === link.source &&
            relationship.target === link.target) ||
          (relationship.source === link.target &&
            relationship.target === link.source)
        );
      });
      sameAll
        .forEach((s, i) => {
          s.temp = {};
          s.temp.realIndex = i + 1;
          s.temp.totalNumber = sameAll.length;
          s.temp.halfNumber = s.temp.totalNumber / 2; // 关系数的一半
          s.temp.numberIsEven = s.temp.totalNumber % 2 !== 0; // 单数个点
          s.temp.isMiddle =
            s.temp.numberIsEven &&
            Math.ceil(s.temp.halfNumber) === s.temp.realIndex;
          s.temp.lowerThanHalfNumber = s.temp.realIndex <= s.temp.halfNumber; // 当前index是否小于关系数的一半
          s.temp.sweepDirection = 1;
          if (s.temp.lowerThanHalfNumber) {
            s.temp.mapIndex = s.temp.realIndex;
          } else {
            s.temp.isMaped = 1;
            s.temp.mapIndex = s.temp.realIndex - Math.ceil(s.temp.halfNumber);
          }
          if (
            (s.source > s.target && !s.temp.isMaped) ||
            (s.source < s.target && s.temp.isMaped)
          ) {
            s.temp.sweepDirection = 0;
          } else {
            s.temp.sweepDirection = 1;
          }
        });
    });
    var maxSame = Math.max(...relationships.map(d => d.temp.totalNumber));
    relationships.forEach(link => {
      link.temp.maxHalfNumber = Math.round(maxSame / 2);
    });
    const links = relationships
      .filter(d => {
        return d.source !== d.target;
      })
      .map(d => Object.create(d));
    return { nodes, links };
  }
  updateNodeAndLink(nodes, links) {
    this.updateLinks(links);
    this.updateNodes(nodes);
    this.simulation.nodes(this.nodes);
    this.simulation.force(
      "link",
      d3
        .forceLink(this.links)
        .id(d => d[this.options.linkKey])
        .distance(function() {
          return 200;
        })
    );
  }
  updateLinks(links) {
    // 增量的数据加入到数据集中
    this.links.push(...links);
    // 用数据集创建svg link的一个group
    this.link = this.linkSvg
      .selectAll("g.link")
      .data(this.links, d => d[this.options.linkKey]);
    const linkSet = this.appendLinkGroup();
    this.link = linkSet.link.merge(this.link);
    this.linkPath = this.linkSvg.selectAll(".path");
    this.linkPath = linkSet.linkPath.merge(this.linkPath);
    this.linkText = this.linkSvg.selectAll(".text");
    this.linkText = linkSet.linkText.merge(this.linkText);
  }
  // 固定node的位置
  stickNode(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  tickNode() {
    if (this.nodeSvg) {
      this.nodeSvg.selectAll("g.node").attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  }
  tickLink() {
    if (this.linkSvg) {
      this.tickLinkPath();
    }
  }
  tickLinkPath() {
    const _this = this;
    this.linkSvg.selectAll("g.link").each(function(relationship) {
      const rel = d3.select(this);
      const path = rel.select(".path");
      const text = rel.select(".textPath");
      path.attr("d", d => {   
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);   
        let arc = (dr * d.temp.maxHalfNumber) / d.temp.mapIndex;
        if (d.temp.isMiddle) {
          arc = 0;
        }
        return `M ${d.source.x} ${d.source.y} A ${arc} ${arc} 0 0 ${d.temp.sweepDirection} ${d.target.x} ${d.target.y}`;
      });

      text.attr("startOffset", d => (d.target.x > d.source.x ? "40%" : "40%"));
      text.text(d => {
        return _this.options.linkTextMap
          ? _this.options.linkTextMap[d[_this.options.linkTextKey]]
          : d[_this.options.linkTextKey];
      });
    });
  }
  tickRelationshipsTexts() {
    this.linkSvg.selectAll(".text").attr("transform", d => {
      const angle = (this.rotation(d.source, d.target) + 360) % 360;
      const mirror = angle > 90 && angle < 270;
      const center = { x: 0, y: 0 };
      const n = this.unitaryNormalVector(d.source, d.target);
      const nWeight = mirror ? 2 : -3;
      const point = {
        x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
        y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight
      };
      const rotatedPoint = this.rotatePoint(center, point, angle);
      return (
        "translate(" +
        rotatedPoint.x +
        ", " +
        rotatedPoint.y +
        ") rotate(" +
        (mirror ? 180 : 0) +
        ")"
      );
    });
  }
  color(type) {
    const scale = d3.scaleOrdinal(d3.schemeCategory10)
    return d => scale(d.type);
  }
  drag(simulation) {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
  mergeOption(options) {
    this.options = {
      ...this.options,
      ...options
    };
  }
}

export default holyNeo4j;
