import{_ as s,o as n,c as e,ae as p}from"./chunks/framework.Iv6F95cJ.js";const T=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/30 - 线程本地存储模式：没有共享，就没有伤害.md","filePath":"books/java-practice/30 - 线程本地存储模式：没有共享，就没有伤害.md"}'),l={name:"books/java-practice/30 - 线程本地存储模式：没有共享，就没有伤害.md"};function t(r,a,c,o,i,d){return n(),e("div",null,[...a[0]||(a[0]=[p(`<p>民国年间某山东省主席参加某大学校庆演讲，在篮球场看到十来个人穿着裤衩抢一个球，观之实在不雅，于是怒斥学校的总务处长贪污，并且发话：“多买几个球，一人发一个，省得你争我抢！”小时候听到这个段子只是觉得好玩，今天再来看，却别有一番滋味。为什么呢？因为其间蕴藏着解决并发问题的一个重要方法：<strong>避免共享</strong>。</p><p>我们曾经一遍一遍又一遍地重复，多个线程同时读写同一共享变量存在并发问题。前面两篇文章我们突破的是写，没有写操作自然没有并发问题了。其实还可以突破共享变量，没有共享变量也不会有并发问题，正所谓是<strong>没有共享，就没有伤害</strong>。</p><p>那如何避免共享呢？思路其实很简单，多个人争一个球总容易出矛盾，那就每个人发一个球。对应到并发编程领域，就是每个线程都拥有自己的变量，彼此之间不共享，也就没有并发问题了。</p><p>我们在<a href="https://time.geekbang.org/column/article/86695" target="_blank" rel="noreferrer">《11 | Java线程（下）：为什么局部变量是线程安全的？》</a>中提到过<strong>线程封闭</strong>，其本质上就是避免共享。你已经知道通过局部变量可以做到避免共享，那还有没有其他方法可以做到呢？有的，<strong>Java语言提供的线程本地存储（ThreadLocal）就能够做到</strong>。下面我们先看看ThreadLocal到底该如何使用。</p><h2 id="threadlocal的使用方法" tabindex="-1">ThreadLocal的使用方法 <a class="header-anchor" href="#threadlocal的使用方法" aria-label="Permalink to &quot;ThreadLocal的使用方法&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面这个静态类ThreadId会为每个线程分配一个唯一的线程Id，如果<strong>一个线程</strong>前后两次调用ThreadId的get()方法，两次get()方法的返回值是相同的。但如果是<strong>两个线程</strong>分别调用ThreadId的get()方法，那么两个线程看到的get()方法的返回值是不同的。若你是初次接触ThreadLocal，可能会觉得奇怪，为什么相同线程调用get()方法结果就相同，而不同线程调用get()方法结果就不同呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static class ThreadId {</span></span>
<span class="line"><span>  static final AtomicLong </span></span>
<span class="line"><span>  nextId=new AtomicLong(0);</span></span>
<span class="line"><span>  //定义ThreadLocal变量</span></span>
<span class="line"><span>  static final ThreadLocal&lt;Long&gt; </span></span>
<span class="line"><span>  tl=ThreadLocal.withInitial(</span></span>
<span class="line"><span>    ()-&gt;nextId.getAndIncrement());</span></span>
<span class="line"><span>  //此方法会为每个线程分配一个唯一的Id</span></span>
<span class="line"><span>  static long get(){</span></span>
<span class="line"><span>    return tl.get();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>能有这个奇怪的结果，都是ThreadLocal的杰作，不过在详细解释ThreadLocal的工作原理之前，我们再看一个实际工作中可能遇到的例子来加深一下对ThreadLocal的理解。你可能知道SimpleDateFormat不是线程安全的，那如果需要在并发场景下使用它，你该怎么办呢？</p><p>其实有一个办法就是用ThreadLocal来解决，下面的示例代码就是ThreadLocal解决方案的具体实现，这段代码与前面ThreadId的代码高度相似，同样地，不同线程调用SafeDateFormat的get()方法将返回不同的SimpleDateFormat对象实例，由于不同线程并不共享SimpleDateFormat，所以就像局部变量一样，是线程安全的。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static class SafeDateFormat {</span></span>
<span class="line"><span>  //定义ThreadLocal变量</span></span>
<span class="line"><span>  static final ThreadLocal&lt;DateFormat&gt;</span></span>
<span class="line"><span>  tl=ThreadLocal.withInitial(</span></span>
<span class="line"><span>    ()-&gt; new SimpleDateFormat(</span></span>
<span class="line"><span>      &quot;yyyy-MM-dd HH:mm:ss&quot;));</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>  static DateFormat get(){</span></span>
<span class="line"><span>    return tl.get();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//不同线程执行下面代码</span></span>
<span class="line"><span>//返回的df是不同的</span></span>
<span class="line"><span>DateFormat df =</span></span>
<span class="line"><span>  SafeDateFormat.get()；</span></span></code></pre></div><p>通过上面两个例子，相信你对ThreadLocal的用法以及应用场景都了解了，下面我们就来详细解释ThreadLocal的工作原理。</p><h2 id="threadlocal的工作原理" tabindex="-1">ThreadLocal的工作原理 <a class="header-anchor" href="#threadlocal的工作原理" aria-label="Permalink to &quot;ThreadLocal的工作原理&quot;">&amp;ZeroWidthSpace;</a></h2><p>在解释ThreadLocal的工作原理之前， 你先自己想想：如果让你来实现ThreadLocal的功能，你会怎么设计呢？ThreadLocal的目标是让不同的线程有不同的变量V，那最直接的方法就是创建一个Map，它的Key是线程，Value是每个线程拥有的变量V，ThreadLocal内部持有这样的一个Map就可以了。你可以参考下面的示意图和示例代码来理解。</p><p><img src="https://static001.geekbang.org/resource/image/6a/34/6a93910f748ebc5b984ae7ac67283034.png?wh=1142%2A484" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>ThreadLocal持有Map的示意图</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class MyThreadLocal&lt;T&gt; {</span></span>
<span class="line"><span>  Map&lt;Thread, T&gt; locals = </span></span>
<span class="line"><span>    new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span>  //获取线程变量  </span></span>
<span class="line"><span>  T get() {</span></span>
<span class="line"><span>    return locals.get(</span></span>
<span class="line"><span>      Thread.currentThread());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //设置线程变量</span></span>
<span class="line"><span>  void set(T t) {</span></span>
<span class="line"><span>    locals.put(</span></span>
<span class="line"><span>      Thread.currentThread(), t);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>那Java的ThreadLocal是这么实现的吗？这一次我们的设计思路和Java的实现差异很大。Java的实现里面也有一个Map，叫做ThreadLocalMap，不过持有ThreadLocalMap的不是ThreadLocal，而是Thread。Thread这个类内部有一个私有属性threadLocals，其类型就是ThreadLocalMap，ThreadLocalMap的Key是ThreadLocal。你可以结合下面的示意图和精简之后的Java实现代码来理解。</p><p><img src="https://static001.geekbang.org/resource/image/3c/02/3cb0a8f15104848dec63eab269bac302.png?wh=1142%2A480" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>Thread持有ThreadLocalMap的示意图</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Thread {</span></span>
<span class="line"><span>  //内部持有ThreadLocalMap</span></span>
<span class="line"><span>  ThreadLocal.ThreadLocalMap </span></span>
<span class="line"><span>    threadLocals;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>class ThreadLocal&lt;T&gt;{</span></span>
<span class="line"><span>  public T get() {</span></span>
<span class="line"><span>    //首先获取线程持有的</span></span>
<span class="line"><span>    //ThreadLocalMap</span></span>
<span class="line"><span>    ThreadLocalMap map =</span></span>
<span class="line"><span>      Thread.currentThread()</span></span>
<span class="line"><span>        .threadLocals;</span></span>
<span class="line"><span>    //在ThreadLocalMap中</span></span>
<span class="line"><span>    //查找变量</span></span>
<span class="line"><span>    Entry e = </span></span>
<span class="line"><span>      map.getEntry(this);</span></span>
<span class="line"><span>    return e.value;  </span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  static class ThreadLocalMap{</span></span>
<span class="line"><span>    //内部是数组而不是Map</span></span>
<span class="line"><span>    Entry[] table;</span></span>
<span class="line"><span>    //根据ThreadLocal查找Entry</span></span>
<span class="line"><span>    Entry getEntry(ThreadLocal key){</span></span>
<span class="line"><span>      //省略查找逻辑</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //Entry定义</span></span>
<span class="line"><span>    static class Entry extends</span></span>
<span class="line"><span>    WeakReference&lt;ThreadLocal&gt;{</span></span>
<span class="line"><span>      Object value;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>初看上去，我们的设计方案和Java的实现仅仅是Map的持有方不同而已，我们的设计里面Map属于ThreadLocal，而Java的实现里面ThreadLocalMap则是属于Thread。这两种方式哪种更合理呢？很显然Java的实现更合理一些。在Java的实现方案里面，ThreadLocal仅仅是一个代理工具类，内部并不持有任何与线程相关的数据，所有和线程相关的数据都存储在Thread里面，这样的设计容易理解。而从数据的亲缘性上来讲，ThreadLocalMap属于Thread也更加合理。</p><p>当然还有一个更加深层次的原因，那就是<strong>不容易产生内存泄露</strong>。在我们的设计方案中，ThreadLocal持有的Map会持有Thread对象的引用，这就意味着，只要ThreadLocal对象存在，那么Map中的Thread对象就永远不会被回收。ThreadLocal的生命周期往往都比线程要长，所以这种设计方案很容易导致内存泄露。而Java的实现中Thread持有ThreadLocalMap，而且ThreadLocalMap里对ThreadLocal的引用还是弱引用（WeakReference），所以只要Thread对象可以被回收，那么ThreadLocalMap就能被回收。Java的这种实现方案虽然看上去复杂一些，但是更加安全。</p><p>Java的ThreadLocal实现应该称得上深思熟虑了，不过即便如此深思熟虑，还是不能百分百地让程序员避免内存泄露，例如在线程池中使用ThreadLocal，如果不谨慎就可能导致内存泄露。</p><h2 id="threadlocal与内存泄露" tabindex="-1">ThreadLocal与内存泄露 <a class="header-anchor" href="#threadlocal与内存泄露" aria-label="Permalink to &quot;ThreadLocal与内存泄露&quot;">&amp;ZeroWidthSpace;</a></h2><p>在线程池中使用ThreadLocal为什么可能导致内存泄露呢？原因就出在线程池中线程的存活时间太长，往往都是和程序同生共死的，这就意味着Thread持有的ThreadLocalMap一直都不会被回收，再加上ThreadLocalMap中的Entry对ThreadLocal是弱引用（WeakReference），所以只要ThreadLocal结束了自己的生命周期是可以被回收掉的。但是Entry中的Value却是被Entry强引用的，所以即便Value的生命周期结束了，Value也是无法被回收的，从而导致内存泄露。</p><p>那在线程池中，我们该如何正确使用ThreadLocal呢？其实很简单，既然JVM不能做到自动释放对Value的强引用，那我们手动释放就可以了。如何能做到手动释放呢？估计你马上想到<strong>try{}finally{}方案</strong>了，这个简直就是<strong>手动释放资源的利器</strong>。示例的代码如下，你可以参考学习。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ExecutorService es;</span></span>
<span class="line"><span>ThreadLocal tl;</span></span>
<span class="line"><span>es.execute(()-&gt;{</span></span>
<span class="line"><span>  //ThreadLocal增加变量</span></span>
<span class="line"><span>  tl.set(obj);</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    // 省略业务逻辑代码</span></span>
<span class="line"><span>  }finally {</span></span>
<span class="line"><span>    //手动清理ThreadLocal </span></span>
<span class="line"><span>    tl.remove();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre></div><h2 id="inheritablethreadlocal与继承性" tabindex="-1">InheritableThreadLocal与继承性 <a class="header-anchor" href="#inheritablethreadlocal与继承性" aria-label="Permalink to &quot;InheritableThreadLocal与继承性&quot;">&amp;ZeroWidthSpace;</a></h2><p>通过ThreadLocal创建的线程变量，其子线程是无法继承的。也就是说你在线程中通过ThreadLocal创建了线程变量V，而后该线程创建了子线程，你在子线程中是无法通过ThreadLocal来访问父线程的线程变量V的。</p><p>如果你需要子线程继承父线程的线程变量，那该怎么办呢？其实很简单，Java提供了InheritableThreadLocal来支持这种特性，InheritableThreadLocal是ThreadLocal子类，所以用法和ThreadLocal相同，这里就不多介绍了。</p><p>不过，我完全不建议你在线程池中使用InheritableThreadLocal，不仅仅是因为它具有ThreadLocal相同的缺点——可能导致内存泄露，更重要的原因是：线程池中线程的创建是动态的，很容易导致继承关系错乱，如果你的业务逻辑依赖InheritableThreadLocal，那么很可能导致业务逻辑计算错误，而这个错误往往比内存泄露更要命。</p><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>线程本地存储模式本质上是一种避免共享的方案，由于没有共享，所以自然也就没有并发问题。如果你需要在并发场景中使用一个线程不安全的工具类，最简单的方案就是避免共享。避免共享有两种方案，一种方案是将这个工具类作为局部变量使用，另外一种方案就是线程本地存储模式。这两种方案，局部变量方案的缺点是在高并发场景下会频繁创建对象，而线程本地存储方案，每个线程只需要创建一个工具类的实例，所以不存在频繁创建对象的问题。</p><p>线程本地存储模式是解决并发问题的常用方案，所以Java SDK也提供了相应的实现：ThreadLocal。通过上面我们的分析，你应该能体会到Java SDK的实现已经是深思熟虑了，不过即便如此，仍不能尽善尽美，例如在线程池中使用ThreadLocal仍可能导致内存泄漏，所以使用ThreadLocal还是需要你打起精神，足够谨慎。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>实际工作中，有很多平台型的技术方案都是采用ThreadLocal来传递一些上下文信息，例如Spring使用ThreadLocal来传递事务信息。我们曾经说过，异步编程已经很成熟了，那你觉得在异步场景中，是否可以使用Spring的事务管理器呢？</p><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） 右耳听海 👍（129） 💬（13）有个疑问请教老师，避免共享变量的两种解决方案，在高并发情况下，使用局部变量会频繁创建对象，使用threadlocal也是针对线程创建新变量，都是针对线程维度，threadlocal并未体现出什么优势，为什么还要用threadlocal2019-05-07晓杰 👍（100） 💬（1）不可以，因为ThreadLocal内的变量是线程级别的，而异步编程意味着线程不同，不同线程的变量不可以共享2019-05-07承香墨影 👍（66） 💬（1）老师您好，有个问题想请教。 在线程池中使用 ThreadLocal，您给的解决方案是，使用后手动释放。 那这样和使用线程的局部变量有什么区别？每次线程执行的时候都去创建对象并存储在 ThreadLocal 中，用完就释放掉了，下次执行依然需要重新创建，并存入 ThreadLocalMap 中，这样并没有解决局部变量频繁创建对象的问题。2019-05-22QQ怪 👍（50） 💬（2）上面有些同学说多线程是simpledateformat会打印出一样名称的对象，我刚刚也试了下，的确可以复现，但其实是simpledateformat对象的toString()方法搞得鬼，该类是继承object类的tostring方法，如下有个hashcode()方法，但该类重写了hashcode方法，在追溯到hashcode方法，pattern.hashcode(),pattern就是我们的yyyy-MM-dd,这个是一直保持不变的，现在终于真相大白了2019-05-07linqw 👍（15） 💬（2）自己写了下对ThreadLocal的源码分析https://juejin.im/post/5ce7e0596fb9a07ee742ba79，感兴趣的可以看下哦，老师也帮忙看下哦 2019-05-25So 👍（13） 💬（3）一个ThreadLocal只能保存一个变量，那如果有多个变量要保存，是不是要建多个ThreadLocal？2019-09-11晓杰 👍（7） 💬（1）请问一下老师，我刚刚对simpledateformat加threadlocal，但是不同线程得到的simpledateformat对象是一样的，代码如下： public class Tool { public static void main(String[] args) throws Exception{ System.out.println(SafeDateFormat.get()); System.out.println(Thread.currentThread().getName()); new Thread(new Runnable() { @Override public void run() { System.out.println(Thread.currentThread().getName()); System.out.println(SafeDateFormat.get()); } }).start();</p><pre><code>}

static class SafeDateFormat{
    static final ThreadLocal&amp;lt;SimpleDateFormat&amp;gt; sdf =
            ThreadLocal.withInitial(()-&amp;gt;new SimpleDateFormat(&amp;quot;yyyy-MM-dd HH:mm:ss&amp;quot;));
    static SimpleDateFormat get(){
        return sdf.get();
    }
}
</code></pre><p>} 请问存在什么问题2019-05-07天天向善 👍（5） 💬（2）有个疑问请教，线程多路复用，使用thread local有什么注意的，会不会不同请求获取内容相同，造成后续业务错误2019-05-08盐多必失 👍（4） 💬（1）某山东省主席…… 宝令小哥哥这加密算法做得太好了，^_^2019-06-09xinglichea 👍（3） 💬（2）老师， 文中提到解决内存泄露的方法是显示调用remove()方法，但貌似ThreadLocalMap的设计中已经考虑到这种情况，也加上了一些防护措施：在ThreadLocal的get(),set(),remove()的时候都会清除线程ThreadLocalMap里所有key为null的value，即：在ThreadLocalMap中的setEntry()、getEntry()，如果遇到key == null的情况，会对value设置为null。</p><p>那么是不是可以说明，如果线程在后续操作中会继续调用set()、get()的话，就不需要显示调用remove()了。2019-08-26拯救地球好累 👍（3） 💬（1）---启发--- 老师对ThreadLocal的思考上，让我对理解一个类的设计问题上有所启发。对一个类的实例、方法等的设计，除了功能上的考虑外，也要考虑安全性、性能问题，也可以站在抽象的角度思考其逻辑。 2019-07-28俺能学个啥 👍（0） 💬（1）异步意味着多线程，不能用ThreadLocal继而无法使用事务2021-03-16_light 👍（0） 💬（1）老师，你好 阿里有一个TransmittableThreadLocal据说是支持线程池线程复用的继承了InheritableThreadLocal类的东西，我试了下确实可以，他可以在线程池线程执行时拿到正确的父类本地变量，其实也不是父类，就是初始化赋值TransmittableThreadLocal的那个线程的数据，因为我们的线程池一般都是静态全局的，谁是父类都说不清楚。感觉这个好强大啊，他包装了线程池，看了好几次源码都没啃下来，实在是好奇怎么实现的，老师有空可以帮我们分析下不啦😀2019-05-09张天屹 👍（0） 💬（1）老师你好，请教一下，spring有事务管理并发安全，但是事务里使用异步编程的安全一般怎么保证呢？比如在事务里新开一个线程执行service方法，这个方法会脱离原有的事务，如果这个异步方法里涉及到对数据库的操作，应该怎么保证数据安全性呢？在保证安全的情况下，spring的事务方法中哪些操作适合异步执行呢？2019-05-07峰 👍（20） 💬（0）java实现异步的方式基本上就是多线程了，而threadlocal是线程封闭的，不能在线程之间共享，就谈不上全局的事务管理了。2019-05-07</p>`,40)])])}const g=s(l,[["render",t]]);export{T as __pageData,g as default};
