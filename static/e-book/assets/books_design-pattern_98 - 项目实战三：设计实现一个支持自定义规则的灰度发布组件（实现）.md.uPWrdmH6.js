import{_ as n,o as s,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/98 - 项目实战三：设计实现一个支持自定义规则的灰度发布组件（实现）.md","filePath":"books/design-pattern/98 - 项目实战三：设计实现一个支持自定义规则的灰度发布组件（实现）.md"}'),l={name:"books/design-pattern/98 - 项目实战三：设计实现一个支持自定义规则的灰度发布组件（实现）.md"};function i(r,a,t,c,u,o){return s(),p("div",null,[...a[0]||(a[0]=[e(`<p>上两节课，我们讲解了灰度组件的需求和设计思路。不管是之前讲过的限流、幂等框架，还是现在正在讲的灰度组件，这些框架、组件、类库的功能性需求都不复杂，相反，非功能性需求是开发的重点、难点。</p><p>今天，我们按照上节课给出的灰度组件的设计思路，讲解如何进行编码实现。不过今天对实现的讲解，跟前面两个实战项目有所不同。在前面两个项目中，我都是手把手地从最基础的MVP代码讲起，然后讲解如何review代码发现问题、重构代码解决问题，最终得到一份还算高质量的代码。考虑到已经有前面两个项目的学习和锻炼了，你应该对开发套路、思考路径很熟悉了，所以，今天我们换个讲法，就不从最基础的讲起了，而是重点讲解实现思路。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="灰度组件功能需求整理" tabindex="-1">灰度组件功能需求整理 <a class="header-anchor" href="#灰度组件功能需求整理" aria-label="Permalink to &quot;灰度组件功能需求整理&quot;">&amp;ZeroWidthSpace;</a></h2><p>针对上两节课给出的开发需求和设计思路，我们还是按照老套路，从中剥离出V1版本要实现的内容。为了方便我讲解和你查看，我把灰度组件的开发需求和设计思路，重新整理罗列了一下，放到了这里。</p><h3 id="_1-灰度规则的格式和存储方式" tabindex="-1">1.灰度规则的格式和存储方式 <a class="header-anchor" href="#_1-灰度规则的格式和存储方式" aria-label="Permalink to &quot;1.灰度规则的格式和存储方式&quot;">&amp;ZeroWidthSpace;</a></h3><p>我们希望支持不同格式（JSON、YAML、XML等）、不同存储方式（本地配置文件、Redis、Zookeeper、或者自研配置中心等）的灰度规则配置方式。实际上，这一点跟之前的限流框架中限流规则的格式和存储方式完全一致，代码实现也是相同的，所以在接下来的讲解中，就不重复啰嗦了，你可以回过头去看下<a href="https://time.geekbang.org/column/article/243961" target="_blank" rel="noreferrer">第92讲</a>。</p><h3 id="_2-灰度规则的语法格式" tabindex="-1">2.灰度规则的语法格式 <a class="header-anchor" href="#_2-灰度规则的语法格式" aria-label="Permalink to &quot;2.灰度规则的语法格式&quot;">&amp;ZeroWidthSpace;</a></h3><p>我们支持三种灰度规则语法格式：具体值（比如893）、区间值（比如1020-1120）、比例值（比如%30）。除此之外，对于更加复杂的灰度规则，比如只对30天内购买过某某商品并且退货次数少于10次的用户进行灰度，我们通过编程的方式来实现。</p><h3 id="_3-灰度规则的内存组织方式" tabindex="-1">3.灰度规则的内存组织方式 <a class="header-anchor" href="#_3-灰度规则的内存组织方式" aria-label="Permalink to &quot;3.灰度规则的内存组织方式&quot;">&amp;ZeroWidthSpace;</a></h3><p>类似于限流框架中的限流规则，我们需要把灰度规则组织成支持快速查找的数据结构，能够快速判定某个灰度对象（darkTarget，比如用户ID），是否落在灰度规则设定的范围内。</p><h3 id="_4-灰度规则热更新" tabindex="-1">4.灰度规则热更新 <a class="header-anchor" href="#_4-灰度规则热更新" aria-label="Permalink to &quot;4.灰度规则热更新&quot;">&amp;ZeroWidthSpace;</a></h3><p>修改了灰度规则之后，我们希望不重新部署和重启系统，新的灰度规则就能生效，所以，我们需要支持灰度规则热更新。</p><p>在V1版本中，对于第一点灰度规则的格式和存储方式，我们只支持YAML格式本地文件的配置存储方式。对于剩下的三点，我们都要进行实现。考虑到V1版本要实现的内容比较多，我们分两步来实现代码，第一步先将大的流程、框架搭建好，第二步再进一步添加、丰富、优化功能。</p><h2 id="实现灰度组件基本功能" tabindex="-1">实现灰度组件基本功能 <a class="header-anchor" href="#实现灰度组件基本功能" aria-label="Permalink to &quot;实现灰度组件基本功能&quot;">&amp;ZeroWidthSpace;</a></h2><p>在第一步中，我们先实现基于YAML格式的本地文件的灰度规则配置方式，以及灰度规则热更新，并且只支持三种基本的灰度规则语法格式。基于编程实现灰度规则的方式，我们留在第二步实现。</p><p>我们先把这个基本功能的开发需求，用代码实现出来。它的目录结构及其Demo示例如下所示。代码非常简单，只包含4个类。接下来，我们针对每个类再详细讲解一下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 代码目录结构</span></span>
<span class="line"><span>com.xzg.darklaunch</span></span>
<span class="line"><span>  --DarkLaunch(框架的最顶层入口类)</span></span>
<span class="line"><span>  --DarkFeature(每个feature的灰度规则)</span></span>
<span class="line"><span>  --DarkRule(灰度规则)</span></span>
<span class="line"><span>  --DarkRuleConfig(用来映射配置到内存中)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Demo示例</span></span>
<span class="line"><span>public class DarkDemo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    DarkLaunch darkLaunch = new DarkLaunch();</span></span>
<span class="line"><span>    DarkFeature darkFeature = darkLaunch.getDarkFeature(&quot;call_newapi_getUserById&quot;);</span></span>
<span class="line"><span>    System.out.println(darkFeature.enabled());</span></span>
<span class="line"><span>    System.out.println(darkFeature.dark(893));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 灰度规则配置(dark-rule.yaml)放置在classpath路径下</span></span>
<span class="line"><span>features:</span></span>
<span class="line"><span>- key: call_newapi_getUserById</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {893,342,1020-1120,%30}</span></span>
<span class="line"><span>- key: call_newapi_registerUser</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {1391198723, %10}</span></span>
<span class="line"><span>- key: newalgo_loan</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {0-1000}</span></span></code></pre></div><p>从Demo代码中，我们可以看出，对于业务系统来说，灰度组件的两个直接使用的类是DarkLaunch类和DarkFeature类。</p><p>**我们先来看DarkLaunch类。**这个类是灰度组件的最顶层入口类。它用来组装其他类对象，串联整个操作流程，提供外部调用的接口。</p><p>DarkLaunch类先读取灰度规则配置文件，映射为内存中的Java对象（DarkRuleConfig），然后再将这个中间结构，构建成一个支持快速查询的数据结构（DarkRule）。除此之外，它还负责定期更新灰度规则，也就是前面提到的灰度规则热更新。</p><p>为了避免更新规则和查询规则的并发执行冲突，在更新灰度规则的时候，我们并非直接操作老的DarkRule，而是先创建一个新的DarkRule，然后等新的DarkRule都构建好之后，再“瞬间”赋值给老的DarkRule。你可以结合着下面的代码一块看下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DarkLaunch {</span></span>
<span class="line"><span>  private static final Logger log = LoggerFactory.getLogger(DarkLaunch.class);</span></span>
<span class="line"><span>  private static final int DEFAULT_RULE_UPDATE_TIME_INTERVAL = 60; // in seconds</span></span>
<span class="line"><span>  private DarkRule rule;</span></span>
<span class="line"><span>  private ScheduledExecutorService executor;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkLaunch(int ruleUpdateTimeInterval) {</span></span>
<span class="line"><span>    loadRule();</span></span>
<span class="line"><span>    this.executor = Executors.newSingleThreadScheduledExecutor();</span></span>
<span class="line"><span>    this.executor.scheduleAtFixedRate(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        loadRule();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }, ruleUpdateTimeInterval, ruleUpdateTimeInterval, TimeUnit.SECONDS);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkLaunch() {</span></span>
<span class="line"><span>    this(DEFAULT_RULE_UPDATE_TIME_INTERVAL);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void loadRule() {</span></span>
<span class="line"><span>    // 将灰度规则配置文件dark-rule.yaml中的内容读取DarkRuleConfig中</span></span>
<span class="line"><span>    InputStream in = null;</span></span>
<span class="line"><span>    DarkRuleConfig ruleConfig = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      in = this.getClass().getResourceAsStream(&quot;/dark-rule.yaml&quot;);</span></span>
<span class="line"><span>      if (in != null) {</span></span>
<span class="line"><span>        Yaml yaml = new Yaml();</span></span>
<span class="line"><span>        ruleConfig = yaml.loadAs(in, DarkRuleConfig.class);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      if (in != null) {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          in.close();</span></span>
<span class="line"><span>        } catch (IOException e) {</span></span>
<span class="line"><span>          log.error(&quot;close file error:{}&quot;, e);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (ruleConfig == null) {</span></span>
<span class="line"><span>      throw new RuntimeException(&quot;Can not load dark rule.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 更新规则并非直接在this.rule上进行，</span></span>
<span class="line"><span>    // 而是通过创建一个新的DarkRule，然后赋值给this.rule，</span></span>
<span class="line"><span>    // 来避免更新规则和规则查询的并发冲突问题</span></span>
<span class="line"><span>    DarkRule newRule = new DarkRule(ruleConfig);</span></span>
<span class="line"><span>    this.rule = newRule;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkFeature getDarkFeature(String featureKey) {</span></span>
<span class="line"><span>    DarkFeature darkFeature = this.rule.getDarkFeature(featureKey);</span></span>
<span class="line"><span>    return darkFeature;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>**我们再来看下DarkRuleConfig类。**这个类功能非常简单，只是用来将灰度规则映射到内存中。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DarkRuleConfig {</span></span>
<span class="line"><span>  private List&lt;DarkFeatureConfig&gt; features;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public List&lt;DarkFeatureConfig&gt; getFeatures() {</span></span>
<span class="line"><span>    return this.features;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setFeatures(List&lt;DarkFeatureConfig&gt; features) {</span></span>
<span class="line"><span>    this.features = features;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static class DarkFeatureConfig {</span></span>
<span class="line"><span>    private String key;</span></span>
<span class="line"><span>    private boolean enabled;</span></span>
<span class="line"><span>    private String rule;</span></span>
<span class="line"><span>    // 省略getter、setter方法</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从代码中，我们可以看出来，DarkRuleConfig类嵌套了一个内部类DarkFeatureConfig。这两个类跟配置文件的两层嵌套结构完全对应。我把对应关系标注在了下面的示例中，你可以对照着代码看下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;!--对应DarkRuleConfig--&gt;</span></span>
<span class="line"><span>features:                       </span></span>
<span class="line"><span>- key: call_newapi_getUserById  &lt;!--对应DarkFeatureConfig--&gt;</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {893,342,1020-1120,%30}</span></span>
<span class="line"><span>- key: call_newapi_registerUser &lt;!--对应DarkFeatureConfig--&gt;</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {1391198723, %10}</span></span>
<span class="line"><span>- key: newalgo_loan             &lt;!--对应DarkFeatureConfig--&gt;</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {0-1000}</span></span></code></pre></div><p>**我们再来看下DarkRule。**DarkRule包含所有要灰度的业务功能的灰度规则。它用来支持根据业务功能标识（feature key），快速查询灰度规则（DarkFeature）。代码也比较简单，具体如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DarkRule {</span></span>
<span class="line"><span>  private Map&lt;String, DarkFeature&gt; darkFeatures = new HashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkRule(DarkRuleConfig darkRuleConfig) {</span></span>
<span class="line"><span>    List&lt;DarkRuleConfig.DarkFeatureConfig&gt; darkFeatureConfigs = darkRuleConfig.getFeatures();</span></span>
<span class="line"><span>    for (DarkRuleConfig.DarkFeatureConfig darkFeatureConfig : darkFeatureConfigs) {</span></span>
<span class="line"><span>      darkFeatures.put(darkFeatureConfig.getKey(), new DarkFeature(darkFeatureConfig));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkFeature getDarkFeature(String featureKey) {</span></span>
<span class="line"><span>    return darkFeatures.get(featureKey);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>**我们最后来看下DarkFeature类。**DarkFeature类表示每个要灰度的业务功能的灰度规则。DarkFeature将配置文件中灰度规则，解析成一定的结构（比如RangeSet），方便快速判定某个灰度对象是否落在灰度规则范围内。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DarkFeature {</span></span>
<span class="line"><span>  private String key;</span></span>
<span class="line"><span>  private boolean enabled;</span></span>
<span class="line"><span>  private int percentage;</span></span>
<span class="line"><span>  private RangeSet&lt;Long&gt; rangeSet = TreeRangeSet.create();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkFeature(DarkRuleConfig.DarkFeatureConfig darkFeatureConfig) {</span></span>
<span class="line"><span>    this.key = darkFeatureConfig.getKey();</span></span>
<span class="line"><span>    this.enabled = darkFeatureConfig.getEnabled();</span></span>
<span class="line"><span>    String darkRule = darkFeatureConfig.getRule().trim();</span></span>
<span class="line"><span>    parseDarkRule(darkRule);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @VisibleForTesting</span></span>
<span class="line"><span>  protected void parseDarkRule(String darkRule) {</span></span>
<span class="line"><span>    if (!darkRule.startsWith(&quot;{&quot;) || !darkRule.endsWith(&quot;}&quot;)) {</span></span>
<span class="line"><span>      throw new RuntimeException(&quot;Failed to parse dark rule: &quot; + darkRule);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String[] rules = darkRule.substring(1, darkRule.length() - 1).split(&quot;,&quot;);</span></span>
<span class="line"><span>    this.rangeSet.clear();</span></span>
<span class="line"><span>    this.percentage = 0;</span></span>
<span class="line"><span>    for (String rule : rules) {</span></span>
<span class="line"><span>      rule = rule.trim();</span></span>
<span class="line"><span>      if (StringUtils.isEmpty(rule)) {</span></span>
<span class="line"><span>        continue;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      if (rule.startsWith(&quot;%&quot;)) {</span></span>
<span class="line"><span>        int newPercentage = Integer.parseInt(rule.substring(1));</span></span>
<span class="line"><span>        if (newPercentage &gt; this.percentage) {</span></span>
<span class="line"><span>          this.percentage = newPercentage;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      } else if (rule.contains(&quot;-&quot;)) {</span></span>
<span class="line"><span>        String[] parts = rule.split(&quot;-&quot;);</span></span>
<span class="line"><span>        if (parts.length != 2) {</span></span>
<span class="line"><span>          throw new RuntimeException(&quot;Failed to parse dark rule: &quot; + darkRule);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        long start = Long.parseLong(parts[0]);</span></span>
<span class="line"><span>        long end = Long.parseLong(parts[1]);</span></span>
<span class="line"><span>        if (start &gt; end) {</span></span>
<span class="line"><span>          throw new RuntimeException(&quot;Failed to parse dark rule: &quot; + darkRule);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        this.rangeSet.add(Range.closed(start, end));</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        long val = Long.parseLong(rule);</span></span>
<span class="line"><span>        this.rangeSet.add(Range.closed(val, val));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public boolean enabled() {</span></span>
<span class="line"><span>    return this.enabled;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public boolean dark(long darkTarget) {</span></span>
<span class="line"><span>    boolean selected = this.rangeSet.contains(darkTarget);</span></span>
<span class="line"><span>    if (selected) {</span></span>
<span class="line"><span>      return true;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    long reminder = darkTarget % 100;</span></span>
<span class="line"><span>    if (reminder &gt;= 0 &amp;&amp; reminder &lt; this.percentage) {</span></span>
<span class="line"><span>      return true;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public boolean dark(String darkTarget) {</span></span>
<span class="line"><span>    long target = Long.parseLong(darkTarget);</span></span>
<span class="line"><span>    return dark(target);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="添加、优化灰度组件功能" tabindex="-1">添加、优化灰度组件功能 <a class="header-anchor" href="#添加、优化灰度组件功能" aria-label="Permalink to &quot;添加、优化灰度组件功能&quot;">&amp;ZeroWidthSpace;</a></h2><p>在第一步中，我们完成了灰度组件的基本功能。在第二步中，我们再实现基于编程的灰度规则配置方式，用来支持更加复杂、更加灵活的灰度规则。</p><p>我们需要对于第一步实现的代码，进行一些改造。改造之后的代码目录结构如下所示。其中，DarkFeature、DarkRuleConfig的基本代码不变，新增了IDarkFeature接口，DarkLaunch、DarkRule的代码有所改动，用来支持编程实现灰度规则。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 第一步的代码目录结构</span></span>
<span class="line"><span>com.xzg.darklaunch</span></span>
<span class="line"><span>  --DarkLaunch(框架的最顶层入口类)</span></span>
<span class="line"><span>  --DarkFeature(每个feature的灰度规则)</span></span>
<span class="line"><span>  --DarkRule(灰度规则)</span></span>
<span class="line"><span>  --DarkRuleConfig(用来映射配置到内存中)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 第二步的代码目录结构</span></span>
<span class="line"><span>com.xzg.darklaunch</span></span>
<span class="line"><span>  --DarkLaunch(框架的最顶层入口类，代码有改动)</span></span>
<span class="line"><span>  --IDarkFeature(抽象接口)</span></span>
<span class="line"><span>  --DarkFeature(实现IDarkFeature接口，基于配置文件的灰度规则，代码不变)</span></span>
<span class="line"><span>  --DarkRule(灰度规则，代码有改动)</span></span>
<span class="line"><span>  --DarkRuleConfig(用来映射配置到内存中，代码不变)</span></span></code></pre></div><p>我们先来看下IDarkFeature接口，它用来抽象从配置文件中得到的灰度规则，以及编程实现的灰度规则。具体代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface IDarkFeature {</span></span>
<span class="line"><span>  boolean enabled();</span></span>
<span class="line"><span>  boolean dark(long darkTarget);</span></span>
<span class="line"><span>  boolean dark(String darkTarget);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>基于这个抽象接口，业务系统可以自己编程实现复杂的灰度规则，然后添加到DarkRule中。为了避免配置文件中的灰度规则热更新时，覆盖掉编程实现的灰度规则，在DarkRule中，我们对从配置文件中加载的灰度规则和编程实现的灰度规则分开存储。按照这个设计思路，我们对DarkRule类进行重构。重构之后的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DarkRule {</span></span>
<span class="line"><span>  // 从配置文件中加载的灰度规则</span></span>
<span class="line"><span>  private Map&lt;String, IDarkFeature&gt; darkFeatures = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>  // 编程实现的灰度规则</span></span>
<span class="line"><span>  private ConcurrentHashMap&lt;String, IDarkFeature&gt; programmedDarkFeatures = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addProgrammedDarkFeature(String featureKey, IDarkFeature darkFeature) {</span></span>
<span class="line"><span>    programmedDarkFeatures.put(featureKey, darkFeature);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setDarkFeatures(Map&lt;String, IDarkFeature&gt; newDarkFeatures) {</span></span>
<span class="line"><span>    this.darkFeatures = newDarkFeatures;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public IDarkFeature getDarkFeature(String featureKey) {</span></span>
<span class="line"><span>    IDarkFeature darkFeature = programmedDarkFeatures.get(featureKey);</span></span>
<span class="line"><span>    if (darkFeature != null) {</span></span>
<span class="line"><span>      return darkFeature;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return darkFeatures.get(featureKey);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>因为DarkRule代码有所修改，对应地，DarkLaunch的代码也需要做少许改动，主要有一处修改和一处新增代码，具体如下所示，我在代码中都做了注释，就不再重复解释了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DarkLaunch {</span></span>
<span class="line"><span>  private static final Logger log = LoggerFactory.getLogger(DarkLaunch.class);</span></span>
<span class="line"><span>  private static final int DEFAULT_RULE_UPDATE_TIME_INTERVAL = 60; // in seconds</span></span>
<span class="line"><span>  private DarkRule rule = new DarkRule();</span></span>
<span class="line"><span>  private ScheduledExecutorService executor;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkLaunch(int ruleUpdateTimeInterval) {</span></span>
<span class="line"><span>    loadRule();</span></span>
<span class="line"><span>    this.executor = Executors.newSingleThreadScheduledExecutor();</span></span>
<span class="line"><span>    this.executor.scheduleAtFixedRate(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        loadRule();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }, ruleUpdateTimeInterval, ruleUpdateTimeInterval, TimeUnit.SECONDS);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DarkLaunch() {</span></span>
<span class="line"><span>    this(DEFAULT_RULE_UPDATE_TIME_INTERVAL);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void loadRule() {</span></span>
<span class="line"><span>    InputStream in = null;</span></span>
<span class="line"><span>    DarkRuleConfig ruleConfig = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      in = this.getClass().getResourceAsStream(&quot;/dark-rule.yaml&quot;);</span></span>
<span class="line"><span>      if (in != null) {</span></span>
<span class="line"><span>        Yaml yaml = new Yaml();</span></span>
<span class="line"><span>        ruleConfig = yaml.loadAs(in, DarkRuleConfig.class);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      if (in != null) {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          in.close();</span></span>
<span class="line"><span>        } catch (IOException e) {</span></span>
<span class="line"><span>          log.error(&quot;close file error:{}&quot;, e);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (ruleConfig == null) {</span></span>
<span class="line"><span>      throw new RuntimeException(&quot;Can not load dark rule.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 修改：单独更新从配置文件中得到的灰度规则，不覆盖编程实现的灰度规则</span></span>
<span class="line"><span>    Map&lt;String, IDarkFeature&gt; darkFeatures = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>    List&lt;DarkRuleConfig.DarkFeatureConfig&gt; darkFeatureConfigs = ruleConfig.getFeatures();</span></span>
<span class="line"><span>    for (DarkRuleConfig.DarkFeatureConfig darkFeatureConfig : darkFeatureConfigs) {</span></span>
<span class="line"><span>      darkFeatures.put(darkFeatureConfig.getKey(), new DarkFeature(darkFeatureConfig));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.rule.setDarkFeatures(darkFeatures);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 新增：添加编程实现的灰度规则的接口</span></span>
<span class="line"><span>  public void addProgrammedDarkFeature(String featureKey, IDarkFeature darkFeature) {</span></span>
<span class="line"><span>    this.rule.addProgrammedDarkFeature(featureKey, darkFeature);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public IDarkFeature getDarkFeature(String featureKey) {</span></span>
<span class="line"><span>    IDarkFeature darkFeature = this.rule.getDarkFeature(featureKey);</span></span>
<span class="line"><span>    return darkFeature;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>灰度组件的代码实现就讲完了。我们再通过一个Demo来看下，目前实现的灰度组件该如何使用。结合着Demo，再去理解上面的代码，会更容易些。Demo代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 灰度规则配置(dark-rule.yaml)，放到classpath路径下</span></span>
<span class="line"><span>features:</span></span>
<span class="line"><span>- key: call_newapi_getUserById</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {893,342,1020-1120,%30}</span></span>
<span class="line"><span>- key: call_newapi_registerUser</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {1391198723, %10}</span></span>
<span class="line"><span>- key: newalgo_loan</span></span>
<span class="line"><span>  enabled: true</span></span>
<span class="line"><span>  rule: {0-100}</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>// 编程实现的灰度规则</span></span>
<span class="line"><span>public class UserPromotionDarkRule implements IDarkFeature {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean enabled() {</span></span>
<span class="line"><span>    return true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean dark(long darkTarget) {</span></span>
<span class="line"><span>    // 灰度规则自己想怎么写就怎么写</span></span>
<span class="line"><span>    return false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean dark(String darkTarget) {</span></span>
<span class="line"><span>    // 灰度规则自己想怎么写就怎么写</span></span>
<span class="line"><span>    return false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Demo</span></span>
<span class="line"><span>public class Demo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    DarkLaunch darkLaunch = new DarkLaunch(); // 默认加载classpath下dark-rule.yaml文件中的灰度规则</span></span>
<span class="line"><span>    darkLaunch.addProgrammedDarkFeature(&quot;user_promotion&quot;, new UserPromotionDarkRule()); // 添加编程实现的灰度规则</span></span>
<span class="line"><span>    IDarkFeature darkFeature = darkLaunch.getDarkFeature(&quot;user_promotion&quot;);</span></span>
<span class="line"><span>    System.out.println(darkFeature.enabled());</span></span>
<span class="line"><span>    System.out.println(darkFeature.dark(893));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>到今天为止，项目实战环节就彻底结束了。在这一部分中，我们通过限流、幂等、灰度这三个实战项目，带你从需求分析、系统设计、代码实现这三个环节，学习了如何进行功能性、非功能性需求分析，如何通过合理的设计，完成功能性需求的同时，满足非功能性需求，以及如何编写高质量的代码实现。</p><p>实际上，项目本身的分析、设计、实现并不重要，不必对细节过于纠结。我希望通过这三个例子，分享我的思考路径、开发套路，让你借鉴并举一反三地应用到你平时的项目开发中。我觉得这才是最有价值的，才是你学习的重点。</p><p>如果你学完这一部分之后，对于项目中的一些通用的功能，能够开始下意识地主动思考代码复用的问题，考虑如何抽象成框架、类库、组件，并且对于如何开发，也不再觉得无从下手，而是觉得有章可循，那我觉得你就学到了这一部分的精髓。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>在DarkFeature类中，灰度规则的解析代码设计的不够优雅，你觉得问题在哪里呢？又该如何重构呢？</p><p>欢迎留言和我分享你的想法。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） Jagger 👍（14） 💬（1）DarkLaunch 构造器包含定时轮询，会不会影响单元测试？2020-08-07robincoin 👍（8） 💬（2）mq和数据库灰度是不是要对mq和数据库再封装一层，方便aop处理？2020-06-17汝林外史 👍（1） 💬（2）好像dark方法中没有对区间的规则进行处理2020-07-15小晏子 👍（46） 💬（1）这个DarkFeature类中灰度规则的解析代码不优雅的地方在于不够灵活，如果有新的灰度规则要加入，就需要再添加if else作处理，破坏了开闭原则，为了解决这一问题，可以使用工厂模式➕策略模式来保证开闭原则和消除if/else，使用工厂模式来实现针对每个灰度规则的处理，使用“查表法”的策略模式来消除if/else！2020-06-17Lee 👍（19） 💬（1）可以使用解释器模式，将不同类型的规则解析拆分到不同的类中。2020-06-17tingye 👍（16） 💬（0）可以考虑用职责链模式，将不同规则字符串的解析抽象为单独的handle类，依次解析直到完成处理，也方便扩展对新规则编写语法的解析2020-06-17Heaven 👍（7） 💬（0）在此类场景下,我们可以简单的使用工厂类去封装规则的解析, 但是我个人觉着,应该以配置文件中配置的规则为主,所以,第二版需要在配置文件中写上实现接口的全限定类名,反射获取实例,同样支持更新,这样配置文件的Map就可以移除了,而且可以将简单的原生三种解析规则也抽象为接口,利用策略类进行区分调用 2020-06-17强哥 👍（5） 💬（0）这个灰度组件感觉适用简单场景，规则之间的表达式、优先级等组合方式不支持，规则的定义很重要。热更新可以通过zk下放到服务器上，通过sdk将配置信息加载到内存中。2020-06-21Jxin 👍（5） 💬（0）1.定时任务在方法内部创建和使用，这样就没办法手动调定时任务的退出方法了。</p><p>2.感觉业务接口的路由规则的选型和路由规则的具体实现应该分离。DarkFear里面应该只要表明，哪个业务接口用哪个灰度规则，这个意图就好。至于灰度规则的具体实现，包括dsl的解析和灰度规则的执行都应该剥离出来单独封装。2020-06-17gogo 👍（5） 💬（0）可以考虑引入策略模式和工厂模式，消除if else2020-06-17djfhchdh 👍（3） 💬（0）DarkFeature类扩展性、灵活性都较弱，如果feature配置新增了字段，那么就要修改类内部的解析代码，不满足开闭原则。可以把parse函数单独拿出来，抽象成一个Parser接口，针对不同的feature配置格式，实现不同的parser。这样的话，对于配置格式的改动，只要修改或扩展相应的parser类就行了，不用改动DarkFeature类的代码，达到了对于修改的隔离。2020-09-09罗 乾 林 👍（2） 💬（0） “DarkFeature 类中，灰度规则的解析代码“，是我能想到最直接简单的方式。我想可以抽象出规则解析类，对规则的解析交个解析类处理，将解析类对象注入到DarkFeature 类中。这样DarkFeature职责更单一2020-06-17test 👍（2） 💬（0）parsedarkrule的代码可以单独出来2020-06-17果果果 👍（1） 💬（0）感谢王争老师，看完这本书后的最大收获是，自己动手完成了一个功能更为丰富的灰度组件，支持动态数据源、以及数据源的扩展、支持规则执行结果跟踪。 github地址 https://github.com/TangGuoGuoR/ab-gray2021-11-20Yeyw 👍（1） 💬（0）规则扩展复杂的话可以用解释器，但是加载配置的话 我觉得定时会重复加载，定时加载加个判断吧，也可以暴露重新加载配置的方法，供开发提供自己自主刷新的接口2021-05-01</p>`,52)])])}const k=n(l,[["render",i]]);export{g as __pageData,k as default};
