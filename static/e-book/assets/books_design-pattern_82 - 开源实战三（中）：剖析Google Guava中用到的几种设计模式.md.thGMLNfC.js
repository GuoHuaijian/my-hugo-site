import{_ as n,o as s,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/82 - 开源实战三（中）：剖析Google Guava中用到的几种设计模式.md","filePath":"books/design-pattern/82 - 开源实战三（中）：剖析Google Guava中用到的几种设计模式.md"}'),l={name:"books/design-pattern/82 - 开源实战三（中）：剖析Google Guava中用到的几种设计模式.md"};function i(t,a,c,o,r,d){return s(),p("div",null,[...a[0]||(a[0]=[e(`<p>上一节课，我们通过Google Guava这样一个优秀的开源类库，讲解了如何在业务开发中，发现跟业务无关、可以复用的通用功能模块，并将它们从业务代码中抽离出来，设计开发成独立的类库、框架或功能组件。</p><p>今天，我们再来学习一下，Google Guava中用到的几种经典设计模式：Builder模式、Wrapper模式，以及之前没讲过的Immutable模式。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="builder模式在guava中的应用" tabindex="-1">Builder模式在Guava中的应用 <a class="header-anchor" href="#builder模式在guava中的应用" aria-label="Permalink to &quot;Builder模式在Guava中的应用&quot;">&amp;ZeroWidthSpace;</a></h2><p>在项目开发中，我们经常用到缓存。它可以非常有效地提高访问速度。</p><p>常用的缓存系统有Redis、Memcache等。但是，如果要缓存的数据比较少，我们完全没必要在项目中独立部署一套缓存系统。毕竟系统都有一定出错的概率，项目中包含的系统越多，那组合起来，项目整体出错的概率就会升高，可用性就会降低。同时，多引入一个系统就要多维护一个系统，项目维护的成本就会变高。</p><p>取而代之，我们可以在系统内部构建一个内存缓存，跟系统集成在一起开发、部署。那如何构建内存缓存呢？我们可以基于JDK提供的类，比如HashMap，从零开始开发内存缓存。不过，从零开发一个内存缓存，涉及的工作就会比较多，比如缓存淘汰策略等。为了简化开发，我们就可以使用Google Guava提供的现成的缓存工具类com.google.common.cache.*。</p><p>使用Google Guava来构建内存缓存非常简单，我写了一个例子贴在了下面，你可以看下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class CacheDemo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    Cache&lt;String, String&gt; cache = CacheBuilder.newBuilder()</span></span>
<span class="line"><span>            .initialCapacity(100)</span></span>
<span class="line"><span>            .maximumSize(1000)</span></span>
<span class="line"><span>            .expireAfterWrite(10, TimeUnit.MINUTES)</span></span>
<span class="line"><span>            .build();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    cache.put(&quot;key1&quot;, &quot;value1&quot;);</span></span>
<span class="line"><span>    String value = cache.getIfPresent(&quot;key1&quot;);</span></span>
<span class="line"><span>    System.out.println(value);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从上面的代码中，我们可以发现，Cache对象是通过CacheBuilder这样一个Builder类来创建的。为什么要由Builder类来创建Cache对象呢？我想这个问题应该对你来说没难度了吧。</p><p>你可以先想一想，然后再来看我的回答。构建一个缓存，需要配置n多参数，比如过期时间、淘汰策略、最大缓存大小等等。相应地，Cache类就会包含n多成员变量。我们需要在构造函数中，设置这些成员变量的值，但又不是所有的值都必须设置，设置哪些值由用户来决定。为了满足这个需求，我们就需要定义多个包含不同参数列表的构造函数。</p><p>为了避免构造函数的参数列表过长、不同的构造函数过多，我们一般有两种解决方案。其中，一个解决方案是使用Builder模式；另一个方案是先通过无参构造函数创建对象，然后再通过setXXX()方法来逐一设置需要的设置的成员变量。</p><p>那我再问你一个问题，为什么Guava选择第一种而不是第二种解决方案呢？使用第二种解决方案是否也可以呢？答案是不行的。至于为什么，我们看下源码就清楚了。我把CacheBuilder类中的build()函数摘抄到了下面，你可以先看下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public &lt;K1 extends K, V1 extends V&gt; Cache&lt;K1, V1&gt; build() {</span></span>
<span class="line"><span>  this.checkWeightWithWeigher();</span></span>
<span class="line"><span>  this.checkNonLoadingCache();</span></span>
<span class="line"><span>  return new LocalManualCache(this);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private void checkNonLoadingCache() {</span></span>
<span class="line"><span>  Preconditions.checkState(this.refreshNanos == -1L, &quot;refreshAfterWrite requires a LoadingCache&quot;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private void checkWeightWithWeigher() {</span></span>
<span class="line"><span>  if (this.weigher == null) {</span></span>
<span class="line"><span>    Preconditions.checkState(this.maximumWeight == -1L, &quot;maximumWeight requires weigher&quot;);</span></span>
<span class="line"><span>  } else if (this.strictParsing) {</span></span>
<span class="line"><span>    Preconditions.checkState(this.maximumWeight != -1L, &quot;weigher requires maximumWeight&quot;);</span></span>
<span class="line"><span>  } else if (this.maximumWeight == -1L) {</span></span>
<span class="line"><span>    logger.log(Level.WARNING, &quot;ignoring weigher specified without maximumWeight&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><p>看了代码，你是否有了答案呢？实际上，答案我们在讲Builder模式的时候已经讲过了。现在，我们再结合CacheBuilder的源码重新说下。</p><p>必须使用Builder模式的主要原因是，在真正构造Cache对象的时候，我们必须做一些必要的参数校验，也就是build()函数中前两行代码要做的工作。如果采用无参默认构造函数加setXXX()方法的方案，这两个校验就无处安放了。而不经过校验，创建的Cache对象有可能是不合法、不可用的。</p><h2 id="wrapper模式在guava中的应用" tabindex="-1">Wrapper模式在Guava中的应用 <a class="header-anchor" href="#wrapper模式在guava中的应用" aria-label="Permalink to &quot;Wrapper模式在Guava中的应用&quot;">&amp;ZeroWidthSpace;</a></h2><p>在Google Guava的collection包路径下，有一组以Forwarding开头命名的类。我截了这些类中的一部分贴到了下面，你可以看下。</p><p><img src="https://static001.geekbang.org/resource/image/ac/7d/ac5ce5f711711c0b86149f402e76177d.png?wh=259%2A420" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>这组Forwarding类很多，但实现方式都很相似。我摘抄了其中的ForwardingCollection中的部分代码到这里，你可以下先看下代码，然后思考下这组Forwarding类是干什么用的。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@GwtCompatible</span></span>
<span class="line"><span>public abstract class ForwardingCollection&lt;E&gt; extends ForwardingObject implements Collection&lt;E&gt; {</span></span>
<span class="line"><span>  protected ForwardingCollection() {</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected abstract Collection&lt;E&gt; delegate();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Iterator&lt;E&gt; iterator() {</span></span>
<span class="line"><span>    return this.delegate().iterator();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int size() {</span></span>
<span class="line"><span>    return this.delegate().size();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @CanIgnoreReturnValue</span></span>
<span class="line"><span>  public boolean removeAll(Collection&lt;?&gt; collection) {</span></span>
<span class="line"><span>    return this.delegate().removeAll(collection);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public boolean isEmpty() {</span></span>
<span class="line"><span>    return this.delegate().isEmpty();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public boolean contains(Object object) {</span></span>
<span class="line"><span>    return this.delegate().contains(object);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @CanIgnoreReturnValue</span></span>
<span class="line"><span>  public boolean add(E element) {</span></span>
<span class="line"><span>    return this.delegate().add(element);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @CanIgnoreReturnValue</span></span>
<span class="line"><span>  public boolean remove(Object object) {</span></span>
<span class="line"><span>    return this.delegate().remove(object);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public boolean containsAll(Collection&lt;?&gt; collection) {</span></span>
<span class="line"><span>    return this.delegate().containsAll(collection);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @CanIgnoreReturnValue</span></span>
<span class="line"><span>  public boolean addAll(Collection&lt;? extends E&gt; collection) {</span></span>
<span class="line"><span>    return this.delegate().addAll(collection);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @CanIgnoreReturnValue</span></span>
<span class="line"><span>  public boolean retainAll(Collection&lt;?&gt; collection) {</span></span>
<span class="line"><span>    return this.delegate().retainAll(collection);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void clear() {</span></span>
<span class="line"><span>    this.delegate().clear();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Object[] toArray() {</span></span>
<span class="line"><span>    return this.delegate().toArray();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  //...省略部分代码...</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>光看ForwardingCollection的代码实现，你可能想不到它的作用。我再给点提示，举一个它的用法示例，如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class AddLoggingCollection&lt;E&gt; extends ForwardingCollection&lt;E&gt; {</span></span>
<span class="line"><span>  private static final Logger logger = LoggerFactory.getLogger(AddLoggingCollection.class);</span></span>
<span class="line"><span>  private Collection&lt;E&gt; originalCollection;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public AddLoggingCollection(Collection&lt;E&gt; originalCollection) {</span></span>
<span class="line"><span>    this.originalCollection = originalCollection;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected Collection delegate() {</span></span>
<span class="line"><span>    return this.originalCollection;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean add(E element) {</span></span>
<span class="line"><span>    logger.info(&quot;Add element: &quot; + element);</span></span>
<span class="line"><span>    return this.delegate().add(element);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean addAll(Collection&lt;? extends E&gt; collection) {</span></span>
<span class="line"><span>    logger.info(&quot;Size of elements to add: &quot; + collection.size());</span></span>
<span class="line"><span>    return this.delegate().addAll(collection);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><p>结合源码和示例，我想你应该知道这组Forwarding类的作用了吧？</p><p>在上面的代码中，AddLoggingCollection是基于代理模式实现的一个代理类，它在原始Collection类的基础之上，针对“add”相关的操作，添加了记录日志的功能。</p><p>我们前面讲到，代理模式、装饰器、适配器模式可以统称为Wrapper模式，通过Wrapper类二次封装原始类。它们的代码实现也很相似，都可以通过组合的方式，将Wrapper类的函数实现委托给原始类的函数来实现。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface Interf {</span></span>
<span class="line"><span>  void f1();</span></span>
<span class="line"><span>  void f2();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>public class OriginalClass implements Interf {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void f1() { //... }</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void f2() { //... }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class WrapperClass implements Interf {</span></span>
<span class="line"><span>  private OriginalClass oc;</span></span>
<span class="line"><span>  public WrapperClass(OriginalClass oc) {</span></span>
<span class="line"><span>    this.oc = oc;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void f1() {</span></span>
<span class="line"><span>    //...附加功能...</span></span>
<span class="line"><span>    this.oc.f1();</span></span>
<span class="line"><span>    //...附加功能...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void f2() {</span></span>
<span class="line"><span>    this.oc.f2();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，这个ForwardingCollection类是一个“默认Wrapper类”或者叫“缺省Wrapper类”。这类似于在装饰器模式那一节课中，讲到的FilterInputStream缺省装饰器类。你可以再重新看下<a href="https://time.geekbang.org/column/article/204845" target="_blank" rel="noreferrer">第50讲</a>装饰器模式的相关内容。</p><p>如果我们不使用这个ForwardinCollection类，而是让AddLoggingCollection代理类直接实现Collection接口，那Collection接口中的所有方法，都要在AddLoggingCollection类中实现一遍，而真正需要添加日志功能的只有add()和addAll()两个函数，其他函数的实现，都只是类似Wrapper类中f2()函数的实现那样，简单地委托给原始collection类对象的对应函数。</p><p>为了简化Wrapper模式的代码实现，Guava提供一系列缺省的Forwarding类。用户在实现自己的Wrapper类的时候，基于缺省的Forwarding类来扩展，就可以只实现自己关心的方法，其他不关心的方法使用缺省Forwarding类的实现，就像AddLoggingCollection类的实现那样。</p><h2 id="immutable模式在guava中的应用" tabindex="-1">Immutable模式在Guava中的应用 <a class="header-anchor" href="#immutable模式在guava中的应用" aria-label="Permalink to &quot;Immutable模式在Guava中的应用&quot;">&amp;ZeroWidthSpace;</a></h2><p>Immutable模式，中文叫作不变模式，它并不属于经典的23种设计模式，但作为一种较常用的设计思路，可以总结为一种设计模式来学习。之前在理论部分，我们只稍微提到过Immutable模式，但没有独立的拿出来详细讲解，我们这里借Google Guava再补充讲解一下。</p><p>一个对象的状态在对象创建之后就不再改变，这就是所谓的不变模式。其中涉及的类就是<strong>不变类</strong>（Immutable Class），对象就是<strong>不变对象</strong>（Immutable Object）。在Java中，最常用的不变类就是String类，String对象一旦创建之后就无法改变。</p><p>不变模式可以分为两类，一类是普通不变模式，另一类是深度不变模式（Deeply Immutable Pattern）。普通的不变模式指的是，对象中包含的引用对象是可以改变的。如果不特别说明，通常我们所说的不变模式，指的就是普通的不变模式。深度不变模式指的是，对象包含的引用对象也不可变。它们两个之间的关系，有点类似之前讲过的浅拷贝和深拷贝之间的关系。我举了一个例子来进一步解释一下，代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 普通不变模式</span></span>
<span class="line"><span>public class User {</span></span>
<span class="line"><span>  private String name;</span></span>
<span class="line"><span>  private int age;</span></span>
<span class="line"><span>  private Address addr;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public User(String name, int age, Address addr) {</span></span>
<span class="line"><span>    this.name = name;</span></span>
<span class="line"><span>    this.age = age;</span></span>
<span class="line"><span>    this.addr = addr;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 只有getter方法，无setter方法...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class Address {</span></span>
<span class="line"><span>  private String province;</span></span>
<span class="line"><span>  private String city;</span></span>
<span class="line"><span>  public Address(String province, String city) {</span></span>
<span class="line"><span>    this.province = province;</span></span>
<span class="line"><span>    this.city= city;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 有getter方法，也有setter方法...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 深度不变模式</span></span>
<span class="line"><span>public class User {</span></span>
<span class="line"><span>  private String name;</span></span>
<span class="line"><span>  private int age;</span></span>
<span class="line"><span>  private Address addr;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public User(String name, int age, Address addr) {</span></span>
<span class="line"><span>    this.name = name;</span></span>
<span class="line"><span>    this.age = age;</span></span>
<span class="line"><span>    this.addr = addr;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 只有getter方法，无setter方法...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class Address {</span></span>
<span class="line"><span>  private String province;</span></span>
<span class="line"><span>  private String city;</span></span>
<span class="line"><span>  public Address(String province, String city) {</span></span>
<span class="line"><span>    this.province = province;</span></span>
<span class="line"><span>    this.city= city;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 只有getter方法，无setter方法..</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>在某个业务场景下，如果一个对象符合创建之后就不会被修改这个特性，那我们就可以把它设计成不变类。显式地强制它不可变，这样能避免意外被修改。那如何将一个类设置为不变类呢？其实方法很简单，只要这个类满足：所有的成员变量都通过构造函数一次性设置好，不暴露任何set等修改成员变量的方法。除此之外，因为数据不变，所以不存在并发读写问题，因此不变模式常用在多线程环境下，来避免线程加锁。所以，不变模式也常被归类为多线程设计模式。</p><p>接下来，我们来看一种特殊的不变类，那就是不变集合。Google Guava针对集合类（Collection、List、Set、Map…）提供了对应的不变集合类（ImmutableCollection、ImmutableList、ImmutableSet、ImmutableMap…）。刚刚我们讲过，不变模式分为两种，普通不变模式和深度不变模式。Google Guava提供的不变集合类属于前者，也就是说，集合中的对象不会增删，但是对象的成员变量（或叫属性值）是可以改变的。</p><p>实际上，Java JDK也提供了不变集合类（UnmodifiableCollection、UnmodifiableList、UnmodifiableSet、UnmodifiableMap…）。那它跟Google Guava提供的不变集合类的区别在哪里呢？我举个例子你就明白了，代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ImmutableDemo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    List&lt;String&gt; originalList = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>    originalList.add(&quot;a&quot;);</span></span>
<span class="line"><span>    originalList.add(&quot;b&quot;);</span></span>
<span class="line"><span>    originalList.add(&quot;c&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    List&lt;String&gt; jdkUnmodifiableList = Collections.unmodifiableList(originalList);</span></span>
<span class="line"><span>    List&lt;String&gt; guavaImmutableList = ImmutableList.copyOf(originalList);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //jdkUnmodifiableList.add(&quot;d&quot;);</span><span> // 抛出UnsupportedOperationException</span></span>
<span class="line"><span>    // guavaImmutableList.add(&quot;d&quot;);</span><span> // 抛出UnsupportedOperationException</span></span>
<span class="line"><span>    originalList.add(&quot;d&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    print(originalList); // a b c d</span></span>
<span class="line"><span>    print(jdkUnmodifiableList); // a b c d</span></span>
<span class="line"><span>    print(guavaImmutableList); // a b c</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static void print(List&lt;String&gt; list) {</span></span>
<span class="line"><span>    for (String s : list) {</span></span>
<span class="line"><span>      System.out.print(s + &quot; &quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    System.out.println();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>今天我们学习了Google Guava中都用到的几个设计模式：Builder模式、Wrapper模式、Immutable模式。还是那句话，内容本身不重要，你也不用死记硬背Google Guava的某某类用到了某某设计模式。实际上，我想通过这些源码的剖析，传达给你下面这些东西。</p><p>我们在阅读源码的时候，要问问自己，为什么它要这么设计？不这么设计行吗？还有更好的设计吗？实际上，很多人缺少这种“质疑”精神，特别是面对权威（经典书籍、著名源码、权威人士）的时候。</p><p>我觉得我本人是最不缺质疑精神的一个人，我喜欢挑战权威，喜欢以理服人。就好比在今天的讲解中，我把ForwardingCollection等类理解为缺省Wrapper类，可以用在装饰器、代理、适配器三种Wrapper模式中，简化代码编写。如果你去看Google Guava在GitHub上的Wiki，你会发现，它对ForwardingCollection类的理解跟我是不一样的。它把ForwardingCollection类单纯地理解为缺省的装饰器类，只用在装饰器模式中。我个人觉得我的理解更加好些，不知道你怎么认为呢？</p><p>除此之外，在专栏的最开始，我也讲到，学习设计模式能让你更好的阅读源码、理解源码。如果我们没有之前的理论学习，那对于很多源码的阅读，可能都只停留在走马观花的层面上，根本学习不到它的精髓。这就好比今天讲到的CacheBuilder。我想大部分人都知道它是利用了Builder模式，但如果对Builder模式没有深入的了解，很少人能讲清楚为什么要用Builder模式，不用构造函数加set方法的方式来实现。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>从最后一段代码中，我们可以发现，JDK不变集合和Google Guava不变集合都不可增删数据。但是，当原始集合增加数据之后，JDK不变集合的数据随之增加，而Google Guava的不变集合的数据并没有增加。这是两者最大的区别。那这两者底层分别是如何实现不变的呢？</p><p>欢迎留言和我分享你的想法，如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） 3Spiders 👍（63） 💬（5）JDK是浅拷贝，Guava使用的是深拷贝。一个复制引用，一个复制值。2020-05-11hhhh 👍（22） 💬（2）猜测jdk中的不变集合保存了原始集合的引用，而guava应该是复制了原始集合的值。2020-05-11不能忍的地精 👍（11） 💬（0）Guava里面的引用已经是一个新的集合,Jdk里面的引用还是原来的集合2020-05-11何用 👍（11） 💬（2）我是个特别能关注到细节的人。Memcached 是个开源库，不知道为何好多人都喜欢把它叫做 Memcache，本文也不例外。2020-05-11leezer 👍（7） 💬（0）我觉得我更赞同wrapper类的理解，因为装饰器的主要功能是在原始的类上做功能增强，而代理模式更多关注对非业务功能的关注。通过组合的方式我们能实现更多的Wrapper模式。这时候就不只是算装饰器的设计模式了 。2020-05-11梦倚栏杆 👍（6） 💬（0）老师给这个深拷贝和浅拷贝不是太形象。String 本身就是不可变的。 从这个例子可以看出的是guava 重新创建了list，jdk 是持有的原list的引用。那么guava 有没有进一步的深copy呢？答案是：没有。里面的对象存储的还是引用 也或许老师说的深copy和浅copy只是指collection的引用。2020-05-15辣么大 👍（5） 💬（0）在JDK中只是将list的地址赋给了UnmodifiableList final List&lt;? extends E&gt; list; UnmodifiableList(List&lt;? extends E&gt; list) { super(list); this.list = list; } 在Guava中不可变集合是“保护性”拷贝，创建的不可变集合可以理解为常量。 要创建真正的不可变集合，集合中的对象还要是真正的不可变。 下面我举个反例，各位看看： public static void main(String[] args) { List&lt;Student&gt; ori = new ArrayList&lt;&gt;(); ori.add(new Student(&quot;xiaoqiang&quot;, 10));</p><pre><code>Student mutable = new Student(&amp;quot;wangz&amp;quot;, 8);
ori.add(mutable);

ori.add(new Student(&amp;quot;lameda&amp;quot;, 12));
List&amp;lt;Student&amp;gt; jdkCopy = Collections.unmodifiableList(ori);

List&amp;lt;Student&amp;gt; guavaCopy = ImmutableList.copyOf(ori);

ori.add(new Student(&amp;quot;wawa&amp;quot;, 20));

System.out.println(jdkCopy);
System.out.println(guavaCopy);

mutable.name = &amp;quot;mutable&amp;quot;;
System.out.println(guavaCopy);
</code></pre><p>// [Student{age=10, name=&#39;xiaoqiang&#39;}, Student{age=8, name=&#39;mutable&#39;}, Student{age=12, name=&#39;lameda&#39;}]</p><p>}2020-05-11小晏子 👍（4） 💬（0）JDK中的unmodifiableList的构造函数是对原始集合的浅拷贝，而Guava.ImmutableList.copyOf是对原始集合的深拷贝。从source code可以看出来： UnmodifiableList UnmodifiableList(List&lt;? extends E&gt; list) { super(list); this.list = list; } Guava.ImmutableList.copyOf public static &lt;E&gt; ImmutableList&lt;E&gt; copyOf(Collection&lt;? extends E&gt; elements) { if (elements instanceof ImmutableCollection) { @SuppressWarnings(&quot;unchecked&quot;) // all supported methods are covariant ImmutableList&lt;E&gt; list = ((ImmutableCollection&lt;E&gt;) elements).asList(); return list.isPartialView() ? ImmutableList.&lt;E&gt;asImmutableList(list.toArray()) : list; } return construct(elements.toArray()); } /** Views the array as an immutable list. Checks for nulls; does not copy. */ private static &lt;E&gt; ImmutableList&lt;E&gt; construct(Object... elements) { return asImmutableList(checkElementsNotNull(elements)); }</p><p>/**</p><ul><li>Views the array as an immutable list. Does not check for nulls; does not copy.</li><li></li><li>&lt;p&gt;The array must be internally created. */ static &lt;E&gt; ImmutableList&lt;E&gt; asImmutableList(Object[] elements) { return asImmutableList(elements, elements.length); }</li></ul><p>/**</p><ul><li>Views the array as an immutable list. Copies if the specified range does not cover the complete</li><li>array. Does not check for nulls. */ static &lt;E&gt; ImmutableList&lt;E&gt; asImmutableList(Object[] elements, int length) { switch (length) { case 0: return of(); case 1: return of((E) elements[0]); default: if (length &lt; elements.length) { elements = Arrays.copyOf(elements, length); } return new RegularImmutableList&lt;E&gt;(elements); } }2020-05-11test 👍（4） 💬（0）jdk是浅拷贝，guava是深拷贝，在修改的时候报错2020-05-11Frank 👍（2） 💬（0）unmodifiableList 内部还是使用了Warpper模式，重新实现了某些方法，比如add,remove等，当调用这些方法时，抛出异常，而有些方法还是委托给原始list进行操作，比如get操作。所以这里在原始类添加元素后，使用不jdk的变类可以打印出新添加的元素。而Guava 中的ImmutableList 时采用拷贝的方式将原始集合中的数据拷贝到一个对象数组中，后续原始集合添加，删除元素，其结果都不会影响该ImmutableList。2020-05-11汝林外史 👍（2） 💬（1）我觉得 ForwardingCollection 类就应该理解为缺省的装饰器类，前面的文章就说过代理模式、装饰器模式、适配器模式代码的写法几乎一样，差别就是各自的使用场景，我觉得ForwardingCollection这些类的使用场景就是作为装饰类来用的，不会应用到代理和适配器的场景，王老师貌似又掉入了以代码写法判断设计模式的自己说的陷阱中。2020-05-11八年老萌新 👍（1） 💬（0）jdk的UnmodifiableCollection看起来更像是个装饰器，内部持有源集合的引用，对源集合的操作进行包装。所以直接操作源集合的同时也改变了不可变集合。而guava的ImmutableList则是通过Arrays.copyOf去创建新的不可变集合，所以改变源集合并不能改变不可变集合2023-05-19yu 👍（1） 💬（0）JDK与Guava的不可变集合都是属于普通不可变集合，试了一下，无法增减元素，但都是可以对集合中的对像的成员变量修改的。不同的是，原集合改动之后，JDK跟着改变，Guava不跟着变2020-05-22董大大 👍（1） 💬（0）深究设计模式，对阅读开源代码大有好处2020-05-21落尘kira 👍（1） 💬（0）还有一点就是 作者觉得 不可变的例子，我看起来深拷贝和浅拷贝的代码是一摸一样的？深拷贝是对于对象类型的是否要加入 deepCopy（object）方法？2020-05-13</li></ul>`,55)])])}const m=n(l,[["render",i]]);export{g as __pageData,m as default};
