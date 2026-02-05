import{_ as s,o as a,c as e,ae as p}from"./chunks/framework.Iv6F95cJ.js";const f=JSON.parse('{"title":"作业","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/44 - 工厂模式（上）：我为什么说没事不要随便用工厂模式创建对象？.md","filePath":"books/design-pattern/44 - 工厂模式（上）：我为什么说没事不要随便用工厂模式创建对象？.md"}'),l={name:"books/design-pattern/44 - 工厂模式（上）：我为什么说没事不要随便用工厂模式创建对象？.md"};function r(i,n,t,o,c,u){return a(),e("div",null,[...n[0]||(n[0]=[p(`<p>上几节课我们讲了单例模式，今天我们再来讲另外一个比较常用的创建型模式：工厂模式（Factory Design Pattern）。</p><p>一般情况下，工厂模式分为三种更加细分的类型：简单工厂、工厂方法和抽象工厂。不过，在GoF的《设计模式》一书中，它将简单工厂模式看作是工厂方法模式的一种特例，所以工厂模式只被分成了工厂方法和抽象工厂两类。实际上，前面一种分类方法更加常见，所以，在今天的讲解中，我们沿用第一种分类方法。</p><p>在这三种细分的工厂模式中，简单工厂、工厂方法原理比较简单，在实际的项目中也比较常用。而抽象工厂的原理稍微复杂点，在实际的项目中相对也不常用。所以，我们今天讲解的重点是前两种工厂模式。对于抽象工厂，你稍微了解一下即可。</p><p>除此之外，我们讲解的重点也不是原理和实现，因为这些都很简单，重点还是带你搞清楚应用场景：什么时候该用工厂模式？相对于直接new来创建对象，用工厂模式来创建究竟有什么好处呢？</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="简单工厂-simple-factory" tabindex="-1">简单工厂（Simple Factory） <a class="header-anchor" href="#简单工厂-simple-factory" aria-label="Permalink to &quot;简单工厂（Simple Factory）&quot;">&amp;ZeroWidthSpace;</a></h2><p>首先，我们来看，什么是简单工厂模式。我们通过一个例子来解释一下。</p><p>在下面这段代码中，我们根据配置文件的后缀（json、xml、yaml、properties），选择不同的解析器（JsonRuleConfigParser、XmlRuleConfigParser……），将存储在文件中的配置解析成内存对象RuleConfig。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RuleConfigSource {</span></span>
<span class="line"><span>  public RuleConfig load(String ruleConfigFilePath) {</span></span>
<span class="line"><span>    String ruleConfigFileExtension = getFileExtension(ruleConfigFilePath);</span></span>
<span class="line"><span>    IRuleConfigParser parser = null;</span></span>
<span class="line"><span>    if (&quot;json&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parser = new JsonRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;xml&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parser = new XmlRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;yaml&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parser = new YamlRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;properties&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parser = new PropertiesRuleConfigParser();</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      throw new InvalidRuleConfigException(</span></span>
<span class="line"><span>             &quot;Rule config file format is not supported: &quot; + ruleConfigFilePath);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String configText = &quot;&quot;;</span></span>
<span class="line"><span>    //从ruleConfigFilePath文件中读取配置文本到configText中</span></span>
<span class="line"><span>    RuleConfig ruleConfig = parser.parse(configText);</span></span>
<span class="line"><span>    return ruleConfig;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private String getFileExtension(String filePath) {</span></span>
<span class="line"><span>    //...解析文件名获取扩展名，比如rule.json，返回json</span></span>
<span class="line"><span>    return &quot;json&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>在“规范和重构”那一部分中，我们有讲到，为了让代码逻辑更加清晰，可读性更好，我们要善于将功能独立的代码块封装成函数。按照这个设计思路，我们可以将代码中涉及parser创建的部分逻辑剥离出来，抽象成createParser()函数。重构之后的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  public RuleConfig load(String ruleConfigFilePath) {</span></span>
<span class="line"><span>    String ruleConfigFileExtension = getFileExtension(ruleConfigFilePath);</span></span>
<span class="line"><span>    IRuleConfigParser parser = createParser(ruleConfigFileExtension);</span></span>
<span class="line"><span>    if (parser == null) {</span></span>
<span class="line"><span>      throw new InvalidRuleConfigException(</span></span>
<span class="line"><span>              &quot;Rule config file format is not supported: &quot; + ruleConfigFilePath);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String configText = &quot;&quot;;</span></span>
<span class="line"><span>    //从ruleConfigFilePath文件中读取配置文本到configText中</span></span>
<span class="line"><span>    RuleConfig ruleConfig = parser.parse(configText);</span></span>
<span class="line"><span>    return ruleConfig;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private String getFileExtension(String filePath) {</span></span>
<span class="line"><span>    //...解析文件名获取扩展名，比如rule.json，返回json</span></span>
<span class="line"><span>    return &quot;json&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private IRuleConfigParser createParser(String configFormat) {</span></span>
<span class="line"><span>    IRuleConfigParser parser = null;</span></span>
<span class="line"><span>    if (&quot;json&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new JsonRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;xml&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new XmlRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;yaml&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new YamlRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;properties&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new PropertiesRuleConfigParser();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return parser;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>为了让类的职责更加单一、代码更加清晰，我们还可以进一步将createParser()函数剥离到一个独立的类中，让这个类只负责对象的创建。而这个类就是我们现在要讲的简单工厂模式类。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RuleConfigSource {</span></span>
<span class="line"><span>  public RuleConfig load(String ruleConfigFilePath) {</span></span>
<span class="line"><span>    String ruleConfigFileExtension = getFileExtension(ruleConfigFilePath);</span></span>
<span class="line"><span>    IRuleConfigParser parser = RuleConfigParserFactory.createParser(ruleConfigFileExtension);</span></span>
<span class="line"><span>    if (parser == null) {</span></span>
<span class="line"><span>      throw new InvalidRuleConfigException(</span></span>
<span class="line"><span>              &quot;Rule config file format is not supported: &quot; + ruleConfigFilePath);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String configText = &quot;&quot;;</span></span>
<span class="line"><span>    //从ruleConfigFilePath文件中读取配置文本到configText中</span></span>
<span class="line"><span>    RuleConfig ruleConfig = parser.parse(configText);</span></span>
<span class="line"><span>    return ruleConfig;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private String getFileExtension(String filePath) {</span></span>
<span class="line"><span>    //...解析文件名获取扩展名，比如rule.json，返回json</span></span>
<span class="line"><span>    return &quot;json&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class RuleConfigParserFactory {</span></span>
<span class="line"><span>  public static IRuleConfigParser createParser(String configFormat) {</span></span>
<span class="line"><span>    IRuleConfigParser parser = null;</span></span>
<span class="line"><span>    if (&quot;json&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new JsonRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;xml&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new XmlRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;yaml&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new YamlRuleConfigParser();</span></span>
<span class="line"><span>    } else if (&quot;properties&quot;.equalsIgnoreCase(configFormat)) {</span></span>
<span class="line"><span>      parser = new PropertiesRuleConfigParser();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return parser;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>大部分工厂类都是以“Factory”这个单词结尾的，但也不是必须的，比如Java中的DateFormat、Calender。除此之外，工厂类中创建对象的方法一般都是create开头，比如代码中的createParser()，但有的也命名为getInstance()、createInstance()、newInstance()，有的甚至命名为valueOf()（比如Java String类的valueOf()函数）等等，这个我们根据具体的场景和习惯来命名就好。</p><p>在上面的代码实现中，我们每次调用RuleConfigParserFactory的createParser()的时候，都要创建一个新的parser。实际上，如果parser可以复用，为了节省内存和对象创建的时间，我们可以将parser事先创建好缓存起来。当调用createParser()函数的时候，我们从缓存中取出parser对象直接使用。</p><p>这有点类似单例模式和简单工厂模式的结合，具体的代码实现如下所示。在接下来的讲解中，我们把上一种实现方法叫作简单工厂模式的第一种实现方法，把下面这种实现方法叫作简单工厂模式的第二种实现方法。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RuleConfigParserFactory {</span></span>
<span class="line"><span>  private static final Map&lt;String, RuleConfigParser&gt; cachedParsers = new HashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  static {</span></span>
<span class="line"><span>    cachedParsers.put(&quot;json&quot;, new JsonRuleConfigParser());</span></span>
<span class="line"><span>    cachedParsers.put(&quot;xml&quot;, new XmlRuleConfigParser());</span></span>
<span class="line"><span>    cachedParsers.put(&quot;yaml&quot;, new YamlRuleConfigParser());</span></span>
<span class="line"><span>    cachedParsers.put(&quot;properties&quot;, new PropertiesRuleConfigParser());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static IRuleConfigParser createParser(String configFormat) {</span></span>
<span class="line"><span>    if (configFormat == null || configFormat.isEmpty()) {</span></span>
<span class="line"><span>      return null;//返回null还是IllegalArgumentException全凭你自己说了算</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    IRuleConfigParser parser = cachedParsers.get(configFormat.toLowerCase());</span></span>
<span class="line"><span>    return parser;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>对于上面两种简单工厂模式的实现方法，如果我们要添加新的parser，那势必要改动到RuleConfigParserFactory的代码，那这是不是违反开闭原则呢？实际上，如果不是需要频繁地添加新的parser，只是偶尔修改一下RuleConfigParserFactory代码，稍微不符合开闭原则，也是完全可以接受的。</p><p>除此之外，在RuleConfigParserFactory的第一种代码实现中，有一组if分支判断逻辑，是不是应该用多态或其他设计模式来替代呢？实际上，如果if分支并不是很多，代码中有if分支也是完全可以接受的。应用多态或设计模式来替代if分支判断逻辑，也并不是没有任何缺点的，它虽然提高了代码的扩展性，更加符合开闭原则，但也增加了类的个数，牺牲了代码的可读性。关于这一点，我们在后面章节中会详细讲到。</p><p>总结一下，尽管简单工厂模式的代码实现中，有多处if分支判断逻辑，违背开闭原则，但权衡扩展性和可读性，这样的代码实现在大多数情况下（比如，不需要频繁地添加parser，也没有太多的parser）是没有问题的。</p><h2 id="工厂方法-factory-method" tabindex="-1">工厂方法（Factory Method） <a class="header-anchor" href="#工厂方法-factory-method" aria-label="Permalink to &quot;工厂方法（Factory Method）&quot;">&amp;ZeroWidthSpace;</a></h2><p>如果我们非得要将if分支逻辑去掉，那该怎么办呢？比较经典处理方法就是利用多态。按照多态的实现思路，对上面的代码进行重构。重构之后的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface IRuleConfigParserFactory {</span></span>
<span class="line"><span>  IRuleConfigParser createParser();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class JsonRuleConfigParserFactory implements IRuleConfigParserFactory {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public IRuleConfigParser createParser() {</span></span>
<span class="line"><span>    return new JsonRuleConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class XmlRuleConfigParserFactory implements IRuleConfigParserFactory {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public IRuleConfigParser createParser() {</span></span>
<span class="line"><span>    return new XmlRuleConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class YamlRuleConfigParserFactory implements IRuleConfigParserFactory {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public IRuleConfigParser createParser() {</span></span>
<span class="line"><span>    return new YamlRuleConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class PropertiesRuleConfigParserFactory implements IRuleConfigParserFactory {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public IRuleConfigParser createParser() {</span></span>
<span class="line"><span>    return new PropertiesRuleConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，这就是工厂方法模式的典型代码实现。这样当我们新增一种parser的时候，只需要新增一个实现了IRuleConfigParserFactory接口的Factory类即可。所以，<strong>工厂方法模式比起简单工厂模式更加符合开闭原则。</strong></p><p>从上面的工厂方法的实现来看，一切都很完美，但是实际上存在挺大的问题。问题存在于这些工厂类的使用上。接下来，我们看一下，如何用这些工厂类来实现RuleConfigSource的load()函数。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RuleConfigSource {</span></span>
<span class="line"><span>  public RuleConfig load(String ruleConfigFilePath) {</span></span>
<span class="line"><span>    String ruleConfigFileExtension = getFileExtension(ruleConfigFilePath);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    IRuleConfigParserFactory parserFactory = null;</span></span>
<span class="line"><span>    if (&quot;json&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parserFactory = new JsonRuleConfigParserFactory();</span></span>
<span class="line"><span>    } else if (&quot;xml&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parserFactory = new XmlRuleConfigParserFactory();</span></span>
<span class="line"><span>    } else if (&quot;yaml&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parserFactory = new YamlRuleConfigParserFactory();</span></span>
<span class="line"><span>    } else if (&quot;properties&quot;.equalsIgnoreCase(ruleConfigFileExtension)) {</span></span>
<span class="line"><span>      parserFactory = new PropertiesRuleConfigParserFactory();</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      throw new InvalidRuleConfigException(&quot;Rule config file format is not supported: &quot; + ruleConfigFilePath);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    IRuleConfigParser parser = parserFactory.createParser();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String configText = &quot;&quot;;</span></span>
<span class="line"><span>    //从ruleConfigFilePath文件中读取配置文本到configText中</span></span>
<span class="line"><span>    RuleConfig ruleConfig = parser.parse(configText);</span></span>
<span class="line"><span>    return ruleConfig;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private String getFileExtension(String filePath) {</span></span>
<span class="line"><span>    //...解析文件名获取扩展名，比如rule.json，返回json</span></span>
<span class="line"><span>    return &quot;json&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从上面的代码实现来看，工厂类对象的创建逻辑又耦合进了load()函数中，跟我们最初的代码版本非常相似，引入工厂方法非但没有解决问题，反倒让设计变得更加复杂了。那怎么来解决这个问题呢？</p><p>**我们可以为工厂类再创建一个简单工厂，也就是工厂的工厂，用来创建工厂类对象。**这段话听起来有点绕，我把代码实现出来了，你一看就能明白了。其中，RuleConfigParserFactoryMap类是创建工厂对象的工厂类，getParserFactory()返回的是缓存好的单例工厂对象。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RuleConfigSource {</span></span>
<span class="line"><span>  public RuleConfig load(String ruleConfigFilePath) {</span></span>
<span class="line"><span>    String ruleConfigFileExtension = getFileExtension(ruleConfigFilePath);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    IRuleConfigParserFactory parserFactory = RuleConfigParserFactoryMap.getParserFactory(ruleConfigFileExtension);</span></span>
<span class="line"><span>    if (parserFactory == null) {</span></span>
<span class="line"><span>      throw new InvalidRuleConfigException(&quot;Rule config file format is not supported: &quot; + ruleConfigFilePath);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    IRuleConfigParser parser = parserFactory.createParser();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String configText = &quot;&quot;;</span></span>
<span class="line"><span>    //从ruleConfigFilePath文件中读取配置文本到configText中</span></span>
<span class="line"><span>    RuleConfig ruleConfig = parser.parse(configText);</span></span>
<span class="line"><span>    return ruleConfig;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private String getFileExtension(String filePath) {</span></span>
<span class="line"><span>    //...解析文件名获取扩展名，比如rule.json，返回json</span></span>
<span class="line"><span>    return &quot;json&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//因为工厂类只包含方法，不包含成员变量，完全可以复用，</span></span>
<span class="line"><span>//不需要每次都创建新的工厂类对象，所以，简单工厂模式的第二种实现思路更加合适。</span></span>
<span class="line"><span>public class RuleConfigParserFactoryMap { //工厂的工厂</span></span>
<span class="line"><span>  private static final Map&lt;String, IRuleConfigParserFactory&gt; cachedFactories = new HashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  static {</span></span>
<span class="line"><span>    cachedFactories.put(&quot;json&quot;, new JsonRuleConfigParserFactory());</span></span>
<span class="line"><span>    cachedFactories.put(&quot;xml&quot;, new XmlRuleConfigParserFactory());</span></span>
<span class="line"><span>    cachedFactories.put(&quot;yaml&quot;, new YamlRuleConfigParserFactory());</span></span>
<span class="line"><span>    cachedFactories.put(&quot;properties&quot;, new PropertiesRuleConfigParserFactory());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static IRuleConfigParserFactory getParserFactory(String type) {</span></span>
<span class="line"><span>    if (type == null || type.isEmpty()) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    IRuleConfigParserFactory parserFactory = cachedFactories.get(type.toLowerCase());</span></span>
<span class="line"><span>    return parserFactory;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>当我们需要添加新的规则配置解析器的时候，我们只需要创建新的parser类和parser factory类，并且在RuleConfigParserFactoryMap类中，将新的parser factory对象添加到cachedFactories中即可。代码的改动非常少，基本上符合开闭原则。</p><p>实际上，对于规则配置文件解析这个应用场景来说，工厂模式需要额外创建诸多Factory类，也会增加代码的复杂性，而且，每个Factory类只是做简单的new操作，功能非常单薄（只有一行代码），也没必要设计成独立的类，所以，在这个应用场景下，简单工厂模式简单好用，比工厂方法模式更加合适。</p><p><strong>那什么时候该用工厂方法模式，而非简单工厂模式呢？</strong></p><p>我们前面提到，之所以将某个代码块剥离出来，独立为函数或者类，原因是这个代码块的逻辑过于复杂，剥离之后能让代码更加清晰，更加可读、可维护。但是，如果代码块本身并不复杂，就几行代码而已，我们完全没必要将它拆分成单独的函数或者类。</p><p>基于这个设计思想，当对象的创建逻辑比较复杂，不只是简单的new一下就可以，而是要组合其他类对象，做各种初始化操作的时候，我们推荐使用工厂方法模式，将复杂的创建逻辑拆分到多个工厂类中，让每个工厂类都不至于过于复杂。而使用简单工厂模式，将所有的创建逻辑都放到一个工厂类中，会导致这个工厂类变得很复杂。</p><p>除此之外，在某些场景下，如果对象不可复用，那工厂类每次都要返回不同的对象。如果我们使用简单工厂模式来实现，就只能选择第一种包含if分支逻辑的实现方式。如果我们还想避免烦人的if-else分支逻辑，这个时候，我们就推荐使用工厂方法模式。</p><h2 id="抽象工厂-abstract-factory" tabindex="-1">抽象工厂（Abstract Factory） <a class="header-anchor" href="#抽象工厂-abstract-factory" aria-label="Permalink to &quot;抽象工厂（Abstract Factory）&quot;">&amp;ZeroWidthSpace;</a></h2><p>讲完了简单工厂、工厂方法，我们再来看抽象工厂模式。抽象工厂模式的应用场景比较特殊，没有前两种常用，所以不是我们本节课学习的重点，你简单了解一下就可以了。</p><p>在简单工厂和工厂方法中，类只有一种分类方式。比如，在规则配置解析那个例子中，解析器类只会根据配置文件格式（Json、Xml、Yaml……）来分类。但是，如果类有两种分类方式，比如，我们既可以按照配置文件格式来分类，也可以按照解析的对象（Rule规则配置还是System系统配置）来分类，那就会对应下面这8个parser类。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>针对规则配置的解析器：基于接口IRuleConfigParser</span></span>
<span class="line"><span>JsonRuleConfigParser</span></span>
<span class="line"><span>XmlRuleConfigParser</span></span>
<span class="line"><span>YamlRuleConfigParser</span></span>
<span class="line"><span>PropertiesRuleConfigParser</span></span>
<span class="line"><span></span></span>
<span class="line"><span>针对系统配置的解析器：基于接口ISystemConfigParser</span></span>
<span class="line"><span>JsonSystemConfigParser</span></span>
<span class="line"><span>XmlSystemConfigParser</span></span>
<span class="line"><span>YamlSystemConfigParser</span></span>
<span class="line"><span>PropertiesSystemConfigParser</span></span></code></pre></div><p>针对这种特殊的场景，如果还是继续用工厂方法来实现的话，我们要针对每个parser都编写一个工厂类，也就是要编写8个工厂类。如果我们未来还需要增加针对业务配置的解析器（比如IBizConfigParser），那就要再对应地增加4个工厂类。而我们知道，过多的类也会让系统难维护。这个问题该怎么解决呢？</p><p>抽象工厂就是针对这种非常特殊的场景而诞生的。我们可以让一个工厂负责创建多个不同类型的对象（IRuleConfigParser、ISystemConfigParser等），而不是只创建一种parser对象。这样就可以有效地减少工厂类的个数。具体的代码实现如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface IConfigParserFactory {</span></span>
<span class="line"><span>  IRuleConfigParser createRuleParser();</span></span>
<span class="line"><span>  ISystemConfigParser createSystemParser();</span></span>
<span class="line"><span>  //此处可以扩展新的parser类型，比如IBizConfigParser</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class JsonConfigParserFactory implements IConfigParserFactory {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public IRuleConfigParser createRuleParser() {</span></span>
<span class="line"><span>    return new JsonRuleConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ISystemConfigParser createSystemParser() {</span></span>
<span class="line"><span>    return new JsonSystemConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class XmlConfigParserFactory implements IConfigParserFactory {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public IRuleConfigParser createRuleParser() {</span></span>
<span class="line"><span>    return new XmlRuleConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ISystemConfigParser createSystemParser() {</span></span>
<span class="line"><span>    return new XmlSystemConfigParser();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 省略YamlConfigParserFactory和PropertiesConfigParserFactory代码</span></span></code></pre></div><h2 id="重点回顾" tabindex="-1">\b重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;\b重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们来一块总结回顾一下，你需要重点掌握的内容。</p><p>在今天讲的三种工厂模式中，简单工厂和工厂方法比较常用，抽象工厂的应用场景比较特殊，所以很少用到，不是我们学习的重点。所以，下面我重点对前两种工厂模式的应用场景进行总结。</p><p>当创建逻辑比较复杂，是一个“大工程”的时候，我们就考虑使用工厂模式，封装对象的创建过程，将对象的创建和使用相分离。何为创建逻辑比较复杂呢？我总结了下面两种情况。</p><ul><li>第一种情况：类似规则配置解析的例子，代码中存在if-else分支判断，动态地根据不同的类型创建不同的对象。针对这种情况，我们就考虑使用工厂模式，将这一大坨if-else创建对象的代码抽离出来，放到工厂类中。</li><li>还有一种情况，尽管我们不需要根据不同的类型创建不同的对象，但是，单个对象本身的创建过程比较复杂，比如前面提到的要组合其他类对象，做各种初始化操作。在这种情况下，我们也可以考虑使用工厂模式，将对象的创建过程封装到工厂类中。</li></ul><p>对于第一种情况，当每个对象的创建逻辑都比较简单的时候，我推荐使用简单工厂模式，将多个对象的创建逻辑放到一个工厂类中。当每个对象的创建逻辑都比较复杂的时候，为了避免设计一个过于庞大的简单工厂类，我推荐使用工厂方法模式，将创建逻辑拆分得更细，每个对象的创建逻辑独立到各自的工厂类中。同理，对于第二种情况，因为单个对象本身的创建逻辑就比较复杂，所以，我建议使用工厂方法模式。</p><p>除了刚刚提到的这几种情况之外，如果创建对象的逻辑并不复杂，那我们就直接通过new来创建对象就可以了，不需要使用工厂模式。</p><p>现在，我们上升一个思维层面来看工厂模式，它的作用无外乎下面这四个。这也是判断要不要使用工厂模式的最本质的参考标准。</p><ul><li>封装变化：创建逻辑有可能变化，封装成工厂类之后，创建逻辑的变更对调用者透明。</li><li>代码复用：\b创建代码抽离到独立的工厂类之后可以复用。</li><li>隔离复杂性：封装复杂的创建逻辑，调用者无需了解如何创建对象。</li><li>控制复杂度：将创建代码抽离出来，让原本的函数或类职责更单一，代码更简洁。</li></ul><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><ol><li>工厂模式是一种非常常用的设计模式，在很多开源项目、工具类中到处可见，比如Java中的Calendar、DateFormat类。除此之外，你还知道哪些用工厂模式实现类？可以留言说一说它们为什么要设计成工厂模式类？</li><li>实际上，简单工厂模式还叫作静态工厂方法模式（Static Factory Method Pattern）。之所以叫静态工厂方法模式，是因为其中创建对象的方法是静态的。那为什么要设置成静态的呢？设置成静态的，在使用的时候，是否会影响到代码的可测试性呢？</li></ol><p>欢迎在留言区写下你的答案，和同学一起交流和分享。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） zhengyu.nie 👍（202） 💬（35）个人意见，传统的工厂模式太麻烦了，除非业务真的很复杂，通常我会选择以下方案。 还是举文中的例子</p><p>1.将不同的RuleConfigParser实现按照约定格式指定beanName注入，比方说@Component(“XmlRuleConfigParser”)，取的时候applicationContext.getBean(typeSuffix+RuleConfigParser)即可，拓展的话，自己写一个xxRuleConfigParser，就注入进去了，也不需要在map容器新增。 整个工厂方法就是 public RuleConfigParser getInstance(suffix){ return InstanceLocator.getBean(suffix+&quot;RuleConfigParser&quot;); }</p><p>2.直接用java.util.functional实现现代函数式编程范式的设计模式 像文中的例子,可以看作工厂,也可以看作获取一种parse策略。 可以有一个FunctionFactory内部维护一组Function&lt;String,String&gt;函数，再有一个Map容器 mapping type和Function的关系。这样是简化了类的数量，如果业务简单没必要整太多类，function铺在一个factory里可读性不会有什么问题。如果是没有返回值的操作，也可以用Consumer函数。打个比方</p><pre><code>public BiConsumer&amp;lt;AbstractProductServiceRequest, Function&amp;lt;ProductServiceQueryRequest,
    ProductServiceQueryResponse&amp;gt;&amp;gt; operateConsumer() {
    switch (serviceOperationEnum) {
        case OPEN:
            return openConsumer();
        case CLOSE:
            return closeConsumer();
        default:
            throw new RuntimeException(&amp;quot;not support OperationType&amp;quot;);
    }
}
</code></pre><p>如果是对象，那更简单，Map&lt;Supply&gt;函数即可。</p><p>public class ShapeFactory { final static Map&lt;String, Supplier&lt;Shape&gt;&gt; map = new HashMap&lt;&gt;(); static { map.put(&quot;CIRCLE&quot;, Circle::new); map.put(&quot;RECTANGLE&quot;, Rectangle::new); }<br> public Shape getShape(String shapeType){ Supplier&lt;Shape&gt; shape = map.get(shapeType.toUpperCase()); if(shape != null) { return shape.get(); } throw new IllegalArgumentException(&quot;No such shape &quot; + shapeType.toUpperCase()); } }</p><p>以上个人意见，对于比较简单的场景，lambda function等方式代替类，会显得不那么臃肿，具体还是要看需求。至于OOP等原则，也不是完全要遵守的，就像争哥说的少量if可以不管，一样的道理，灵活运用。2020-04-24Robin 👍（11） 💬（9）原文：简单工厂模式的实现方法，如果我们要添加新的 parser，那势必要改动到 RuleConfigParserFactory 的代码，那这是不是违反开闭原则呢？实际上，如果不是需要频繁地添加新的 parser，只是偶尔修改一下 RuleConfigParserFactory 代码，稍微不符合开闭原则，也是完全可以接受的。 原文：工厂方法：当我们需要添加新的规则配置解析器的时候，我们只需要创建新的 parser 类和 parser factory 类，并且在 RuleConfigParserFactoryMap 类中，将新的 parser factory 对象添加到 cachedFactories 中即可。代码的改动非常少，基本上符合开闭原则。 感觉说法有点牵强，添加一个类，简单工厂模式修改RuleConfigParserFactory， 工厂方法也要修改RuleConfigParserFactoryMap，也是会违背开闭原则。关键简单工厂模式(第二种方式)下添加的代码量一个是map.put,工厂方法也是一个map.put,然后说明工厂方法代码的改动非常少，基本上符合开闭原则？2020-07-25郑大钱 👍（6） 💬（1）传统的工厂模式确实很传统。 简单工厂是在一个工厂方法里通过流程控制语句创建不同的对象，适合创建简单的对象。 工厂方法和简单方法没有什么区别，只是用工厂对象再此封装了复杂对象的创建。工厂的工厂负责调用工厂的创建方法，每个工厂只创建一个对象，适合创建复杂的对象。 工厂模式是对创建方法的封装和抽象，创建的复杂度无法被抵消，只能被转移到工厂内部消化。2020-11-17御风 👍（0） 💬（2）掌握了使用工厂模式的本本质：封装变化（创建逻辑可能变化）、隔离复杂性、控制复杂度（让类职责更加单一）、代码复用。 如果创建的对象不能复用，又不想用if–else，就不能使用简单工厂模式。 这个可以在static代码块中使用反射？2020-08-08逍遥思 👍（417） 💬（20）复杂度无法被消除，只能被转移：</p><ul><li>不用工厂模式，if-else 逻辑、创建逻辑和业务代码耦合在一起</li><li>简单工厂是将不同创建逻辑放到一个工厂类中，if-else 逻辑在这个工厂类中</li><li>工厂方法是将不同创建逻辑放到不同工厂类中，先用一个工厂类的工厂来来得到某个工厂，再用这个工厂来创建，if-else 逻辑在工厂类的工厂中2020-02-12跳跳 👍（62） 💬（3）我觉得很多人被带跑偏了 工厂本身的重点不是解决if else 而是解决简单工厂的开闭原则，大家都在重点讨论if else 即使被省略了 也是map的功劳啊2020-08-10麦可 👍（56） 💬（4）我把Head First的定义贴过来，方便大家理解总结</li></ul><p>工厂方法模式：定义了一个创建对象的接口，但由子类决定要实例化的类是哪一个。工厂方法让类把实例化推迟到子类</p><p>抽象工厂模式：提供一个接口，用于创建相关或依赖对象的家族，而不需要明确指定具体类2020-02-12辣么大 👍（44） 💬（6）在JDK中工厂方法的命名有些规范：</p><ol><li>valueOf() 返回与入参相等的对象 例如 Integer.valueOf()</li><li>getInstance() 返回单例对象 例如 Calendar.getInstance()</li><li>newInstance() 每次调用时返回新的对象 例如 HelloWorld.class.getConstructor().newInstance() 4 在反射中的工厂方法 例如 XXX.class.getField(String name) 返回成员</li></ol><p>静态工厂方法的优点：</p><ol><li>静态工厂方法子类可以继承，但不能重写，这样返回类型就是确定的。可以返回对象类型或者primitive 类型。</li><li>静态工厂方法的名字更有意义，例如Collections.synchronizedMap()</li><li>静态工厂方法可以封装创建对象的逻辑，还可以做其他事情，让构造方法只初始化成员变量。</li><li>静态工厂方法可以控制创建实例的个数。例如单例模式，或者多例模式，使用本质上是可以用静态工厂方法实现。2020-02-12Brian 👍（28） 💬（3）一、三种工厂模式</li><li>简单工厂（Simple Factory） 使用场景： a. 当每个对象的创建逻辑都比较简单的时候，将多个对象的创建逻辑放到一个工厂类中。 实现： a. if else 创建不同的对象。 b. 用单例模式 + 简单工厂模式结合来实现。</li><li>工厂方法（Factory Method） 使用场景： a. 当每个对象的创建逻辑都比较复杂的时候，为了避免设计一个过于庞大的简单工厂类时，将创建逻辑拆分得更细，每个对象的创建逻辑独立到各自的工厂类中。 b. 避免很多 if-else 分支逻辑时。 实现： a. 定义相应的ParserFactory接口，每个工厂定义一个实现类。这种方式使用会有多个if else 让使用更加复杂。 b. 创建工厂的工厂来，此方案可以解决上面的问题。</li><li>抽象工厂（Abstract Factory）- 不常用 使用场景： a. 有多种分类方式，如方式要用一套工厂方法，方式二要用一套工厂方法，详见原文例子。 实现： 让一个工厂负责创建多个不同类型的对象（IRuleConfigParser、ISystemConfigParser 等），而不是只创建一种 parser 对象。</li></ol><p>二、例子 刚好最近有这方面的应用场景，主要使用了 单例模式 + 工厂模式 + 策略模式，用于解化多过的if else的复杂性。</p><p>public class OrderOperateStrategyFactory { /** * 消费类型和策略对象映射。 */ private Map&lt;CheckoutType, OrderOperateStrategy&gt; map;</p><pre><code>&amp;#47;**
 * 构造策略列表。
 *&amp;#47;
private OrderOperateStrategyFactory() {
    List&amp;lt;OrderOperateStrategy&amp;gt; list = new ArrayList&amp;lt;&amp;gt;();
    list.add(SpringContextHolder.getBean(ConsumptionOrderOperateStrategy.class));
    list.add(SpringContextHolder.getBean(GroupServiceOrderOperateStrategy.class));
    &amp;#47;&amp;#47;...
    map = list.stream().collect(Collectors.toMap(OrderOperateStrategy::getCheckoutType, v -&amp;gt; v));
}

&amp;#47;**
 * 通过消费类型获取订单操作策略。
 *
 * @param checkoutType 消费类型
 * @return 订单损我策略对象
 *&amp;#47;
public OrderOperateStrategy get(CheckoutType checkoutType) {
    return map.get(checkoutType);
}

&amp;#47;**
 * 静态内部类单例对象。
 *&amp;#47;
private static class Holder {
    private static OrderOperateStrategyFactory INSTANCE = new OrderOperateStrategyFactory();
}

&amp;#47;**
 * 获取订单操作策略工厂类实例。
 *
 * @return 单例实例。
 *&amp;#47;
public static OrderOperateStrategyFactory getInstance() {
    return Holder.INSTANCE;
}
</code></pre><p>}</p><p>使用： OrderOperateStrategy strategy = OrderOperateStrategyFactory.getInstance().get(checkoutType); strategy.complete(orderId);2020-02-13Jxin 👍（28） 💬（1）分歧： 1.文中说，创建对象不复杂的情况下用new，复杂的情况用工厂方法。这描述没问题，但工厂方法除了处理复杂对象创建这一职责，还有增加扩展点这优点。工厂方法，在可能有扩展需求，比如要加对象池，缓存，或其他业务需求时，可以提供扩展的地方。所以，除非明确确定该类只会有简单数据载体的职责（值对象），不然建议还是用工厂方法好点。new这种操作是没有扩展性的。</p><p>回答问题： 2.工厂方法要么归于类，要么归于实例。如果归于实例，那么第一个实例怎么来？而且实例创建出另一个实例，这种行为应该称为拷贝，或则拆分。是一个平级的复制或分裂的行为。而归于类，创建出实例，是一个父子关系，其创建的语义更强些。 我认为不影响测试。因为工厂方法不该包含业务，它只是new的一种更好的写法。所以你只需要用它，而并不该需要测它。如果你的静态工厂方法都需要测试，那么说明你这个方法不够“干净”。2020-02-13李小四 👍（16） 💬（2）设计模式_44:</p><h1 id="作业" tabindex="-1">作业 <a class="header-anchor" href="#作业" aria-label="Permalink to &quot;作业&quot;">&amp;ZeroWidthSpace;</a></h1><ol><li><p>Android开发中工厂模式也很常用，比如<code>BitmapFactory</code>类；用工厂模式的原因是<code>Bitmap</code>对象的创建过程比较复杂，并且可以通过不同的方式来创建。</p></li><li><p>查了一下资料，意识到这个问题的核心在于使用<em>静态工厂方法</em>替代的是使用构造函数，之所以用<em>静态方法</em>，是因为它比构造函数具有以下优势： (1) 构造函数的名字无意义，方法的名字包含更多有用信息 (2) 构造函数只能返回当前Class类型对象，而方法可以返回当前类型对象、当前类型的子类对象，也可以返回基础数据类型 (3) 如果创建过程很复杂，那么方法可以把很多不应该由构造函数处理的过程放在方法中，让构造函数只处理初始化成员的工作，职责更单一。 (4) 方法可以控制生成对象的个数(单例，多例等)</p></li></ol><h1 id="感想" tabindex="-1">感想 <a class="header-anchor" href="#感想" aria-label="Permalink to &quot;感想&quot;">&amp;ZeroWidthSpace;</a></h1><p>看了今天的内容，突然有个疑问: <em>static</em>方法可以是抽象方法吗？可以被继承吗？ 验证了一下，发现 <em>static</em>方法可以被重写，<em>static</em> 与 <em>abstract</em> 是冲突的, 不能同时修饰一个方法；而且，如果用子类重写了父类的static方法，这时候让父类的引用指向子类对象，然后调用该<em>static</em>方法，这时调用的是父类的<em>static</em>方法，也就是不支持“多态”，这也解释了为什么<em>static</em> 与 <em>abstract</em>冲突。</p><p>关于第二题，直觉上来讲，如果不用静态方法就只能对对象方法，但使用对象方法的前提是有一个对象，但这个方法就是用来创建对象的，这时一个死锁。。。但显然问题的用意不是这个，于是查了资料。。。2020-02-23KK 👍（13） 💬（3）作者只会java，感觉讲起来有些晦涩。感觉没有讲清楚，什么叫工厂模式。何为工厂？作者在讲解每一个模式的时候，是不是应该解释一下，为什么起这个名字？不同的名字，肯定是具体描述的抽象。通过名字的由来，就能够明确其相关的区别。2020-04-06林子er 👍（10） 💬（0）工厂方法和抽象工厂都是先定义工厂接口，由子类去创建实际的对象。不同点在于每个工厂方法只负责创建一种对象，解决的是一维问题，而抽象工厂一个工厂创建一簇对象（多种），解决的是多维问题（文章中是二维）。工厂方法是抽象工厂的一种特例。抽象工厂是采用降维的思想来解决复杂问题。2020-04-24Wh1 👍（10） 💬（1）看到工厂方法模式，相信很多人会和我有一模一样的疑问：工厂方法模式不是一样存在if - else么，就算再通过一个工厂优化了if - else分支，与第二种简单工厂不是差不多么？ 反复看了几遍理解类作者的意图。如果ConfigParser的实例创建不是简单的 new 这么简单，而是存在很多复杂的逻辑，那么简单工厂模式就不能通过直接put(newConfigParser())这种方式，必须通过 if else 语句块来完成获取解析器对象的逻辑。 如果要封装复杂的初始化逻辑，那么就可以通过工厂方法来重构。但是工厂方法重构之后会有很多if - else分支，这时候就可以再建立一个工厂将这些 if - else分支优化。 总而言之，如果创建对象是一个简单的new 就能完成的，那么毋庸置疑简单工厂更好一些。如果创建对象比较复杂，就采用工厂方法2020-04-10乾坤瞬间 👍（7） 💬（0）课后习题1，在spark livy框架中，有一个ClientFactory类，这个类根据用户的开发环境会设置成不同的客户端，一种是用来生产rpcClient客户端，一种是用来生产httpClient，每一种创建的逻辑和方式都非常复杂，会根据不同的参数生成Client,有些客户端会内置看门狗，以提高可用性，有些没有.所以应对这种创建的复杂性，使用了工厂模式，使用了工厂的工厂 习题2，个人认为这样的静态方法，第一与单例模式的思想不可分离，因为创建对象的抽象不需要通过创建一个新的类来实现，或者根据dry选择，用静态方法复用代码块的方式更加直接粗糙，简单美。我觉得在可测试方面是有影响的，不过因为这种简单的抽象是基于原有逻辑不存在未决行为的基础上的，而且对新增的代码有足够的信心 同时总结一下今天的三种工厂方法的演进 利用数学公式y≡f(x,x2)的角度，y是关于x x2的一个系统描述。 简单工厂只基于在系统y在不断加上x3的情况下，直接引入一个新的变量来简单替换f函数 工厂函数是在替换变量的基础上对x进行了再替换，使得系统更容易理解，y≡f(θ(x),θ(x2)...)形式 抽象方法是把x变量替换为δ(x,m)即，y≡f(δ(x,m)，δ(x2,m))形式2020-02-21</p>`,77)])])}const C=s(l,[["render",r]]);export{f as __pageData,C as default};
