import{_ as a,o as s,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const h=JSON.parse('{"title":"作业","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/64 - 状态模式：游戏、工作流引擎中常用的状态机是如何实现的？.md","filePath":"books/design-pattern/64 - 状态模式：游戏、工作流引擎中常用的状态机是如何实现的？.md"}'),l={name:"books/design-pattern/64 - 状态模式：游戏、工作流引擎中常用的状态机是如何实现的？.md"};function i(t,n,c,r,o,u){return s(),p("div",null,[...n[0]||(n[0]=[e(`<p>从今天起，我们开始学习状态模式。在实际的软件开发中，状态模式并不是很常用，但是在能够用到的场景里，它可以发挥很大的作用。从这一点上来看，它有点像我们之前讲到的组合模式。</p><p>状态模式一般用来实现状态机，而状态机常用在游戏、工作流引擎等系统开发中。不过，状态机的实现方式有多种，除了状态模式，比较常用的还有分支逻辑法和查表法。今天，我们就详细讲讲这几种实现方式，并且对比一下它们的优劣和应用场景。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="什么是有限状态机" tabindex="-1">什么是有限状态机？ <a class="header-anchor" href="#什么是有限状态机" aria-label="Permalink to &quot;什么是有限状态机？&quot;">&amp;ZeroWidthSpace;</a></h2><p>有限状态机，英文翻译是Finite State Machine，缩写为FSM，简称为状态机。状态机有3个组成部分：状态（State）、事件（Event）、动作（Action）。其中，事件也称为转移条件（Transition Condition）。事件触发状态的转移及动作的执行。不过，动作不是必须的，也可能只转移状态，不执行任何动作。</p><p>对于刚刚给出的状态机的定义，我结合一个具体的例子，来进一步解释一下。</p><p>“超级马里奥”游戏不知道你玩过没有？在游戏中，马里奥可以变身为多种形态，比如小马里奥（Small Mario）、超级马里奥（Super Mario）、火焰马里奥（Fire Mario）、斗篷马里奥（Cape Mario）等等。在不同的游戏情节下，各个形态会互相转化，并相应的增减积分。比如，初始形态是小马里奥，吃了蘑菇之后就会变成超级马里奥，并且增加100积分。</p><p>实际上，马里奥形态的转变就是一个状态机。其中，马里奥的不同形态就是状态机中的“状态”，游戏情节（比如吃了蘑菇）就是状态机中的“事件”，加减积分就是状态机中的“动作”。比如，吃蘑菇这个事件，会触发状态的转移：从小马里奥转移到超级马里奥，以及触发动作的执行（增加100积分）。</p><p>为了方便接下来的讲解，我对游戏背景做了简化，只保留了部分状态和事件。简化之后的状态转移如下图所示：</p><p><img src="https://static001.geekbang.org/resource/image/5a/6c/5aa0310b9b3ea08794cfc2f376c8f96c.jpg?wh=1704%2A1563" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>我们如何编程来实现上面的状态机呢？换句话说，如何将上面的状态转移图翻译成代码呢？</p><p>我写了一个骨架代码，如下所示。其中，obtainMushRoom()、obtainCape()、obtainFireFlower()、meetMonster()这几个函数，能够根据当前的状态和事件，更新状态和增减积分。不过，具体的代码实现我暂时并没有给出。你可以把它当做面试题，试着补全一下，然后再来看我下面的讲解，这样你的收获会更大。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public enum State {</span></span>
<span class="line"><span>  SMALL(0),</span></span>
<span class="line"><span>  SUPER(1),</span></span>
<span class="line"><span>  FIRE(2),</span></span>
<span class="line"><span>  CAPE(3);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private int value;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private State(int value) {</span></span>
<span class="line"><span>    this.value = value;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int getValue() {</span></span>
<span class="line"><span>    return this.value;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class MarioStateMachine {</span></span>
<span class="line"><span>  private int score;</span></span>
<span class="line"><span>  private State currentState;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public MarioStateMachine() {</span></span>
<span class="line"><span>    this.score = 0;</span></span>
<span class="line"><span>    this.currentState = State.SMALL;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainMushRoom() {</span></span>
<span class="line"><span>    //TODO</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainCape() {</span></span>
<span class="line"><span>    //TODO</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainFireFlower() {</span></span>
<span class="line"><span>    //TODO</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void meetMonster() {</span></span>
<span class="line"><span>    //TODO</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int getScore() {</span></span>
<span class="line"><span>    return this.score;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public State getCurrentState() {</span></span>
<span class="line"><span>    return this.currentState;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class ApplicationDemo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    MarioStateMachine mario = new MarioStateMachine();</span></span>
<span class="line"><span>    mario.obtainMushRoom();</span></span>
<span class="line"><span>    int score = mario.getScore();</span></span>
<span class="line"><span>    State state = mario.getCurrentState();</span></span>
<span class="line"><span>    System.out.println(&quot;mario score: &quot; + score + &quot;; state: &quot; + state);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="状态机实现方式一-分支逻辑法" tabindex="-1">状态机实现方式一：分支逻辑法 <a class="header-anchor" href="#状态机实现方式一-分支逻辑法" aria-label="Permalink to &quot;状态机实现方式一：分支逻辑法&quot;">&amp;ZeroWidthSpace;</a></h2><p>对于如何实现状态机，我总结了三种方式。其中，最简单直接的实现方式是，参照状态转移图，将每一个状态转移，原模原样地直译成代码。这样编写的代码会包含大量的if-else或switch-case分支判断逻辑，甚至是嵌套的分支判断逻辑，所以，我把这种方法暂且命名为分支逻辑法。</p><p>按照这个实现思路，我将上面的骨架代码补全一下。补全之后的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class MarioStateMachine {</span></span>
<span class="line"><span>  private int score;</span></span>
<span class="line"><span>  private State currentState;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public MarioStateMachine() {</span></span>
<span class="line"><span>    this.score = 0;</span></span>
<span class="line"><span>    this.currentState = State.SMALL;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainMushRoom() {</span></span>
<span class="line"><span>    if (currentState.equals(State.SMALL)) {</span></span>
<span class="line"><span>      this.currentState = State.SUPER;</span></span>
<span class="line"><span>      this.score += 100;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainCape() {</span></span>
<span class="line"><span>    if (currentState.equals(State.SMALL) || currentState.equals(State.SUPER) ) {</span></span>
<span class="line"><span>      this.currentState = State.CAPE;</span></span>
<span class="line"><span>      this.score += 200;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainFireFlower() {</span></span>
<span class="line"><span>    if (currentState.equals(State.SMALL) || currentState.equals(State.SUPER) ) {</span></span>
<span class="line"><span>      this.currentState = State.FIRE;</span></span>
<span class="line"><span>      this.score += 300;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void meetMonster() {</span></span>
<span class="line"><span>    if (currentState.equals(State.SUPER)) {</span></span>
<span class="line"><span>      this.currentState = State.SMALL;</span></span>
<span class="line"><span>      this.score -= 100;</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (currentState.equals(State.CAPE)) {</span></span>
<span class="line"><span>      this.currentState = State.SMALL;</span></span>
<span class="line"><span>      this.score -= 200;</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (currentState.equals(State.FIRE)) {</span></span>
<span class="line"><span>      this.currentState = State.SMALL;</span></span>
<span class="line"><span>      this.score -= 300;</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int getScore() {</span></span>
<span class="line"><span>    return this.score;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public State getCurrentState() {</span></span>
<span class="line"><span>    return this.currentState;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>对于简单的状态机来说，分支逻辑这种实现方式是可以接受的。但是，对于复杂的状态机来说，这种实现方式极易漏写或者错写某个状态转移。除此之外，代码中充斥着大量的if-else或者switch-case分支判断逻辑，可读性和可维护性都很差。如果哪天修改了状态机中的某个状态转移，我们要在冗长的分支逻辑中找到对应的代码进行修改，很容易改错，引入bug。</p><h2 id="状态机实现方式二-查表法" tabindex="-1">状态机实现方式二：查表法 <a class="header-anchor" href="#状态机实现方式二-查表法" aria-label="Permalink to &quot;状态机实现方式二：查表法&quot;">&amp;ZeroWidthSpace;</a></h2><p>实际上，上面这种实现方法有点类似hard code，对于复杂的状态机来说不适用，而状态机的第二种实现方式查表法，就更加合适了。接下来，我们就一块儿来看下，如何利用查表法来补全骨架代码。</p><p>实际上，除了用状态转移图来表示之外，状态机还可以用二维表来表示，如下所示。在这个二维表中，第一维表示当前状态，第二维表示事件，值表示当前状态经过事件之后，转移到的新状态及其执行的动作。</p><p><img src="https://static001.geekbang.org/resource/image/4f/91/4f4ea3787bd955918578181e18173491.jpg?wh=2263%2A913" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>相对于分支逻辑的实现方式，查表法的代码实现更加清晰，可读性和可维护性更好。当修改状态机时，我们只需要修改transitionTable和actionTable两个二维数组即可。实际上，如果我们把这两个二维数组存储在配置文件中，当需要修改状态机时，我们甚至可以不修改任何代码，只需要修改配置文件就可以了。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public enum Event {</span></span>
<span class="line"><span>  GOT_MUSHROOM(0),</span></span>
<span class="line"><span>  GOT_CAPE(1),</span></span>
<span class="line"><span>  GOT_FIRE(2),</span></span>
<span class="line"><span>  MET_MONSTER(3);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private int value;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private Event(int value) {</span></span>
<span class="line"><span>    this.value = value;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int getValue() {</span></span>
<span class="line"><span>    return this.value;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class MarioStateMachine {</span></span>
<span class="line"><span>  private int score;</span></span>
<span class="line"><span>  private State currentState;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static final State[][] transitionTable = {</span></span>
<span class="line"><span>          {SUPER, CAPE, FIRE, SMALL},</span></span>
<span class="line"><span>          {SUPER, CAPE, FIRE, SMALL},</span></span>
<span class="line"><span>          {CAPE, CAPE, CAPE, SMALL},</span></span>
<span class="line"><span>          {FIRE, FIRE, FIRE, SMALL}</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static final int[][] actionTable = {</span></span>
<span class="line"><span>          {+100, +200, +300, +0},</span></span>
<span class="line"><span>          {+0, +200, +300, -100},</span></span>
<span class="line"><span>          {+0, +0, +0, -200},</span></span>
<span class="line"><span>          {+0, +0, +0, -300}</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public MarioStateMachine() {</span></span>
<span class="line"><span>    this.score = 0;</span></span>
<span class="line"><span>    this.currentState = State.SMALL;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainMushRoom() {</span></span>
<span class="line"><span>    executeEvent(Event.GOT_MUSHROOM);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainCape() {</span></span>
<span class="line"><span>    executeEvent(Event.GOT_CAPE);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainFireFlower() {</span></span>
<span class="line"><span>    executeEvent(Event.GOT_FIRE);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void meetMonster() {</span></span>
<span class="line"><span>    executeEvent(Event.MET_MONSTER);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void executeEvent(Event event) {</span></span>
<span class="line"><span>    int stateValue = currentState.getValue();</span></span>
<span class="line"><span>    int eventValue = event.getValue();</span></span>
<span class="line"><span>    this.currentState = transitionTable[stateValue][eventValue];</span></span>
<span class="line"><span>    this.score += actionTable[stateValue][eventValue];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int getScore() {</span></span>
<span class="line"><span>    return this.score;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public State getCurrentState() {</span></span>
<span class="line"><span>    return this.currentState;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="状态机实现方式三-状态模式" tabindex="-1">状态机实现方式三：状态模式 <a class="header-anchor" href="#状态机实现方式三-状态模式" aria-label="Permalink to &quot;状态机实现方式三：状态模式&quot;">&amp;ZeroWidthSpace;</a></h2><p>在查表法的代码实现中，事件触发的动作只是简单的积分加减，所以，我们用一个int类型的二维数组actionTable就能表示，二维数组中的值表示积分的加减值。但是，如果要执行的动作并非这么简单，而是一系列复杂的逻辑操作（比如加减积分、写数据库，还有可能发送消息通知等等），我们就没法用如此简单的二维数组来表示了。这也就是说，查表法的实现方式有一定局限性。</p><p>虽然分支逻辑的实现方式不存在这个问题，但它又存在前面讲到的其他问题，比如分支判断逻辑较多，导致代码可读性和可维护性不好等。实际上，针对分支逻辑法存在的问题，我们可以使用状态模式来解决。</p><p>状态模式通过将事件触发的状态转移和动作执行，拆分到不同的状态类中，来避免分支判断逻辑。我们还是结合代码来理解这句话。</p><p>利用状态模式，我们来补全MarioStateMachine类，补全后的代码如下所示。</p><p>其中，IMario是状态的接口，定义了所有的事件。SmallMario、SuperMario、CapeMario、FireMario是IMario接口的实现类，分别对应状态机中的4个状态。原来所有的状态转移和动作执行的代码逻辑，都集中在MarioStateMachine类中，现在，这些代码逻辑被分散到了这4个状态类中。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface IMario { //所有状态类的接口</span></span>
<span class="line"><span>  State getName();</span></span>
<span class="line"><span>  //以下是定义的事件</span></span>
<span class="line"><span>  void obtainMushRoom();</span></span>
<span class="line"><span>  void obtainCape();</span></span>
<span class="line"><span>  void obtainFireFlower();</span></span>
<span class="line"><span>  void meetMonster();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class SmallMario implements IMario {</span></span>
<span class="line"><span>  private MarioStateMachine stateMachine;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SmallMario(MarioStateMachine stateMachine) {</span></span>
<span class="line"><span>    this.stateMachine = stateMachine;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public State getName() {</span></span>
<span class="line"><span>    return State.SMALL;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainMushRoom() {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(new SuperMario(stateMachine));</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 100);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainCape() {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(new CapeMario(stateMachine));</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 200);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainFireFlower() {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(new FireMario(stateMachine));</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 300);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void meetMonster() {</span></span>
<span class="line"><span>    // do nothing...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class SuperMario implements IMario {</span></span>
<span class="line"><span>  private MarioStateMachine stateMachine;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SuperMario(MarioStateMachine stateMachine) {</span></span>
<span class="line"><span>    this.stateMachine = stateMachine;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public State getName() {</span></span>
<span class="line"><span>    return State.SUPER;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainMushRoom() {</span></span>
<span class="line"><span>    // do nothing...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainCape() {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(new CapeMario(stateMachine));</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 200);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainFireFlower() {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(new FireMario(stateMachine));</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 300);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void meetMonster() {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(new SmallMario(stateMachine));</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() - 100);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 省略CapeMario、FireMario类...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class MarioStateMachine {</span></span>
<span class="line"><span>  private int score;</span></span>
<span class="line"><span>  private IMario currentState; // 不再使用枚举来表示状态</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public MarioStateMachine() {</span></span>
<span class="line"><span>    this.score = 0;</span></span>
<span class="line"><span>    this.currentState = new SmallMario(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainMushRoom() {</span></span>
<span class="line"><span>    this.currentState.obtainMushRoom();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainCape() {</span></span>
<span class="line"><span>    this.currentState.obtainCape();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainFireFlower() {</span></span>
<span class="line"><span>    this.currentState.obtainFireFlower();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void meetMonster() {</span></span>
<span class="line"><span>    this.currentState.meetMonster();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int getScore() {</span></span>
<span class="line"><span>    return this.score;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public State getCurrentState() {</span></span>
<span class="line"><span>    return this.currentState.getName();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setScore(int score) {</span></span>
<span class="line"><span>    this.score = score;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setCurrentState(IMario currentState) {</span></span>
<span class="line"><span>    this.currentState = currentState;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>上面的代码实现不难看懂，我只强调其中的一点，即MarioStateMachine和各个状态类之间是双向依赖关系。MarioStateMachine依赖各个状态类是理所当然的，但是，反过来，各个状态类为什么要依赖MarioStateMachine呢？这是因为，各个状态类需要更新MarioStateMachine中的两个变量，score和currentState。</p><p>实际上，上面的代码还可以继续优化，我们可以将状态类设计成单例，毕竟状态类中不包含任何成员变量。但是，当将状态类设计成单例之后，我们就无法通过构造函数来传递MarioStateMachine了，而状态类又要依赖MarioStateMachine，那该如何解决这个问题呢？</p><p>实际上，在<a href="https://time.geekbang.org/column/article/194068" target="_blank" rel="noreferrer">第42讲</a>单例模式的讲解中，我们提到过几种解决方法，你可以回过头去再查看一下。在这里，我们可以通过函数参数将MarioStateMachine传递进状态类。根据这个设计思路，我们对上面的代码进行重构。重构之后的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface IMario {</span></span>
<span class="line"><span>  State getName();</span></span>
<span class="line"><span>  void obtainMushRoom(MarioStateMachine stateMachine);</span></span>
<span class="line"><span>  void obtainCape(MarioStateMachine stateMachine);</span></span>
<span class="line"><span>  void obtainFireFlower(MarioStateMachine stateMachine);</span></span>
<span class="line"><span>  void meetMonster(MarioStateMachine stateMachine);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class SmallMario implements IMario {</span></span>
<span class="line"><span>  private static final SmallMario instance = new SmallMario();</span></span>
<span class="line"><span>  private SmallMario() {}</span></span>
<span class="line"><span>  public static SmallMario getInstance() {</span></span>
<span class="line"><span>    return instance;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public State getName() {</span></span>
<span class="line"><span>    return State.SMALL;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainMushRoom(MarioStateMachine stateMachine) {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(SuperMario.getInstance());</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 100);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainCape(MarioStateMachine stateMachine) {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(CapeMario.getInstance());</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 200);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void obtainFireFlower(MarioStateMachine stateMachine) {</span></span>
<span class="line"><span>    stateMachine.setCurrentState(FireMario.getInstance());</span></span>
<span class="line"><span>    stateMachine.setScore(stateMachine.getScore() + 300);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void meetMonster(MarioStateMachine stateMachine) {</span></span>
<span class="line"><span>    // do nothing...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 省略SuperMario、CapeMario、FireMario类...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class MarioStateMachine {</span></span>
<span class="line"><span>  private int score;</span></span>
<span class="line"><span>  private IMario currentState;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public MarioStateMachine() {</span></span>
<span class="line"><span>    this.score = 0;</span></span>
<span class="line"><span>    this.currentState = SmallMario.getInstance();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainMushRoom() {</span></span>
<span class="line"><span>    this.currentState.obtainMushRoom(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainCape() {</span></span>
<span class="line"><span>    this.currentState.obtainCape(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void obtainFireFlower() {</span></span>
<span class="line"><span>    this.currentState.obtainFireFlower(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void meetMonster() {</span></span>
<span class="line"><span>    this.currentState.meetMonster(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int getScore() {</span></span>
<span class="line"><span>    return this.score;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public State getCurrentState() {</span></span>
<span class="line"><span>    return this.currentState.getName();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setScore(int score) {</span></span>
<span class="line"><span>    this.score = score;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setCurrentState(IMario currentState) {</span></span>
<span class="line"><span>    this.currentState = currentState;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，像游戏这种比较复杂的状态机，包含的状态比较多，我优先推荐使用查表法，而状态模式会引入非常多的状态类，会导致代码比较难维护。相反，像电商下单、外卖下单这种类型的状态机，它们的状态并不多，状态转移也比较简单，但事件触发执行的动作包含的业务逻辑可能会比较复杂，所以，更加推荐使用状态模式来实现。</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>今天我们讲解了状态模式。虽然网上有各种状态模式的定义，但是你只要记住状态模式是状态机的一种实现方式即可。状态机又叫有限状态机，它有3个部分组成：状态、事件、动作。其中，事件也称为转移条件。事件触发状态的转移及动作的执行。不过，动作不是必须的，也可能只转移状态，不执行任何动作。</p><p>针对状态机，今天我们总结了三种实现方式。</p><p>第一种实现方式叫分支逻辑法。利用if-else或者switch-case分支逻辑，参照状态转移图，将每一个状态转移原模原样地直译成代码。对于简单的状态机来说，这种实现方式最简单、最直接，是首选。</p><p>第二种实现方式叫查表法。对于状态很多、状态转移比较复杂的状态机来说，查表法比较合适。通过二维数组来表示状态转移图，能极大地提高代码的可读性和可维护性。</p><p>第三种实现方式叫状态模式。对于状态并不多、状态转移也比较简单，但事件触发执行的动作包含的业务逻辑可能比较复杂的状态机来说，我们首选这种实现方式。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>状态模式的代码实现还存在一些问题，比如，状态接口中定义了所有的事件函数，这就导致，即便某个状态类并不需要支持其中的某个或者某些事件，但也要实现所有的事件函数。不仅如此，添加一个事件到状态接口，所有的状态类都要做相应的修改。针对这些问题，你有什么解决方法吗？</p><p>欢迎留言和我分享你的想法。如果有收获，欢迎你把这篇文章分享给你的朋友。 精选留言（15） DFighting 👍（30） 💬（5）不太赞同老师的这种抽象方式，状态机中的每个状态应该具有事件、触发条件、转移（方法）列表，每一个应该都可以抽象为一个接口或者泛型类，状态机作为一个单例这个没问题，但是状态机应该只是作为一个状态的注册工厂，里面具有的应该是多种状态，状态间的流转才是状态机最重要的功能抽象。score放在状态和状态机中都不合适，这应该是状态机操纵的一个对象/资源，应该单独抽象出来，在状态间流转2020-11-21进击的巨人 👍（3） 💬（2）感觉状态模式就是一个策略模式2020-11-27吃饭睡觉打酱油 👍（1） 💬（1）老师，在使用状态机的时候，初始状态应该是可以支持初始化的吧。2020-06-20Geek_78eadb 👍（0） 💬（2）课后题：</p><ol><li>使用抽象工厂模式实现 Action 类：即根据不同的状态实现 ObtainMushRoom 等动作类，比如 ObtainMushRoom 的初始化需要传入目前状态和目前分数， ObtainMushRoom 可以利用状态机的查表法进行状态转移和其它动作 2020-11-28打工人233号 👍（0） 💬（1）如果一种状态转移对应多种状态如何处理呢？2020-11-13慕枫技术笔记 👍（0） 💬（3）查表法在状态新增的情况下怎么做到不修改代码的？2020-07-29pippin 👍（0） 💬（2）查表法的这个数组有问题吧，transitionTable[0][0]应该是SMALL吧。这里应该是写错了吧。private static final State[][] transitionTable = { {SUPER, CAPE, FIRE, SMALL}, {SUPER, CAPE, FIRE, SMALL}, {CAPE, CAPE, CAPE, SMALL}, {FIRE, FIRE, FIRE, SMALL} };2020-04-13张先生丶 👍（153） 💬（6）关于课堂讨论，可以在接口和实现类中间加一层抽象类解决此问题，抽象类实现状态接口，状态类继承抽象类，只需要重写需要的方法即可2020-03-30Darren 👍（58） 💬（0）Java中Spring也有有限状态机的框架 ：https://github.com/spring-projects/spring-statemachine2020-04-14下雨天 👍（34） 💬（2）课后题 最小接口原则</li></ol><p>具体做法:状态类只关心与自己相关的接口，将状态接口中定义的事件函数按事件分类，拆分到不同接口中，通过这些新接口的组合重新实现状态类即可！2020-03-30小晏子 👍（25） 💬（0）课后思考：要解决这个问题可以有两种方式1. 直接使用抽象类替代接口，抽象类中对每个时间有个默认的实现，比如抛出unimplemented exception，这样子类要使用的话必须自己实现。2. 就是还是使用接口定义事件，但是额外创建一个抽象类实现这个接口，然后具体的状态实现类继承这个抽象类，这种方式好处在于可扩展性强，可以处理将来有不相关的事件策略加入进来的情况。2020-03-30Amon Tin 👍（18） 💬（5）状态和事件都可能随需求增加，可以利用callback的方式，将这类组合逻辑注册到对应状态类。代码实现如下： /**</p><ul><li>事件枚举 */ public enum Event { A,B,C }</li></ul><p>/**</p><ul><li><p>事件回调</p></li><li><p>Created on 2021-06-24 */ public interface IEventCallback {</p><p>void onEvent(StateMachine sm);</p></li></ul><p>}</p><p>/**</p><ul><li><p>状态抽象类 */ public abstract class State {</p><p>protected String name;</p><p>protected Map&lt;Event, IEventCallback&gt; events = new HashMap&lt;&gt;();</p><p>public final void triggerEvent(Event e, StateMachine sm) { IEventCallback call = events.get(e); if (call != null) { call.onEvent(sm); } } }</p></li></ul><p>//S1状态类 public class S1State extends State { private static final S1State instance = new S1State();</p><pre><code>Map&amp;lt;Event, IEventCallback&amp;gt; events = new HashMap&amp;lt;&amp;gt;();

public static S1State getInstance() {
    return instance;
}

&amp;#47;&amp;#47;S1状态只关心A、B事件
private S1State() {
    name = &amp;quot;S1&amp;quot;;
    events.put(Event.A, sm -&amp;gt; {
        sm.currentState = S2State.getInstance();
        sm.score++;
    });
    events.put(Event.B, sm -&amp;gt; {
        sm.score *= 10;
    });
}
</code></pre><p>}</p><p>//S2状态类 public class S2State extends State { private static final S2State instance = new S2State();</p><pre><code>public static S2State getInstance() {
    return instance;
}

&amp;#47;&amp;#47;S2状态只关心B、C事件
private S2State() {
    name = &amp;quot;S2&amp;quot;;
    events.put(Event.B, sm -&amp;gt; {
        sm.score = 0;
    });
    events.put(Event.C, sm -&amp;gt; {
        sm.score--;
        sm.currentState = S1State.getInstance();
    });
}
</code></pre><p>}</p><p>/**</p><ul><li><p>状态机核心类，状态流转的入口 */ public class StateMachine { int score; State currentState;</p><p>public StateMachine() { score = 0; currentState = S1State.getInstance(); }</p><p>public void triggerAB() { currentState.triggerEvent(Event.A, this); currentState.triggerEvent(Event.B, this); }</p><p>public void triggerBC() { currentState.triggerEvent(Event.B, this); currentState.triggerEvent(Event.C, this); } }</p></li></ul><p>2021-06-24李小四 👍（13） 💬（0）设计模式_63:</p><h1 id="作业" tabindex="-1">作业 <a class="header-anchor" href="#作业" aria-label="Permalink to &quot;作业&quot;">&amp;ZeroWidthSpace;</a></h1><p>组合优于继承</p><ul><li><p>即使不需要，也必须实现所有的函数 &gt;&gt;&gt; 最小接口原则，每个函数拆分到单独的接口中</p></li><li><p>新增事件要修改所有状态实现 &gt;&gt;&gt; 观察者模式，用注解动态地把事件函数注册到观察队列中。</p></li></ul><h1 id="感想" tabindex="-1">感想 <a class="header-anchor" href="#感想" aria-label="Permalink to &quot;感想&quot;">&amp;ZeroWidthSpace;</a></h1><p>看到状态接口类中直接使用了<code>obtainMushRoom()</code>这样具体的事件函数，感觉很不舒服。就像结尾的讨论，所有的状态类必须实现所有事件函数，新增一种事件状态接口和实现都要改。。。2020-03-30进击的前端er 👍（12） 💬（1）我有个前端组件，很适合这个模式，我正在尝试重构，发现代码缩减量可能达到50%以上，而且更容易理解2020-04-03J.D.Chi 👍（12） 💬（0）Flutter里引入了Bloc框架后，就是非常典型的状态模式（或是有限状态机）。https://bloclibrary.dev/#/coreconcepts2020-03-30</p>`,68)])])}const M=a(l,[["render",i]]);export{h as __pageData,M as default};
