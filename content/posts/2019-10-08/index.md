---
title: "数据库查询（一）"
date: 2019-10-08
author: "Guo"
tags: ["学习笔记", "数据库"]
comments: true
toc: true
---
所谓查询，就是对数据库中的数据进行检索，创建，修改或删除的特定请求。使用查询可以按照不同的方式查看，更改和分析数据。

<!-- more -->

## SELECT查询语法

SELECT语句的语法的语法格式如下：

SELECT{select_list [INTO new_table_name]}

FROM{table_list}

[WHERE {serch_conditions}]

[GROUP BY{group_by_list}]

[HAVING{serch_conditions}]

[ORDER BY {order_list[ASC|DESC]}]

DISTINCT:指定显示所有记录，但不包括重复行。

TOP n [PERCENT]:指定从查询结果中返回前n行或前百分之n行；

**例：**查询student表中的专业名称，过滤掉重复行。

`select distinct specialty from student`

**例：**查询course表中的前3行信息。

`select top3 * from course`

**例：**查询course表中前50%行的信息

select top 50percent * from course

改变查询结果中标题的显示可以用三种方法

1.在列表达式后面给出列名

2.用“=”连接列表达式

3.用AS关键字连接列表达式和指定的列名

### 选择查询

#### 使用关系表达式

比较运算符用于比较两个表达式的值，共有9个，它们是=（等于），<(小于) , <=（小于等于），>(大于)，>=(大于等于)，！<(不小于)，！>(不大于)，！=（不等于），<>(不等与)。

**例：**查询sc表中成绩大于等于60的学生的学号，姓名，成绩。

`selcet * from sc where score>=60;`

#### 使用逻辑表达式

逻辑运算符共有3个，它们是NOT,AND和OR。

- NOT:非，对表达式的否定。
- AND:与，连接多个条件，当所有条件都成立时为真。
- OR:或：连接多个条件，只要一个条件成立就为真。

#### 使用BETWEEN关键字

使用BETWEEN关键字可以更加方便地限制查询数据的范围。

其语法格式如下：

`表达式 [NOT] BETWEEN 表达式1 AND 表达式2`

**例：**查询sc表中成绩在80到90之间的学生的学号，课程号和成绩。

`select * from sc where score between 80 and 90`

#### 使用IN（属于）关键字

和BETWEEN关键字一样，IN的引入也是为了方便地限制检索数据的范围。

其语法格式如下：

`表达式[NOT] IN (表达式1，表达式2[,...,表达式n])`

**例：**查询student表中“计算机”和”通信“专业的学生的姓名，学号和专业。

`select sname,sno,specialty from student where specialty in("计算机"，“通信”)`

#### 使用LIKE关键字

使用LIKE关键字的查询又叫模糊查询，LIKE关键字的搜索与指定模式匹配的字符串，日期或时间值。

**例：**查询student表中所有姓张的学生信息。

`select * from student where sname like '张%'`

#### IS[NOT]NULL(是（否）为空)查询

在WHRER子句中不能使用比较运算符对空值进行判断，只能使用空值表达式来判断某个列值是否为空值。

其语法格式如下：

`表达式 IS[NOT] NULL`

**例：**查询表sc中所有成绩为空值的学生的学号，课程号和成绩。

`select * from where score is null`

#### 复合条件查询

在WHERE子句中可以使用逻辑运算符把若干个搜索条件合并起来，组成复杂的复合搜索条件，这些逻辑运算符包括AND，OR，NOT。

优先级：NOT>AND>OR

**例：**从student表中查询所有计算机和通信专业的女生的信息

`select * from student where sex='女' and (specialty='计算机' or specialty='通信')`

### 聚合函数查询

聚合函数可以把存储在数据库中的数据描述为一个整体而不是一行行孤立的记录，通过使用这些函数可以实现数据集合的汇总或是求平均值等运算。

**常用的聚合函数**

| 函数名        | 功能                                 |
| ------------- | ------------------------------------ |
| sum（列名）   | 对一个数字列求和                     |
| avg（列名）   | 对一个数字列计算平均值               |
| min（列名）   | 返回一个数字，字符串或日期列的最小值 |
| max（列名）   | 返回一个数字，字符串或日期列的最大值 |
| count（列名） | 返回一个列的数据项                   |
| count（*）    | 返回找到的行数                       |

在SELECT子句中可以使用聚合函数进行运算，运算结果作为新列出现在结果集中，但此列无列名。在聚合运算的表达式中可以包括列名，常量以及由算数运算符连接起来的函数

一般情况下可以在3个地方使用聚合函数，即SELECT子句，COMPUTE子句，HAVING子句。

**范:**查询sc表中成绩的平均值，平均值显示列标题为“平均成绩”

`select avg(score) as 平均成绩 from sc`

#### 分组和汇总

**分组查询**

使用聚合函数返回的是所有行数据的统计结果。如果需要按某一列数据的值进行分类，在分类的基础上再进行查询，就要使用GROUP BY 子句了。分组技术是指使用GROUP BY子句完成分组操作的技术。

GROUP BY子句的语法结构如下：

[GROUP BY{ALL} group_by_expression[,...n]]

[WITH{CUBE|ROLLUP}]]

在完成数据结果的查询和统计后，可以使用HAVING关键字对查询和统计的结果做进一步筛选。

**例：**在sc表中查询选修了两门及以上课程的学生的学号和选修课数。

`select sno,count(cno) 选修课程数 from sc group by sno having count(cno)>=2`

HAVING和WHERE子句的区别是：WHERE子句是对整表中数据筛选满足条件的行；而HAVING子句是对GROUP BY分组查询后产生的组加条件，筛选出满足条件的组。另外HAVING中的条件一般都使用聚合函数，WHERE中的条件不能使用聚合函数。

![加油](http://image.guohuaijian.com/timg.jpg)



