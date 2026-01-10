---
title: "👋 关于我"
description: "About Me"
---

## Hi，我是 Sloth

目前在一家网络安全公司做 Java 后端开发。

日常工作内容包括：写代码、看日志、查问题，  
以及在事情不太对劲的时候，反复确认——  
**这次到底是不是我的锅🍳**。

平时主要和 Java、Spring、数据库、Linux 打交道，  
也会参与一些数据安全相关的业务。  
说是“安全”，更多时候是在和各种边界、异常和不可控因素周旋。

💡 比起写出“看起来很厉害”的代码，  
我更在意它是不是足够稳定、是否方便后续的人接手，  
能不能顺利跑到下一个版本上线。

如果某个系统能安静地运行很久，  
不在半夜 🚨 把我叫醒，  
那在我这里，它已经算是一次相当成功的工程实践了。


---

## 技能栈概览

{{< chart >}}
type: 'bar',
data: {
labels: ['Java', 'Spring 全家桶', 'SQL/数据库', 'Redis', 'Linux'],
datasets: [{
label: '熟练度',
data: [95, 90, 85, 80, 75],
backgroundColor: [
'rgba(255, 99, 132, 0.7)',
'rgba(54, 162, 235, 0.7)',
'rgba(255, 206, 86, 0.7)',
'rgba(75, 192, 192, 0.7)',
'rgba(153, 102, 255, 0.7)'
]
}]
},
options: {
indexAxis: 'y',
plugins: {
legend: { display: false }
}
}
{{< /chart >}}

---

## 经历

{{< timeline >}}

{{% timelineItem icon="person-digging" header="后端开发工程师" badge="2020 - 至今" %}}
在网络安全行业从事 Java 企业级后端开发，主要参与：

- 企业内部系统与安全相关平台的设计与开发
- 核心业务模块的接口设计与性能优化
- 日常问题排查、代码重构与文档整理
  {{% /timelineItem %}}

{{% timelineItem icon="graduation-cap" header="网络工程专业" badge="2020" %}}
毕业于 **网络工程专业**。  
在校期间接触过网络与安全相关课程，也是在那时逐渐转向后端开发方向。
{{% /timelineItem %}}

{{< /timeline >}}

---

## 为什么要写这个博客

我记性不算好，  
很多当下想得很清楚的东西，过一段时间就会变模糊。

**好记性不如烂笔头，**<br/>
于是把这些内容写下来。

这里的内容，  
首先是写给 **未来的自己**，  
如果刚好也帮到了路过的你，那就更好了。

---

## 联系我

{{< button href="https://github.com/GuoHuaijian" target="_blank" >}}
{{< icon "github" >}} GitHub
{{< /button >}}

{{< button href="guohuaijian9527@gmail.com" >}}
{{< icon "email" >}} Email
{{< /button >}}

> 如果你在工作中遇到类似的问题，或者刚好对这些方向感兴趣，  
> 欢迎通过以上方式交流。

---

## 本站信息

{{< alert "circle-info" >}}
- 框架：Hugo
- 主题：Blowfish
- 部署：Cloudflare Pages

这里主要会记录：

- Java 后端开发与企业级项目实践
- 工作中解决过的问题与踩过的坑
- 一些关于方法论、工程实践和个人成长的笔记
  {{< /alert >}}
