import{_ as n,o as s,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/04 - 互斥锁（下）：如何用一把锁保护多个资源？.md","filePath":"books/java-practice/04 - 互斥锁（下）：如何用一把锁保护多个资源？.md"}'),c={name:"books/java-practice/04 - 互斥锁（下）：如何用一把锁保护多个资源？.md"};function t(l,a,i,o,r,b){return s(),p("div",null,[...a[0]||(a[0]=[e(`<p>在上一篇文章中，我们提到<strong>受保护资源和锁之间合理的关联关系应该是N:1的关系</strong>，也就是说可以用一把锁来保护多个资源，但是不能用多把锁来保护一个资源，并且结合文中示例，我们也重点强调了“不能用多把锁来保护一个资源”这个问题。而至于如何保护多个资源，我们今天就来聊聊。</p><p>当我们要保护多个资源时，首先要区分这些资源是否存在关联关系。</p><h2 id="保护没有关联关系的多个资源" tabindex="-1">保护没有关联关系的多个资源 <a class="header-anchor" href="#保护没有关联关系的多个资源" aria-label="Permalink to &quot;保护没有关联关系的多个资源&quot;">&amp;ZeroWidthSpace;</a></h2><p>在现实世界里，球场的座位和电影院的座位就是没有关联关系的，这种场景非常容易解决，那就是球赛有球赛的门票，电影院有电影院的门票，各自管理各自的。</p><p>同样这对应到编程领域，也很容易解决。例如，银行业务中有针对账户余额（余额是一种资源）的取款操作，也有针对账户密码（密码也是一种资源）的更改操作，我们可以为账户余额和账户密码分配不同的锁来解决并发问题，这个还是很简单的。</p><p>相关的示例代码如下，账户类Account有两个成员变量，分别是账户余额balance和账户密码password。取款withdraw()和查看余额getBalance()操作会访问账户余额balance，我们创建一个final对象balLock作为锁（类比球赛门票）；而更改密码updatePassword()和查看密码getPassword()操作会修改账户密码password，我们创建一个final对象pwLock作为锁（类比电影票）。不同的资源用不同的锁保护，各自管各自的，很简单。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Account {</span></span>
<span class="line"><span>  // 锁：保护账户余额</span></span>
<span class="line"><span>  private final Object balLock</span></span>
<span class="line"><span>    = new Object();</span></span>
<span class="line"><span>  // 账户余额  </span></span>
<span class="line"><span>  private Integer balance;</span></span>
<span class="line"><span>  // 锁：保护账户密码</span></span>
<span class="line"><span>  private final Object pwLock</span></span>
<span class="line"><span>    = new Object();</span></span>
<span class="line"><span>  // 账户密码</span></span>
<span class="line"><span>  private String password;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 取款</span></span>
<span class="line"><span>  void withdraw(Integer amt) {</span></span>
<span class="line"><span>    synchronized(balLock) {</span></span>
<span class="line"><span>      if (this.balance &gt; amt){</span></span>
<span class="line"><span>        this.balance -= amt;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>  // 查看余额</span></span>
<span class="line"><span>  Integer getBalance() {</span></span>
<span class="line"><span>    synchronized(balLock) {</span></span>
<span class="line"><span>      return balance;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 更改密码</span></span>
<span class="line"><span>  void updatePassword(String pw){</span></span>
<span class="line"><span>    synchronized(pwLock) {</span></span>
<span class="line"><span>      this.password = pw;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>  // 查看密码</span></span>
<span class="line"><span>  String getPassword() {</span></span>
<span class="line"><span>    synchronized(pwLock) {</span></span>
<span class="line"><span>      return password;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>当然，我们也可以用一把互斥锁来保护多个资源，例如我们可以用this这一把锁来管理账户类里所有的资源：账户余额和用户密码。具体实现很简单，示例程序中所有的方法都增加同步关键字synchronized就可以了，这里我就不一一展示了。</p><p>但是用一把锁有个问题，就是性能太差，会导致取款、查看余额、修改密码、查看密码这四个操作都是串行的。而我们用两把锁，取款和修改密码是可以并行的。<strong>用不同的锁对受保护资源进行精细化管理，能够提升性能</strong>。这种锁还有个名字，叫<strong>细粒度锁</strong>。</p><h2 id="保护有关联关系的多个资源" tabindex="-1">保护有关联关系的多个资源 <a class="header-anchor" href="#保护有关联关系的多个资源" aria-label="Permalink to &quot;保护有关联关系的多个资源&quot;">&amp;ZeroWidthSpace;</a></h2><p>如果多个资源是有关联关系的，那这个问题就有点复杂了。例如银行业务里面的转账操作，账户A减少100元，账户B增加100元。这两个账户就是有关联关系的。那对于像转账这种有关联关系的操作，我们应该怎么去解决呢？先把这个问题代码化。我们声明了个账户类：Account，该类有一个成员变量余额：balance，还有一个用于转账的方法：transfer()，然后怎么保证转账操作transfer()没有并发问题呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Account {</span></span>
<span class="line"><span>  private int balance;</span></span>
<span class="line"><span>  // 转账</span></span>
<span class="line"><span>  void transfer(</span></span>
<span class="line"><span>      Account target, int amt){</span></span>
<span class="line"><span>    if (this.balance &gt; amt) {</span></span>
<span class="line"><span>      this.balance -= amt;</span></span>
<span class="line"><span>      target.balance += amt;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>}</span></span></code></pre></div><p>相信你的直觉会告诉你这样的解决方案：用户synchronized关键字修饰一下transfer()方法就可以了，于是你很快就完成了相关的代码，如下所示。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Account {</span></span>
<span class="line"><span>  private int balance;</span></span>
<span class="line"><span>  // 转账</span></span>
<span class="line"><span>  synchronized void transfer(</span></span>
<span class="line"><span>      Account target, int amt){</span></span>
<span class="line"><span>    if (this.balance &gt; amt) {</span></span>
<span class="line"><span>      this.balance -= amt;</span></span>
<span class="line"><span>      target.balance += amt;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>}</span></span></code></pre></div><p>在这段代码中，临界区内有两个资源，分别是转出账户的余额this.balance和转入账户的余额target.balance，并且用的是一把锁this，符合我们前面提到的，多个资源可以用一把锁来保护，这看上去完全正确呀。真的是这样吗？可惜，这个方案仅仅是看似正确，为什么呢？</p><p>问题就出在this这把锁上，this这把锁可以保护自己的余额this.balance，却保护不了别人的余额target.balance，就像你不能用自家的锁来保护别人家的资产，也不能用自己的票来保护别人的座位一样。</p><p><img src="https://static001.geekbang.org/resource/image/1b/d8/1ba92a09d1a55a6a1636318f30c155d8.png?wh=1142%2A640" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>用锁this保护this.balance和target.balance的示意图</p><p>下面我们具体分析一下，假设有A、B、C三个账户，余额都是200元，我们用两个线程分别执行两个转账操作：账户A转给账户B 100 元，账户B转给账户C 100 元，最后我们期望的结果应该是账户A的余额是100元，账户B的余额是200元， 账户C的余额是300元。</p><p>我们假设线程1执行账户A转账户B的操作，线程2执行账户B转账户C的操作。这两个线程分别在两颗CPU上同时执行，那它们是互斥的吗？我们期望是，但实际上并不是。因为线程1锁定的是账户A的实例（A.this），而线程2锁定的是账户B的实例（B.this），所以这两个线程可以同时进入临界区transfer()。同时进入临界区的结果是什么呢？线程1和线程2都会读到账户B的余额为200，导致最终账户B的余额可能是300（线程1后于线程2写B.balance，线程2写的B.balance值被线程1覆盖），可能是100（线程1先于线程2写B.balance，线程1写的B.balance值被线程2覆盖），就是不可能是200。</p><p><img src="https://static001.geekbang.org/resource/image/a4/27/a46b4a1e73671d6e6f1bdb26f6c87627.png?wh=1142%2A640" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>并发转账示意图</p><h2 id="使用锁的正确姿势" tabindex="-1">使用锁的正确姿势 <a class="header-anchor" href="#使用锁的正确姿势" aria-label="Permalink to &quot;使用锁的正确姿势&quot;">&amp;ZeroWidthSpace;</a></h2><p>在上一篇文章中，我们提到用同一把锁来保护多个资源，也就是现实世界的“包场”，那在编程领域应该怎么“包场”呢？很简单，只要我们的<strong>锁能覆盖所有受保护资源</strong>就可以了。在上面的例子中，this是对象级别的锁，所以A对象和B对象都有自己的锁，如何让A对象和B对象共享一把锁呢？</p><p>稍微开动脑筋，你会发现其实方案还挺多的，比如可以让所有对象都持有一个唯一性的对象，这个对象在创建Account时传入。方案有了，完成代码就简单了。示例代码如下，我们把Account默认构造函数变为private，同时增加一个带Object lock参数的构造函数，创建Account对象时，传入相同的lock，这样所有的Account对象都会共享这个lock了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Account {</span></span>
<span class="line"><span>  private Object lock；</span></span>
<span class="line"><span>  private int balance;</span></span>
<span class="line"><span>  private Account();</span></span>
<span class="line"><span>  // 创建Account时传入同一个lock对象</span></span>
<span class="line"><span>  public Account(Object lock) {</span></span>
<span class="line"><span>    this.lock = lock;</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>  // 转账</span></span>
<span class="line"><span>  void transfer(Account target, int amt){</span></span>
<span class="line"><span>    // 此处检查所有对象共享的锁</span></span>
<span class="line"><span>    synchronized(lock) {</span></span>
<span class="line"><span>      if (this.balance &gt; amt) {</span></span>
<span class="line"><span>        this.balance -= amt;</span></span>
<span class="line"><span>        target.balance += amt;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这个办法确实能解决问题，但是有点小瑕疵，它要求在创建Account对象的时候必须传入同一个对象，如果创建Account对象时，传入的lock不是同一个对象，那可就惨了，会出现锁自家门来保护他家资产的荒唐事。在真实的项目场景中，创建Account对象的代码很可能分散在多个工程中，传入共享的lock真的很难。</p><p>所以，上面的方案缺乏实践的可行性，我们需要更好的方案。还真有，就是<strong>用Account.class作为共享的锁</strong>。Account.class是所有Account对象共享的，而且这个对象是Java虚拟机在加载Account类的时候创建的，所以我们不用担心它的唯一性。使用Account.class作为共享的锁，我们就无需在创建Account对象时传入了，代码更简单。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Account {</span></span>
<span class="line"><span>  private int balance;</span></span>
<span class="line"><span>  // 转账</span></span>
<span class="line"><span>  void transfer(Account target, int amt){</span></span>
<span class="line"><span>    synchronized(Account.class) {</span></span>
<span class="line"><span>      if (this.balance &gt; amt) {</span></span>
<span class="line"><span>        this.balance -= amt;</span></span>
<span class="line"><span>        target.balance += amt;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>}</span></span></code></pre></div><p>下面这幅图很直观地展示了我们是如何使用共享的锁Account.class来保护不同对象的临界区的。</p><p><img src="https://static001.geekbang.org/resource/image/52/7c/527cd65f747abac3f23390663748da7c.png?wh=1142%2A640" alt="" loading="lazy" referrerpolicy="no-referrer"></p><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>相信你看完这篇文章后，对如何保护多个资源已经很有心得了，关键是要分析多个资源之间的关系。如果资源之间没有关系，很好处理，每个资源一把锁就可以了。如果资源之间有关联关系，就要选择一个粒度更大的锁，这个锁应该能够覆盖所有相关的资源。除此之外，还要梳理出有哪些访问路径，所有的访问路径都要设置合适的锁，这个过程可以类比一下门票管理。</p><p>我们再引申一下上面提到的关联关系，关联关系如果用更具体、更专业的语言来描述的话，其实是一种“原子性”特征，在前面的文章中，我们提到的原子性，主要是面向CPU指令的，转账操作的原子性则是属于是面向高级语言的，不过它们本质上是一样的。</p><p><strong>“原子性”的本质</strong>是什么？其实不是不可分割，不可分割只是外在表现，其本质是多个资源间有一致性的要求，<strong>操作的中间状态对外不可见</strong>。例如，在32位的机器上写long型变量有中间状态（只写了64位中的32位），在银行转账的操作中也有中间状态（账户A减少了100，账户B还没来得及发生变化）。所以<strong>解决原子性问题，是要保证中间状态对外不可见</strong>。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>在第一个示例程序里，我们用了两把不同的锁来分别保护账户余额、账户密码，创建锁的时候，我们用的是：<code>private final Object xxxLock = new Object();</code>，如果账户余额用 this.balance 作为互斥锁，账户密码用this.password作为互斥锁，你觉得是否可以呢？</p><h2 id="欢迎在留言区与我分享你的想法-也欢迎你在留言区记录你的思考过程。感谢阅读-如果你觉得这篇文章对你有帮助的话-也欢迎把它分享给更多的朋友。精选留言-15-少主江衫-👍-227-💬-8-用this-balance-和this-password-都不行。在同一个账户多线程访问时候-a线程取款进行this-balance-amt-时候此时this-balance对应的值已经发生变换-线程b再次取款时拿到的balance对应的值并不是a线程中的-也就是说不能把可变的对象当成一把锁。this-password-虽然说是string修饰但也会改变-所以也不行。老师所讲的例子中的两个object无论多次访问过程中都未发生变化-请老师指正。2019-03-07树森-👍-180-💬-8-有个疑问-使用account-class获得锁-那所有转账操作不是都成串行了-这里实践中可行吗-2019-03-07老杨同志-👍-86-💬-8-思考题-我觉得不能用balance和password做为锁对象。这两个对象balance是integer-password是string都是不可变变对象-一但对他们进行赋值就会变成新的对象-加的锁就失效了2019-03-07夜空中最亮的星-👍-81-💬-9-我是一名普通的运维工程师-我是真看不懂java代码-我是来听思想的-。2019-03-07yuc-👍-62-💬-10-是否可以在account中添加一个静态object-通过锁这个object来实现一个锁保护多个资源-如下-class-account-private-static-object-lock-new-object-private-int-balance-47-47-转账void-transfer-account-target-int-amt-synchronized-lock-if-this-balance-gt-amt-this-balance-amt-target-balance-amt-2019-03-09别皱眉-👍-45-💬-2-老师-很感谢有这个专栏-让我能够更加系统的学习并发知识。对于思考题-之所以不可行是因为每次修改balance和password时都会使锁发生变化。" tabindex="-1">欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） 少主江衫 👍（227） 💬（8）用this.balance 和this.password 都不行。在同一个账户多线程访问时候，A线程取款进行this.balance-=amt;时候此时this.balance对应的值已经发生变换，线程B再次取款时拿到的balance对应的值并不是A线程中的，也就是说不能把可变的对象当成一把锁。this.password 虽然说是String修饰但也会改变，所以也不行。老师所讲的例子中的两个Object无论多次访问过程中都未发生变化？ 请老师指正。2019-03-07树森 👍（180） 💬（8）有个疑问，使用Account.class获得锁，那所有转账操作不是都成串行了，这里实践中可行吗？2019-03-07老杨同志 👍（86） 💬（8）思考题： 我觉得不能用balance和password做为锁对象。这两个对象balance是Integer，password是String都是不可变变对象，一但对他们进行赋值就会变成新的对象，加的锁就失效了2019-03-07夜空中最亮的星 👍（81） 💬（9）我是一名普通的运维工程师，我是真看不懂java代码，我是来听思想的 。2019-03-07yuc 👍（62） 💬（10）是否可以在Account中添加一个静态object，通过锁这个object来实现一个锁保护多个资源，如下： class Account { private static Object lock = new Object(); private int balance; // 转账 void transfer(Account target, int amt){ synchronized(lock) { if (this.balance &gt; amt) { this.balance -= amt; target.balance += amt; } } } } 2019-03-09别皱眉 👍（45） 💬（2）老师，很感谢有这个专栏，让我能够更加系统的学习并发知识。 对于思考题,之所以不可行是因为每次修改balance和password时都会使锁发生变化。 <a class="header-anchor" href="#欢迎在留言区与我分享你的想法-也欢迎你在留言区记录你的思考过程。感谢阅读-如果你觉得这篇文章对你有帮助的话-也欢迎把它分享给更多的朋友。精选留言-15-少主江衫-👍-227-💬-8-用this-balance-和this-password-都不行。在同一个账户多线程访问时候-a线程取款进行this-balance-amt-时候此时this-balance对应的值已经发生变换-线程b再次取款时拿到的balance对应的值并不是a线程中的-也就是说不能把可变的对象当成一把锁。this-password-虽然说是string修饰但也会改变-所以也不行。老师所讲的例子中的两个object无论多次访问过程中都未发生变化-请老师指正。2019-03-07树森-👍-180-💬-8-有个疑问-使用account-class获得锁-那所有转账操作不是都成串行了-这里实践中可行吗-2019-03-07老杨同志-👍-86-💬-8-思考题-我觉得不能用balance和password做为锁对象。这两个对象balance是integer-password是string都是不可变变对象-一但对他们进行赋值就会变成新的对象-加的锁就失效了2019-03-07夜空中最亮的星-👍-81-💬-9-我是一名普通的运维工程师-我是真看不懂java代码-我是来听思想的-。2019-03-07yuc-👍-62-💬-10-是否可以在account中添加一个静态object-通过锁这个object来实现一个锁保护多个资源-如下-class-account-private-static-object-lock-new-object-private-int-balance-47-47-转账void-transfer-account-target-int-amt-synchronized-lock-if-this-balance-gt-amt-this-balance-amt-target-balance-amt-2019-03-09别皱眉-👍-45-💬-2-老师-很感谢有这个专栏-让我能够更加系统的学习并发知识。对于思考题-之所以不可行是因为每次修改balance和password时都会使锁发生变化。" aria-label="Permalink to &quot;欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。
精选留言（15）
少主江衫 👍（227） 💬（8）用this.balance 和this.password 都不行。在同一个账户多线程访问时候，A线程取款进行this.balance-=amt;时候此时this.balance对应的值已经发生变换，线程B再次取款时拿到的balance对应的值并不是A线程中的，也就是说不能把可变的对象当成一把锁。this.password 虽然说是String修饰但也会改变，所以也不行。老师所讲的例子中的两个Object无论多次访问过程中都未发生变化？
请老师指正。2019-03-07树森 👍（180） 💬（8）有个疑问，使用Account.class获得锁，那所有转账操作不是都成串行了，这里实践中可行吗？2019-03-07老杨同志 👍（86） 💬（8）思考题：
我觉得不能用balance和password做为锁对象。这两个对象balance是Integer，password是String都是不可变变对象，一但对他们进行赋值就会变成新的对象，加的锁就失效了2019-03-07夜空中最亮的星 👍（81） 💬（9）我是一名普通的运维工程师，我是真看不懂java代码，我是来听思想的 。2019-03-07yuc 👍（62） 💬（10）是否可以在Account中添加一个静态object，通过锁这个object来实现一个锁保护多个资源，如下：
class Account {
  private static Object lock = new Object();
  private int balance;
  &amp;#47;&amp;#47; 转账
  void transfer(Account target, int amt){
    synchronized(lock) {
      if (this.balance &amp;gt; amt) {
        this.balance -= amt;
        target.balance += amt;
      }
    }
  } 
}
2019-03-09别皱眉 👍（45） 💬（2）老师，很感谢有这个专栏，让我能够更加系统的学习并发知识。
对于思考题,之所以不可行是因为每次修改balance和password时都会使锁发生变化。&quot;">&amp;ZeroWidthSpace;</a></h2><h2 id="以下只是我的猜想比如有线程a、b、c线程a首先拿到balance1锁-线程b这个时候也过来-发现锁被拿走了-线程b被放入一个地方进行等待。当a修改掉变量balance的值后-锁由balance1变为balance2-线程b也拿到那个balance1锁-这时候刚好有线程c过来-拿到了balance2锁。由于b和c持有的锁不同-所以可以同时执行这个方法来修改balance的值-这个时候就有可能是线程b修改的值会覆盖掉线程c修改的值" tabindex="-1">以下只是我的猜想 比如有线程A、B、C 线程A首先拿到balance1锁，线程B这个时候也过来，发现锁被拿走了，线程B被放入一个地方进行等待。 当A修改掉变量balance的值后，锁由balance1变为balance2. 线程B也拿到那个balance1锁，这时候刚好有线程C过来，拿到了balance2锁。 由于B和C持有的锁不同，所以可以同时执行这个方法来修改balance的值,这个时候就有可能是线程B修改的值会覆盖掉线程C修改的值? <a class="header-anchor" href="#以下只是我的猜想比如有线程a、b、c线程a首先拿到balance1锁-线程b这个时候也过来-发现锁被拿走了-线程b被放入一个地方进行等待。当a修改掉变量balance的值后-锁由balance1变为balance2-线程b也拿到那个balance1锁-这时候刚好有线程c过来-拿到了balance2锁。由于b和c持有的锁不同-所以可以同时执行这个方法来修改balance的值-这个时候就有可能是线程b修改的值会覆盖掉线程c修改的值" aria-label="Permalink to &quot;以下只是我的猜想
比如有线程A、B、C 
线程A首先拿到balance1锁，线程B这个时候也过来，发现锁被拿走了，线程B被放入一个地方进行等待。
当A修改掉变量balance的值后，锁由balance1变为balance2.
线程B也拿到那个balance1锁，这时候刚好有线程C过来，拿到了balance2锁。
由于B和C持有的锁不同，所以可以同时执行这个方法来修改balance的值,这个时候就有可能是线程B修改的值会覆盖掉线程C修改的值?&quot;">&amp;ZeroWidthSpace;</a></h2><p>不知道到底是不是这样?老师可以详细讲下这个过程吗?谢谢2019-03-13wang 👍（35） 💬（1）不可以。因为balance为integer对象，当值被修改相当于换锁，还有integer有缓存-128到127，相当于同一个对象。2019-03-07zhaozp 👍（22） 💬（1）可变对象不能作为锁2019-03-070bug 👍（20） 💬（3）思考题： 结论：不可行 原因：举个例子，假如this.balance = 10 ，多个线程同时竞争同一把锁this.balance，此时只有一个线程拿到了锁，其他线程等待，拿到锁的线程进行this.balance -= 1操作，this.balance = 9。 该线程释放锁， 之前等待锁的线程继续竞争this.balance=10的锁，新加入的线程竞争this.balance=9的锁，导致多个锁对应一个资源 2019-03-07强哥 👍（13） 💬（2）文章里第二个例子根本无法用到实践中，锁力度太大，可以用乐观关锁解决，另外分布式的情况下，应该如何分析也应该讲讲？至于原子性其实跟数据库的原子性还是有差异的，例如虚拟机异常退出时，synchinzed也无法操作原子操作的。2019-03-07yang 👍（10） 💬（1）王老师， 您在第二讲中贴出的英文链接的地址很棒，看着您写过的专栏，再去看它，有种恍然大悟地感觉~！ 恳请您还是在后续地专栏里，继续保持这种死磕并发基础地原汁原味地链接啊~！ 您地专栏是您多年地理解与实战的营养，加上您亲自地朗读，当然也是原汁原味。但是我的意思是，我们应该有一批人很少看英文类的文档，所以才会有这种恳请~！ 谢谢老师~!2019-03-07SnowsonZ 👍（9） 💬（2）老师，有个疑问，为什么作为互斥锁的对象一定要是final的？非final导致两个互斥锁的原因是什么？是工作内存从主内存拷贝的原因吗？2019-03-09峰 👍（7） 💬（1）思考题，我的答案是不行，因为对象可变，所以导致加锁对象不一样。</p><p>然后感觉加锁的所有用户用同一个锁的粒度太大了，但如果每次转账操作，是不是可以同时加两个用户的锁，如果有先后顺序又可能有死锁问题。2019-03-07知行合一 👍（6） 💬（3）老师，写的时候加锁能理解，读的时候为啥要加锁呢2019-07-29zyl 👍（6） 💬（1）请问这个画图软件是什么？谢谢2019-03-07</p>`,41)])])}const g=n(c,[["render",t]]);export{d as __pageData,g as default};
