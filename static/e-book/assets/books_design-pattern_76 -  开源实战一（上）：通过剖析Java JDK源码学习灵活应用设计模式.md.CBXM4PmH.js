import{_ as a,o as s,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/76 -  开源实战一（上）：通过剖析Java JDK源码学习灵活应用设计模式.md","filePath":"books/design-pattern/76 -  开源实战一（上）：通过剖析Java JDK源码学习灵活应用设计模式.md"}'),l={name:"books/design-pattern/76 -  开源实战一（上）：通过剖析Java JDK源码学习灵活应用设计模式.md"};function i(t,n,c,r,o,d){return s(),p("div",null,[...n[0]||(n[0]=[e(`<p>从今天开始，我们就正式地进入到实战环节。实战环节包括两部分，一部分是开源项目实战，另一部分是项目实战。</p><p>在开源项目实战部分，我会带你剖析几个经典的开源项目中用到的设计原则、思想和模式，这其中就包括对Java JDK、Unix、Google Guava、Spring、MyBatis这样五个开源项目的分析。在项目实战部分，我们精心挑选了几个实战项目，手把手地带你利用之前学过的设计原则、思想、模式，来对它们进行分析、设计和代码实现，这其中就包括鉴权限流、幂等重试、灰度发布这样三个项目。</p><p>接下来的两节课，我们重点剖析Java JDK中用到的几种常见的设计模式。学习的目的是让你体会，在真实的项目开发中，要学会活学活用，切不可过于死板，生搬硬套设计模式的设计与实现。除此之外，针对每个模式，我们不可能像前面学习理论知识那样，分析得细致入微，很多都是点到为止。在已经具备之前理论知识的前提下，我想你可以跟着我的指引自己去研究，有哪里不懂的话，也可以再回过头去看下之前的理论讲解。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="工厂模式在calendar类中的应用" tabindex="-1">工厂模式在Calendar类中的应用 <a class="header-anchor" href="#工厂模式在calendar类中的应用" aria-label="Permalink to &quot;工厂模式在Calendar类中的应用&quot;">&amp;ZeroWidthSpace;</a></h2><p>在前面讲到工厂模式的时候，大部分工厂类都是以Factory作为后缀来命名，并且工厂类主要负责创建对象这样一件事情。但在实际的项目开发中，工厂类的设计更加灵活。那我们就来看下，工厂模式在Java JDK中的一个应用：java.util.Calendar。从命名上，我们无法看出它是一个工厂类。</p><p>Calendar类提供了大量跟日期相关的功能代码，同时，又提供了一个getInstance()工厂方法，用来根据不同的TimeZone和Locale创建不同的Calendar子类对象。也就是说，功能代码和工厂方法代码耦合在了一个类中。所以，即便我们去查看它的源码，如果不细心的话，也很难发现它用到了工厂模式。同时，因为它不单单是一个工厂类，所以，它并没有以Factory作为后缀来命名。</p><p>Calendar类的相关代码如下所示，大部分代码都已经省略，我只给出了getInstance()工厂方法的代码实现。从代码中，我们可以看出，getInstance()方法可以根据不同TimeZone和Locale，创建不同的Calendar子类对象，比如BuddhistCalendar、JapaneseImperialCalendar、GregorianCalendar，这些细节完全封装在工厂方法中，使用者只需要传递当前的时区和地址，就能够获得一个Calendar类对象来使用，而获得的对象具体是哪个Calendar子类的对象，使用者在使用的时候并不关心。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class Calendar implements Serializable, Cloneable, Comparable&lt;Calendar&gt; {</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>  public static Calendar getInstance(TimeZone zone, Locale aLocale){</span></span>
<span class="line"><span>    return createCalendar(zone, aLocale);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static Calendar createCalendar(TimeZone zone,Locale aLocale) {</span></span>
<span class="line"><span>    CalendarProvider provider = LocaleProviderAdapter.getAdapter(</span></span>
<span class="line"><span>        CalendarProvider.class, aLocale).getCalendarProvider();</span></span>
<span class="line"><span>    if (provider != null) {</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        return provider.getInstance(zone, aLocale);</span></span>
<span class="line"><span>      } catch (IllegalArgumentException iae) {</span></span>
<span class="line"><span>        // fall back to the default instantiation</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    Calendar cal = null;</span></span>
<span class="line"><span>    if (aLocale.hasExtensions()) {</span></span>
<span class="line"><span>      String caltype = aLocale.getUnicodeLocaleType(&quot;ca&quot;);</span></span>
<span class="line"><span>      if (caltype != null) {</span></span>
<span class="line"><span>        switch (caltype) {</span></span>
<span class="line"><span>          case &quot;buddhist&quot;:</span></span>
<span class="line"><span>            cal = new BuddhistCalendar(zone, aLocale);</span></span>
<span class="line"><span>            break;</span></span>
<span class="line"><span>          case &quot;japanese&quot;:</span></span>
<span class="line"><span>            cal = new JapaneseImperialCalendar(zone, aLocale);</span></span>
<span class="line"><span>            break;</span></span>
<span class="line"><span>          case &quot;gregory&quot;:</span></span>
<span class="line"><span>            cal = new GregorianCalendar(zone, aLocale);</span></span>
<span class="line"><span>            break;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (cal == null) {</span></span>
<span class="line"><span>      if (aLocale.getLanguage() == &quot;th&quot; &amp;&amp; aLocale.getCountry() == &quot;TH&quot;) {</span></span>
<span class="line"><span>        cal = new BuddhistCalendar(zone, aLocale);</span></span>
<span class="line"><span>      } else if (aLocale.getVariant() == &quot;JP&quot; &amp;&amp; aLocale.getLanguage() == &quot;ja&quot; &amp;&amp; aLocale.getCountry() == &quot;JP&quot;) {</span></span>
<span class="line"><span>        cal = new JapaneseImperialCalendar(zone, aLocale);</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        cal = new GregorianCalendar(zone, aLocale);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return cal;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="建造者模式在calendar类中的应用" tabindex="-1">建造者模式在Calendar类中的应用 <a class="header-anchor" href="#建造者模式在calendar类中的应用" aria-label="Permalink to &quot;建造者模式在Calendar类中的应用&quot;">&amp;ZeroWidthSpace;</a></h2><p>还是刚刚的Calendar类，它不仅仅用到了工厂模式，还用到了建造者模式。我们知道，建造者模式有两种实现方法，一种是单独定义一个Builder类，另一种是将Builder实现为原始类的内部类。Calendar就采用了第二种实现思路。我们先来看代码再讲解，相关代码我贴在了下面。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class Calendar implements Serializable, Cloneable, Comparable&lt;Calendar&gt; {</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>  public static class Builder {</span></span>
<span class="line"><span>    private static final int NFIELDS = FIELD_COUNT + 1;</span></span>
<span class="line"><span>    private static final int WEEK_YEAR = FIELD_COUNT;</span></span>
<span class="line"><span>    private long instant;</span></span>
<span class="line"><span>    private int[] fields;</span></span>
<span class="line"><span>    private int nextStamp;</span></span>
<span class="line"><span>    private int maxFieldIndex;</span></span>
<span class="line"><span>    private String type;</span></span>
<span class="line"><span>    private TimeZone zone;</span></span>
<span class="line"><span>    private boolean lenient = true;</span></span>
<span class="line"><span>    private Locale locale;</span></span>
<span class="line"><span>    private int firstDayOfWeek, minimalDaysInFirstWeek;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public Builder() {}</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    public Builder setInstant(long instant) {</span></span>
<span class="line"><span>        if (fields != null) {</span></span>
<span class="line"><span>            throw new IllegalStateException();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        this.instant = instant;</span></span>
<span class="line"><span>        nextStamp = COMPUTED;</span></span>
<span class="line"><span>        return this;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //...省略n多set()方法</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    public Calendar build() {</span></span>
<span class="line"><span>      if (locale == null) {</span></span>
<span class="line"><span>        locale = Locale.getDefault();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (zone == null) {</span></span>
<span class="line"><span>        zone = TimeZone.getDefault();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      Calendar cal;</span></span>
<span class="line"><span>      if (type == null) {</span></span>
<span class="line"><span>        type = locale.getUnicodeLocaleType(&quot;ca&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (type == null) {</span></span>
<span class="line"><span>        if (locale.getCountry() == &quot;TH&quot; &amp;&amp; locale.getLanguage() == &quot;th&quot;) {</span></span>
<span class="line"><span>          type = &quot;buddhist&quot;;</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>          type = &quot;gregory&quot;;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      switch (type) {</span></span>
<span class="line"><span>        case &quot;gregory&quot;:</span></span>
<span class="line"><span>          cal = new GregorianCalendar(zone, locale, true);</span></span>
<span class="line"><span>          break;</span></span>
<span class="line"><span>        case &quot;iso8601&quot;:</span></span>
<span class="line"><span>          GregorianCalendar gcal = new GregorianCalendar(zone, locale, true);</span></span>
<span class="line"><span>          // make gcal a proleptic Gregorian</span></span>
<span class="line"><span>          gcal.setGregorianChange(new Date(Long.MIN_VALUE));</span></span>
<span class="line"><span>          // and week definition to be compatible with ISO 8601</span></span>
<span class="line"><span>          setWeekDefinition(MONDAY, 4);</span></span>
<span class="line"><span>          cal = gcal;</span></span>
<span class="line"><span>          break;</span></span>
<span class="line"><span>        case &quot;buddhist&quot;:</span></span>
<span class="line"><span>          cal = new BuddhistCalendar(zone, locale);</span></span>
<span class="line"><span>          cal.clear();</span></span>
<span class="line"><span>          break;</span></span>
<span class="line"><span>        case &quot;japanese&quot;:</span></span>
<span class="line"><span>          cal = new JapaneseImperialCalendar(zone, locale, true);</span></span>
<span class="line"><span>          break;</span></span>
<span class="line"><span>        default:</span></span>
<span class="line"><span>          throw new IllegalArgumentException(&quot;unknown calendar type: &quot; + type);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      cal.setLenient(lenient);</span></span>
<span class="line"><span>      if (firstDayOfWeek != 0) {</span></span>
<span class="line"><span>        cal.setFirstDayOfWeek(firstDayOfWeek);</span></span>
<span class="line"><span>        cal.setMinimalDaysInFirstWeek(minimalDaysInFirstWeek);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (isInstantSet()) {</span></span>
<span class="line"><span>        cal.setTimeInMillis(instant);</span></span>
<span class="line"><span>        cal.complete();</span></span>
<span class="line"><span>        return cal;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      if (fields != null) {</span></span>
<span class="line"><span>        boolean weekDate = isSet(WEEK_YEAR) &amp;&amp; fields[WEEK_YEAR] &gt; fields[YEAR];</span></span>
<span class="line"><span>        if (weekDate &amp;&amp; !cal.isWeekDateSupported()) {</span></span>
<span class="line"><span>          throw new IllegalArgumentException(&quot;week date is unsupported by &quot; + type);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        for (int stamp = MINIMUM_USER_STAMP; stamp &lt; nextStamp; stamp++) {</span></span>
<span class="line"><span>          for (int index = 0; index &lt;= maxFieldIndex; index++) {</span></span>
<span class="line"><span>            if (fields[index] == stamp) {</span></span>
<span class="line"><span>              cal.set(index, fields[NFIELDS + index]);</span></span>
<span class="line"><span>              break;</span></span>
<span class="line"><span>             }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (weekDate) {</span></span>
<span class="line"><span>          int weekOfYear = isSet(WEEK_OF_YEAR) ? fields[NFIELDS + WEEK_OF_YEAR] : 1;</span></span>
<span class="line"><span>          int dayOfWeek = isSet(DAY_OF_WEEK) ? fields[NFIELDS + DAY_OF_WEEK] : cal.getFirstDayOfWeek();</span></span>
<span class="line"><span>          cal.setWeekDate(fields[NFIELDS + WEEK_YEAR], weekOfYear, dayOfWeek);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        cal.complete();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return cal;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>看了上面的代码，我有一个问题请你思考一下：既然已经有了getInstance()工厂方法来创建Calendar类对象，为什么还要用Builder来创建Calendar类对象呢？这两者之间的区别在哪里呢？</p><p>实际上，在前面讲到这两种模式的时候，我们对它们之间的区别做了详细的对比，现在，我们再来一块回顾一下。工厂模式是用来创建不同但是相关类型的对象（继承同一父类或者接口的一组子类），由给定的参数来决定创建哪种类型的对象。建造者模式用来创建一种类型的复杂对象，通过设置不同的可选参数，“定制化”地创建不同的对象。</p><p>网上有一个经典的例子很好地解释了两者的区别。</p><blockquote><p>顾客走进一家餐馆点餐，我们利用工厂模式，根据用户不同的选择，来制作不同的食物，比如披萨、汉堡、沙拉。对于披萨来说，用户又有各种配料可以定制，比如奶酪、西红柿、起司，我们通过建造者模式根据用户选择的不同配料来制作不同的披萨。</p></blockquote><p>粗看Calendar的Builder类的build()方法，你可能会觉得它有点像工厂模式。你的感觉没错，前面一半代码确实跟getInstance()工厂方法类似，根据不同的type创建了不同的Calendar子类。实际上，后面一半代码才属于标准的建造者模式，根据setXXX()方法设置的参数，来定制化刚刚创建的Calendar子类对象。</p><p>你可能会说，这还能算是建造者模式吗？我用<a href="https://time.geekbang.org/column/article/199674" target="_blank" rel="noreferrer">第46讲</a>的一段话来回答你：</p><blockquote><p>我们也不要太学院派，非得把工厂模式、建造者模式分得那么清楚，我们需要知道的是，每个模式为什么这么设计，能解决什么问题。只有了解了这些最本质的东西，我们才能不生搬硬套，才能灵活应用，甚至可以混用各种模式，创造出新的模式来解决特定场景的问题。</p></blockquote><p>实际上，从Calendar这个例子，我们也能学到，不要过于死板地套用各种模式的原理和实现，不要不敢做丝毫的改动。模式是死的，用的人是活的。在实际上的项目开发中，不仅各种模式可以混合在一起使用，而且具体的代码实现，也可以根据具体的功能需求做灵活的调整。</p><h2 id="装饰器模式在collections类中的应用" tabindex="-1">装饰器模式在Collections类中的应用 <a class="header-anchor" href="#装饰器模式在collections类中的应用" aria-label="Permalink to &quot;装饰器模式在Collections类中的应用&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们前面讲到，Java IO类库是装饰器模式的非常经典的应用。实际上，Java的Collections类也用到了装饰器模式。</p><p>Collections类是一个集合容器的工具类，提供了很多静态方法，用来创建各种集合容器，比如通过unmodifiableColletion()静态方法，来创建UnmodifiableCollection类对象。而这些容器类中的UnmodifiableCollection类、CheckedCollection和SynchronizedCollection类，就是针对Collection类的装饰器类。</p><p>因为刚刚提到的这三个装饰器类，在代码结构上几乎一样，所以，我们这里只拿其中的UnmodifiableCollection类来举例讲解一下。UnmodifiableCollection类是Collections类的一个内部类，相关代码我摘抄到了下面，你可以先看下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Collections {</span></span>
<span class="line"><span>  private Collections() {}</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>  public static &lt;T&gt; Collection&lt;T&gt; unmodifiableCollection(Collection&lt;? extends T&gt; c) {</span></span>
<span class="line"><span>    return new UnmodifiableCollection&lt;&gt;(c);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  static class UnmodifiableCollection&lt;E&gt; implements Collection&lt;E&gt;,   Serializable {</span></span>
<span class="line"><span>    private static final long serialVersionUID = 1820017752578914078L;</span></span>
<span class="line"><span>    final Collection&lt;? extends E&gt; c;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    UnmodifiableCollection(Collection&lt;? extends E&gt; c) {</span></span>
<span class="line"><span>      if (c==null)</span></span>
<span class="line"><span>        throw new NullPointerException();</span></span>
<span class="line"><span>      this.c = c;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public int size()                   {return c.size();}</span></span>
<span class="line"><span>    public boolean isEmpty()            {return c.isEmpty();}</span></span>
<span class="line"><span>    public boolean contains(Object o)   {return c.contains(o);}</span></span>
<span class="line"><span>    public Object[] toArray()           {return c.toArray();}</span></span>
<span class="line"><span>    public &lt;T&gt; T[] toArray(T[] a)       {return c.toArray(a);}</span></span>
<span class="line"><span>    public String toString()            {return c.toString();}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public Iterator&lt;E&gt; iterator() {</span></span>
<span class="line"><span>      return new Iterator&lt;E&gt;() {</span></span>
<span class="line"><span>        private final Iterator&lt;? extends E&gt; i = c.iterator();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        public boolean hasNext() {return i.hasNext();}</span></span>
<span class="line"><span>        public E next()          {return i.next();}</span></span>
<span class="line"><span>        public void remove() {</span></span>
<span class="line"><span>          throw new UnsupportedOperationException();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        @Override</span></span>
<span class="line"><span>        public void forEachRemaining(Consumer&lt;? super E&gt; action) {</span></span>
<span class="line"><span>          // Use backing collection version</span></span>
<span class="line"><span>          i.forEachRemaining(action);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public boolean add(E e) {</span></span>
<span class="line"><span>      throw new UnsupportedOperationException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public boolean remove(Object o) {</span></span>
<span class="line"><span>       hrow new UnsupportedOperationException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public boolean containsAll(Collection&lt;?&gt; coll) {</span></span>
<span class="line"><span>      return c.containsAll(coll);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public boolean addAll(Collection&lt;? extends E&gt; coll) {</span></span>
<span class="line"><span>      throw new UnsupportedOperationException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public boolean removeAll(Collection&lt;?&gt; coll) {</span></span>
<span class="line"><span>      throw new UnsupportedOperationException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public boolean retainAll(Collection&lt;?&gt; coll) {</span></span>
<span class="line"><span>      throw new UnsupportedOperationException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public void clear() {</span></span>
<span class="line"><span>      throw new UnsupportedOperationException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // Override default methods in Collection</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public void forEach(Consumer&lt;? super E&gt; action) {</span></span>
<span class="line"><span>      c.forEach(action);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public boolean removeIf(Predicate&lt;? super E&gt; filter) {</span></span>
<span class="line"><span>      throw new UnsupportedOperationException();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    @SuppressWarnings(&quot;unchecked&quot;)</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public Spliterator&lt;E&gt; spliterator() {</span></span>
<span class="line"><span>      return (Spliterator&lt;E&gt;)c.spliterator();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    @SuppressWarnings(&quot;unchecked&quot;)</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public Stream&lt;E&gt; stream() {</span></span>
<span class="line"><span>      return (Stream&lt;E&gt;)c.stream();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    @SuppressWarnings(&quot;unchecked&quot;)</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public Stream&lt;E&gt; parallelStream() {</span></span>
<span class="line"><span>      return (Stream&lt;E&gt;)c.parallelStream();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>看了上面的代码，请你思考一下，为什么说UnmodifiableCollection类是Collection类的装饰器类呢？这两者之间可以看作简单的接口实现关系或者类继承关系吗？</p><p>我们前面讲过，装饰器模式中的装饰器类是对原始类功能的增强。尽管UnmodifiableCollection类可以算是对Collection类的一种功能增强，但这点还不具备足够的说服力来断定UnmodifiableCollection就是Collection类的装饰器类。</p><p>实际上，最关键的一点是，UnmodifiableCollection的构造函数接收一个Collection类对象，然后对其所有的函数进行了包裹（Wrap）：重新实现（比如add()函数）或者简单封装（比如stream()函数）。而简单的接口实现或者继承，并不会如此来实现UnmodifiableCollection类。所以，从代码实现的角度来说，UnmodifiableCollection类是典型的装饰器类。</p><h2 id="适配器模式在collections类中的应用" tabindex="-1">适配器模式在Collections类中的应用 <a class="header-anchor" href="#适配器模式在collections类中的应用" aria-label="Permalink to &quot;适配器模式在Collections类中的应用&quot;">&amp;ZeroWidthSpace;</a></h2><p>在<a href="https://time.geekbang.org/column/article/205912" target="_blank" rel="noreferrer">第51讲</a>中我们讲到，适配器模式可以用来兼容老的版本接口。当时我们举了一个JDK的例子，这里我们再重新仔细看一下。</p><p>老版本的JDK提供了Enumeration类来遍历容器。新版本的JDK用Iterator类替代Enumeration类来遍历容器。为了兼容老的客户端代码（使用老版本JDK的代码），我们保留了Enumeration类，并且在Collections类中，仍然保留了enumaration()静态方法（因为我们一般都是通过这个静态函数来创建一个容器的Enumeration类对象）。</p><p>不过，保留Enumeration类和enumeration()函数，都只是为了兼容，实际上，跟适配器没有一点关系。那到底哪一部分才是适配器呢？</p><p>在新版本的JDK中，Enumeration类是适配器类。它适配的是客户端代码（使用Enumeration类）和新版本JDK中新的迭代器Iterator类。不过，从代码实现的角度来说，这个适配器模式的代码实现，跟经典的适配器模式的代码实现，差别稍微有点大。enumeration()静态函数的逻辑和Enumeration适配器类的代码耦合在一起，enumeration()静态函数直接通过new的方式创建了匿名类对象。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * Returns an enumeration over the specified collection.  This provides</span></span>
<span class="line"><span> * interoperability with legacy APIs that require an enumeration</span></span>
<span class="line"><span> * as input.</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * @param  &lt;T&gt; the class of the objects in the collection</span></span>
<span class="line"><span> * @param c the collection for which an enumeration is to be returned.</span></span>
<span class="line"><span> * @return an enumeration over the specified collection.</span></span>
<span class="line"><span> * @see Enumeration</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>public static &lt;T&gt; Enumeration&lt;T&gt; enumeration(final Collection&lt;T&gt; c) {</span></span>
<span class="line"><span>  return new Enumeration&lt;T&gt;() {</span></span>
<span class="line"><span>    private final Iterator&lt;T&gt; i = c.iterator();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public boolean hasMoreElements() {</span></span>
<span class="line"><span>      return i.hasNext();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public T nextElement() {</span></span>
<span class="line"><span>      return i.next();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>今天，我重点讲了工厂模式、建造者模式、装饰器模式、适配器模式，这四种模式在Java JDK中的应用，主要目的是给你展示真实项目中是如何灵活应用设计模式的。</p><p>从今天的讲解中，我们可以学习到，尽管在之前的理论讲解中，我们都有讲到每个模式的经典代码实现，但是，在真实的项目开发中，这些模式的应用更加灵活，代码实现更加自由，可以根据具体的业务场景、功能需求，对代码实现做很大的调整，甚至还可能会对模式本身的设计思路做调整。</p><p>比如，Java JDK中的Calendar类，就耦合了业务功能代码、工厂方法、建造者类三种类型的代码，而且，在建造者类的build()方法中，前半部分是工厂方法的代码实现，后半部分才是真正的建造者模式的代码实现。这也告诉我们，在项目中应用设计模式，切不可生搬硬套，过于学院派，要学会结合实际情况做灵活调整，做到心中无剑胜有剑。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>在Java中，经常用到的StringBuilder类是否是建造者模式的应用呢？你可以试着像我一样从源码的角度去剖析一下。</p><p>欢迎留言和我分享你的想法。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） Laughing 👍（23） 💬（1）我个人理解是建造者模式的典型实现。虽然只有append方法，但是每个append的参数构造是不同的，从方面也反映出，append的方法可以通过不同的参数构造不同的String。当然该类也不只是只有append的参数，还有例如insert delete参数。以上说明符合建造者模式中所要解决的构建复杂对象的目的。2020-11-27Darren 👍（92） 💬（0）我觉得是，因为StringBuilder的主要方法append，其实就是类似于建造者模式中的set方法，只不过构建者模式的set方法可能是对象的不同属性，但append其实是在一直修改一个属性，且最后没有build(),但StringBuilder出现的目的其实是为了解决String不可变的问题，最终输出其实是String，所以可以类比toString()就是build()，所以认为算是建造者模式。2020-04-27辣么大 👍（25） 💬（0）StringBuilder没有使用建造者模式，只是名字碰巧用了builder这个单词。它只是用来构建可变字符串，仅此而已，别想太多。2020-05-01小晏子 👍（11） 💬（1）课后思考： 我的答案是算也不算…，如果按照学院派的思想，stringbuilder和GOF中的对于builder模式的定义完全不同，stringbuilder并不会创建新的string对象，只是将多个字符连接在一起，而builder模式的基本功能是生成新对象，两个本质就不一样了，从这个角度来讲，stringbuilder不能算是builder模式。 那为什么又说算呢？这样从另外一个角度想，stringbuilder得到的字符串是一步一步append出来的，这个builder模式的一步一步set在build的行为很像，因为文中也说了不要太学院派，要灵活使用，那么从这个角度来说可以认为stringbuilder也是属于builder的一种实现，只是它不是典型实现。2020-04-27Jxin 👍（8） 💬（0）回答课后题：</p><p>我认为应该算是建造者模式。</p><p>拿餐厅类比，对于披萨加番茄，起司等不同配料来定制披萨，这属于建造者模式要解决的问题（实例对象的定制）。而stringbuild的应用场景，更像是对披萨加一个番茄还是两个番茄更或者三个番茄的定制方式（某个字段的定制）。</p><p>所以strbuild的应用场景比传统的建造者模式更细更具体（前者实现字段的定制，后者实现对象的定制）。但字段定制依旧属于对象定制的范涛，所以我认为其依旧算是建造者模式。2020-04-27守拙 👍（5） 💬（0）课堂讨论: StringBuilder应用了Builder模式. 其主要方式是append(), 即通过不断append创建复杂对象. 不同于传统Builder模式的是:</p><ol><li>StringBuilder的目的是创建String, 但StringBuilder并不是String的内部类.</li><li>StringBuilder的创建过程可以断续, 传统的Builder模式一次性填入参数后调用build()方法创建对象.</li><li>StringBuilder通过内部维护字符数组(char[])的方式实现拼接. 2020-04-27QQ怪 👍（5） 💬（0）StringBuilder的append()方法使用了建造者模式，StringBuilder把构建者的角色交给了其的父类AbstractStringBuilder，最终调用的是父类的append（）方法2020-04-27Richie 👍（4） 💬（1）The intent of the Builder design pattern is to separate the construction of a complex object from its representation. By doing so the same construction process can create different representations.</li></ol><p>从StringBuilder的代码实现来看，他通过append方法来设置其value属性，最终使用toString()方法来创建对象。这符合建造者模式的定义。这跟我们平时使用的建造者模式唯一的不同就是他一直设置的是同一个属性，而平时我们会设置多个属性，并最终调用build()方法来创建对象。2020-05-08javaadu 👍（3） 💬（0）StringBuilder并没有使用构造者模式，从设计意图上看这俩不是一回事—构造者模式得意图是为同一个类生成不同定制需求的对象，而StringBuilder的设计意图是为了实现可变更的字符串来优化内存占用2020-05-03Demon.Lee 👍（3） 💬（0）如果说要创建一个复杂的String对象，那么通过StringBuilder的append()方法会非常方便，最后通过toString()方法返回，从这个角度看算建造者模式。 @Override public String toString() { // Create a copy, don&#39;t share the array return new String(value, 0, count); }2020-04-27J.Smile 👍（3） 💬（0）总结： 1 工厂模式：简单工厂模式+工厂方法模式 ● 简单工厂模式直接在条件判断中根据不同参数将目标对象new了出来。 ● 工厂方法模式是将目标对象的创建过程根据参数分类抽取到各自独立的工厂类中，以应对目标对象创建过程的复杂度。条件分支可以使用map来缓存起来！ 案例：java.util.Calendar的getInstance() 方法可以根据不同 TimeZone 和 Locale，创建不同的 Calendar 子类对象。</p><p>2 建造者模式： 通过内部的Builder类主导目标对象的创建同时校验必选属性之间的依赖关系。</p><p>3 装饰器模式： 装饰器模式把每个要装饰的功能放到单独的类中，并让这个类包装它所需要装饰的对象，从而实现对原始类的增强。 案例：java的IO类库比如InputStream和BufferInputStream。还有Collections类。2020-04-27Nano 👍（2） 💬（2）虽然建造者模式有个明确的定义。 但是对于我个人来说，只要是可以一直return this，可以一直.setA().setB().setC()....的我都会把它当做建造者模式来理解。因为每次set都会给这个实例添砖加瓦，添加属性。至于要不要最后build()一下做一些逻辑，按需使用吧。2020-10-15飞翔 👍（2） 💬（1）不是，从源码角度看，构造方法不私有，没有复杂构造逻辑，完全不符合构建这模式定义，唯一关联就是名字里面有一个Builder2020-09-18落尘kira 👍（2） 💬（0）StringBuilder本意是创建可变字符串，如果调用toString（）那么就是；如果不调用，那严格意义上不是。但由于出发点是创建可变字符串，理论上其设计的目的就是让使用者最终都会调用toString（）方法，因此我认为他是2020-05-13Heaven 👍（2） 💬（0）个人认为,是属于建造者模式的,在其中,最主要的append方法,是将其抛给了父类AbstractStringBuilder,然后返回自己,其父类AbstractStringBuilder中维护了一个数组,并且可以动然扩容,在我们最后获取结果的toString()方法中,就是直接new String对象,这种模式其实更像是装饰器模式的实现2020-04-27</p>`,49)])])}const b=a(l,[["render",i]]);export{g as __pageData,b as default};
