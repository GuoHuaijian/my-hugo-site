import{_ as n,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/go-36/07 - 数组和切片.md","filePath":"books/go-36/07 - 数组和切片.md"}'),c={name:"books/go-36/07 - 数组和切片.md"};function o(l,s,t,i,d,r){return a(),p("div",null,[...s[0]||(s[0]=[e(`<p>从本篇文章开始，我们正式进入了模块2的学习。在这之前，我们已经聊了很多的Go语言和编程方面的基础知识，相信你已经对Go语言的开发环境配置、常用源码文件写法，以及程序实体（尤其是变量）及其相关的各种概念和编程技巧（比如类型推断、变量重声明、可重名变量、类型断言、类型转换、别名类型和潜在类型等）都有了一定的理解。</p><p>它们都是我认为的Go语言编程基础中比较重要的部分，同时也是后续文章的基石。如果你在后面的学习过程中感觉有些吃力，那可能是基础仍未牢固，可以再回去复习一下。</p><hr><p>我们这次主要讨论Go语言的数组（array）类型和切片（slice）类型。数组和切片有时候会让初学者感到困惑。</p><p>它们的共同点是都属于集合类的类型，并且，它们的值也都可以用来存储某一种类型的值（或者说元素）。</p><p>不过，它们最重要的不同是：<strong>数组类型的值（以下简称数组）的长度是固定的，而切片类型的值（以下简称切片）是可变长的。</strong></p><p>数组的长度在声明它的时候就必须给定，并且之后不会再改变。可以说，数组的长度是其类型的一部分。比如，<code>[1]string</code>和<code>[2]string</code>就是两个不同的数组类型。</p><p>而切片的类型字面量中只有元素的类型，而没有长度。切片的长度可以自动地随着其中元素数量的增长而增长，但不会随着元素数量的减少而减小。</p><p><img src="https://static001.geekbang.org/resource/image/ed/6c/edb5acaf595673e083cdcf1ea7bb966c.png?wh=1018%2A454" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>（数组与切片的字面量）</p><p>我们其实可以把切片看做是对数组的一层简单的封装，因为在每个切片的底层数据结构中，一定会包含一个数组。数组可以被叫做切片的底层数组，而切片也可以被看作是对数组的某个连续片段的引用。</p><blockquote><p>也正因为如此，Go语言的切片类型属于引用类型，同属引用类型的还有字典类型、通道类型、函数类型等；而Go语言的数组类型则属于值类型，同属值类型的有基础数据类型以及结构体类型。</p><p>注意，Go语言里不存在像Java等编程语言中令人困惑的“传值或传引用”问题。在Go语言中，我们判断所谓的“传值”或者“传引用”只要看被传递的值的类型就好了。</p><p>如果传递的值是引用类型的，那么就是“传引用”。如果传递的值是值类型的，那么就是“传值”。从传递成本的角度讲，引用类型的值往往要比值类型的值低很多。</p><p>我们在数组和切片之上都可以应用索引表达式，得到的都会是某个元素。我们在它们之上也都可以应用切片表达式，也都会得到一个新的切片。</p></blockquote><p>我们通过调用内建函数<code>len</code>，得到数组和切片的长度。通过调用内建函数<code>cap</code>，我们可以得到它们的容量。</p><p>但要注意，数组的容量永远等于其长度，都是不可变的。切片的容量却不是这样，并且它的变化是有规律可寻的。</p><p>下面我们就通过一道题来了解一下。<strong>我们今天的问题就是：怎样正确估算切片的长度和容量？</strong></p><p>为此，我编写了一个简单的命令源码文件demo15.go。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>package main</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import &quot;fmt&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>	// 示例1。</span></span>
<span class="line"><span>	s1 := make([]int, 5)</span></span>
<span class="line"><span>	fmt.Printf(&quot;The length of s1: %d\\n&quot;, len(s1))</span></span>
<span class="line"><span>	fmt.Printf(&quot;The capacity of s1: %d\\n&quot;, cap(s1))</span></span>
<span class="line"><span>	fmt.Printf(&quot;The value of s1: %d\\n&quot;, s1)</span></span>
<span class="line"><span>	s2 := make([]int, 5, 8)</span></span>
<span class="line"><span>	fmt.Printf(&quot;The length of s2: %d\\n&quot;, len(s2))</span></span>
<span class="line"><span>	fmt.Printf(&quot;The capacity of s2: %d\\n&quot;, cap(s2))</span></span>
<span class="line"><span>	fmt.Printf(&quot;The value of s2: %d\\n&quot;, s2)</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我描述一下它所做的事情。</p><p>首先，我用内建函数<code>make</code>声明了一个<code>[]int</code>类型的变量<code>s1</code>。我传给<code>make</code>函数的第二个参数是<code>5</code>，从而指明了该切片的长度。我用几乎同样的方式声明了切片<code>s2</code>，只不过多传入了一个参数<code>8</code>以指明该切片的容量。</p><p>现在，具体的问题是：切片<code>s1</code>和<code>s2</code>的容量都是多少？</p><p>这道题的典型回答：切片<code>s1</code>和<code>s2</code>的容量分别是<code>5</code>和<code>8</code>。</p><h2 id="问题解析" tabindex="-1">问题解析 <a class="header-anchor" href="#问题解析" aria-label="Permalink to &quot;问题解析&quot;">&amp;ZeroWidthSpace;</a></h2><p>解析一下这道题。<code>s1</code>的容量为什么是<code>5</code>呢？因为我在声明<code>s1</code>的时候把它的长度设置成了<code>5</code>。当我们用<code>make</code>函数初始化切片时，如果不指明其容量，那么它就会和长度一致。如果在初始化时指明了容量，那么切片的实际容量也就是它了。这也正是<code>s2</code>的容量是<code>8</code>的原因。</p><p>我们顺便通过<code>s2</code>再来明确下长度、容量以及它们的关系。我在初始化<code>s2</code>代表的切片时，同时也指定了它的长度和容量。</p><p>我在刚才说过，可以把切片看做是对数组的一层简单的封装，因为在每个切片的底层数据结构中，一定会包含一个数组。数组可以被叫做切片的底层数组，而切片也可以被看作是对数组的某个连续片段的引用。</p><p>在这种情况下，切片的容量实际上代表了它的底层数组的长度，这里是<code>8</code>。（注意，切片的底层数组等同于我们前面讲到的数组，其长度不可变。）</p><p>现在你需要跟着我一起想象：<strong>有一个窗口，你可以通过这个窗口看到一个数组，但是不一定能看到该数组中的所有元素，有时候只能看到连续的一部分元素。</strong></p><p>现在，这个数组就是切片<code>s2</code>的底层数组，而这个窗口就是切片<code>s2</code>本身。<code>s2</code>的长度实际上指明的就是这个窗口的宽度，决定了你透过<code>s2</code>，可以看到其底层数组中的哪几个连续的元素。</p><p>由于<code>s2</code>的长度是<code>5</code>，所以你可以看到底层数组中的第1个元素到第5个元素，对应的底层数组的索引范围是[0, 4]。</p><p>切片代表的窗口也会被划分成一个一个的小格子，就像我们家里的窗户那样。每个小格子都对应着其底层数组中的某一个元素。</p><p>我们继续拿<code>s2</code>为例，这个窗口最左边的那个小格子对应的正好是其底层数组中的第一个元素，即索引为<code>0</code>的那个元素。因此可以说，<code>s2</code>中的索引从<code>0</code>到<code>4</code>所指向的元素恰恰就是其底层数组中索引从<code>0</code>到<code>4</code>代表的那5个元素。</p><p>请记住，当我们用<code>make</code>函数或切片值字面量（比如<code>[]int{1, 2, 3}</code>）初始化一个切片时，该窗口最左边的那个小格子总是会对应其底层数组中的第1个元素。</p><p>但是当我们通过切片表达式基于某个数组或切片生成新切片的时候，情况就变得复杂起来了。</p><p><strong>我们再来看一个例子：</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>s3 := []int{1, 2, 3, 4, 5, 6, 7, 8}</span></span>
<span class="line"><span>s4 := s3[3:6]</span></span>
<span class="line"><span>fmt.Printf(&quot;The length of s4: %d\\n&quot;, len(s4))</span></span>
<span class="line"><span>fmt.Printf(&quot;The capacity of s4: %d\\n&quot;, cap(s4))</span></span>
<span class="line"><span>fmt.Printf(&quot;The value of s4: %d\\n&quot;, s4)</span></span></code></pre></div><p>切片<code>s3</code>中有8个元素，分别是从<code>1</code>到<code>8</code>的整数。<code>s3</code>的长度和容量都是<code>8</code>。然后，我用切片表达式<code>s3[3:6]</code>初始化了切片<code>s4</code>。问题是，这个<code>s4</code>的长度和容量分别是多少？</p><p>这并不难，用减法就可以搞定。首先你要知道，切片表达式中的方括号里的那两个整数都代表什么。我换一种表达方式你也许就清楚了，即：[3, 6)。</p><p>这是数学中的区间表示法，常用于表示取值范围，我其实已经在本专栏用过好几次了。由此可知，<code>[3:6]</code>要表达的就是透过新窗口能看到的<code>s3</code>中元素的索引范围是从<code>3</code>到<code>5</code>（注意，不包括<code>6</code>）。</p><p>这里的<code>3</code>可被称为起始索引，<code>6</code>可被称为结束索引。那么<code>s4</code>的长度就是<code>6</code>减去<code>3</code>，即<code>3</code>。因此可以说，<code>s4</code>中的索引从<code>0</code>到<code>2</code>指向的元素对应的是<code>s3</code>及其底层数组中索引从<code>3</code>到<code>5</code>的那3个元素。</p><p><img src="https://static001.geekbang.org/resource/image/96/55/96e2c7129793ee5e73a574ef8f3ad755.png?wh=1364%2A783" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>（切片与数组的关系）</p><p>再来看容量。我在前面说过，切片的容量代表了它的底层数组的长度，但这仅限于使用<code>make</code>函数或者切片值字面量初始化切片的情况。</p><p>更通用的规则是：一个切片的容量可以被看作是透过这个窗口最多可以看到的底层数组中元素的个数。</p><p>由于<code>s4</code>是通过在<code>s3</code>上施加切片操作得来的，所以<code>s3</code>的底层数组就是<code>s4</code>的底层数组。</p><p>又因为，在底层数组不变的情况下，切片代表的窗口可以向右扩展，直至其底层数组的末尾。</p><p>所以，<code>s4</code>的容量就是其底层数组的长度<code>8</code>,减去上述切片表达式中的那个起始索引<code>3</code>，即<code>5</code>。</p><p>注意，切片代表的窗口是无法向左扩展的。也就是说，我们永远无法透过<code>s4</code>看到<code>s3</code>中最左边的那3个元素。</p><p>最后，顺便提一下把切片的窗口向右扩展到最大的方法。对于<code>s4</code>来说，切片表达式<code>s4[0:cap(s4)]</code>就可以做到。我想你应该能看懂。该表达式的结果值（即一个新的切片）会是<code>[]int{4, 5, 6, 7, 8}</code>，其长度和容量都是<code>5</code>。</p><h2 id="知识扩展" tabindex="-1">知识扩展 <a class="header-anchor" href="#知识扩展" aria-label="Permalink to &quot;知识扩展&quot;">&amp;ZeroWidthSpace;</a></h2><p><strong>问题1：怎样估算切片容量的增长？</strong></p><p>一旦一个切片无法容纳更多的元素，Go语言就会想办法扩容。但它并不会改变原来的切片，而是会生成一个容量更大的切片，然后将把原有的元素和新元素一并拷贝到新切片中。在一般的情况下，你可以简单地认为新切片的容量（以下简称新容量）将会是原切片容量（以下简称原容量）的2倍。</p><p>但是，当原切片的长度（以下简称原长度）大于或等于<code>1024</code>时，Go语言将会以原容量的<code>1.25</code>倍作为新容量的基准（以下新容量基准）。新容量基准会被调整（不断地与<code>1.25</code>相乘），直到结果不小于原长度与要追加的元素数量之和（以下简称新长度）。最终，新容量往往会比新长度大一些，当然，相等也是可能的。</p><p>另外，如果我们一次追加的元素过多，以至于使新长度比原容量的2倍还要大，那么新容量就会以新长度为基准。注意，与前面那种情况一样，最终的新容量在很多时候都要比新容量基准更大一些。更多细节可参见<code>runtime</code>包中slice.go文件里的<code>growslice</code>及相关函数的具体实现。</p><p>我把展示上述扩容策略的一些例子都放到了demo16.go文件中。你可以去试运行看看。</p><p><strong>问题 2：切片的底层数组什么时候会被替换？</strong></p><p>确切地说，一个切片的底层数组永远不会被替换。为什么？虽然在扩容的时候Go语言一定会生成新的底层数组，但是它也同时生成了新的切片。</p><p>它只是把新的切片作为了新底层数组的窗口，而没有对原切片，及其底层数组做任何改动。</p><p>请记住，在无需扩容时，<code>append</code>函数返回的是指向原底层数组的原切片，而在需要扩容时，<code>append</code>函数返回的是指向新底层数组的新切片。所以，严格来讲，“扩容”这个词用在这里虽然形象但并不合适。不过鉴于这种称呼已经用得很广泛了，我们也没必要另找新词了。</p><p>顺便说一下，只要新长度不会超过切片的原容量，那么使用<code>append</code>函数对其追加元素的时候就不会引起扩容。这只会使紧邻切片窗口右边的（底层数组中的）元素被新的元素替换掉。你可以运行demo17.go文件以增强对这些知识的理解。</p><p><strong>总结</strong></p><p>总结一下，我们今天一起探讨了数组和切片以及它们之间的关系。切片是基于数组的，可变长的，并且非常轻快。一个切片的容量总是固定的，而且一个切片也只会与某一个底层数组绑定在一起。</p><p>此外，切片的容量总会是在切片长度和底层数组长度之间的某一个值，并且还与切片窗口最左边对应的元素在底层数组中的位置有关系。那两个分别用减法计算切片长度和容量的方法你一定要记住。</p><p>另外，如果新的长度比原有切片的容量还要大，那么底层数组就一定会是新的，而且<code>append</code>函数也会返回一个新的切片。还有，你其实不必太在意切片“扩容”策略中的一些细节，只要能够理解它的基本规律并可以进行近似的估算就可以了。</p><p><strong>思考题</strong></p><p>这里仍然是聚焦于切片的问题。</p><ol><li>如果有多个切片指向了同一个底层数组，那么你认为应该注意些什么？</li><li>怎样沿用“扩容”的思想对切片进行“缩容”？请写出代码。</li></ol><p>这两个问题都是开放性的，你需要认真思考一下。最好在动脑的同时动动手。</p><p><a href="https://github.com/hyper0x/Golang_Puzzlers" target="_blank" rel="noreferrer">戳此查看Go语言专栏文章配套详细代码。</a> 精选留言（15） Nuzar 👍（44） 💬（5）老师的行文用字非常好，不用改！2019-02-22小小笑儿 👍（71） 💬（1）切片缩容之后还是会引用底层的原数组，这有时候会造成大量缩容之后的多余内容没有被垃圾回收。可以使用新建一个数组然后copy的方式。2018-08-29许大 👍（69） 💬（5）老师 go中 make和new 有什么区别2019-08-28传说中的成大大 👍（23） 💬（4）首先总结今天课程内容</p><ol><li><p>数组和切片的区别与联系 1.1数组是有长度的并且长度是类型的组成部分之一 所以[1]string!=[2]string 长度固定不可变 1.2切片实际上是对底层数组的一层封装，通过切片的容量和长度 我们可以访问到底层数组中对应的元素, 1.2.1如果切片是从底层数组下标为0处开始引用 那个切片的第一个元素(下标为0时)引用的是数组下标为0的元素 1.2.2如果切片是从底层数组下标为3处开始引用那么切片的第一个元素(下标为0时)引用的是数组下标为3的元素</p></li><li><p>数组和切片的共同点 它们都是集合类型</p></li><li><p>值传递和引用传递 如果实参是值类型 就是值传递 如果实参为引用类型则是引用传递 一般来说引用传递更快更好 go语言中值类型 : 数组，和内置的数据类型 以及结构体 go语言中引用类型: 切片(slice) 字典(map) 通道(channel) 函数(func) 是引用类型 引用类型一般使用make创建和初始化</p></li><li><p>关于切片长度和容量的计算 切片长度一般是对底层数组的引用范围 比如s1=s2[3:6] [3,6)引用范围为3-5所以长度为6-3=3，但是切片可以向右扩展而不能向左扩展 所以 s1的容量就 = s2的容量-3 3是对数组引用的起始下标 6是对数组引用的结束下标</p></li><li><p>关于append和切片扩容 一般使用append对切片进行追加元素 分为以下两种情况</p></li><li><p>追加过后元素长度小于容量 append返回原切片</p></li><li><p>追加过后元素长度超过了容量 2.1 如果长度小于1024 则扩容机制为 新切片容量 = 原切片容量<em>2 返回新切片地址 2.2 如果长度大于1024 则扩容机制为 新切片容量 = 原切片容量</em>1.25 返回 新切片地址 2.3 如果要追加的元素过多 比切片容量的两倍还多 则再进行前面 2.1 2.2的操作 重点 因为切片必定引用一个底层数组 所以数组也不会是原来的数组了</p></li><li><p>切片的缩容 回答到思考题当中 思考题答案</p></li><li><p>如果多个切片引用到同一个数组应该注意什么 这个问题 就像并发问题 多个线程同时操作一块内存区域 所以要注意的是 读写顺序 及读写过后的更新问题 避免本来想读老数据 却被另外一个切片给写入数据了</p></li><li><p>切片缩容问题 其实可以反向思考 扩容问题 当切片的容量小于等于一定比例后 有大量的空间被浪费 所以新弄一个新切片 容量为原切片按比列缩小 并返回新的切片 代码 等有空了再补上2020-03-03传说中的成大大 👍（13） 💬（2）回答追问，旧的切片，无论是扩容或者缩容都会有老的切片释放出来，这个时候应该是被回收了！不然肯定会内存泄露的2020-03-03Wei Yongchao 👍（8） 💬（2）我的这段代码： s := make([]int, 0) fmt.Printf(&quot;len(s) = %d, cap(s)=%d, addr=%p\\n&quot;, len(s), cap(s), s) for i := 1; i &lt;= 10; i++{ s = append(s, 1)</p><pre><code> fmt.Printf(&amp;quot;i:%d, len(s) = %d, cap(s)=%d, addr=%p\\n&amp;quot;, i, len(s), cap(s), s)
</code></pre><p>} 输出如下： len(s) = 0, cap(s)=0, addr=0x6d0e70 i:1, len(s) = 1, cap(s)=1, addr=0xc00000a0d0 i:2, len(s) = 2, cap(s)=2, addr=0xc00000a0e0 i:3, len(s) = 3, cap(s)=4, addr=0xc0000103a0 i:4, len(s) = 4, cap(s)=4, addr=0xc0000103a0 i:5, len(s) = 5, cap(s)=8, addr=0xc00000e2c0 i:6, len(s) = 6, cap(s)=8, addr=0xc00000e2c0 i:7, len(s) = 7, cap(s)=8, addr=0xc00000e2c0 i:8, len(s) = 8, cap(s)=8, addr=0xc00000e2c0 i:9, len(s) = 9, cap(s)=16, addr=0xc000078000 i:10, len(s) = 10, cap(s)=16, addr=0xc000078000</p></li></ol><p>他在i=3, 4和i=5, 6, 7, 8的时候没有扩容。但，看样子返回的还是以前的切片？2020-12-01wjq310 👍（6） 💬（1）老师，请问下demo16.go的示例三的几个cap值是怎么来的？看这后面的值，不像是2的指数倍。更奇怪的是，我在不同的地方运行（比如把代码贴到https://golang.org/go）得到的结果还不一样，不知道为什么，麻烦帮忙解答一下，感谢了2018-08-28mateye 👍（4） 💬（1） 老师您好，就像您说的，切片赋值的话会，如果完全赋值，会指向相同的底层数组， s1 :=[]int{1,2,3,4} s2 := s1[0:4] 就像这样，这样的话改变s2会影响s1，如何消除这种影响呢2018-08-30Spike 👍（4） 💬（2）slices are not passed by reference, nothing is passed by reference in go. Everything is a copy, every assignment, every parameter to a function, there are no exceptions to this rule. 这是Dave Cheney的原话 slice不是指针也不是引用 希望作者参考下https://dave.cheney.net/2018/07/12/slices-from-the-ground-up 这篇博文2018-08-28Bruce Lee 👍（3） 💬（3）老师您好 demo16的例子</p><p>s8b := append(s8a, make([]int, 23)...) fmt.Printf(&quot;s8b: len: %d, cap: %d\\n&quot;, len(s8b), cap(s8b)) s8c := append(s8b, make([]int, 45)...) fmt.Printf(&quot;s8c: len: %d, cap: %d\\n&quot;, len(s8c), cap(s8c))</p><p>根据分析应该输出 s8b: len: 44, cap: 44 s8c: len: 89, cap: 89</p><p>实际输出 s8b: len: 44, cap: 44 s8c: len: 89, cap: 96</p><p>没有明白 希望老师能解答</p><div class="language-2021-03-18许森森 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">2021-03-18许森森</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>2生成新的slice</span></span>
<span class="line highlighted"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>	s1 := []int{1,2,3,4,5}</span></span>
<span class="line"><span>	printSlice(&amp;quot;s1&amp;quot;, s1)</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>	s1 = shrinkSlice(s1)</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>	printSlice(&amp;quot;s1&amp;quot;, s1)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func shrinkSlice(x []int) []int{</span></span>
<span class="line"><span>	if( cap(x) &amp;gt; 0 ) {</span></span>
<span class="line"><span>		x = x[0:cap(x)-1]</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	return x</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func printSlice(s string, x []int) {</span></span>
<span class="line"><span>	fmt.Printf(&amp;quot;%s len=%d cap=%d %v\\n&amp;quot;,</span></span>
<span class="line"><span>		s, len(x), cap(x), x)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>输出结果</span></span>
<span class="line"><span>s1 len=5 cap=5 [1 2 3 4 5]</span></span>
<span class="line"><span>s1 len=4 cap=5 [1 2 3 4]2018-08-28咸鱼三月° 👍（2） 💬（2）老师你好我在自己练手的时候有一些疑惑</span></span>
<span class="line"><span>&amp;#47;&amp;#47;BubbleSort 示例1 传数组的指针类型</span></span>
<span class="line"><span>&amp;#47;**</span></span>
<span class="line"><span>冒泡排序</span></span>
<span class="line"><span>*&amp;#47;</span></span>
<span class="line"><span>func BubbleSort(arr *[10]int) {</span></span>
<span class="line"><span>	a:=arr</span></span>
<span class="line"><span>	for i := 0; i &amp;lt; len(a)-1; i++ {</span></span>
<span class="line"><span>		for j := 0; j &amp;lt; len(a)-i-1; j++ {</span></span>
<span class="line"><span>			if a[j] &amp;gt; a[j+1] {</span></span>
<span class="line"><span>				tem:= a[j]</span></span>
<span class="line"><span>				a[j]=a[j+1]</span></span>
<span class="line"><span>				a[j+1]=tem</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	fmt.Println(arr)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&amp;#47;&amp;#47;BubbleSort 示例2 传切片的指针类型</span></span>
<span class="line"><span>&amp;#47;**</span></span>
<span class="line"><span>冒泡排序</span></span>
<span class="line"><span>*&amp;#47;</span></span>
<span class="line"><span>func BubbleSort(arr *[]int) {</span></span>
<span class="line"><span>	a:=arr</span></span>
<span class="line"><span>	for i := 0; i &amp;lt; len(a)-1; i++ {</span></span>
<span class="line"><span>		for j := 0; j &amp;lt; len(a)-i-1; j++ {</span></span>
<span class="line"><span>			if a[j] &amp;gt; a[j+1] {</span></span>
<span class="line"><span>				tem:= a[j]</span></span>
<span class="line"><span>				a[j]=a[j+1]</span></span>
<span class="line"><span>				a[j+1]=tem</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	fmt.Println(arr)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>为什么切片的指针类型取下标时编译器会提示语法错误呢，但是数组的指针类型取下标并不会提示语法错误，这一款让我感到疑惑 希望老师能够帮忙解答一下2021-09-05cameron 👍（2） 💬（2）数组是集合类型吗2019-08-15Action 👍（2） 💬（3）老师您好！我对源码demo16中示例1、3实际运行结果与预期结果表示ok，但唯独示例2的运行结果觉得没有什么规则可供参考，为何不是下面我预期的结果呢，对于实际的运行结果表示不理解，还烦请老师有空帮忙解答下，感谢！</span></span>
<span class="line"><span></span></span>
<span class="line"><span>代码如下：</span></span>
<span class="line"><span>&amp;#47;&amp;#47; 示例2</span></span>
<span class="line"><span>s7 := make([]int, 1024)</span></span>
<span class="line"><span>fmt.Printf(&amp;quot;The capacity of s7: %d\\n&amp;quot;, cap(s7))</span></span>
<span class="line"><span>s7e1 := append(s7, make([]int, 200)...)</span></span>
<span class="line"><span>fmt.Printf(&amp;quot;s7e1: len: %d, cap: %d\\n&amp;quot;, len(s7e1), cap(s7e1))</span></span>
<span class="line"><span>s7e2 := append(s7, make([]int, 400)...)</span></span>
<span class="line"><span>fmt.Printf(&amp;quot;s7e2: len: %d, cap: %d\\n&amp;quot;, len(s7e2), cap(s7e2))</span></span>
<span class="line"><span>s7e3 := append(s7, make([]int, 600)...)</span></span>
<span class="line"><span>fmt.Printf(&amp;quot;s7e3: len: %d, cap: %d\\n&amp;quot;, len(s7e3), cap(s7e3))</span></span>
<span class="line"><span>fmt.Println()</span></span>
<span class="line"><span>实际运行结果：</span></span>
<span class="line"><span>The capacity of s7: 1024</span></span>
<span class="line"><span>s7e1: len: 1224, cap: 1280</span></span>
<span class="line"><span>s7e2: len: 1424, cap: 1696</span></span>
<span class="line"><span>s7e3: len: 1624, cap: 2048</span></span>
<span class="line"><span></span></span>
<span class="line"><span>预期运行结果：</span></span>
<span class="line"><span>The capacity of s7: 1024</span></span>
<span class="line"><span>s7e1: len: 1224, cap: 1280</span></span>
<span class="line"><span>s7e2: len: 1424, cap: 1600</span></span>
<span class="line"><span>s7e3: len: 1624, cap: 20002018-11-02高并发 👍（1） 💬（1）老师我想问一下指针类型是属于引用类型还是值类型2023-03-08</span></span></code></pre></div>`,75)])])}const f=n(c,[["render",o]]);export{u as __pageData,f as default};
