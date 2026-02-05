import{_ as a,o as s,c as e,ae as p}from"./chunks/framework.Iv6F95cJ.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/45 - 工厂模式（下）：如何设计实现一个Dependency Injection框架？.md","filePath":"books/design-pattern/45 - 工厂模式（下）：如何设计实现一个Dependency Injection框架？.md"}'),i={name:"books/design-pattern/45 - 工厂模式（下）：如何设计实现一个Dependency Injection框架？.md"};function t(l,n,o,c,r,g){return s(),e("div",null,[...n[0]||(n[0]=[p(`<p>在上一节课我们讲到，当创建对象是一个“大工程”的时候，我们一般会选择使用工厂模式，来封装对象复杂的创建过程，将对象的创建和使用分离，让代码更加清晰。那何为“大工程”呢？上一节课中我们讲了两种情况，一种是创建过程涉及复杂的if-else分支判断，另一种是对象创建需要组装多个其他类对象或者需要复杂的初始化过程。</p><p>今天，我们再来讲一个创建对象的“大工程”，依赖注入框架，或者叫依赖注入容器（Dependency Injection Container），简称DI容器。在今天的讲解中，我会带你一块搞清楚这样几个问题：DI容器跟我们讲的工厂模式又有何区别和联系？DI容器的核心功能有哪些，以及如何实现一个简单的DI容器？</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="工厂模式和di容器有何区别" tabindex="-1">工厂模式和DI容器有何区别？ <a class="header-anchor" href="#工厂模式和di容器有何区别" aria-label="Permalink to &quot;工厂模式和DI容器有何区别？&quot;">&amp;ZeroWidthSpace;</a></h2><p>实际上，DI容器底层最基本的设计思路就是基于工厂模式的。DI容器相当于一个大的工厂类，负责在程序启动的时候，根据配置（要创建哪些类对象，每个类对象的创建需要依赖哪些其他类对象）事先创建好对象。当应用程序需要使用某个类对象的时候，直接从容器中获取即可。正是因为它持有一堆对象，所以这个框架才被称为“容器”。</p><p>DI容器相对于我们上节课讲的工厂模式的例子来说，它处理的是更大的对象创建工程。上节课讲的工厂模式中，一个工厂类只负责某个类对象或者某一组相关类对象（继承自同一抽象类或者接口的子类）的创建，而DI容器负责的是整个应用中所有类对象的创建。</p><p>除此之外，DI容器负责的事情要比单纯的工厂模式要多。比如，它还包括配置的解析、对象生命周期的管理。接下来，我们就详细讲讲，一个简单的DI容器应该包含哪些核心功能。</p><h2 id="di容器的核心功能有哪些" tabindex="-1">DI容器的核心功能有哪些？ <a class="header-anchor" href="#di容器的核心功能有哪些" aria-label="Permalink to &quot;DI容器的核心功能有哪些？&quot;">&amp;ZeroWidthSpace;</a></h2><p>总结一下，一个简单的DI容器的核心功能一般有三个：配置解析、对象创建和对象生命周期管理。</p><p><strong>首先，我们来看配置解析。</strong></p><p>在上节课讲的工厂模式中，工厂类要创建哪个类对象是事先确定好的，并且是写死在工厂类代码中的。作为一个通用的框架来说，框架代码跟应用代码应该是高度解耦的，DI容器事先并不知道应用会创建哪些对象，不可能把某个应用要创建的对象写死在框架代码中。所以，我们需要通过一种形式，让应用告知DI容器要创建哪些对象。这种形式就是我们要讲的配置。</p><p>我们将需要由DI容器来创建的类对象和创建类对象的必要信息（使用哪个构造函数以及对应的构造函数参数都是什么等等），放到配置文件中。容器读取配置文件，根据配置文件提供的信息来创建对象。</p><p>下面是一个典型的Spring容器的配置文件。Spring容器读取这个配置文件，解析出要创建的两个对象：rateLimiter和redisCounter，并且得到两者的依赖关系：rateLimiter依赖redisCounter。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RateLimiter {</span></span>
<span class="line"><span>  private RedisCounter redisCounter;</span></span>
<span class="line"><span>  public RateLimiter(RedisCounter redisCounter) {</span></span>
<span class="line"><span>    this.redisCounter = redisCounter;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  public void test() {</span></span>
<span class="line"><span>    System.out.println(&quot;Hello World!&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class RedisCounter {</span></span>
<span class="line"><span>  private String ipAddress;</span></span>
<span class="line"><span>  private int port;</span></span>
<span class="line"><span>  public RedisCounter(String ipAddress, int port) {</span></span>
<span class="line"><span>    this.ipAddress = ipAddress;</span></span>
<span class="line"><span>    this.port = port;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>配置文件beans.xml：</span></span>
<span class="line"><span>&lt;beans&gt;</span></span>
<span class="line"><span>   &lt;bean id=&quot;rateLimiter&quot; class=&quot;com.xzg.RateLimiter&quot;&gt;</span></span>
<span class="line"><span>      &lt;constructor-arg ref=&quot;redisCounter&quot;/&gt;</span></span>
<span class="line"><span>   &lt;/bean&gt;</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>   &lt;bean id=&quot;redisCounter&quot; class=&quot;com.xzg.redisCounter&quot;&gt;</span></span>
<span class="line"><span>     &lt;constructor-arg type=&quot;String&quot; value=&quot;127.0.0.1&quot;&gt;</span></span>
<span class="line"><span>     &lt;constructor-arg type=&quot;int&quot; value=1234&gt;</span></span>
<span class="line"><span>   &lt;/bean&gt;</span></span>
<span class="line"><span>&lt;/beans&gt;</span></span></code></pre></div><p><strong>其次，我们再来看对象创建。</strong></p><p>在DI容器中，如果我们给每个类都对应创建一个工厂类，那项目中类的个数会成倍增加，这会增加代码的维护成本。要解决这个问题并不难。我们只需要将所有类对象的创建都放到一个工厂类中完成就可以了，比如BeansFactory。</p><p>你可能会说，如果要创建的类对象非常多，BeansFactory中的代码会不会线性膨胀（代码量跟创建对象的个数成正比）呢？实际上并不会。待会讲到DI容器的具体实现的时候，我们会讲“反射”这种机制，它能在程序运行的过程中，动态地加载类、创建对象，不需要事先在代码中写死要创建哪些对象。所以，不管是创建一个对象还是十个对象，BeansFactory工厂类代码都是一样的。</p><p><strong>最后，我们来看对象的生命周期管理。</strong></p><p>上一节课我们讲到，简单工厂模式有两种实现方式，一种是每次都返回新创建的对象，另一种是每次都返回同一个事先创建好的对象，也就是所谓的单例对象。在Spring框架中，我们可以通过配置scope属性，来区分这两种不同类型的对象。scope=prototype表示返回新创建的对象，scope=singleton表示返回单例对象。</p><p>除此之外，我们还可以配置对象是否支持懒加载。如果lazy-init=true，对象在真正被使用到的时候（比如：BeansFactory.getBean(“userService”)）才被被创建；如果lazy-init=false，对象在应用启动的时候就事先创建好。</p><p>不仅如此，我们还可以配置对象的init-method和destroy-method方法，比如init-method=loadProperties()，destroy-method=updateConfigFile()。DI容器在创建好对象之后，会主动调用init-method属性指定的方法来初始化对象。在对象被最终销毁之前，DI容器会主动调用destroy-method属性指定的方法来做一些清理工作，比如释放数据库连接池、关闭文件。</p><h2 id="如何实现一个简单的di容器" tabindex="-1">如何实现一个简单的DI容器？ <a class="header-anchor" href="#如何实现一个简单的di容器" aria-label="Permalink to &quot;如何实现一个简单的DI容器？&quot;">&amp;ZeroWidthSpace;</a></h2><p>实际上，用Java语言来实现一个简单的DI容器，核心逻辑只需要包括这样两个部分：配置文件解析、根据配置文件通过“反射”语法来创建对象。</p><h3 id="_1-最小原型设计" tabindex="-1">1.最小原型设计 <a class="header-anchor" href="#_1-最小原型设计" aria-label="Permalink to &quot;1.最小原型设计&quot;">&amp;ZeroWidthSpace;</a></h3><p>因为我们主要是讲解设计模式，所以，在今天的讲解中，我们只实现一个DI容器的最小原型。像Spring框架这样的DI容器，它支持的配置格式非常灵活和复杂。为了简化代码实现，重点讲解原理，在最小原型中，我们只支持下面配置文件中涉及的配置语法。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>配置文件beans.xml</span></span>
<span class="line"><span>&lt;beans&gt;</span></span>
<span class="line"><span>   &lt;bean id=&quot;rateLimiter&quot; class=&quot;com.xzg.RateLimiter&quot;&gt;</span></span>
<span class="line"><span>      &lt;constructor-arg ref=&quot;redisCounter&quot;/&gt;</span></span>
<span class="line"><span>   &lt;/bean&gt;</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>   &lt;bean id=&quot;redisCounter&quot; class=&quot;com.xzg.redisCounter&quot; scope=&quot;singleton&quot; lazy-init=&quot;true&quot;&gt;</span></span>
<span class="line"><span>     &lt;constructor-arg type=&quot;String&quot; value=&quot;127.0.0.1&quot;&gt;</span></span>
<span class="line"><span>     &lt;constructor-arg type=&quot;int&quot; value=1234&gt;</span></span>
<span class="line"><span>   &lt;/bean&gt;</span></span>
<span class="line"><span>&lt;/bean</span></span></code></pre></div><p>最小原型的使用方式跟Spring框架非常类似，示例代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Demo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    ApplicationContext applicationContext = new ClassPathXmlApplicationContext(</span></span>
<span class="line"><span>            &quot;beans.xml&quot;);</span></span>
<span class="line"><span>    RateLimiter rateLimiter = (RateLimiter) applicationContext.getBean(&quot;rateLimiter&quot;);</span></span>
<span class="line"><span>    rateLimiter.test();</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-提供执行入口" tabindex="-1">2.提供执行入口 <a class="header-anchor" href="#_2-提供执行入口" aria-label="Permalink to &quot;2.提供执行入口&quot;">&amp;ZeroWidthSpace;</a></h3><p>前面我们讲到，面向对象设计的最后一步是：组装类并提供执行入口。在这里，执行入口就是一组暴露给外部使用的接口和类。</p><p>通过刚刚的最小原型使用示例代码，我们可以看出，执行入口主要包含两部分：ApplicationContext和ClassPathXmlApplicationContext。其中，ApplicationContext是接口，ClassPathXmlApplicationContext是接口的实现类。两个类具体实现如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface ApplicationContext {</span></span>
<span class="line"><span>  Object getBean(String beanId);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class ClassPathXmlApplicationContext implements ApplicationContext {</span></span>
<span class="line"><span>  private BeansFactory beansFactory;</span></span>
<span class="line"><span>  private BeanConfigParser beanConfigParser;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public ClassPathXmlApplicationContext(String configLocation) {</span></span>
<span class="line"><span>    this.beansFactory = new BeansFactory();</span></span>
<span class="line"><span>    this.beanConfigParser = new XmlBeanConfigParser();</span></span>
<span class="line"><span>    loadBeanDefinitions(configLocation);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void loadBeanDefinitions(String configLocation) {</span></span>
<span class="line"><span>    InputStream in = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      in = this.getClass().getResourceAsStream(&quot;/&quot; + configLocation);</span></span>
<span class="line"><span>      if (in == null) {</span></span>
<span class="line"><span>        throw new RuntimeException(&quot;Can not find config file: &quot; + configLocation);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      List&lt;BeanDefinition&gt; beanDefinitions = beanConfigParser.parse(in);</span></span>
<span class="line"><span>      beansFactory.addBeanDefinitions(beanDefinitions);</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      if (in != null) {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          in.close();</span></span>
<span class="line"><span>        } catch (IOException e) {</span></span>
<span class="line"><span>          // TODO: log error</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object getBean(String beanId) {</span></span>
<span class="line"><span>    return beansFactory.getBean(beanId);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从上面的代码中，我们可以看出，ClassPathXmlApplicationContext负责组装BeansFactory和BeanConfigParser两个类，串联执行流程：从classpath中加载XML格式的配置文件，通过BeanConfigParser解析为统一的BeanDefinition格式，然后，BeansFactory根据BeanDefinition来创建对象。</p><h3 id="_3-配置文件解析" tabindex="-1">3.配置文件解析 <a class="header-anchor" href="#_3-配置文件解析" aria-label="Permalink to &quot;3.配置文件解析&quot;">&amp;ZeroWidthSpace;</a></h3><p>配置文件解析主要包含BeanConfigParser接口和XmlBeanConfigParser实现类，负责将配置文件解析为BeanDefinition结构，以便BeansFactory根据这个结构来创建对象。</p><p>配置文件的解析比较繁琐，不涉及我们专栏要讲的理论知识，不是我们讲解的重点，所以这里我只给出两个类的大致设计思路，并未给出具体的实现代码。如果感兴趣的话，你可以自行补充完整。具体的代码框架如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface BeanConfigParser {</span></span>
<span class="line"><span>  List&lt;BeanDefinition&gt; parse(InputStream inputStream);</span></span>
<span class="line"><span>  List&lt;BeanDefinition&gt; parse(String configContent);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class XmlBeanConfigParser implements BeanConfigParser {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public List&lt;BeanDefinition&gt; parse(InputStream inputStream) {</span></span>
<span class="line"><span>    String content = null;</span></span>
<span class="line"><span>    // TODO:...</span></span>
<span class="line"><span>    return parse(content);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public List&lt;BeanDefinition&gt; parse(String configContent) {</span></span>
<span class="line"><span>    List&lt;BeanDefinition&gt; beanDefinitions = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>    // TODO:...</span></span>
<span class="line"><span>    return beanDefinitions;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class BeanDefinition {</span></span>
<span class="line"><span>  private String id;</span></span>
<span class="line"><span>  private String className;</span></span>
<span class="line"><span>  private List&lt;ConstructorArg&gt; constructorArgs = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>  private Scope scope = Scope.SINGLETON;</span></span>
<span class="line"><span>  private boolean lazyInit = false;</span></span>
<span class="line"><span>  // 省略必要的getter/setter/constructors</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>  public boolean isSingleton() {</span></span>
<span class="line"><span>    return scope.equals(Scope.SINGLETON);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static enum Scope {</span></span>
<span class="line"><span>    SINGLETON,</span></span>
<span class="line"><span>    PROTOTYPE</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public static class ConstructorArg {</span></span>
<span class="line"><span>    private boolean isRef;</span></span>
<span class="line"><span>    private Class type;</span></span>
<span class="line"><span>    private Object arg;</span></span>
<span class="line"><span>    // 省略必要的getter/setter/constructors</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_4-核心工厂类设计" tabindex="-1">4.核心工厂类设计 <a class="header-anchor" href="#_4-核心工厂类设计" aria-label="Permalink to &quot;4.核心工厂类设计&quot;">&amp;ZeroWidthSpace;</a></h3><p>最后，我们来看，BeansFactory是如何设计和实现的。这也是我们这个DI容器最核心的一个类了。它负责根据从配置文件解析得到的BeanDefinition来创建对象。</p><p>如果对象的scope属性是singleton，那对象创建之后会缓存在singletonObjects这样一个map中，下次再请求此对象的时候，直接从map中取出返回，不需要重新创建。如果对象的scope属性是prototype，那每次请求对象，BeansFactory都会创建一个新的对象返回。</p><p>实际上，BeansFactory创建对象用到的主要技术点就是Java中的反射语法：一种动态加载类和创建对象的机制。我们知道，JVM在启动的时候会根据代码自动地加载类、创建对象。至于都要加载哪些类、创建哪些对象，这些都是在代码中写死的，或者说提前写好的。但是，如果某个对象的创建并不是写死在代码中，而是放到配置文件中，我们需要在程序运行期间，动态地根据配置文件来加载类、创建对象，那这部分工作就没法让JVM帮我们自动完成了，我们需要利用Java提供的反射语法自己去编写代码。</p><p>搞清楚了反射的原理，BeansFactory的代码就不难看懂了。具体代码实现如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class BeansFactory {</span></span>
<span class="line"><span>  private ConcurrentHashMap&lt;String, Object&gt; singletonObjects = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span>  private ConcurrentHashMap&lt;String, BeanDefinition&gt; beanDefinitions = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addBeanDefinitions(List&lt;BeanDefinition&gt; beanDefinitionList) {</span></span>
<span class="line"><span>    for (BeanDefinition beanDefinition : beanDefinitionList) {</span></span>
<span class="line"><span>      this.beanDefinitions.putIfAbsent(beanDefinition.getId(), beanDefinition);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    for (BeanDefinition beanDefinition : beanDefinitionList) {</span></span>
<span class="line"><span>      if (beanDefinition.isLazyInit() == false &amp;&amp; beanDefinition.isSingleton()) {</span></span>
<span class="line"><span>        createBean(beanDefinition);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Object getBean(String beanId) {</span></span>
<span class="line"><span>    BeanDefinition beanDefinition = beanDefinitions.get(beanId);</span></span>
<span class="line"><span>    if (beanDefinition == null) {</span></span>
<span class="line"><span>      throw new NoSuchBeanDefinitionException(&quot;Bean is not defined: &quot; + beanId);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return createBean(beanDefinition);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @VisibleForTesting</span></span>
<span class="line"><span>  protected Object createBean(BeanDefinition beanDefinition) {</span></span>
<span class="line"><span>    if (beanDefinition.isSingleton() &amp;&amp; singletonObjects.contains(beanDefinition.getId())) {</span></span>
<span class="line"><span>      return singletonObjects.get(beanDefinition.getId());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    Object bean = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      Class beanClass = Class.forName(beanDefinition.getClassName());</span></span>
<span class="line"><span>      List&lt;BeanDefinition.ConstructorArg&gt; args = beanDefinition.getConstructorArgs();</span></span>
<span class="line"><span>      if (args.isEmpty()) {</span></span>
<span class="line"><span>        bean = beanClass.newInstance();</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        Class[] argClasses = new Class[args.size()];</span></span>
<span class="line"><span>        Object[] argObjects = new Object[args.size()];</span></span>
<span class="line"><span>        for (int i = 0; i &lt; args.size(); ++i) {</span></span>
<span class="line"><span>          BeanDefinition.ConstructorArg arg = args.get(i);</span></span>
<span class="line"><span>          if (!arg.getIsRef()) {</span></span>
<span class="line"><span>            argClasses[i] = arg.getType();</span></span>
<span class="line"><span>            argObjects[i] = arg.getArg();</span></span>
<span class="line"><span>          } else {</span></span>
<span class="line"><span>            BeanDefinition refBeanDefinition = beanDefinitions.get(arg.getArg());</span></span>
<span class="line"><span>            if (refBeanDefinition == null) {</span></span>
<span class="line"><span>              throw new NoSuchBeanDefinitionException(&quot;Bean is not defined: &quot; + arg.getArg());</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            argClasses[i] = Class.forName(refBeanDefinition.getClassName());</span></span>
<span class="line"><span>            argObjects[i] = createBean(refBeanDefinition);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        bean = beanClass.getConstructor(argClasses).newInstance(argObjects);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } catch (ClassNotFoundException | IllegalAccessException</span></span>
<span class="line"><span>            | InstantiationException | NoSuchMethodException | InvocationTargetException e) {</span></span>
<span class="line"><span>      throw new BeanCreationFailureException(&quot;&quot;, e);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (bean != null &amp;&amp; beanDefinition.isSingleton()) {</span></span>
<span class="line"><span>      singletonObjects.putIfAbsent(beanDefinition.getId(), bean);</span></span>
<span class="line"><span>      return singletonObjects.get(beanDefinition.getId());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return bean;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们来一块总结回顾一下，你需要重点掌握的内容。</p><p>DI容器在一些软件开发中已经成为了标配，比如Spring IOC、Google Guice。但是，大部分人可能只是把它当作一个黑盒子来使用，并未真正去了解它的底层是如何实现的。当然，如果只是做一些简单的小项目，简单会用就足够了，但是，如果我们面对的是非常复杂的系统，当系统出现问题的时候，对底层原理的掌握程度，决定了我们排查问题的能力，直接影响到我们排查问题的效率。</p><p>今天，我们讲解了一个简单的DI容器的实现原理，其核心逻辑主要包括：配置文件解析，以及根据配置文件通过“反射”语法来创建对象。其中，创建对象的过程就应用到了我们在学的工厂模式。对象创建、组装、管理完全有DI容器来负责，跟具体业务代码解耦，让程序员聚焦在业务代码的开发上。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>BeansFactory类中的createBean()函数是一个递归函数。当构造函数的参数是ref类型时，会递归地创建ref属性指向的对象。如果我们在配置文件中错误地配置了对象之间的依赖关系，导致存在循环依赖，那BeansFactory的createBean()函数是否会出现堆栈溢出？又该如何解决这个问题呢？</p><p>你可以可以在留言区说一说，和同学一起交流和分享。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） 郑大钱 👍（25） 💬（1）“初级工程师在维护代码，高级工程师在设计代码，资深工程师在重构代码” 依赖注入框架好牛逼呀！当手把手教我设计一个框架之后，才破除了我对框架的权威和迷信。 自己最开始做业务也是在原有框架上面修修补补，回过头来看，发现自己非常能忍，即使原有的框架很难用，自己也能坚持用下去。 转念一想，那不是能忍，那是懒。懒得去理解框架的原理，懒得让它更易用。 像豌豆公主一样保持自己的敏感，是持续改进的动力。2020-11-17少年锦时 👍（0） 💬（1）beanDefinition.isLazyInit() == false 为什么不直接写成!beanDefinition.isLazyInit() 呢2020-07-04沈康 👍（165） 💬（7）默默的掏出了《spring源码深度解析》回顾一番 1、构造器循环依赖 构造器注入的循环依赖是无法解决的，只能抛出bean创建异常使容器无法启动 如何判断是循环依赖？ 把正在创建的bean放入到一个(正在创建的map)中，如果依赖创建bean在此map中存在，则抛出异常。 2、setter方法循环依赖 ①单例情况可以解决循环依赖，方法是提前暴露一个返回该单例的工厂方法，让依赖对象可以引用到 ②多例不能解决循环依赖，因为多例不需要缓存2020-02-18undefined 👍（66） 💬（2）把本文的示例补全成了可执行代码： https://github.com/plusmancn/learn-java/tree/master/src/main/java/Exercise/di 顺便纠正一个笔误： BeansFactory 下 createBean 方法中：singletonObjects.contains 应为 singletonObjects. containsKey2020-02-23javaadu 👍（39） 💬（2）20200218再次复习：</p><ol><li>研究了Spring容器中处理循环依赖的知识点：（1）只能处理单例的、setter注入的循环依赖，其他的注入模式无法处理；（2）依赖缓存处理循环依赖，关键思想是，将正在创建中的对象提前暴露一个单例工厂，让其他实例可以引用到</li><li>网上一篇比较好的文章：https://juejin.im/post/5d0d8f64f265da1b7b3193ac2020-02-19简单猫 👍（37） 💬（3）不要被这些所谓的专业化名词吓到了 什么三级缓存。a依赖b，b依赖c，c依赖a,d依赖a，b，c什么的，你要解决的核心是不要重复创建。那么你就要把已经创建的对象存起来(map，hashmaps什么的) ，然后再次创建的时候先去缓存map中读取，没有才创建。 创建对象流程：1先反射创建类对象 2然后配置类里面的属性 方法(依赖就在这)。 至于你要怎么利用设计模式解耦 分3级缓存 分别存储完全实例化的对象 未设置属性方法类对象 还是对象工厂 那就看如何好用咯2020-05-14此鱼不得水 👍（23） 💬（0）Spring解决循环依赖的办法是多级缓存。2020-02-14zhengyu.nie 👍（16） 💬（0）基本就是Spring源码大体原型了，委托的BeanFactory在Spring源码里是DefaultListableBeanFactory。循环依赖解决是三级缓存，提前暴露还没有初始化结束的bean。检测是Map存一下过程，aba这样顺序判断，有重复（a出现两次）就是环了。</li></ol><p>三级缓存源码对应 org.springframework.beans.factory.support.DefaultSingletonBeanRegistry#getSingleton</p><p>/** * Return the (raw) singleton object registered under the given name. * &lt;p&gt;Checks already instantiated singletons and also allows for an early * reference to a currently created singleton (resolving a circular reference). * @param beanName the name of the bean to look for * @param allowEarlyReference whether early references should be created or not * @return the registered singleton object, or {@code null} if none found */ @Nullable protected Object getSingleton(String beanName, boolean allowEarlyReference) { Object singletonObject = this.singletonObjects.get(beanName); if (singletonObject == null &amp;&amp; isSingletonCurrentlyInCreation(beanName)) { synchronized (this.singletonObjects) { singletonObject = this.earlySingletonObjects.get(beanName); if (singletonObject == null &amp;&amp; allowEarlyReference) { ObjectFactory&lt;?&gt; singletonFactory = this.singletonFactories.get(beanName); if (singletonFactory != null) { singletonObject = singletonFactory.getObject(); this.earlySingletonObjects.put(beanName, singletonObject); this.singletonFactories.remove(beanName); } } } } return singletonObject; }</p><pre><code>&amp;#47;** Cache of singleton objects: bean name to bean instance. *&amp;#47;
private final Map&amp;lt;String, Object&amp;gt; singletonObjects = new ConcurrentHashMap&amp;lt;&amp;gt;(256);

&amp;#47;** Cache of singleton factories: bean name to ObjectFactory. *&amp;#47;
private final Map&amp;lt;String, ObjectFactory&amp;lt;?&amp;gt;&amp;gt; singletonFactories = new HashMap&amp;lt;&amp;gt;(16);

&amp;#47;** Cache of early singleton objects: bean name to bean instance. *&amp;#47;
private final Map&amp;lt;String, Object&amp;gt; earlySingletonObjects = new HashMap&amp;lt;&amp;gt;(16);
</code></pre><p>2020-04-24王先森 👍（11） 💬（0）php开发者默默的去瞅laravel的DI容器2020-06-16好吃不贵 👍（9） 💬（1）createBean先用Topology sort看是否有环，然后再按序创建？2020-02-14J.Smile 👍（9） 💬（0）思考题: ①构造器初始化方式，无法解决循环依赖 ②set注入方式初始化，有两种: 第一种，创建的是单例对象，可以解决。 第二种，创建的是原型对象，由于di容器不缓存对象导致无法提前暴露一个创建中的对象，依赖对象就会getbean时创建一个新对象，接着又进去循环依赖创建新对象…依然解决不了。2020-02-14Geek_3b1096 👍（8） 💬（1）终于解答了我对于DI的疑惑2020-02-14DullBird 👍（7） 💬（3）1. 我理解spring 解决A和B对象的循环引用是这样的流程是这样的，假设先加载A，丢一个A的引用到一个引用map&lt;id, ref&gt;，发现A有一个filed 引用B，就初始化B，丢一个B的引用到Map，初始化发现需要一个A，就从map里面找，找到了一个A，就把A的引用丢给B的属性，然后B加载结束了，A继续加载，拿到map里面的B，加载完成。2020-02-24勤劳的明酱 👍（7） 💬（3）思考题： 构造器注入不好解决 setter注入：根据BenDefinition创建的bean可以是未完成的bean，就是说bean里面的属性可以是没有填充过的，这个时候bean依然能创建成功，之后属性，postConstruct、InitializingBean、init-method完成之后才能算是一个完整的bean，所以即使出现循环依赖也能解决。2020-02-14KK 👍（6） 💬（1）这里例子，过于限制语言了。对 java 用户友好，对其他用户似乎意义不大。2022-05-05</p>`,55)])])}const d=a(i,[["render",t]]);export{u as __pageData,d as default};
