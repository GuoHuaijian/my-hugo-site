import{_ as n,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/67 - 迭代器模式（下）：如何设计实现一个支持“快照”功能的iterator？.md","filePath":"books/design-pattern/67 - 迭代器模式（下）：如何设计实现一个支持“快照”功能的iterator？.md"}'),l={name:"books/design-pattern/67 - 迭代器模式（下）：如何设计实现一个支持“快照”功能的iterator？.md"};function t(i,s,r,c,o,m){return a(),p("div",null,[...s[0]||(s[0]=[e(`<p>上两节课，我们学习了迭代器模式的原理、实现，并且分析了在遍历集合的同时增删集合元素，产生不可预期结果的原因以及应对策略。</p><p>今天，我们再来看这样一个问题：如何实现一个支持“快照”功能的迭代器？这个问题算是对上一节课内容的延伸思考，为的是帮你加深对迭代器模式的理解，也是对你分析、解决问题的一种锻炼。你可以把它当作一个面试题或者练习题，在看我的讲解之前，先试一试自己能否顺利回答上来。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="问题描述" tabindex="-1">问题描述 <a class="header-anchor" href="#问题描述" aria-label="Permalink to &quot;问题描述&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们先来介绍一下问题的背景：如何实现一个支持“快照”功能的迭代器模式？</p><p>理解这个问题最关键的是理解“快照”两个字。所谓“快照”，指我们为容器创建迭代器的时候，相当于给容器拍了一张快照（Snapshot）。之后即便我们增删容器中的元素，快照中的元素并不会做相应的改动。而迭代器遍历的对象是快照而非容器，这样就避免了在使用迭代器遍历的过程中，增删容器中的元素，导致的不可预期的结果或者报错。</p><p>接下来，我举一个例子来解释一下上面这段话。具体的代码如下所示。容器list中初始存储了3、8、2三个元素。尽管在创建迭代器iter1之后，容器list删除了元素3，只剩下8、2两个元素，但是，通过iter1遍历的对象是快照，而非容器list本身。所以，遍历的结果仍然是3、8、2。同理，iter2、iter3也是在各自的快照上遍历，输出的结果如代码中注释所示。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>List&lt;Integer&gt; list = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>list.add(3);</span></span>
<span class="line"><span>list.add(8);</span></span>
<span class="line"><span>list.add(2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Iterator&lt;Integer&gt; iter1 = list.iterator();//snapshot: 3, 8, 2</span></span>
<span class="line"><span>list.remove(new Integer(2));//list：3, 8</span></span>
<span class="line"><span>Iterator&lt;Integer&gt; iter2 = list.iterator();//snapshot: 3, 8</span></span>
<span class="line"><span>list.remove(new Integer(3));//list：8</span></span>
<span class="line"><span>Iterator&lt;Integer&gt; iter3 = list.iterator();//snapshot: 3</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 输出结果：3 8 2</span></span>
<span class="line"><span>while (iter1.hasNext()) {</span></span>
<span class="line"><span>  System.out.print(iter1.next() + &quot; &quot;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>System.out.println();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 输出结果：3 8</span></span>
<span class="line"><span>while (iter2.hasNext()) {</span></span>
<span class="line"><span>  System.out.print(iter1.next() + &quot; &quot;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>System.out.println();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 输出结果：8</span></span>
<span class="line"><span>while (iter3.hasNext()) {</span></span>
<span class="line"><span>  System.out.print(iter1.next() + &quot; &quot;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>System.out.println();</span></span></code></pre></div><p>如果由你来实现上面的功能，你会如何来做呢？下面是针对这个功能需求的骨架代码，其中包含ArrayList、SnapshotArrayIterator两个类。对于这两个类，我只定义了必须的几个关键接口，完整的代码实现我并没有给出。你可以试着去完善一下，然后再看我下面的讲解。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public ArrayList&lt;E&gt; implements List&lt;E&gt; {</span></span>
<span class="line"><span>  // TODO: 成员变量、私有函数等随便你定义</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void add(E obj) {</span></span>
<span class="line"><span>    //TODO: 由你来完善</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void remove(E obj) {</span></span>
<span class="line"><span>    // TODO: 由你来完善</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Iterator&lt;E&gt; iterator() {</span></span>
<span class="line"><span>    return new SnapshotArrayIterator(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class SnapshotArrayIterator&lt;E&gt; implements Iterator&lt;E&gt; {</span></span>
<span class="line"><span>  // TODO: 成员变量、私有函数等随便你定义</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean hasNext() {</span></span>
<span class="line"><span>    // TODO: 由你来完善</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public E next() {//返回当前元素，并且游标后移一位</span></span>
<span class="line"><span>    // TODO: 由你来完善</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="解决方案一" tabindex="-1">解决方案一 <a class="header-anchor" href="#解决方案一" aria-label="Permalink to &quot;解决方案一&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们先来看最简单的一种解决办法。在迭代器类中定义一个成员变量snapshot来存储快照。每当创建迭代器的时候，都拷贝一份容器中的元素到快照中，后续的遍历操作都基于这个迭代器自己持有的快照来进行。具体的代码实现如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SnapshotArrayIterator&lt;E&gt; implements Iterator&lt;E&gt; {</span></span>
<span class="line"><span>  private int cursor;</span></span>
<span class="line"><span>  private ArrayList&lt;E&gt; snapshot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SnapshotArrayIterator(ArrayList&lt;E&gt; arrayList) {</span></span>
<span class="line"><span>    this.cursor = 0;</span></span>
<span class="line"><span>    this.snapshot = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>    this.snapshot.addAll(arrayList);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean hasNext() {</span></span>
<span class="line"><span>    return cursor &lt; snapshot.size();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public E next() {</span></span>
<span class="line"><span>    E currentItem = snapshot.get(cursor);</span></span>
<span class="line"><span>    cursor++;</span></span>
<span class="line"><span>    return currentItem;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这个解决方案虽然简单，但代价也有点高。每次创建迭代器的时候，都要拷贝一份数据到快照中，会增加内存的消耗。如果一个容器同时有多个迭代器在遍历元素，就会导致数据在内存中重复存储多份。不过，庆幸的是，Java中的拷贝属于浅拷贝，也就是说，容器中的对象并非真的拷贝了多份，而只是拷贝了对象的引用而已。关于深拷贝、浅拷贝，我们在<a href="https://time.geekbang.org/column/article/200786" target="_blank" rel="noreferrer">第47讲</a>中有详细的讲解，你可以回过头去再看一下。</p><p>那有没有什么方法，既可以支持快照，又不需要拷贝容器呢？</p><h2 id="解决方案二" tabindex="-1">解决方案二 <a class="header-anchor" href="#解决方案二" aria-label="Permalink to &quot;解决方案二&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们再来看第二种解决方案。</p><p>我们可以在容器中，为每个元素保存两个时间戳，一个是添加时间戳addTimestamp，一个是删除时间戳delTimestamp。当元素被加入到集合中的时候，我们将addTimestamp设置为当前时间，将delTimestamp设置成最大长整型值（Long.MAX_VALUE）。当元素被删除时，我们将delTimestamp更新为当前时间，表示已经被删除。</p><p>注意，这里只是标记删除，而非真正将它从容器中删除。</p><p>同时，每个迭代器也保存一个迭代器创建时间戳snapshotTimestamp，也就是迭代器对应的快照的创建时间戳。当使用迭代器来遍历容器的时候，只有满足addTimestamp&lt;snapshotTimestamp&lt;delTimestamp的元素，才是属于这个迭代器的快照。</p><p>如果元素的addTimestamp&gt;snapshotTimestamp，说明元素在创建了迭代器之后才加入的，不属于这个迭代器的快照；如果元素的delTimestamp&lt;snapshotTimestamp，说明元素在创建迭代器之前就被删除掉了，也不属于这个迭代器的快照。</p><p>这样就在不拷贝容器的情况下，在容器本身上借助时间戳实现了快照功能。具体的代码实现如下所示。注意，我们没有考虑ArrayList的扩容问题，感兴趣的话，你可以自己完善一下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ArrayList&lt;E&gt; implements List&lt;E&gt; {</span></span>
<span class="line"><span>  private static final int DEFAULT_CAPACITY = 10;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private int actualSize; //不包含标记删除元素</span></span>
<span class="line"><span>  private int totalSize; //包含标记删除元素</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private Object[] elements;</span></span>
<span class="line"><span>  private long[] addTimestamps;</span></span>
<span class="line"><span>  private long[] delTimestamps;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public ArrayList() {</span></span>
<span class="line"><span>    this.elements = new Object[DEFAULT_CAPACITY];</span></span>
<span class="line"><span>    this.addTimestamps = new long[DEFAULT_CAPACITY];</span></span>
<span class="line"><span>    this.delTimestamps = new long[DEFAULT_CAPACITY];</span></span>
<span class="line"><span>    this.totalSize = 0;</span></span>
<span class="line"><span>    this.actualSize = 0;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void add(E obj) {</span></span>
<span class="line"><span>    elements[totalSize] = obj;</span></span>
<span class="line"><span>    addTimestamps[totalSize] = System.currentTimeMillis();</span></span>
<span class="line"><span>    delTimestamps[totalSize] = Long.MAX_VALUE;</span></span>
<span class="line"><span>    totalSize++;</span></span>
<span class="line"><span>    actualSize++;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void remove(E obj) {</span></span>
<span class="line"><span>    for (int i = 0; i &lt; totalSize; ++i) {</span></span>
<span class="line"><span>      if (elements[i].equals(obj)) {</span></span>
<span class="line"><span>        delTimestamps[i] = System.currentTimeMillis();</span></span>
<span class="line"><span>        actualSize--;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int actualSize() {</span></span>
<span class="line"><span>    return this.actualSize;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int totalSize() {</span></span>
<span class="line"><span>    return this.totalSize;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public E get(int i) {</span></span>
<span class="line"><span>    if (i &gt;= totalSize) {</span></span>
<span class="line"><span>      throw new IndexOutOfBoundsException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return (E)elements[i];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public long getAddTimestamp(int i) {</span></span>
<span class="line"><span>    if (i &gt;= totalSize) {</span></span>
<span class="line"><span>      throw new IndexOutOfBoundsException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return addTimestamps[i];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public long getDelTimestamp(int i) {</span></span>
<span class="line"><span>    if (i &gt;= totalSize) {</span></span>
<span class="line"><span>      throw new IndexOutOfBoundsException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return delTimestamps[i];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class SnapshotArrayIterator&lt;E&gt; implements Iterator&lt;E&gt; {</span></span>
<span class="line"><span>  private long snapshotTimestamp;</span></span>
<span class="line"><span>  private int cursorInAll; // 在整个容器中的下标，而非快照中的下标</span></span>
<span class="line"><span>  private int leftCount; // 快照中还有几个元素未被遍历</span></span>
<span class="line"><span>  private ArrayList&lt;E&gt; arrayList;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SnapshotArrayIterator(ArrayList&lt;E&gt; arrayList) {</span></span>
<span class="line"><span>    this.snapshotTimestamp = System.currentTimeMillis();</span></span>
<span class="line"><span>    this.cursorInAll = 0;</span></span>
<span class="line"><span>    this.leftCount = arrayList.actualSize();;</span></span>
<span class="line"><span>    this.arrayList = arrayList;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    justNext(); // 先跳到这个迭代器快照的第一个元素</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean hasNext() {</span></span>
<span class="line"><span>    return this.leftCount &gt;= 0; // 注意是&gt;=, 而非&gt;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public E next() {</span></span>
<span class="line"><span>    E currentItem = arrayList.get(cursorInAll);</span></span>
<span class="line"><span>    justNext();</span></span>
<span class="line"><span>    return currentItem;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void justNext() {</span></span>
<span class="line"><span>    while (cursorInAll &lt; arrayList.totalSize()) {</span></span>
<span class="line"><span>      long addTimestamp = arrayList.getAddTimestamp(cursorInAll);</span></span>
<span class="line"><span>      long delTimestamp = arrayList.getDelTimestamp(cursorInAll);</span></span>
<span class="line"><span>      if (snapshotTimestamp &gt; addTimestamp &amp;&amp; snapshotTimestamp &lt; delTimestamp) {</span></span>
<span class="line"><span>        leftCount--;</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      cursorInAll++;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，上面的解决方案相当于解决了一个问题，又引入了另外一个问题。ArrayList底层依赖数组这种数据结构，原本可以支持快速的随机访问，在O(1)时间复杂度内获取下标为i的元素，但现在，删除数据并非真正的删除，只是通过时间戳来标记删除，这就导致无法支持按照下标快速随机访问了。如果你对数组随机访问这块知识点不了解，可以去看我的《数据结构与算法之美》专栏，这里我就不展开讲解了。</p><p>现在，我们来看怎么解决这个问题：让容器既支持快照遍历，又支持随机访问？</p><p>解决的方法也不难，我稍微提示一下。我们可以在ArrayList中存储两个数组。一个支持标记删除的，用来实现快照遍历功能；一个不支持标记删除的（也就是将要删除的数据直接从数组中移除），用来支持随机访问。对应的代码我这里就不给出了，感兴趣的话你可以自己实现一下。</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>今天我们讲了如何实现一个支持“快照”功能的迭代器。其实这个问题本身并不是学习的重点，因为在真实的项目开发中，我们几乎不会遇到这样的需求。所以，基于今天的内容我不想做过多的总结。我想和你说一说，为什么我要来讲今天的内容呢？</p><p>实际上，学习本节课的内容，如果你只是从前往后看一遍，看懂就觉得ok了，那收获几乎是零。一个好学习方法是，把它当作一个思考题或者面试题，在看我的讲解之前，自己主动思考如何解决，并且把解决方案用代码实现一遍，然后再来看跟我的讲解有哪些区别。这个过程对你分析问题、解决问题的能力的锻炼，代码设计能力、编码能力的锻炼，才是最有价值的，才是我们这篇文章的意义所在。所谓“知识是死的，能力才是活的”就是这个道理。</p><p>其实，不仅仅是这一节的内容，整个专栏的学习都是这样的。</p><p>在《数据结构与算法之美》专栏中，有同学曾经对我说，他看了很多遍我的专栏，几乎看懂了所有的内容，他觉得都掌握了，但是，在最近第一次面试中，面试官给他出了一个结合实际开发的算法题，他还是没有思路，当时脑子一片放空，问我学完这个专栏之后，要想应付算法面试，还要学哪些东西，有没有推荐的书籍。</p><p>我看了他的面试题之后发现，用我专栏里讲的知识是完全可以解决的，而且，专栏里已经讲过类似的问题，只是换了个业务背景而已。之所以他没法回答上来，还是没有将知识转化成解决问题的能力，因为他只是被动地“看”，从来没有主动地“思考”。<strong>只掌握了知识，没锻炼能力，遇到实际的问题还是没法自己去分析、思考、解决</strong>。</p><p>我给他的建议是，把专栏里的每个开篇问题都当做面试题，自己去思考一下，然后再看解答。这样整个专栏学下来，对能力的锻炼就多了，再遇到算法面试也就不会一点思路都没有了。同理，学习《设计模式之美》这个专栏也应该如此。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>在今天讲的解决方案二中，删除元素只是被标记删除。被删除的元素即便在没有迭代器使用的情况下，也不会从数组中真正移除，这就会导致不必要的内存占用。针对这个问题，你有进一步优化的方法吗？</p><p>欢迎留言和我分享你的思考。如果有收获，欢迎你把这篇文章分享给你的朋友。 精选留言（15） 万历十五年 👍（42） 💬（3）思考题：为迭代器创建虚引用，当迭代器被回收时，清空容器中相应元素。2020-11-29太阳app苹果版 👍（4） 💬（3）1.代码貌似跑得不对，只有justNext方法自增了cursorInAll，假设第一个元素没有被删除，那么总是cursorInAll总是0； 2.时间戳获取有点问题，连续操作获取时间戳很有可能都是一样的，应该将时间戳进行递增操作，防止相等2020-04-26Mew151 👍（0） 💬（1）方案二中： public E get(int i) { if (i &gt;= totalSize) { throw new IndexOutOfBoundsException(); } return (E)elements[i]; } 这个方法不需要判断第i个元素是不是已删除的吗？2020-08-11嘉一 👍（0） 💬（1）发现一个问题，如果在SnapshotArrayIterator创建前添加了几个数据，那么会不会出现这几个数据的添加时间戳和SnapshotArrayIterator创建的时间戳是一样（因为计算机的时间戳最小是毫秒，而添加数据毕竟是非常快的操作，可能在不到一毫秒的时间就完成了）的导致这几个数据遍历不了？2020-04-21LJK 👍（93） 💬（11）思考题感觉像是数据库的MVCC？</p><ul><li>容器中维护一个每个迭代器创建时间的列表</li><li>每次有迭代器创建时就在这个列表中加入自己的创建时间</li><li>迭代器迭代完成后将列表中对应时间点删除</li><li>清理容器时，对于容器中每个元素，如果addTime小于这个列表中的最小时间点就可以进行删除2020-04-06Monday 👍（19） 💬（9）在阅读本节代码实现就想到了第二种方案存在类似思考题的问题 解决方案可以在合适的时候清理带删除标记的元素。本想使用数据库的多版本控制（MVCC)的方案，把所有的迭代器对象存起来，并添加创建时间。但是冒出一个新问题，数据库事务有commit来表示事务已完成，而迭代器的使用完成无法知晓，还在思考方案中……2020-04-06smartjia 👍（15） 💬（9）感觉代码有两个小问题，若理解有误，请帮指正：</li></ul><p>问题1. 重复删除同一个元素时，actualSize 应该保持不变。 以下是修改后的代码： @Override public void remove(E obj) { for (int i = 0; i &lt; totalSize; ++i) { if (elements[i].equals(obj) &amp;&amp; delTimestamps[i] == Long.MAX_VALUE) { // 防止重复删除 delTimestamps[i] = System.currentTimeMillis(); actualSize--; } } }</p><p>问题2： 遍历完一个元素后需要让 cursorInAll 自增，否则 cursorInAll 一直指向第一个待遍历的元素。同时hasNext() 恒为true， 也需要修改。 以下是修改后的代码：</p><p>@Override public E next() { E currentItem = arrayList.get(cursorInAll); cursorInAll++； //自增，否则 cursorInAll 一直不变 justNext(); return currentItem; }</p><p>@Override public boolean hasNext() { return this.leftCount &gt;= 0; // 注意是&gt;=, 而非&gt; （ 修改后 leftCount &gt;= 0 恒成立， 总是返回 true） 改为： return cursorInAll &lt; arrayList.totalSize()； } 2020-04-07辣么大 👍（15） 💬（3）课后思考题：类似数组动态扩容和缩容，删除元素时可以比较被删除元素的总数，在被删除元素总数 &lt; 总数的 1/2 时， 进行resize数组，清空被删除的元素，回收空间。2020-04-06辉哥 👍（7） 💬（5）课堂讨论：可以创建一个object类型的常量，删除数组元素时，可以将被删除数组元素的引用指向该常量。Android中的SparseArray就是采用此方式实现的2020-04-07马以 👍（7） 💬（2）记录一个迭代变量，每迭代一次，计数加一，迭代完一次减一，当为0的时候就可以删除标记为delete的元素了2020-04-06子豪sirius 👍（5） 💬（0）第二个问题，我想可不可用个数组记录当前有多少个迭代器。每调用一次iterrator方法，迭代器加一；有元素删除时，记录这个时间点的迭代器的数量；当迭代器访问到该元素时，减一，减到0，说明不再有删除该元素时间点之前生成的迭代器来访问了，就可以实际删除该元素。2020-04-06xk_ 👍（3） 💬（2）课后题： 我们可以在集合类中记录每一个迭代器创建时间列表iteratorCreateTimeList。</p><p>在迭代器创建的时候，删除iteratorCreateTimeList[0]之前的被标记删除的元素。</p><p>在迭代器中需要写一个销毁的方法，删掉iteratorCreateTimeList中对应的创建时间，删除iteratorCreateTimeList[0]之前的被标记删除的元素。2020-05-01webmin 👍（3） 💬（2）可以参考GC的算法，弄一个减化版的优化方法：</p><ol><li>被删除的元素是否还有可能被已经创建的iterator所访问，即被删除的元素还被引用着；（iterator使用完需要有调用关闭动作）</li><li>被删除的元素达到一定量时，按照删除时间清理掉效早删除的元素，清理掉的最晚的被删除元素的删除时间放置在清理标识字段，iterator迭代时检查清理标识字段，如果iterator创建时间早于清理标识字段中的时间丢出异常；2020-04-06eason2017 👍（3） 💬（0）定时清理里面的数据，做一次同步。期间可能会加锁来保证数据的有效性。2020-04-06tt 👍（2） 💬（0）想起来MySQL中的多版本控制，用于实现事物间不同的隔离级别2020-04-07</li></ol>`,45)])])}const h=n(l,[["render",t]]);export{d as __pageData,h as default};
