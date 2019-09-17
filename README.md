# Neo4jForceMap

## 介绍
基于d3-force，将Neo4j数据可视化。

## 特点
* 不同类型的节点有不同的颜色
* 节点和关系线均有选中样式
* 节点拖拽固定
* 动态增加节点和关系
* 两个节点之前的多关系
* 平移和缩放

## 使用文档

### 安装
```js
npm install holy-relationship-map --save
```

### 使用
```js
import HolyRelationshipMap from "holy-relationship-map "
const graph = new HolyRelationshipMap(".forceMap", options)
```

### 文档
**options**
| 参数 | 类型 | 描述 |默认值|
| --------- | ---- | ----------- |------- |
| nodeRadius | number | 节点的半径 |16|
| arrowSize | number | 关系指向箭头的大小 |10|
| nodeTextKey | string | 节点的文本key |label|
| nodeTextSize | number | 节点文本的字体大小 |14|
| nodeTextColor | string | 节点文本的颜色 |#333|
| linkKey | string | 关系中的source和target值对应节点数据中的哪个key的值 |id|
| linkTextKey | string | 关系文本key |type|
| linkTextMap | string | 关系文本的映射表，即linkTextMap[linkTextKey]才是需要渲染的文本 |无|
| linkTextSize | number | 关系文本字体大小 |12|
| linkTextColor | string | 关系文本的颜色 |#333|
| linkColor | string | 关系线的颜色 |#a5abb6|
| linkHighlightColor | string | 关系高亮时文本key |#66b1ff|
| data | object | 图谱数据，拥有nodes数组和links数组，必填。 |无|
| onNodeClick | function | 节点左键点击事件。 |无|
| onNodeDBClick | function | 节点双击事件。 |无|
| onNodeMouseenter | function | 节点鼠标移入事件。 |无|
| onNodeMouseleave | function | 节点鼠标移出事件。 |无|
| onLinkClick | function | 关系连线点击事件。 |无|

## 注意
* 不同类型的节点是通过node对象上的type:number决定的，现在仅支持最多六种颜色（即type的取值范围为[1,6]），后续会增加更多配色/类型。

## 例子
```html
<div class="forceMap"></div>
```
```js
const data = {
    nodes: [
        {
            id: 1,
            properties: {},
            type: 1,
            label: "魏无羡"
        },
        {
            id: 2,
            properties: {},
            type: 1,
            label: "江澄"
        },
        ...
    ]，
    links:[
        {
            id: 1,
            source: 1,
            target: 2,
            type: "对不起我食言了",
            properties: {}
        },
        {
            id: 2,
            source: 2,
            target: 1,
            type: "我做你的家主",
            properties: {}
        },
        ...
    ]
}
```
```js
const svg = new HolyNeo4j(".forceMap", {
    data,
    onNodeClick: d => {
        if (!isPanelShow) {
            isPanelShow = true;
        }
        property = { ...d.properties };
    },
    // onNodeDBClick: d => {
    //   getMoreData();
    // },
    onLinkClick: d => {
        if (!isPanelShow) {
           isPanelShow = true;
        }
        property = { ...d.properties };
    }
});
```
![image.png](https://i.loli.net/2019/09/17/LjIx2HMQfFrcdAO.png)


