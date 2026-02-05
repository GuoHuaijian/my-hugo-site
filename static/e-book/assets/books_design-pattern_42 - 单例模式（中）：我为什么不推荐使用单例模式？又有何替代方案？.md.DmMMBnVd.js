import{_ as a,o as s,c as e,ae as p}from"./chunks/framework.Iv6F95cJ.js";const h=JSON.parse('{"title":"作业","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/42 - 单例模式（中）：我为什么不推荐使用单例模式？又有何替代方案？.md","filePath":"books/design-pattern/42 - 单例模式（中）：我为什么不推荐使用单例模式？又有何替代方案？.md"}'),i={name:"books/design-pattern/42 - 单例模式（中）：我为什么不推荐使用单例模式？又有何替代方案？.md"};function l(t,n,c,r,o,d){return s(),e("div",null,[...n[0]||(n[0]=[p(`<p>上一节课中，我们通过两个实战案例，讲解了单例模式的一些应用场景，比如，避免资源访问冲突、表示业务概念上的全局唯一类。除此之外，我们还学习了Java语言中，单例模式的几种实现方法。如果你熟悉的是其他编程语言，不知道你课后有没有自己去对照着实现一下呢？</p><p>尽管单例是一个很常用的设计模式，在实际的开发中，我们也确实经常用到它，但是，有些人认为单例是一种反模式（anti-pattern），并不推荐使用。所以，今天，我就针对这个说法详细地讲讲这几个问题：单例这种设计模式存在哪些问题？为什么会被称为反模式？如果不用单例，该如何表示全局唯一类？有何替代的解决方案？</p><p>话不多说，让我们带着这些问题，正式开始今天的学习吧！</p><h2 id="单例存在哪些问题" tabindex="-1">单例存在哪些问题? <a class="header-anchor" href="#单例存在哪些问题" aria-label="Permalink to &quot;单例存在哪些问题?&quot;">&amp;ZeroWidthSpace;</a></h2><p>大部分情况下，我们在项目中使用单例，都是用它来表示一些全局唯一类，比如配置信息类、连接池类、ID生成器类。单例模式书写简洁、使用方便，在代码中，我们不需要创建对象，直接通过类似IdGenerator.getInstance().getId()这样的方法来调用就可以了。但是，这种使用方法有点类似硬编码（hard code），会带来诸多问题。接下来，我们就具体看看到底有哪些问题。</p><h3 id="_1-单例对oop特性的支持不友好" tabindex="-1">1.单例对OOP特性的支持不友好 <a class="header-anchor" href="#_1-单例对oop特性的支持不友好" aria-label="Permalink to &quot;1.单例对OOP特性的支持不友好&quot;">&amp;ZeroWidthSpace;</a></h3><p>我们知道，OOP的四大特性是封装、抽象、继承、多态。单例这种设计模式对于其中的抽象、继承、多态都支持得不好。为什么这么说呢？我们还是通过IdGenerator这个例子来讲解。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Order {</span></span>
<span class="line"><span>  public void create(...) {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    long id = IdGenerator.getInstance().getId();</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class User {</span></span>
<span class="line"><span>  public void create(...) {</span></span>
<span class="line"><span>    // ...</span></span>
<span class="line"><span>    long id = IdGenerator.getInstance().getId();</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>IdGenerator的使用方式违背了基于接口而非实现的设计原则，也就违背了广义上理解的OOP的抽象特性。如果未来某一天，我们希望针对不同的业务采用不同的ID生成算法。比如，订单ID和用户ID采用不同的ID生成器来生成。为了应对这个需求变化，我们需要修改所有用到IdGenerator类的地方，这样代码的改动就会比较大。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Order {</span></span>
<span class="line"><span>  public void create(...) {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    long id = IdGenerator.getInstance().getId();</span></span>
<span class="line"><span>    // 需要将上面一行代码，替换为下面一行代码</span></span>
<span class="line"><span>    long id = OrderIdGenerator.getIntance().getId();</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class User {</span></span>
<span class="line"><span>  public void create(...) {</span></span>
<span class="line"><span>    // ...</span></span>
<span class="line"><span>    long id = IdGenerator.getInstance().getId();</span></span>
<span class="line"><span>    // 需要将上面一行代码，替换为下面一行代码</span></span>
<span class="line"><span>    long id = UserIdGenerator.getIntance().getId();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>除此之外，单例对继承、多态特性的支持也不友好。这里我之所以会用“不友好”这个词，而非“完全不支持”，是因为从理论上来讲，单例类也可以被继承、也可以实现多态，只是实现起来会非常奇怪，会导致代码的可读性变差。不明白设计意图的人，看到这样的设计，会觉得莫名其妙。所以，一旦你选择将某个类设计成到单例类，也就意味着放弃了继承和多态这两个强有力的面向对象特性，也就相当于损失了可以应对未来需求变化的扩展性。</p><h3 id="_2-单例会隐藏类之间的依赖关系" tabindex="-1">2.单例会隐藏类之间的依赖关系 <a class="header-anchor" href="#_2-单例会隐藏类之间的依赖关系" aria-label="Permalink to &quot;2.单例会隐藏类之间的依赖关系&quot;">&amp;ZeroWidthSpace;</a></h3><p>我们知道，代码的可读性非常重要。在阅读代码的时候，我们希望一眼就能看出类与类之间的依赖关系，搞清楚这个类依赖了哪些外部类。</p><p>通过构造函数、参数传递等方式声明的类之间的依赖关系，我们通过查看函数的定义，就能很容易识别出来。但是，单例类不需要显示创建、不需要依赖参数传递，在函数中直接调用就可以了。如果代码比较复杂，这种调用关系就会非常隐蔽。在阅读代码的时候，我们就需要仔细查看每个函数的代码实现，才能知道这个类到底依赖了哪些单例类。</p><h3 id="_3-单例对代码的扩展性不友好" tabindex="-1">3.单例对代码的扩展性不友好 <a class="header-anchor" href="#_3-单例对代码的扩展性不友好" aria-label="Permalink to &quot;3.单例对代码的扩展性不友好&quot;">&amp;ZeroWidthSpace;</a></h3><p>我们知道，单例类只能有一个对象实例。如果未来某一天，我们需要在代码中创建两个实例或多个实例，那就要对代码有比较大的改动。你可能会说，会有这样的需求吗？既然单例类大部分情况下都用来表示全局类，怎么会需要两个或者多个实例呢？</p><p>实际上，这样的需求并不少见。我们拿数据库连接池来举例解释一下。</p><p>在系统设计初期，我们觉得系统中只应该有一个数据库连接池，这样能方便我们控制对数据库连接资源的消耗。所以，我们把数据库连接池类设计成了单例类。但之后我们发现，系统中有些SQL语句运行得非常慢。这些SQL语句在执行的时候，长时间占用数据库连接资源，导致其他SQL请求无法响应。为了解决这个问题，我们希望将慢SQL与其他SQL隔离开来执行。为了实现这样的目的，我们可以在系统中创建两个数据库连接池，慢SQL独享一个数据库连接池，其他SQL独享另外一个数据库连接池，这样就能避免慢SQL影响到其他SQL的执行。</p><p>如果我们将数据库连接池设计成单例类，显然就无法适应这样的需求变更，也就是说，单例类在某些情况下会影响代码的扩展性、灵活性。所以，数据库连接池、线程池这类的资源池，最好还是不要设计成单例类。实际上，一些开源的数据库连接池、线程池也确实没有设计成单例类。</p><h3 id="_4-单例对代码的可测试性不友好" tabindex="-1">4.单例对代码的可测试性不友好 <a class="header-anchor" href="#_4-单例对代码的可测试性不友好" aria-label="Permalink to &quot;4.单例对代码的可测试性不友好&quot;">&amp;ZeroWidthSpace;</a></h3><p>单例模式的使用会影响到代码的可测试性。如果单例类依赖比较重的外部资源，比如DB，我们在写单元测试的时候，希望能通过mock的方式将它替换掉。而单例类这种硬编码式的使用方式，导致无法实现mock替换。</p><p>除此之外，如果单例类持有成员变量（比如IdGenerator中的id成员变量），那它实际上相当于一种全局变量，被所有的代码共享。如果这个全局变量是一个可变全局变量，也就是说，它的成员变量是可以被修改的，那我们在编写单元测试的时候，还需要注意不同测试用例之间，修改了单例类中的同一个成员变量的值，从而导致测试结果互相影响的问题。关于这一点，你可以回过头去看下<a href="https://time.geekbang.org/column/article/186691" target="_blank" rel="noreferrer">第29讲</a>中的“其他常见的Anti-Patterns：全局变量”那部分的代码示例和讲解。</p><h3 id="_5-单例不支持有参数的构造函数" tabindex="-1">5.单例不支持有参数的构造函数 <a class="header-anchor" href="#_5-单例不支持有参数的构造函数" aria-label="Permalink to &quot;5.单例不支持有参数的构造函数&quot;">&amp;ZeroWidthSpace;</a></h3><p>单例不支持有参数的构造函数，比如我们创建一个连接池的单例对象，我们没法通过参数来指定连接池的大小。针对这个问题，我们来看下都有哪些解决方案。</p><p>第一种解决思路是：创建完实例之后，再调用init()函数传递参数。需要注意的是，我们在使用这个单例类的时候，要先调用init()方法，然后才能调用getInstance()方法，否则代码会抛出异常。具体的代码实现如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Singleton {</span></span>
<span class="line"><span>  private static Singleton instance = null;</span></span>
<span class="line"><span>  private final int paramA;</span></span>
<span class="line"><span>  private final int paramB;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private Singleton(int paramA, int paramB) {</span></span>
<span class="line"><span>    this.paramA = paramA;</span></span>
<span class="line"><span>    this.paramB = paramB;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static Singleton getInstance() {</span></span>
<span class="line"><span>    if (instance == null) {</span></span>
<span class="line"><span>       throw new RuntimeException(&quot;Run init() first.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return instance;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public synchronized static Singleton init(int paramA, int paramB) {</span></span>
<span class="line"><span>    if (instance != null){</span></span>
<span class="line"><span>       throw new RuntimeException(&quot;Singleton has been created!&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    instance = new Singleton(paramA, paramB);</span></span>
<span class="line"><span>    return instance;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Singleton.init(10, 50); // 先init，再使用</span></span>
<span class="line"><span>Singleton singleton = Singleton.getInstance();</span></span></code></pre></div><p>第二种解决思路是：将参数放到getIntance()方法中。具体的代码实现如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Singleton {</span></span>
<span class="line"><span>  private static Singleton instance = null;</span></span>
<span class="line"><span>  private final int paramA;</span></span>
<span class="line"><span>  private final int paramB;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private Singleton(int paramA, int paramB) {</span></span>
<span class="line"><span>    this.paramA = paramA;</span></span>
<span class="line"><span>    this.paramB = paramB;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public synchronized static Singleton getInstance(int paramA, int paramB) {</span></span>
<span class="line"><span>    if (instance == null) {</span></span>
<span class="line"><span>      instance = new Singleton(paramA, paramB);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return instance;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Singleton singleton = Singleton.getInstance(10, 50);</span></span></code></pre></div><p>不知道你有没有发现，上面的代码实现稍微有点问题。如果我们如下两次执行getInstance()方法，那获取到的singleton1和signleton2的paramA和paramB都是10和50。也就是说，第二次的参数（20，30）没有起作用，而构建的过程也没有给与提示，这样就会误导用户。这个问题如何解决呢？留给你自己思考，你可以在留言区说说你的解决思路。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Singleton singleton1 = Singleton.getInstance(10, 50);</span></span>
<span class="line"><span>Singleton singleton2 = Singleton.getInstance(20, 30);</span></span></code></pre></div><p>第三种解决思路是：将参数放到另外一个全局变量中。具体的代码实现如下。Config是一个存储了paramA和paramB值的全局变量。里面的值既可以像下面的代码那样通过静态常量来定义，也可以从配置文件中加载得到。实际上，这种方式是最值得推荐的。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Config {</span></span>
<span class="line"><span>  public static final int PARAM_A = 123;</span></span>
<span class="line"><span>  public static final int PARAM_B = 245;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class Singleton {</span></span>
<span class="line"><span>  private static Singleton instance = null;</span></span>
<span class="line"><span>  private final int paramA;</span></span>
<span class="line"><span>  private final int paramB;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private Singleton() {</span></span>
<span class="line"><span>    this.paramA = Config.PARAM_A;</span></span>
<span class="line"><span>    this.paramB = Config.PARAM_B;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public synchronized static Singleton getInstance() {</span></span>
<span class="line"><span>    if (instance == null) {</span></span>
<span class="line"><span>      instance = new Singleton();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return instance;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="有何替代解决方案" tabindex="-1">有何替代解决方案？ <a class="header-anchor" href="#有何替代解决方案" aria-label="Permalink to &quot;有何替代解决方案？&quot;">&amp;ZeroWidthSpace;</a></h2><p>刚刚我们提到了单例的很多问题，你可能会说，即便单例有这么多问题，但我不用不行啊。我业务上有表示全局唯一类的需求，如果不用单例，我怎么才能保证这个类的对象全局唯一呢？</p><p>为了保证全局唯一，除了使用单例，我们还可以用静态方法来实现。这也是项目开发中经常用到的一种实现思路。比如，上一节课中讲的ID唯一递增生成器的例子，用静态方法实现一下，就是下面这个样子：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 静态方法实现方式</span></span>
<span class="line"><span>public class IdGenerator {</span></span>
<span class="line"><span>  private static AtomicLong id = new AtomicLong(0);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public static long getId() { </span></span>
<span class="line"><span>    return id.incrementAndGet();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 使用举例</span></span>
<span class="line"><span>long id = IdGenerator.getId();</span></span></code></pre></div><p>不过，静态方法这种实现思路，并不能解决我们之前提到的问题。实际上，它比单例更加不灵活，比如，它无法支持延迟加载。我们再来看看有没有其他办法。实际上，单例除了我们之前讲到的使用方法之外，还有另外一种使用方法。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 老的使用方式</span></span>
<span class="line"><span>public demofunction() {</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>  long id = IdGenerator.getInstance().getId();</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 新的使用方式：依赖注入</span></span>
<span class="line"><span>public demofunction(IdGenerator idGenerator) {</span></span>
<span class="line"><span>  long id = idGenerator.getId();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 外部调用demofunction()的时候，传入idGenerator</span></span>
<span class="line"><span>IdGenerator idGenerator = IdGenerator.getInsance();</span></span>
<span class="line"><span>demofunction(idGenerator);</span></span></code></pre></div><p>基于新的使用方式，我们将单例生成的对象，作为参数传递给函数（也可以通过构造函数传递给类的成员变量），可以解决单例隐藏类之间依赖关系的问题。不过，对于单例存在的其他问题，比如对OOP特性、扩展性、可测性不友好等问题，还是无法解决。</p><p>所以，如果要完全解决这些问题，我们可能要从根上，寻找其他方式来实现全局唯一类。实际上，类对象的全局唯一性可以通过多种不同的方式来保证。我们既可以通过单例模式来强制保证，也可以通过工厂模式、IOC容器（比如Spring IOC容器）来保证，还可以通过程序员自己来保证（自己在编写代码的时候自己保证不要创建两个类对象）。这就类似Java中内存对象的释放由JVM来负责，而C++中由程序员自己负责，道理是一样的。</p><p>对于替代方案工厂模式、IOC容器的详细讲解，我们放到后面的章节中讲解。</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们来一块总结回顾一下，你需要掌握的重点内容。</p><p><strong>1.单例存在哪些问题？</strong></p><ul><li>单例对OOP特性的支持不友好</li><li>单例会隐藏类之间的依赖关系</li><li>单例对代码的扩展性不友好</li><li>单例对代码的可测试性不友好</li><li>单例不支持有参数的构造函数</li></ul><p><strong>2.单例有什么替代解决方案？</strong></p><p>为了保证全局唯一，除了使用单例，我们还可以用静态方法来实现。不过，静态方法这种实现思路，并不能解决我们之前提到的问题。如果要完全解决这些问题，我们可能要从根上，寻找其他方式来实现全局唯一类了。比如，通过工厂模式、IOC容器（比如Spring IOC容器）来保证，由程序员自己来保证（自己在编写代码的时候自己保证不要创建两个类对象）。</p><p>有人把单例当作反模式，主张杜绝在项目中使用。我个人觉得这有点极端。模式没有对错，关键看你怎么用。如果单例类并没有后续扩展的需求，并且不依赖外部系统，那设计成单例类就没有太大问题。对于一些全局的类，我们在其他地方new的话，还要在类之间传来传去，不如直接做成单例类，使用起来简洁方便。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>1.如果项目中已经用了很多单例模式，比如下面这段代码，我们该如何在尽量减少代码改动的情况下，通过重构代码来提高代码的可测试性呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Demo {</span></span>
<span class="line"><span>  private UserRepo userRepo; // 通过构造哈函数或IOC容器依赖注入</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public boolean validateCachedUser(long userId) {</span></span>
<span class="line"><span>    User cachedUser = CacheManager.getInstance().getUser(userId);</span></span>
<span class="line"><span>    User actualUser = userRepo.getUser(userId);</span></span>
<span class="line"><span>    // 省略核心逻辑：对比cachedUser和actualUser...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>2.在单例支持参数传递的第二种解决方案中，如果我们两次执行getInstance(paramA, paramB)方法，第二次传递进去的参数是不生效的，而构建的过程也没有给与提示，这样就会误导用户。这个问题如何解决呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Singleton singleton1 = Singleton.getInstance(10, 50);</span></span>
<span class="line"><span>Singleton singleton2 = Singleton.getInstance(20, 30);</span></span></code></pre></div><p>欢迎留言和我分享你的思考和见解。如果有收获，也欢迎你把文章分享给你的朋友。 精选留言（15） Roger宇 👍（7） 💬（1）想问一下老师，所谓两个资源池，慢的请求独占一个的设计，如何知道一个sql请求会快会慢？快与慢更多是在运行后才知道的，已经进去运行了还怎么保证独占呢？除非有机制可以在处理sql请求之前评估可能需要的时间。2020-05-15小晏子 👍（124） 💬（21）课堂讨论，</p><ol><li>把代码“User cachedUser = CacheManager.getInstance().getUser(userId);”单独提取出来做成一个单独的函数，这样这个函数就可以进行mock了，进而方便测试validateCachedUser。</li><li>可以判断传进来的参数和已经存在的instance里面的两个成员变量的值，如果全部相等，就直接返回已经存在的instance，否则就新创建一个instance返回。示例如下：</li></ol><p>public synchronized static Singleton getInstance(int paramA, int paramB) { if (instance == null) { instance = new Singleton(paramA, paramB); } else if (instance.paramA == paramA &amp;&amp; instance.paramB == paramB) { return instance; } else { instance = new Singleton(paramA, paramB); } return instance; }2020-02-07J.Smile 👍（85） 💬（2）模式没有对错，关键看你怎么用。这句话说的很对，所以其实所谓单例模式的缺点这种说法还是有点牵强！2020-02-07Richie 👍（67） 💬（3）课堂讨论第2点，我认为应该先搞清楚需求，为什么需要在getInstance()方法中加参数，想要达到什么目的？ 这里分两种情况讨论一下：</p><ol><li>如果的确需要一个全局唯一的类，并且这个类只能被初始化一次，那么应该采用文中提到的第三种解决思路，即将所需参数放到全局的配置文件中，从而避免多次初始化参数被忽略或者抛出运行时异常的问题；</li><li>如果是要根据不同参数构造出不同的对象，并且相同参数的对象只被构造一次，那么应该改成在Singleton类中维护一个HashMap，然后每次调用getInstance()方法的时候，根据参数去判断对象是否已经存在了（可以采用双重检测），存在则直接返回，不存在再去创建，然后存储，返回。个人理解，这应该是单例+简单工厂的结合。2020-03-08李小四 👍（31） 💬（1）设计模式_42:</li></ol><h1 id="作业" tabindex="-1">作业 <a class="header-anchor" href="#作业" aria-label="Permalink to &quot;作业&quot;">&amp;ZeroWidthSpace;</a></h1><ol><li>可以把单例的对象以依赖注入的方式传入方法；</li><li>第二次调用时，如果参数发生了变化，应该抛出异常。</li></ol><h1 id="感想" tabindex="-1">感想 <a class="header-anchor" href="#感想" aria-label="Permalink to &quot;感想&quot;">&amp;ZeroWidthSpace;</a></h1><p>坦白讲，一直以使用双重检测沾沾自喜。。。现在看来，要不要使用单例要比使用那种单例的实现方式更需要投入思考。2020-02-22林子er 👍（21） 💬（0）由于单例本身存在的一系列缺点，而单例一般又都是全局的，因而一般我们项目中很少直接使用单例，而是通过容器注入，让容器充当单例和工厂。有时候我们甚至使用伪单例，即类本身并不是单例的，而是通过容器保证单例性，实际编程中按照约定只通过容器获取该实例。 参数化单例实际中是通过Map解决的，即同样的参数才返回同一个实例，不同的参数返回不同的实例，为了保证实例不会太多，一般可传的参数我们会事先做了限制，比如只能使用配置文件中配置的（如数据库连接池的名称）2020-04-23webmin 👍（8） 💬（3）1. 如果项目中已经用了很多单例模式，比如下面这段代码，我们该如何在尽量减少代码改动的情况下，通过重构代码来提高代码的可测试性呢？ CacheManager.getInstance(long userId)中增加Mock开关，如： private User mockUser; public CacheManager.setMockObj(User mockUser) public User getInstance(long userId) { if(mockUser != null &amp;&amp; mockUser.getUserId() == userId) { return mockUser } } 2. 在单例支持参数传递的第二种解决方案中，如果我们两次执行 getInstance(paramA, paramB) 方法，第二次传递进去的参数是不生效的，而构建的过程也没有给与提示，这样就会误导用户。这个问题如何解决呢？ 第一次构造Instance成功时需要记录paramA和paramB，在以后的调用需要匹配paramA与paramB构造成功Instance时的参数是否一至，不一至时需要抛出异常。2020-02-07小麦 👍（6） 💬（3）不太能理解的使用方式违背了基于接口而非实现的设计原则，比如 spring 中的 service 类一般也是单例的，也是继承接口，controller 的调用也是基于接口，不觉得有什么问题啊，如果实现类变了，也只是改注入而已啊。 2020-04-03黄林晴 👍（6） 💬（0）打卡2020-02-07@二十一大叔 👍（5） 💬（1）1. public class Demo {</p><pre><code>    private UserRepo userRepo; &amp;#47;&amp;#47; 通过构造哈函数或IOC容器依赖注入
    private CacheManager cacheManager; &amp;#47;&amp;#47; 将获取CacheManager对象提出来，通过依赖注入的方式初始化

    public Demo(CacheManager cacheManager){
        this.cacheManager = cacheManager;
    }

    public boolean validateCachedUser(long userId) {
        User cachedUser = getCachedUser(userId);
        User actualUser =userRepo.getUser(userId);
        &amp;#47;&amp;#47; 省略核心逻辑：对比cachedUser和actualUser...
    }
    
    public User getCachedUser(long userId){
        return cacheManager.getInstance().getUser(userId);
    }

    static class MockManager extends CacheManager {
        private static MockManager mockManager;
        
        private MockManager(){}

        public static MockManager getInstance(){
            &amp;#47;&amp;#47;todo
            return mockManager;
        }

        public static User getUser(long userId){
            &amp;#47;&amp;#47; 返回mock数据
            return new User(userId);
        }
    }

public static void main(String[] args) {
    CacheManager cacheManager = MockManager().getInstance();
    Demo demo = new Demo(cacheManager);
    User user = demo.getCachedUser(123L);
}2022-09-27Eden Ma 👍（5） 💬（1）
</code></pre><p>2、instance不为空抛出异常2020-02-07Ken张云忠 👍（3） 💬（0）1.下面这段代码，我们该如何在尽量减少代码改动的情况下，通过重构代码来提高代码的可测试性呢？ 将单例类中新增一个用于获取测试instance的函数,命名getTestInstance(User testUser),该函数中把需要的测试用例通过参数传入instance当中,当要做测试时就可以通过getTestInstance函数来获取实例得到需要的测试数据. public boolean validateCachedUser(long userId) { User actualUser = userRepo.getUser(userId); //User cachedUser = CacheManager.getInstance().getUser(userId);//生产使用 User cachedUser = CacheManager.getTestInstance(actualUser).getUser(userId);//测试使用 // 省略核心逻辑：对比cachedUser和actualUser... } 2.第二次传递进去的参数是不生效的，而构建的过程也没有给与提示，这样就会误导用户。这个问题如何解决呢？ 第二次调用getInstance时如果带有与之前相同参数就直接返回instance实例;如果参数不相同且业务允许构建新的instance实例就允许再第二次getInstance时构建新的实例,如果业务不允许就在构建时抛出异常. public synchronized static Singleton getInstance(int paramA, int paramB) { if (instance == null) { instance = new Singleton(paramA, paramB); } else if (this.paramA != paramA || this.paramB != paramB) { //instance = new Singleton(paramA, paramB);// 业务允许 throw new RuntimeException(&quot;Singleton has been created!&quot;);// 业务不允许 } return instance; }2020-02-09红烧冰淇淋 👍（2） 💬（1）难道单例模式最大的问题不是没办法横向扩展吗？</p><p>现在都是多实例部署了，单个实例内部的单例模式没有啥意义2022-08-17木子 👍（2） 💬（0）在我们视野内（经验或者业务建模上），立足脚下的取应用单例模式2020-08-18小动物 👍（2） 💬（0）之前重构过一个简单业务模块，原入口是一个简单的单例：biz1class.getinstance().doSomething()。但新需求单例模式不支持，需要支持不同处理业务的模式，于是重构。 当时的思路是，其实实际业务代码并不关心getinstance()后返回的是什么。所以这个方法的返回类型由原来的类换成接口对业务代码而言，基本无影响，最多重新编译下代码。 所以最后的方案是将原业务类提供的方法提取成合适的接口，并编写相关实现类。原getInstance()方法返回类型改成接口。并根据当前配置返回不同的实现类以满足不同的处理方式。</p><p>基于这个思路，文章中的问题应该就能解决了。让原先的biz1class的getinstance方法支持返回自己想要的实现即可。2020-04-05</p>`,65)])])}const u=a(i,[["render",l]]);export{h as __pageData,u as default};
