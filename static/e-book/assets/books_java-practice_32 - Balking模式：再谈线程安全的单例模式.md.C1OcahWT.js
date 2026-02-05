import{_ as s,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/32 - Balking模式：再谈线程安全的单例模式.md","filePath":"books/java-practice/32 - Balking模式：再谈线程安全的单例模式.md"}'),l={name:"books/java-practice/32 - Balking模式：再谈线程安全的单例模式.md"};function i(t,n,c,o,r,d){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>上一篇文章中，我们提到可以用“多线程版本的if”来理解Guarded Suspension模式，不同于单线程中的if，这个“多线程版本的if”是需要等待的，而且还很执着，必须要等到条件为真。但很显然这个世界，不是所有场景都需要这么执着，有时候我们还需要快速放弃。</p><p>需要快速放弃的一个最常见的例子是各种编辑器提供的自动保存功能。自动保存功能的实现逻辑一般都是隔一定时间自动执行存盘操作，存盘操作的前提是文件做过修改，如果文件没有执行过修改操作，就需要快速放弃存盘操作。下面的示例代码将自动保存功能代码化了，很显然AutoSaveEditor这个类不是线程安全的，因为对共享变量changed的读写没有使用同步，那如何保证AutoSaveEditor的线程安全性呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class AutoSaveEditor{</span></span>
<span class="line"><span>  //文件是否被修改过</span></span>
<span class="line"><span>  boolean changed=false;</span></span>
<span class="line"><span>  //定时任务线程池</span></span>
<span class="line"><span>  ScheduledExecutorService ses = </span></span>
<span class="line"><span>    Executors.newSingleThreadScheduledExecutor();</span></span>
<span class="line"><span>  //定时执行自动保存</span></span>
<span class="line"><span>  void startAutoSave(){</span></span>
<span class="line"><span>    ses.scheduleWithFixedDelay(()-&gt;{</span></span>
<span class="line"><span>      autoSave();</span></span>
<span class="line"><span>    }, 5, 5, TimeUnit.SECONDS);  </span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //自动存盘操作</span></span>
<span class="line"><span>  void autoSave(){</span></span>
<span class="line"><span>    if (!changed) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    changed = false;</span></span>
<span class="line"><span>    //执行存盘操作</span></span>
<span class="line"><span>    //省略且实现</span></span>
<span class="line"><span>    this.execSave();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //编辑操作</span></span>
<span class="line"><span>  void edit(){</span></span>
<span class="line"><span>    //省略编辑逻辑</span></span>
<span class="line"><span>    ......</span></span>
<span class="line"><span>    changed = true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>解决这个问题相信你一定手到擒来了：读写共享变量changed的方法autoSave()和edit()都加互斥锁就可以了。这样做虽然简单，但是性能很差，原因是锁的范围太大了。那我们可以将锁的范围缩小，只在读写共享变量changed的地方加锁，实现代码如下所示。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//自动存盘操作</span></span>
<span class="line"><span>void autoSave(){</span></span>
<span class="line"><span>  synchronized(this){</span></span>
<span class="line"><span>    if (!changed) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    changed = false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //执行存盘操作</span></span>
<span class="line"><span>  //省略且实现</span></span>
<span class="line"><span>  this.execSave();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//编辑操作</span></span>
<span class="line"><span>void edit(){</span></span>
<span class="line"><span>  //省略编辑逻辑</span></span>
<span class="line"><span>  ......</span></span>
<span class="line"><span>  synchronized(this){</span></span>
<span class="line"><span>    changed = true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>如果你深入地分析一下这个示例程序，你会发现，示例中的共享变量是一个状态变量，业务逻辑依赖于这个状态变量的状态：当状态满足某个条件时，执行某个业务逻辑，其本质其实不过就是一个if而已，放到多线程场景里，就是一种“多线程版本的if”。这种“多线程版本的if”的应用场景还是很多的，所以也有人把它总结成了一种设计模式，叫做<strong>Balking模式</strong>。</p><h2 id="balking模式的经典实现" tabindex="-1">Balking模式的经典实现 <a class="header-anchor" href="#balking模式的经典实现" aria-label="Permalink to &quot;Balking模式的经典实现&quot;">&amp;ZeroWidthSpace;</a></h2><p>Balking模式本质上是一种规范化地解决“多线程版本的if”的方案，对于上面自动保存的例子，使用Balking模式规范化之后的写法如下所示，你会发现仅仅是将edit()方法中对共享变量changed的赋值操作抽取到了change()中，这样的好处是将并发处理逻辑和业务逻辑分开。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>boolean changed=false;</span></span>
<span class="line"><span>//自动存盘操作</span></span>
<span class="line"><span>void autoSave(){</span></span>
<span class="line"><span>  synchronized(this){</span></span>
<span class="line"><span>    if (!changed) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    changed = false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //执行存盘操作</span></span>
<span class="line"><span>  //省略且实现</span></span>
<span class="line"><span>  this.execSave();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//编辑操作</span></span>
<span class="line"><span>void edit(){</span></span>
<span class="line"><span>  //省略编辑逻辑</span></span>
<span class="line"><span>  ......</span></span>
<span class="line"><span>  change();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//改变状态</span></span>
<span class="line"><span>void change(){</span></span>
<span class="line"><span>  synchronized(this){</span></span>
<span class="line"><span>    changed = true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="用volatile实现balking模式" tabindex="-1">用volatile实现Balking模式 <a class="header-anchor" href="#用volatile实现balking模式" aria-label="Permalink to &quot;用volatile实现Balking模式&quot;">&amp;ZeroWidthSpace;</a></h2><p>前面我们用synchronized实现了Balking模式，这种实现方式最为稳妥，建议你实际工作中也使用这个方案。不过在某些特定场景下，也可以使用volatile来实现，但<strong>使用volatile的前提是对原子性没有要求</strong>。</p><p>在<a href="https://time.geekbang.org/column/article/93154" target="_blank" rel="noreferrer">《29 | Copy-on-Write模式：不是延时策略的COW》</a>中，有一个RPC框架路由表的案例，在RPC框架中，本地路由表是要和注册中心进行信息同步的，应用启动的时候，会将应用依赖服务的路由表从注册中心同步到本地路由表中，如果应用重启的时候注册中心宕机，那么会导致该应用依赖的服务均不可用，因为找不到依赖服务的路由表。为了防止这种极端情况出现，RPC框架可以将本地路由表自动保存到本地文件中，如果重启的时候注册中心宕机，那么就从本地文件中恢复重启前的路由表。这其实也是一种降级的方案。</p><p>自动保存路由表和前面介绍的编辑器自动保存原理是一样的，也可以用Balking模式实现，不过我们这里采用volatile来实现，实现的代码如下所示。之所以可以采用volatile来实现，是因为对共享变量changed和rt的写操作不存在原子性的要求，而且采用scheduleWithFixedDelay()这种调度方式能保证同一时刻只有一个线程执行autoSave()方法。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//路由表信息</span></span>
<span class="line"><span>public class RouterTable {</span></span>
<span class="line"><span>  //Key:接口名</span></span>
<span class="line"><span>  //Value:路由集合</span></span>
<span class="line"><span>  ConcurrentHashMap&lt;String, CopyOnWriteArraySet&lt;Router&gt;&gt; </span></span>
<span class="line"><span>    rt = new ConcurrentHashMap&lt;&gt;();    </span></span>
<span class="line"><span>  //路由表是否发生变化</span></span>
<span class="line"><span>  volatile boolean changed;</span></span>
<span class="line"><span>  //将路由表写入本地文件的线程池</span></span>
<span class="line"><span>  ScheduledExecutorService ses=</span></span>
<span class="line"><span>    Executors.newSingleThreadScheduledExecutor();</span></span>
<span class="line"><span>  //启动定时任务</span></span>
<span class="line"><span>  //将变更后的路由表写入本地文件</span></span>
<span class="line"><span>  public void startLocalSaver(){</span></span>
<span class="line"><span>    ses.scheduleWithFixedDelay(()-&gt;{</span></span>
<span class="line"><span>      autoSave();</span></span>
<span class="line"><span>    }, 1, 1, MINUTES);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //保存路由表到本地文件</span></span>
<span class="line"><span>  void autoSave() {</span></span>
<span class="line"><span>    if (!changed) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    changed = false;</span></span>
<span class="line"><span>    //将路由表写入本地文件</span></span>
<span class="line"><span>    //省略其方法实现</span></span>
<span class="line"><span>    this.save2Local();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //删除路由</span></span>
<span class="line"><span>  public void remove(Router router) {</span></span>
<span class="line"><span>    Set&lt;Router&gt; set=rt.get(router.iface);</span></span>
<span class="line"><span>    if (set != null) {</span></span>
<span class="line"><span>      set.remove(router);</span></span>
<span class="line"><span>      //路由表已发生变化</span></span>
<span class="line"><span>      changed = true;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //增加路由</span></span>
<span class="line"><span>  public void add(Router router) {</span></span>
<span class="line"><span>    Set&lt;Router&gt; set = rt.computeIfAbsent(</span></span>
<span class="line"><span>      route.iface, r -&gt; </span></span>
<span class="line"><span>        new CopyOnWriteArraySet&lt;&gt;());</span></span>
<span class="line"><span>    set.add(router);</span></span>
<span class="line"><span>    //路由表已发生变化</span></span>
<span class="line"><span>    changed = true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>Balking模式有一个非常典型的应用场景就是单次初始化，下面的示例代码是它的实现。这个实现方案中，我们将init()声明为一个同步方法，这样同一个时刻就只有一个线程能够执行init()方法；init()方法在第一次执行完时会将inited设置为true，这样后续执行init()方法的线程就不会再执行doInit()了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class InitTest{</span></span>
<span class="line"><span>  boolean inited = false;</span></span>
<span class="line"><span>  synchronized void init(){</span></span>
<span class="line"><span>    if(inited){</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //省略doInit的实现</span></span>
<span class="line"><span>    doInit();</span></span>
<span class="line"><span>    inited=true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>线程安全的单例模式本质上其实也是单次初始化，所以可以用Balking模式来实现线程安全的单例模式，下面的示例代码是其实现。这个实现虽然功能上没有问题，但是性能却很差，因为互斥锁synchronized将getInstance()方法串行化了，那有没有办法可以优化一下它的性能呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Singleton{</span></span>
<span class="line"><span>  private static</span></span>
<span class="line"><span>    Singleton singleton;</span></span>
<span class="line"><span>  //构造方法私有化  </span></span>
<span class="line"><span>  private Singleton(){}</span></span>
<span class="line"><span>  //获取实例（单例）</span></span>
<span class="line"><span>  public synchronized static </span></span>
<span class="line"><span>  Singleton getInstance(){</span></span>
<span class="line"><span>    if(singleton == null){</span></span>
<span class="line"><span>      singleton=new Singleton();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return singleton;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>办法当然是有的，那就是经典的<strong>双重检查</strong>（Double Check）方案，下面的示例代码是其详细实现。在双重检查方案中，一旦Singleton对象被成功创建之后，就不会执行synchronized(Singleton.class){}相关的代码，也就是说，此时getInstance()方法的执行路径是无锁的，从而解决了性能问题。不过需要你注意的是，这个方案中使用了volatile来禁止编译优化，其原因你可以参考<a href="https://time.geekbang.org/column/article/83682" target="_blank" rel="noreferrer">《01 | 可见性、原子性和有序性问题：并发编程Bug的源头》</a>中相关的内容。至于获取锁后的二次检查，则是出于对安全性负责。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Singleton{</span></span>
<span class="line"><span>  private static volatile </span></span>
<span class="line"><span>    Singleton singleton;</span></span>
<span class="line"><span>  //构造方法私有化  </span></span>
<span class="line"><span>  private Singleton() {}</span></span>
<span class="line"><span>  //获取实例（单例）</span></span>
<span class="line"><span>  public static Singleton </span></span>
<span class="line"><span>  getInstance() {</span></span>
<span class="line"><span>    //第一次检查</span></span>
<span class="line"><span>    if(singleton==null){</span></span>
<span class="line"><span>      synchronize(Singleton.class){</span></span>
<span class="line"><span>        //获取锁后二次检查</span></span>
<span class="line"><span>        if(singleton==null){</span></span>
<span class="line"><span>          singleton=new Singleton();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return singleton;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>Balking模式和Guarded Suspension模式从实现上看似乎没有多大的关系，Balking模式只需要用互斥锁就能解决，而Guarded Suspension模式则要用到管程这种高级的并发原语；但是从应用的角度来看，它们解决的都是“线程安全的if”语义，不同之处在于，Guarded Suspension模式会等待if条件为真，而Balking模式不会等待。</p><p>Balking模式的经典实现是使用互斥锁，你可以使用Java语言内置synchronized，也可以使用SDK提供Lock；如果你对互斥锁的性能不满意，可以尝试采用volatile方案，不过使用volatile方案需要你更加谨慎。</p><p>当然你也可以尝试使用双重检查方案来优化性能，双重检查中的第一次检查，完全是出于对性能的考量：避免执行加锁操作，因为加锁操作很耗时。而加锁之后的二次检查，则是出于对安全性负责。双重检查方案在优化加锁性能方面经常用到，例如<a href="https://time.geekbang.org/column/article/88909" target="_blank" rel="noreferrer">《17 | ReadWriteLock：如何快速实现一个完备的缓存？》</a>中实现缓存按需加载功能时，也用到了双重检查方案。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面的示例代码中，init()方法的本意是：仅需计算一次count的值，采用了Balking模式的volatile实现方式，你觉得这个实现是否有问题呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Test{</span></span>
<span class="line"><span>  volatile boolean inited = false;</span></span>
<span class="line"><span>  int count = 0;</span></span>
<span class="line"><span>  void init(){</span></span>
<span class="line"><span>    if(inited){</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    inited = true;</span></span>
<span class="line"><span>    //计算count的值</span></span>
<span class="line"><span>    count = calc();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） zero 👍（58） 💬（3）是有问题的，volatile关键字只能保证可见性，无法保证原子性和互斥性。所以calc方法有可能被重复执行。2019-05-11LeonHan 👍（50） 💬（1）思考题代码相当于： if（intied == false） { // 1 inited = true; //2 count = calc() }</p><p>可能有多条线程同时到1的位置，判断到inited为false，都进入2执行。 解决方案： （1）加锁保护临界区 （2） AtomicBoolean.compareAndSet(false, true) 2019-05-14孙志强 👍（18） 💬（1）inited变量需要使用CAS的方式进行赋值，赋值失败就return，保证只有一个线程可以修改inited变量。2019-05-14Corner 👍（17） 💬（4）最好就不要单独使用volatile防止产生线程安全问题。因为变量的读写是两个操作，和我们的直觉不一样，很容易出问题。老师的那个volatile就没有问题吗？如果一个线程修改了路由表，此时定时器任务判断共享变量为true，在将其修改为false之前，此时另一个线程又修改了路由表，然后定时任务继续执行会将其修改为false，这就出现问题了。最后还是要在autoSave方法上做同步的。2019-05-11岥羽 👍（5） 💬（2）老师，自动保存路由表用 Balking 模式的volatile方式实现中，为什么对共享变量 changed 和 rt 的写操作不存在原子性的要求？2019-08-07Jxin 👍（5） 💬（1）volative修饰的属性。我见过在方法中。用局部变量接收该属性值，方法后续的操作都基于该局部变量。这样是不是就不再有volative的特性了？性能虽然提高了，毕竟能走缓存和编译优化了。但是就像上例双重检查的场景。这么个操作就依旧会有空指针异常的可能。请问老师我理解对吗。2019-06-16锦 👍（5） 💬（1）回答问题： 有问题，volatile不能保证原子性，题目要求只需计算一次Count，所以需要对共享变量inited加锁保护。</p><p>疑问： public class RouterTable 类中AutoSave方法同一时刻只有一个线程调用，而Remove和Add方法也是要求使用方单线程访问吗？在实际开发中一般采用什么方式达成这种约定呢？2019-05-11热台 👍（3） 💬（1）回答问题 1，cal（）可能被执行多次 2. 也可能cal（）执行结束前，count就被使用</p><p>解决方法 inited 赋值和cal（）执行放在一个同步块中，并增加双重check2019-05-11J.M.Liu 👍（3） 💬（1）有问题，存在竞态条件2019-05-11geoxs 👍（0） 💬（1）我有个问题，如果需求不要求只执行一次呢，比如计算很简单，耗费资源不大，多计算几次是可以接受的，可不可以这样写，有没有并发问题呢，甚至我把volitale关键字去掉可不可以呢？2020-09-11晓杰 👍（0） 💬（2）在微服务的场景下，synchornize应该不适用了吧2019-05-12拒绝 👍（0） 💬（1）老师，volatile只能保证变量的可见性，在多线程下，发生线程切换会都读取到变量为false，则计算count方法被调用多次，对吗？2019-05-11郑晨Cc 👍（10） 💬（1）第8行 inited = true；改成cas操作 失败直接return。成功继续执行cal方法2019-05-11逆流的鱼 👍（5） 💬（0）这两个模式怎么这么违和，突兀，虎头虎脑的2019-08-30码小呆 👍（0） 💬（0）感觉需要加锁,无法保证原子性2022-07-03</p>`,31)])])}const h=s(l,[["render",i]]);export{u as __pageData,h as default};
