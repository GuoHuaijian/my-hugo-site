import{_ as s,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const _=JSON.parse('{"title":"作业:","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/73 - 中介模式：什么时候用中介模式？什么时候用观察者模式？.md","filePath":"books/design-pattern/73 - 中介模式：什么时候用中介模式？什么时候用观察者模式？.md"}'),t={name:"books/design-pattern/73 - 中介模式：什么时候用中介模式？什么时候用观察者模式？.md"};function i(l,n,o,c,r,u){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>今天，我们来学习23种经典设计模式中的最后一个，中介模式。跟前面刚刚讲过的命令模式、解释器模式类似，中介模式也属于不怎么常用的模式，应用场景比较特殊、有限，但是，跟它俩不同的是，中介模式理解起来并不难，代码实现也非常简单，学习难度要小很多。</p><p>如果你对中介模式有所了解，你可能会知道，中介模式跟之前讲过的观察者模式有点相似，所以，今天我们还会详细讨论下这两种模式的区别。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="中介模式的原理和实现" tabindex="-1">中介模式的原理和实现 <a class="header-anchor" href="#中介模式的原理和实现" aria-label="Permalink to &quot;中介模式的原理和实现&quot;">&amp;ZeroWidthSpace;</a></h2><p>中介模式的英文翻译是Mediator Design Pattern。在GoF中的《设计模式》一书中，它是这样定义的：</p><blockquote><p>Mediator pattern defines a separate (mediator) object that encapsulates the interaction between a set of objects and the objects delegate their interaction to a mediator object instead of interacting with each other directly.</p></blockquote><p>翻译成中文就是：中介模式定义了一个单独的（中介）对象，来封装一组对象之间的交互。将这组对象之间的交互委派给与中介对象交互，来避免对象之间的直接交互。</p><p>还记得我们在<a href="https://time.geekbang.org/column/article/187761" target="_blank" rel="noreferrer">第30节课</a>中讲的“如何给代码解耦”吗？其中一个方法就是引入中间层。</p><p>实际上，中介模式的设计思想跟中间层很像，通过引入中介这个中间层，将一组对象之间的交互关系（或者说依赖关系）从多对多（网状关系）转换为一对多（星状关系）。原来一个对象要跟n个对象交互，现在只需要跟一个中介对象交互，从而最小化对象之间的交互关系，降低了代码的复杂度，提高了代码的可读性和可维护性。</p><p>这里我画了一张对象交互关系的对比图。其中，右边的交互图是利用中介模式对左边交互关系优化之后的结果，从图中我们可以很直观地看出，右边的交互关系更加清晰、简洁。</p><p><img src="https://static001.geekbang.org/resource/image/43/9f/4376d541bf17a029f37aa76009ef3a9f.jpg?wh=2563%2A1183" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>提到中介模式，有一个比较经典的例子不得不说，那就是航空管制。</p><p>为了让飞机在飞行的时候互不干扰，每架飞机都需要知道其他飞机每时每刻的位置，这就需要时刻跟其他飞机通信。飞机通信形成的通信网络就会无比复杂。这个时候，我们通过引入“塔台”这样一个中介，让每架飞机只跟塔台来通信，发送自己的位置给塔台，由塔台来负责每架飞机的航线调度。这样就大大简化了通信网络。</p><p>刚刚举的是生活中的例子，我们再举一个跟编程开发相关的例子。这个例子与UI控件有关，算是中介模式比较经典的应用，很多书籍在讲到中介模式的时候，都会拿它来举例。</p><p>假设我们有一个比较复杂的对话框，对话框中有很多控件，比如按钮、文本框、下拉框等。当我们对某个控件进行操作的时候，其他控件会做出相应的反应，比如，我们在下拉框中选择“注册”，注册相关的控件就会显示在对话框中。如果我们在下拉框中选择“登陆”，登陆相关的控件就会显示在对话框中。</p><p>按照通常我们习惯的UI界面的开发方式，我们将刚刚的需求用代码实现出来，就是下面这个样子。在这种实现方式中，控件和控件之间互相操作、互相依赖。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class UIControl {</span></span>
<span class="line"><span>  private static final String LOGIN_BTN_ID = &quot;login_btn&quot;;</span></span>
<span class="line"><span>  private static final String REG_BTN_ID = &quot;reg_btn&quot;;</span></span>
<span class="line"><span>  private static final String USERNAME_INPUT_ID = &quot;username_input&quot;;</span></span>
<span class="line"><span>  private static final String PASSWORD_INPUT_ID = &quot;pswd_input&quot;;</span></span>
<span class="line"><span>  private static final String REPEATED_PASSWORD_INPUT_ID = &quot;repeated_pswd_input&quot;;</span></span>
<span class="line"><span>  private static final String HINT_TEXT_ID = &quot;hint_text&quot;;</span></span>
<span class="line"><span>  private static final String SELECTION_ID = &quot;selection&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    Button loginButton = (Button)findViewById(LOGIN_BTN_ID);</span></span>
<span class="line"><span>    Button regButton = (Button)findViewById(REG_BTN_ID);</span></span>
<span class="line"><span>    Input usernameInput = (Input)findViewById(USERNAME_INPUT_ID);</span></span>
<span class="line"><span>    Input passwordInput = (Input)findViewById(PASSWORD_INPUT_ID);</span></span>
<span class="line"><span>    Input repeatedPswdInput = (Input)findViewById(REPEATED_PASSWORD_INPUT_ID);</span></span>
<span class="line"><span>    Text hintText = (Text)findViewById(HINT_TEXT_ID);</span></span>
<span class="line"><span>    Selection selection = (Selection)findViewById(SELECTION_ID);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    loginButton.setOnClickListener(new OnClickListener() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void onClick(View v) {</span></span>
<span class="line"><span>        String username = usernameInput.text();</span></span>
<span class="line"><span>        String password = passwordInput.text();</span></span>
<span class="line"><span>        //校验数据...</span></span>
<span class="line"><span>        //做业务处理...</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    regButton.setOnClickListener(new OnClickListener() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void onClick(View v) {</span></span>
<span class="line"><span>      //获取usernameInput、passwordInput、repeatedPswdInput数据...</span></span>
<span class="line"><span>      //校验数据...</span></span>
<span class="line"><span>      //做业务处理...</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //...省略selection下拉选择框相关代码....</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们再按照中介模式，将上面的代码重新实现一下。在新的代码实现中，各个控件只跟中介对象交互，中介对象负责所有业务逻辑的处理。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface Mediator {</span></span>
<span class="line"><span>  void handleEvent(Component component, String event);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class LandingPageDialog implements Mediator {</span></span>
<span class="line"><span>  private Button loginButton;</span></span>
<span class="line"><span>  private Button regButton;</span></span>
<span class="line"><span>  private Selection selection;</span></span>
<span class="line"><span>  private Input usernameInput;</span></span>
<span class="line"><span>  private Input passwordInput;</span></span>
<span class="line"><span>  private Input repeatedPswdInput;</span></span>
<span class="line"><span>  private Text hintText;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void handleEvent(Component component, String event) {</span></span>
<span class="line"><span>    if (component.equals(loginButton)) {</span></span>
<span class="line"><span>      String username = usernameInput.text();</span></span>
<span class="line"><span>      String password = passwordInput.text();</span></span>
<span class="line"><span>      //校验数据...</span></span>
<span class="line"><span>      //做业务处理...</span></span>
<span class="line"><span>    } else if (component.equals(regButton)) {</span></span>
<span class="line"><span>      //获取usernameInput、passwordInput、repeatedPswdInput数据...</span></span>
<span class="line"><span>      //校验数据...</span></span>
<span class="line"><span>      //做业务处理...</span></span>
<span class="line"><span>    } else if (component.equals(selection)) {</span></span>
<span class="line"><span>      String selectedItem = selection.select();</span></span>
<span class="line"><span>      if (selectedItem.equals(&quot;login&quot;)) {</span></span>
<span class="line"><span>        usernameInput.show();</span></span>
<span class="line"><span>        passwordInput.show();</span></span>
<span class="line"><span>        repeatedPswdInput.hide();</span></span>
<span class="line"><span>        hintText.hide();</span></span>
<span class="line"><span>        //...省略其他代码</span></span>
<span class="line"><span>      } else if (selectedItem.equals(&quot;register&quot;)) {</span></span>
<span class="line"><span>        //....</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class UIControl {</span></span>
<span class="line"><span>  private static final String LOGIN_BTN_ID = &quot;login_btn&quot;;</span></span>
<span class="line"><span>  private static final String REG_BTN_ID = &quot;reg_btn&quot;;</span></span>
<span class="line"><span>  private static final String USERNAME_INPUT_ID = &quot;username_input&quot;;</span></span>
<span class="line"><span>  private static final String PASSWORD_INPUT_ID = &quot;pswd_input&quot;;</span></span>
<span class="line"><span>  private static final String REPEATED_PASSWORD_INPUT_ID = &quot;repeated_pswd_input&quot;;</span></span>
<span class="line"><span>  private static final String HINT_TEXT_ID = &quot;hint_text&quot;;</span></span>
<span class="line"><span>  private static final String SELECTION_ID = &quot;selection&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    Button loginButton = (Button)findViewById(LOGIN_BTN_ID);</span></span>
<span class="line"><span>    Button regButton = (Button)findViewById(REG_BTN_ID);</span></span>
<span class="line"><span>    Input usernameInput = (Input)findViewById(USERNAME_INPUT_ID);</span></span>
<span class="line"><span>    Input passwordInput = (Input)findViewById(PASSWORD_INPUT_ID);</span></span>
<span class="line"><span>    Input repeatedPswdInput = (Input)findViewById(REPEATED_PASSWORD_INPUT_ID);</span></span>
<span class="line"><span>    Text hintText = (Text)findViewById(HINT_TEXT_ID);</span></span>
<span class="line"><span>    Selection selection = (Selection)findViewById(SELECTION_ID);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    Mediator dialog = new LandingPageDialog();</span></span>
<span class="line"><span>    dialog.setLoginButton(loginButton);</span></span>
<span class="line"><span>    dialog.setRegButton(regButton);</span></span>
<span class="line"><span>    dialog.setUsernameInput(usernameInput);</span></span>
<span class="line"><span>    dialog.setPasswordInput(passwordInput);</span></span>
<span class="line"><span>    dialog.setRepeatedPswdInput(repeatedPswdInput);</span></span>
<span class="line"><span>    dialog.setHintText(hintText);</span></span>
<span class="line"><span>    dialog.setSelection(selection);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    loginButton.setOnClickListener(new OnClickListener() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void onClick(View v) {</span></span>
<span class="line"><span>        dialog.handleEvent(loginButton, &quot;click&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    regButton.setOnClickListener(new OnClickListener() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void onClick(View v) {</span></span>
<span class="line"><span>        dialog.handleEvent(regButton, &quot;click&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //....</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从代码中我们可以看出，原本业务逻辑会分散在各个控件中，现在都集中到了中介类中。实际上，这样做既有好处，也有坏处。好处是简化了控件之间的交互，坏处是中介类有可能会变成大而复杂的“上帝类”（God Class）。所以，在使用中介模式的时候，我们要根据实际的情况，平衡对象之间交互的复杂度和中介类本身的复杂度。</p><h2 id="中介模式-vs-观察者模式" tabindex="-1">中介模式 VS 观察者模式 <a class="header-anchor" href="#中介模式-vs-观察者模式" aria-label="Permalink to &quot;中介模式 VS 观察者模式&quot;">&amp;ZeroWidthSpace;</a></h2><p>前面讲观察者模式的时候，我们讲到，观察者模式有多种实现方式。虽然经典的实现方式没法彻底解耦观察者和被观察者，观察者需要注册到被观察者中，被观察者状态更新需要调用观察者的update()方法。但是，在跨进程的实现方式中，我们可以利用消息队列实现彻底解耦，观察者和被观察者都只需要跟消息队列交互，观察者完全不知道被观察者的存在，被观察者也完全不知道观察者的存在。</p><p>我们前面提到，中介模式也是为了解耦对象之间的交互，所有的参与者都只与中介进行交互。而观察者模式中的消息队列，就有点类似中介模式中的“中介”，观察者模式的中观察者和被观察者，就有点类似中介模式中的“参与者”。那问题来了：中介模式和观察者模式的区别在哪里呢？什么时候选择使用中介模式？什么时候选择使用观察者模式呢？</p><p>在观察者模式中，尽管一个参与者既可以是观察者，同时也可以是被观察者，但是，大部分情况下，交互关系往往都是单向的，一个参与者要么是观察者，要么是被观察者，不会兼具两种身份。也就是说，在观察者模式的应用场景中，参与者之间的交互关系比较有条理。</p><p>而中介模式正好相反。只有当参与者之间的交互关系错综复杂，维护成本很高的时候，我们才考虑使用中介模式。毕竟，中介模式的应用会带来一定的副作用，前面也讲到，它有可能会产生大而复杂的上帝类。除此之外，如果一个参与者状态的改变，其他参与者执行的操作有一定先后顺序的要求，这个时候，中介模式就可以利用中介类，通过先后调用不同参与者的方法，来实现顺序的控制，而观察者模式是无法实现这样的顺序要求的。</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>中介模式的设计思想跟中间层很像，通过引入中介这个中间层，将一组对象之间的交互关系（或者依赖关系）从多对多（网状关系）转换为一对多（星状关系）。原来一个对象要跟n个对象交互，现在只需要跟一个中介对象交互，从而最小化对象之间的交互关系，降低了代码的复杂度，提高了代码的可读性和可维护性。</p><p>观察者模式和中介模式都是为了实现参与者之间的解耦，简化交互关系。两者的不同在于应用场景上。在观察者模式的应用场景中，参与者之间的交互比较有条理，一般都是单向的，一个参与者只有一个身份，要么是观察者，要么是被观察者。而在中介模式的应用场景中，参与者之间的交互关系错综复杂，既可以是消息的发送者、也可以同时是消息的接收者。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>在讲观察者模式的时候，我们有讲到EventBus框架。当时我们认为它是观察者模式的实现框架。EventBus作为一个事件处理的中心，事件的派送、订阅都通过这个中心来完成，那是不是更像中介模式的实现框架呢？</p><p>欢迎留言和我分享你的想法。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） 守拙 👍（93） 💬（8）我按照老师的demo写了一遍中介模式的dialog实现, 发现不就是Dialog impl OnClickListener嘛...</p><p>关于Observer与Mediator的区别</p><p>Observer定义了一对多(one-to-many)的依赖关系, Mediator封装了多个对象互相之间的交互方式. Oberver定义了单向的订阅关系, Mediator通过引入中间件的方式解决多个对象之间混乱的依赖关系与通信方式.</p><p>一个可爱的小栗子:</p><p>Observer不能做什么:</p><ol><li>观察者: hey订阅号, 你到底什么时候更新?</li><li>观察者: 订阅号你到底什么时候更新? 我怎么没收到更新?</li><li>观察者: 我知道订阅号更新了!(假话)</li></ol><p>Observer能做什么:</p><pre><code>   1. 观察者乖乖坐等更新;
   2. 一段时间后...
   3. 订阅号: hey我更新了, 小崽子们!
</code></pre><p>Mediator不能做什么:</p><ol><li>乘客1: hey taxi1, 带我去xx(不会得到任何回应)</li><li>乘客2: hey taxi2, 带我去xx(不会得到任何回应)</li><li>乘客1: hey taxi2, 带我去xx(不会得到任何回应)</li></ol><p>Mediator能做什么:</p><ol><li>乘客1: dd车辆调度中心, 我要去xx, 请派车接我!(司机正在赶来)</li><li>乘客2: dd车辆调度中心, 我要去xx, 请派优享来接我!(优享司机马上就到!)</li></ol><p>课堂讨论:</p><p>​ EventBus基于观察者模式实现, 并不符合中介模式的定义. 中介模式封装一组对象间交互, 将这组对象间的交互委派给中介对象交互. EventBus仅负责发布消息, 并不处理发布者/订阅者的任何交互.</p><p>2020-04-20iLeGeND 👍（23） 💬（5）感觉23中设计模式之间本身就有某种耦合 好多不易区分2020-04-20Demon.Lee 👍（4） 💬（4）老师的这个例子，我还是没看明白哪里体现了“多个对象之间交互” --&gt; &quot;多个对象之间通过中介交互&quot; 的变化。比如之前是regButton，loginButton，Selection三者之间是怎么交互的，我没看出来。然后又是如何把这三个对象的相互调用，改成了通过中介类交互的，我也没看明白。我去查阅了其他资料，发现什么虚拟聊天室什么的代码就体现了上面这一点：用户A发消息给用户B是直接交互，改造之后是，用户A发消息给中介，中介再把消息转给消息B。有小伙伴们理解了么，能否分享下。2020-04-20小晏子 👍（151） 💬（2）eventbus更属于观察者模式，首先eventbus中不处理业务逻辑，只提供了对象与对象之间交互的管道；而中介模式为了解决多个对象之间交互的问题，将多个对象的行为封装到一起（中介），然后任意对象和这个中介交互，中介中包含了具体业务逻辑。其次从其实现的思路上，EventBus 和观察者都需要定义 Observer，并且通过 register() 函数注册 Observer，也都需要通过调用某个函数（比如，EventBus 中的 post() 函数）来给 Observer 发送消息。而且eventbus并没有中介模式大而臃肿的上帝类问题。2020-04-20大头 👍（53） 💬（6）想到了现在流行的微服务，注册中心可以理解为广义的中介模式，防止各个服务间错综复杂的调用2020-04-20写代码的 👍（6） 💬（1）中介模式注重于协调，而不是通讯。既然要协调，那么中介模式就得依赖于各个参与者，知道他们的功能。而观察者不需要知道被观察者的功能，只负责把消息送到就行。2020-09-14李小四 👍（6） 💬（1）设计模式_73:</p><h1 id="作业" tabindex="-1">作业: <a class="header-anchor" href="#作业" aria-label="Permalink to &quot;作业:&quot;">&amp;ZeroWidthSpace;</a></h1><p>个人认为还是观察者模式，当然，引入消息队列的观察者模式可以理解为中介模式的一种，它的业务调用更有规律，它不要求被调用者的顺序。</p><h1 id="感想" tabindex="-1">感想: <a class="header-anchor" href="#感想" aria-label="Permalink to &quot;感想:&quot;">&amp;ZeroWidthSpace;</a></h1><p>中介模式看下来，感觉是要带领我们回到面向过程的老路，就文中所述的“上帝类”，有了这个中介，依然在维护复杂的调用关系。2020-04-20xk_ 👍（4） 💬（0）EventBus不处理业务逻辑，只是单向传递消息，所以是观察者模式。 中介模式，可以处理业务逻辑，而且双向传递信息的。2020-05-04test 👍（4） 💬（0）eventbus解决的是消息的发布订阅等，跟具体的业务没关系，所以是观察者模式2020-04-20黄林晴 👍（3） 💬（2）打卡 在实际的开发中 UI 控件变化那种感觉不太适合中介模式 因为要把所有的控件view 都传到中介类中才可以获取到输入的内容 感觉比较奇怪，就像只是把某个方法单独提取到一个类中一样2020-04-20为梦想而生！ 👍（2） 💬（0）中介模式:调用和被调用之间无法确认彼此，只能到中介询问，比如黑心中间商，如果明确的知道彼此的存在，不会找中间商，中间商有特定的业务能力，才会有价值 观察者模式？就是这种确彼此关系，依赖特定的事件出发或者通知，比如公司通知发工资了，大家才会去看看工资到账了没。观察者模式，不关心具体的业务知识，我只是发了一个通知给大家，或者发了一个特定类型的通知给大家，具体内容，不太关心2020-06-10小文同学 👍（2） 💬（0）eventbus 是不带业务处理的，而且bus不会随着业务复杂而改变，所以属于观察者模式2020-04-20eason2017 👍（2） 💬（1）从定义上看，中介模式是解决一组对象之间的交互，而Evenybus并不是解决这块的，解决的是所有观察者和被观察者之间的交互方式。所以，确切的说，它并不算中介模式。不知回答是否正确，请指点，谢谢2020-04-20MrVito 👍（1） 💬（0）eventBus没有业务逻辑，中介模式是存在业务逻辑处理的，所以eventbus属于观察者而不是中介。2021-12-05鲁鸣 👍（1） 💬（2）中介模式和门面模式感觉有点像呢，难道是差在，一个单向一个多向？2021-02-05</p>`,50)])])}const I=s(t,[["render",i]]);export{_ as __pageData,I as default};
