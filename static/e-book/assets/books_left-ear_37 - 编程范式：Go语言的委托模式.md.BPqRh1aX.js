import{_ as s,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const f=JSON.parse('{"title":"委托的简单示例","description":"","frontmatter":{},"headers":[],"relativePath":"books/left-ear/37 - 编程范式：Go语言的委托模式.md","filePath":"books/left-ear/37 - 编程范式：Go语言的委托模式.md"}'),t={name:"books/left-ear/37 - 编程范式：Go语言的委托模式.md"};function l(i,n,o,c,d,r){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>你好，我是陈皓，网名左耳朵耗子。</p><p>我们再来看Go语言这个模式，Go语言的这个模式挺好玩儿的。声明一个struct，跟C很一样，然后直接把这个struct类型放到另一个struct里。</p><h1 id="委托的简单示例" tabindex="-1">委托的简单示例 <a class="header-anchor" href="#委托的简单示例" aria-label="Permalink to &quot;委托的简单示例&quot;">&amp;ZeroWidthSpace;</a></h1><p>我们来看几个示例：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Widget struct {</span></span>
<span class="line"><span>    X, Y int</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type Label struct {</span></span>
<span class="line"><span>    Widget        // Embedding (delegation)</span></span>
<span class="line"><span>    Text   string // Aggregation</span></span>
<span class="line"><span>    X int         // Override </span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (label Label) Paint() {</span></span>
<span class="line"><span>	// [0xc4200141e0] - Label.Paint(&quot;State&quot;)</span></span>
<span class="line"><span>    fmt.Printf(&quot;[%p] - Label.Paint(%q)\\n&quot;, </span></span>
<span class="line"><span>    	&amp;label, label.Text)</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>由上面可知：</p><ul><li>我们声明了一个 <code>Widget</code>，其有 <code>X</code>和<code>Y</code>；</li><li>然后用它来声明一个 <code>Label</code>，直接把 <code>Widget</code> 委托进去；</li><li>然后再给 <code>Label</code> 声明并实现了一个 <code>Paint()</code> 方法。</li></ul><p>于是，我们就可以这样编程了：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>label := Label{Widget{10, 10}, &quot;State&quot;, 100}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// X=100, Y=10, Text=State, Widget.X=10</span></span>
<span class="line"><span>fmt.Printf(&quot;X=%d, Y=%d, Text=%s Widget.X=%d\\n&quot;, </span></span>
<span class="line"><span>	label.X, label.Y, label.Text, </span></span>
<span class="line"><span>	label.Widget.X)</span></span>
<span class="line"><span>fmt.Println()</span></span>
<span class="line"><span>// {Widget:{X:10 Y:10} Text:State X:100} </span></span>
<span class="line"><span>// {{10 10} State 100}</span></span>
<span class="line"><span>fmt.Printf(&quot;%+v\\n%v\\n&quot;, label, label)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>label.Paint()</span></span></code></pre></div><p>我们可以看到，如果有成员变量重名，则需要手动地解决冲突。</p><p>我们继续扩展代码。</p><p>先来一个 <code>Button</code>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Button struct {</span></span>
<span class="line"><span>    Label // Embedding (delegation)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>func NewButton(x, y int, text string) Button {</span></span>
<span class="line"><span>    return Button{Label{Widget{x, y}, text, x}}</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>func (button Button) Paint() { // Override</span></span>
<span class="line"><span>    fmt.Printf(&quot;[%p] - Button.Paint(%q)\\n&quot;, </span></span>
<span class="line"><span>    	&amp;button, button.Text)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>func (button Button) Click() {</span></span>
<span class="line"><span>    fmt.Printf(&quot;[%p] - Button.Click()\\n&quot;, &amp;button)</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>再来一个 <code>ListBox</code>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type ListBox struct {</span></span>
<span class="line"><span>    Widget          // Embedding (delegation)</span></span>
<span class="line"><span>    Texts  []string // Aggregation</span></span>
<span class="line"><span>    Index  int      // Aggregation</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>func (listBox ListBox) Paint() {</span></span>
<span class="line"><span>    fmt.Printf(&quot;[%p] - ListBox.Paint(%q)\\n&quot;, </span></span>
<span class="line"><span>    	&amp;listBox, listBox.Texts)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>func (listBox ListBox) Click() {</span></span>
<span class="line"><span>    fmt.Printf(&quot;[%p] - ListBox.Click()\\n&quot;, &amp;listBox)</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>然后，声明两个接口用于多态：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Painter interface {</span></span>
<span class="line"><span>    Paint()</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type Clicker interface {</span></span>
<span class="line"><span>    Click()</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>于是我们就可以这样泛型地使用（注意其中的两个for循环）：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>button1 := Button{Label{Widget{10, 70}, &quot;OK&quot;, 10}}</span></span>
<span class="line"><span>button2 := NewButton(50, 70, &quot;Cancel&quot;)</span></span>
<span class="line"><span>listBox := ListBox{Widget{10, 40}, </span></span>
<span class="line"><span>    []string{&quot;AL&quot;, &quot;AK&quot;, &quot;AZ&quot;, &quot;AR&quot;}, 0}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fmt.Println()</span></span>
<span class="line"><span>//[0xc4200142d0] - Label.Paint(&quot;State&quot;)</span></span>
<span class="line"><span>//[0xc420014300] - ListBox.Paint([&quot;AL&quot; &quot;AK&quot; &quot;AZ&quot; &quot;AR&quot;])</span></span>
<span class="line"><span>//[0xc420014330] - Button.Paint(&quot;OK&quot;)</span></span>
<span class="line"><span>//[0xc420014360] - Button.Paint(&quot;Cancel&quot;)</span></span>
<span class="line"><span>for _, painter := range []Painter{label, listBox, button1, button2} {</span></span>
<span class="line"><span>	painter.Paint()</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fmt.Println()</span></span>
<span class="line"><span>//[0xc420014450] - ListBox.Click()</span></span>
<span class="line"><span>//[0xc420014480] - Button.Click()</span></span>
<span class="line"><span>//[0xc4200144b0] - Button.Click()</span></span>
<span class="line"><span>for _, widget := range []interface{}{label, listBox, button1, button2} {</span></span>
<span class="line"><span>    if clicker, ok := widget.(Clicker); ok {</span></span>
<span class="line"><span>    	clicker.Click()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h1 id="一个-undo-的委托重构" tabindex="-1">一个 Undo 的委托重构 <a class="header-anchor" href="#一个-undo-的委托重构" aria-label="Permalink to &quot;一个 Undo 的委托重构&quot;">&amp;ZeroWidthSpace;</a></h1><p>上面这个是 Go 语言中的委托和接口多态的编程方式，其实是面向对象和原型编程综合的玩法。这个玩法可不可以玩得更有意思呢？这是可以的。</p><p>首先，我们先声明一个数据容器，其中有 <code>Add()</code>、 <code>Delete()</code> 和 <code>Contains()</code> 方法。还有一个转字符串的方法。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type IntSet struct {</span></span>
<span class="line"><span>    data map[int]bool</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func NewIntSet() IntSet {</span></span>
<span class="line"><span>    return IntSet{make(map[int]bool)}</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) Add(x int) {</span></span>
<span class="line"><span>    set.data[x] = true</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) Delete(x int) {</span></span>
<span class="line"><span>    delete(set.data, x)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) Contains(x int) bool {</span></span>
<span class="line"><span>    return set.data[x]</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) String() string { // Satisfies fmt.Stringer interface</span></span>
<span class="line"><span>    if len(set.data) == 0 {</span></span>
<span class="line"><span>        return &quot;{}&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ints := make([]int, 0, len(set.data))</span></span>
<span class="line"><span>    for i := range set.data {</span></span>
<span class="line"><span>        ints = append(ints, i)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    sort.Ints(ints)</span></span>
<span class="line"><span>    parts := make([]string, 0, len(ints))</span></span>
<span class="line"><span>    for _, i := range ints {</span></span>
<span class="line"><span>        parts = append(parts, fmt.Sprint(i))</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return &quot;{&quot; + strings.Join(parts, &quot;,&quot;) + &quot;}&quot;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们如下使用这个数据容器：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ints := NewIntSet()</span></span>
<span class="line"><span>for _, i := range []int{1, 3, 5, 7} {</span></span>
<span class="line"><span>    ints.Add(i)</span></span>
<span class="line"><span>    fmt.Println(ints)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>for _, i := range []int{1, 2, 3, 4, 5, 6, 7} {</span></span>
<span class="line"><span>    fmt.Print(i, ints.Contains(i), &quot; &quot;)</span></span>
<span class="line"><span>    ints.Delete(i)</span></span>
<span class="line"><span>    fmt.Println(ints)</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这个数据容器平淡无奇，我们想给它加一个Undo的功能。我们可以这样来做：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type UndoableIntSet struct { // Poor style</span></span>
<span class="line"><span>    IntSet    // Embedding (delegation)</span></span>
<span class="line"><span>    functions []func()</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func NewUndoableIntSet() UndoableIntSet {</span></span>
<span class="line"><span>    return UndoableIntSet{NewIntSet(), nil}</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *UndoableIntSet) Add(x int) { // Override</span></span>
<span class="line"><span>    if !set.Contains(x) {</span></span>
<span class="line"><span>        set.data[x] = true</span></span>
<span class="line"><span>        set.functions = append(set.functions, func() { set.Delete(x) })</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>        set.functions = append(set.functions, nil)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *UndoableIntSet) Delete(x int) { // Override</span></span>
<span class="line"><span>    if set.Contains(x) {</span></span>
<span class="line"><span>        delete(set.data, x)</span></span>
<span class="line"><span>        set.functions = append(set.functions, func() { set.Add(x) })</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>        set.functions = append(set.functions, nil)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *UndoableIntSet) Undo() error {</span></span>
<span class="line"><span>    if len(set.functions) == 0 {</span></span>
<span class="line"><span>        return errors.New(&quot;No functions to undo&quot;)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    index := len(set.functions) - 1</span></span>
<span class="line"><span>    if function := set.functions[index]; function != nil {</span></span>
<span class="line"><span>        function()</span></span>
<span class="line"><span>        set.functions[index] = nil // Free closure for garbage collection</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    set.functions = set.functions[:index]</span></span>
<span class="line"><span>    return nil</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>于是就可以这样使用了：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ints := NewUndoableIntSet()</span></span>
<span class="line"><span>for _, i := range []int{1, 3, 5, 7} {</span></span>
<span class="line"><span>    ints.Add(i)</span></span>
<span class="line"><span>    fmt.Println(ints)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>for _, i := range []int{1, 2, 3, 4, 5, 6, 7} {</span></span>
<span class="line"><span>    fmt.Println(i, ints.Contains(i), &quot; &quot;)</span></span>
<span class="line"><span>    ints.Delete(i)</span></span>
<span class="line"><span>    fmt.Println(ints)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>fmt.Println()</span></span>
<span class="line"><span>for {</span></span>
<span class="line"><span>    if err := ints.Undo(); err != nil {</span></span>
<span class="line"><span>        break</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    fmt.Println(ints)</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>但是，需要注意的是，我们用了一个新的 <code>UndoableIntSet</code> 几乎重写了所有的 <code>IntSet</code> 和 “写” 相关的方法，这样就可以把操作记录下来，然后 <strong>Undo</strong> 了。</p><p>但是，可能别的类也需要Undo的功能，我是不是要重写所有的需要这个功能的类啊？这样的代码类似，就是因为数据容器不一样，我就要去重写它们，这太二了。</p><p>我们能不能利用前面学到的泛型编程、函数式编程、IoC等范式来把这个事干得好一些呢？当然是可以的。</p><p>如下所示：</p><ul><li>我们先声明一个 <code>Undo[]</code> 的函数数组（其实是一个栈）；</li><li>并实现一个通用 <code>Add()</code>。其需要一个函数指针，并把这个函数指针存放到 <code>Undo[]</code> 函数数组中。</li><li>在 <code>Undo()</code> 的函数中，我们会遍历<code>Undo[]</code>函数数组，并执行之，执行完后就弹栈。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Undo []func()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (undo *Undo) Add(function func()) {</span></span>
<span class="line"><span>    *undo = append(*undo, function)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (undo *Undo) Undo() error {</span></span>
<span class="line"><span>    functions := *undo</span></span>
<span class="line"><span>    if len(functions) == 0 {</span></span>
<span class="line"><span>        return errors.New(&quot;No functions to undo&quot;)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    index := len(functions) - 1</span></span>
<span class="line"><span>    if function := functions[index]; function != nil {</span></span>
<span class="line"><span>        function()</span></span>
<span class="line"><span>        functions[index] = nil // Free closure for garbage collection</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    *undo = functions[:index]</span></span>
<span class="line"><span>    return nil</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>那么我们的 <code>IntSet</code> 就可以改写成如下的形式：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type IntSet struct {</span></span>
<span class="line"><span>    data map[int]bool</span></span>
<span class="line"><span>    undo Undo</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func NewIntSet() IntSet {</span></span>
<span class="line"><span>    return IntSet{data: make(map[int]bool)}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>然后在其中的 <code>Add</code> 和 <code>Delete</code>中实现 Undo 操作。</p><ul><li><code>Add</code> 操作时加入 <code>Delete</code> 操作的 Undo。</li><li><code>Delete</code> 操作时加入 <code>Add</code> 操作的 Undo。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) Add(x int) {</span></span>
<span class="line"><span>    if !set.Contains(x) {</span></span>
<span class="line"><span>        set.data[x] = true</span></span>
<span class="line"><span>        set.undo.Add(func() { set.Delete(x) })</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>        set.undo.Add(nil)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) Delete(x int) {</span></span>
<span class="line"><span>    if set.Contains(x) {</span></span>
<span class="line"><span>        delete(set.data, x)</span></span>
<span class="line"><span>        set.undo.Add(func() { set.Add(x) })</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>        set.undo.Add(nil)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) Undo() error {</span></span>
<span class="line"><span>    return set.undo.Undo()</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (set *IntSet) Contains(x int) bool {</span></span>
<span class="line"><span>    return set.data[x]</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们再次看到，Go语言的Undo接口把Undo的流程给抽象出来，而要怎么Undo的事交给了业务代码来维护（通过注册一个Undo的方法）。这样在Undo的时候，就可以回调这个方法来做与业务相关的Undo操作了。</p><h1 id="小结" tabindex="-1">小结 <a class="header-anchor" href="#小结" aria-label="Permalink to &quot;小结&quot;">&amp;ZeroWidthSpace;</a></h1><p>这是不是和最一开始的C++的泛型编程很像？也和map、reduce、filter这样的只关心控制流程，不关心业务逻辑的做法很像？而且，一开始用一个UndoableIntSet来包装<code>IntSet</code>类，到反过来在<code>IntSet</code>里依赖<code>Undo</code>类，这就是控制反转IoC。</p><p>以下是《编程范式游记》系列文章的目录，方便你了解这一系列内容的全貌。</p><ul><li><a href="https://time.geekbang.org/column/article/301" target="_blank" rel="noreferrer">01 | 编程范式游记：起源</a></li><li><a href="https://time.geekbang.org/column/article/303" target="_blank" rel="noreferrer">02 | 编程范式游记：泛型编程</a></li><li><a href="https://time.geekbang.org/column/article/2017" target="_blank" rel="noreferrer">03 | 编程范式游记：类型系统和泛型的本质</a></li><li><a href="https://time.geekbang.org/column/article/2711" target="_blank" rel="noreferrer">04 | 编程范式游记：函数式编程</a></li><li><a href="https://time.geekbang.org/column/article/2723" target="_blank" rel="noreferrer">05 | 编程范式游记：修饰器模式</a></li><li><a href="https://time.geekbang.org/column/article/2729" target="_blank" rel="noreferrer">06 | 编程范式游记：面向对象编程</a></li><li><a href="https://time.geekbang.org/column/article/2741" target="_blank" rel="noreferrer">07 | 编程范式游记：基于原型的编程范式</a></li><li><a href="https://time.geekbang.org/column/article/2748" target="_blank" rel="noreferrer">08 | 编程范式游记：Go 语言的委托模式</a></li><li><a href="https://time.geekbang.org/column/article/2751" target="_blank" rel="noreferrer">09 | 编程范式游记：编程的本质</a></li><li><a href="https://time.geekbang.org/column/article/2752" target="_blank" rel="noreferrer">10 | 编程范式游记：逻辑编程范式</a></li><li><a href="https://time.geekbang.org/column/article/2754" target="_blank" rel="noreferrer">11 | 编程范式游记：程序世界里的编程范式</a> 精选留言（15） milley 👍（39） 💬（0）这样的代码和思维只能说赏心悦目！2018-02-06小文同学 👍（11） 💬（0）1、文章说了什么？ 文章分了两部分，一部分先简单说了 Golang 的委托用法。简单来说，就是讲一个 structA 嵌套到另外一个 structB 中，structB 会自动继承 structA 的字段。其后，通过一个更加复杂的例子说明委托的用法。（作为一个 Java 程序员，Golang 为 struct 增加方法，和定义接口的方法让人印象深刻）</li></ul><p>另一部分，作者举了一个更加复杂的例子说明 Go 中委托和接口多态是如何实现一个数据容器的 Undo 实现的。为了说明这部分，作者通过以下步骤一说说进阶说明： 1、最简单的一个 IntSet，并定义了 Add ，Delete 方法； 2、通过一个委托的方法，将 IntSet 委托给一个新的 struct，新 struct 再重写一次 Add，Delete 方法以记录步骤（保存Undo函数对象），完成 Undo 功能； 3、最后作者希望可以进一步改写，编写一个 Undo 栈，委托给 IntSet ，并在 IntSet 编写 Add，Delete 的方法中就完成 Undo 函数对象的保存。这也是一个实现方法。2020-11-04Jie 👍（4） 💬（1）求教，最后那段代码执行undo的时候会继续添加undo函数，那样不就回不到最初的状态了？后续一直在撤销undo—撤销撤销undo……2020-11-11亢（知行合一的路上） 👍（4） 💬（0）依赖的东西要可靠、稳定，也就是接口。 业务与控制分离，控制就可以复用。 把变化频率不同的事物分开。2019-02-26拉欧 👍（3） 💬（0）go里面这个undo功能的实现类似scala里面的trait,也是把一些功能模块（以及实现）单独封装起来，然后以委托或者继承的形式组装到类里面，这种灵活组装的方式确实比java的interface要更方便使用，不同语言之间是有共同点的2019-05-29寻找的人cs 👍（3） 💬（0）web端功能多一点就好了，比如显示文章列表的时候感觉不如app端那么清爽2019-02-06Jacob.C 👍（2） 💬（0）再在undo里加个反撤销的功能，就更秀了2021-03-05你为啥那么牛 👍（2） 💬（0）写了半年的go语言了，终于体会到go语言的美感了。那种只要会嘎嘎叫的，我就认为是一只🦆的境界。😃2020-09-15Z3 👍（2） 💬（0）sort.Ints(ints) parts := make([]string, 0, len(ints)) for _, i := range ints {</p><p>这块要sort吗？ 能否直接for （i=0；i&lt;len）print ints[i]2018-02-06小虾米 👍（1） 💬（0）这样写的undo在第一次插入过后，可以无限撤销了吧2018-02-06小破 👍（1） 💬（0）几个月前听到代码时间做节目，陈老师讲的内容让我感觉很实在，今天终于跟过来了😃2018-02-06qiushye 👍（0） 💬（0）没有理解的可以直接拷贝代码去执行，不懂的地方打日志输出指针之类的来帮助理解，可以思考下after undo的相同输出如何来的。 package main</p><p>import ( &quot;errors&quot; &quot;fmt&quot; &quot;sort&quot; &quot;strings&quot; )</p><p>func main() { ints := NewIntSet() for _, i := range []int{1, 3, 5} { ints.Add(i) fmt.Println(&quot;after add:&quot;, ints.String()) } for _, i := range []int{1, 2, 3, 4, 5} { fmt.Println(&quot;want delete:&quot;, i, ints.Contains(i), &quot; &quot;) ints.Delete(i) fmt.Println(&quot;after delete:&quot;, ints.String()) } fmt.Println(&quot;------- undo result ---------&quot;) for { if err := ints.Undo(); err != nil { fmt.Println(err) break } fmt.Println(&quot;after undo:&quot;, ints.String()) } } type IntSet struct { data map[int]bool undo Undo } func NewIntSet() IntSet { return IntSet{data: make(map[int]bool)} }</p><p>func (set *IntSet) Add(x int) { if !set.Contains(x) { set.data[x] = true set.undo.Add(func() { set.Delete(x) }) } else { set.undo.Add(nil) } }</p><p>func (set *IntSet) Delete(x int) { if set.Contains(x) { delete(set.data, x) set.undo.Add(func() { set.Add(x) }) } else { set.undo.Add(nil) } }</p><p>func (set *IntSet) Undo() error { return set.undo.Undo() }</p><p>func (set *IntSet) Contains(x int) bool { return set.data[x] }</p><p>func (set *IntSet) String() string { if len(set.data) == 0 { return &quot;{}&quot; } ints := make([]int, 0, len(set.data)) for i := range set.data { ints = append(ints, i) } sort.Ints(ints) parts := make([]string, 0, len(ints)) for _, i := range ints { parts = append(parts, fmt.Sprint(i)) } return &quot;{&quot; + strings.Join(parts, &quot;,&quot;) + &quot;}&quot; }</p><p>type Undo []func()</p><p>func (undo *Undo) Add(function func()) { *undo = append(*undo, function) }</p><p>func (undo *Undo) Undo() error { functions := *undo if len(functions) == 0 { return errors.New(&quot;No functions to undo&quot;) } index := len(functions) - 1 if function := functions[index]; function != nil { function() functions[index] = nil // Free closure for garbage collection } *undo = functions[:index] return nil } 2023-09-15seedjyh 👍（0） 💬（0）委托模式其实就是利用了go的组合功能实现了类似C++的继承功能。就undo数组而言，继承了基类的栈、注册undo的方法和执行undo的方法。2021-10-20seedjyh 👍（0） 💬（0）最后的undo数组很有意思。 在C++里，一般是基类Undoable有一个public的实体函数Undo和一个private的纯虚函数undo，前者调用后最后；各个需要undo的子类实现这个纯虚函数。但这样就引入了强耦合（继承）。 在go里是注册一个闭包，让Undo数组回调。2021-10-20Geek_bc461b 👍（0） 💬（0）单从undo功能来说用装饰器模式是不是更好2020-12-16</p>`,57)])])}const g=s(t,[["render",l]]);export{f as __pageData,g as default};
