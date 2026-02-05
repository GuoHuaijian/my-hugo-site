import{_ as n,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const m=JSON.parse('{"title":"作业","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/53 - 组合模式：如何设计实现支持递归遍历的文件系统目录树结构？.md","filePath":"books/design-pattern/53 - 组合模式：如何设计实现支持递归遍历的文件系统目录树结构？.md"}'),l={name:"books/design-pattern/53 - 组合模式：如何设计实现支持递归遍历的文件系统目录树结构？.md"};function i(t,s,c,o,r,d){return a(),p("div",null,[...s[0]||(s[0]=[e(`<p>结构型设计模式就快要讲完了，还剩下两个不那么常用的：组合模式和享元模式。今天，我们来讲一下<strong>组合模式</strong>（Composite Design Pattern）。</p><p>组合模式跟我们之前讲的面向对象设计中的“组合关系（通过组合来组装两个类）”，完全是两码事。这里讲的“组合模式”，主要是用来处理树形结构数据。这里的“数据”，你可以简单理解为一组对象集合，待会我们会详细讲解。</p><p>正因为其应用场景的特殊性，数据必须能表示成树形结构，这也导致了这种模式在实际的项目开发中并不那么常用。但是，一旦数据满足树形结构，应用这种模式就能发挥很大的作用，能让代码变得非常简洁。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="组合模式的原理与实现" tabindex="-1">组合模式的原理与实现 <a class="header-anchor" href="#组合模式的原理与实现" aria-label="Permalink to &quot;组合模式的原理与实现&quot;">&amp;ZeroWidthSpace;</a></h2><p>在GoF的《设计模式》一书中，组合模式是这样定义的：</p><blockquote><p>Compose objects into tree structure to represent part-whole hierarchies.Composite lets client treat individual objects and compositions of objects uniformly.</p></blockquote><p>翻译成中文就是：将一组对象组织（Compose）成树形结构，以表示一种“部分-整体”的层次结构。组合让客户端（在很多设计模式书籍中，“客户端”代指代码的使用者。）可以统一单个对象和组合对象的处理逻辑。</p><p>接下来，对于组合模式，我举个例子来给你解释一下。</p><p>假设我们有这样一个需求：设计一个类来表示文件系统中的目录，能方便地实现下面这些功能：</p><ul><li>动态地添加、删除某个目录下的子目录或文件；</li><li>统计指定目录下的文件个数；</li><li>统计指定目录下的文件总大小。</li></ul><p>我这里给出了这个类的骨架代码，如下所示。其中的核心逻辑并未实现，你可以试着自己去补充完整，再来看我的讲解。在下面的代码实现中，我们把文件和目录统一用FileSystemNode类来表示，并且通过isFile属性来区分。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class FileSystemNode {</span></span>
<span class="line"><span>  private String path;</span></span>
<span class="line"><span>  private boolean isFile;</span></span>
<span class="line"><span>  private List&lt;FileSystemNode&gt; subNodes = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public FileSystemNode(String path, boolean isFile) {</span></span>
<span class="line"><span>    this.path = path;</span></span>
<span class="line"><span>    this.isFile = isFile;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public int countNumOfFiles() {</span></span>
<span class="line"><span>    // TODO:...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public long countSizeOfFiles() {</span></span>
<span class="line"><span>    // TODO:...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String getPath() {</span></span>
<span class="line"><span>    return path;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addSubNode(FileSystemNode fileOrDir) {</span></span>
<span class="line"><span>    subNodes.add(fileOrDir);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void removeSubNode(FileSystemNode fileOrDir) {</span></span>
<span class="line"><span>    int size = subNodes.size();</span></span>
<span class="line"><span>    int i = 0;</span></span>
<span class="line"><span>    for (; i &lt; size; ++i) {</span></span>
<span class="line"><span>      if (subNodes.get(i).getPath().equalsIgnoreCase(fileOrDir.getPath())) {</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (i &lt; size) {</span></span>
<span class="line"><span>      subNodes.remove(i);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，如果你看过我的《数据结构与算法之美》专栏，想要补全其中的countNumOfFiles()和countSizeOfFiles()这两个函数，并不是件难事，实际上这就是树上的递归遍历算法。对于文件，我们直接返回文件的个数（返回1）或大小。对于目录，我们遍历目录中每个子目录或者文件，递归计算它们的个数或大小，然后求和，就是这个目录下的文件个数和文件大小。</p><p>我把两个函数的代码实现贴在下面了，你可以对照着看一下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  public int countNumOfFiles() {</span></span>
<span class="line"><span>    if (isFile) {</span></span>
<span class="line"><span>      return 1;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    int numOfFiles = 0;</span></span>
<span class="line"><span>    for (FileSystemNode fileOrDir : subNodes) {</span></span>
<span class="line"><span>      numOfFiles += fileOrDir.countNumOfFiles();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return numOfFiles;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public long countSizeOfFiles() {</span></span>
<span class="line"><span>    if (isFile) {</span></span>
<span class="line"><span>      File file = new File(path);</span></span>
<span class="line"><span>      if (!file.exists()) return 0;</span></span>
<span class="line"><span>      return file.length();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    long sizeofFiles = 0;</span></span>
<span class="line"><span>    for (FileSystemNode fileOrDir : subNodes) {</span></span>
<span class="line"><span>      sizeofFiles += fileOrDir.countSizeOfFiles();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return sizeofFiles;</span></span>
<span class="line"><span>  }</span></span></code></pre></div><p>单纯从功能实现角度来说，上面的代码没有问题，已经实现了我们想要的功能。但是，如果我们开发的是一个大型系统，从扩展性（文件或目录可能会对应不同的操作）、业务建模（文件和目录从业务上是两个概念）、代码的可读性（文件和目录区分对待更加符合人们对业务的认知）的角度来说，我们最好对文件和目录进行区分设计，定义为File和Directory两个类。</p><p>按照这个设计思路，我们对代码进行重构。重构之后的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class FileSystemNode {</span></span>
<span class="line"><span>  protected String path;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public FileSystemNode(String path) {</span></span>
<span class="line"><span>    this.path = path;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public abstract int countNumOfFiles();</span></span>
<span class="line"><span>  public abstract long countSizeOfFiles();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String getPath() {</span></span>
<span class="line"><span>    return path;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class File extends FileSystemNode {</span></span>
<span class="line"><span>  public File(String path) {</span></span>
<span class="line"><span>    super(path);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public int countNumOfFiles() {</span></span>
<span class="line"><span>    return 1;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public long countSizeOfFiles() {</span></span>
<span class="line"><span>    java.io.File file = new java.io.File(path);</span></span>
<span class="line"><span>    if (!file.exists()) return 0;</span></span>
<span class="line"><span>    return file.length();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class Directory extends FileSystemNode {</span></span>
<span class="line"><span>  private List&lt;FileSystemNode&gt; subNodes = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Directory(String path) {</span></span>
<span class="line"><span>    super(path);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public int countNumOfFiles() {</span></span>
<span class="line"><span>    int numOfFiles = 0;</span></span>
<span class="line"><span>    for (FileSystemNode fileOrDir : subNodes) {</span></span>
<span class="line"><span>      numOfFiles += fileOrDir.countNumOfFiles();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return numOfFiles;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public long countSizeOfFiles() {</span></span>
<span class="line"><span>    long sizeofFiles = 0;</span></span>
<span class="line"><span>    for (FileSystemNode fileOrDir : subNodes) {</span></span>
<span class="line"><span>      sizeofFiles += fileOrDir.countSizeOfFiles();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return sizeofFiles;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addSubNode(FileSystemNode fileOrDir) {</span></span>
<span class="line"><span>    subNodes.add(fileOrDir);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void removeSubNode(FileSystemNode fileOrDir) {</span></span>
<span class="line"><span>    int size = subNodes.size();</span></span>
<span class="line"><span>    int i = 0;</span></span>
<span class="line"><span>    for (; i &lt; size; ++i) {</span></span>
<span class="line"><span>      if (subNodes.get(i).getPath().equalsIgnoreCase(fileOrDir.getPath())) {</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (i &lt; size) {</span></span>
<span class="line"><span>      subNodes.remove(i);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>文件和目录类都设计好了，我们来看，如何用它们来表示一个文件系统中的目录树结构。具体的代码示例如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Demo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * /</span></span>
<span class="line"><span>     * /wz/</span></span>
<span class="line"><span>     * /wz/a.txt</span></span>
<span class="line"><span>     * /wz/b.txt</span></span>
<span class="line"><span>     * /wz/movies/</span></span>
<span class="line"><span>     * /wz/movies/c.avi</span></span>
<span class="line"><span>     * /xzg/</span></span>
<span class="line"><span>     * /xzg/docs/</span></span>
<span class="line"><span>     * /xzg/docs/d.txt</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    Directory fileSystemTree = new Directory(&quot;/&quot;);</span></span>
<span class="line"><span>    Directory node_wz = new Directory(&quot;/wz/&quot;);</span></span>
<span class="line"><span>    Directory node_xzg = new Directory(&quot;/xzg/&quot;);</span></span>
<span class="line"><span>    fileSystemTree.addSubNode(node_wz);</span></span>
<span class="line"><span>    fileSystemTree.addSubNode(node_xzg);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    File node_wz_a = new File(&quot;/wz/a.txt&quot;);</span></span>
<span class="line"><span>    File node_wz_b = new File(&quot;/wz/b.txt&quot;);</span></span>
<span class="line"><span>    Directory node_wz_movies = new Directory(&quot;/wz/movies/&quot;);</span></span>
<span class="line"><span>    node_wz.addSubNode(node_wz_a);</span></span>
<span class="line"><span>    node_wz.addSubNode(node_wz_b);</span></span>
<span class="line"><span>    node_wz.addSubNode(node_wz_movies);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    File node_wz_movies_c = new File(&quot;/wz/movies/c.avi&quot;);</span></span>
<span class="line"><span>    node_wz_movies.addSubNode(node_wz_movies_c);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    Directory node_xzg_docs = new Directory(&quot;/xzg/docs/&quot;);</span></span>
<span class="line"><span>    node_xzg.addSubNode(node_xzg_docs);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    File node_xzg_docs_d = new File(&quot;/xzg/docs/d.txt&quot;);</span></span>
<span class="line"><span>    node_xzg_docs.addSubNode(node_xzg_docs_d);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    System.out.println(&quot;/ files num:&quot; + fileSystemTree.countNumOfFiles());</span></span>
<span class="line"><span>    System.out.println(&quot;/wz/ files num:&quot; + node_wz.countNumOfFiles());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们对照着这个例子，再重新看一下组合模式的定义：“将一组对象（文件和目录）组织成树形结构，以表示一种‘部分-整体’的层次结构（目录与子目录的嵌套结构）。组合模式让客户端可以统一单个对象（文件）和组合对象（目录）的处理逻辑（递归遍历）。”</p><p>实际上，刚才讲的这种组合模式的设计思路，与其说是一种设计模式，倒不如说是对业务场景的一种数据结构和算法的抽象。其中，数据可以表示成树这种数据结构，业务需求可以通过在树上的递归遍历算法来实现。</p><h2 id="组合模式的应用场景举例" tabindex="-1">组合模式的应用场景举例 <a class="header-anchor" href="#组合模式的应用场景举例" aria-label="Permalink to &quot;组合模式的应用场景举例&quot;">&amp;ZeroWidthSpace;</a></h2><p>刚刚我们讲了文件系统的例子，对于组合模式，我这里再举一个例子。搞懂了这两个例子，你基本上就算掌握了组合模式。在实际的项目中，遇到类似的可以表示成树形结构的业务场景，你只要“照葫芦画瓢”去设计就可以了。</p><p>假设我们在开发一个OA系统（办公自动化系统）。公司的组织结构包含部门和员工两种数据类型。其中，部门又可以包含子部门和员工。在数据库中的表结构如下所示：</p><p><img src="https://static001.geekbang.org/resource/image/5b/8b/5b19dc0c296f728328794eab1f16a38b.jpg?wh=1863%2A1023" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>我们希望在内存中构建整个公司的人员架构图（部门、子部门、员工的隶属关系），并且提供接口计算出部门的薪资成本（隶属于这个部门的所有员工的薪资和）。</p><p>部门包含子部门和员工，这是一种嵌套结构，可以表示成树这种数据结构。计算每个部门的薪资开支这样一个需求，也可以通过在树上的遍历算法来实现。所以，从这个角度来看，这个应用场景可以使用组合模式来设计和实现。</p><p>这个例子的代码结构跟上一个例子的很相似，代码实现我直接贴在了下面，你可以对比着看一下。其中，HumanResource是部门类（Department）和员工类（Employee）抽象出来的父类，为的是能统一薪资的处理逻辑。Demo中的代码负责从数据库中读取数据并在内存中构建组织架构图。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class HumanResource {</span></span>
<span class="line"><span>  protected long id;</span></span>
<span class="line"><span>  protected double salary;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public HumanResource(long id) {</span></span>
<span class="line"><span>    this.id = id;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public long getId() {</span></span>
<span class="line"><span>    return id;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public abstract double calculateSalary();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class Employee extends HumanResource {</span></span>
<span class="line"><span>  public Employee(long id, double salary) {</span></span>
<span class="line"><span>    super(id);</span></span>
<span class="line"><span>    this.salary = salary;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public double calculateSalary() {</span></span>
<span class="line"><span>    return salary;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class Department extends HumanResource {</span></span>
<span class="line"><span>  private List&lt;HumanResource&gt; subNodes = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Department(long id) {</span></span>
<span class="line"><span>    super(id);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public double calculateSalary() {</span></span>
<span class="line"><span>    double totalSalary = 0;</span></span>
<span class="line"><span>    for (HumanResource hr : subNodes) {</span></span>
<span class="line"><span>      totalSalary += hr.calculateSalary();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.salary = totalSalary;</span></span>
<span class="line"><span>    return totalSalary;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addSubNode(HumanResource hr) {</span></span>
<span class="line"><span>    subNodes.add(hr);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 构建组织架构的代码</span></span>
<span class="line"><span>public class Demo {</span></span>
<span class="line"><span>  private static final long ORGANIZATION_ROOT_ID = 1001;</span></span>
<span class="line"><span>  private DepartmentRepo departmentRepo; // 依赖注入</span></span>
<span class="line"><span>  private EmployeeRepo employeeRepo; // 依赖注入</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void buildOrganization() {</span></span>
<span class="line"><span>    Department rootDepartment = new Department(ORGANIZATION_ROOT_ID);</span></span>
<span class="line"><span>    buildOrganization(rootDepartment);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void buildOrganization(Department department) {</span></span>
<span class="line"><span>    List&lt;Long&gt; subDepartmentIds = departmentRepo.getSubDepartmentIds(department.getId());</span></span>
<span class="line"><span>    for (Long subDepartmentId : subDepartmentIds) {</span></span>
<span class="line"><span>      Department subDepartment = new Department(subDepartmentId);</span></span>
<span class="line"><span>      department.addSubNode(subDepartment);</span></span>
<span class="line"><span>      buildOrganization(subDepartment);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    List&lt;Long&gt; employeeIds = employeeRepo.getDepartmentEmployeeIds(department.getId());</span></span>
<span class="line"><span>    for (Long employeeId : employeeIds) {</span></span>
<span class="line"><span>      double salary = employeeRepo.getEmployeeSalary(employeeId);</span></span>
<span class="line"><span>      department.addSubNode(new Employee(employeeId, salary));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们再拿组合模式的定义跟这个例子对照一下：“将一组对象（员工和部门）组织成树形结构，以表示一种‘部分-整体’的层次结构（部门与子部门的嵌套结构）。组合模式让客户端可以统一单个对象（员工）和组合对象（部门）的处理逻辑（递归遍历）。”</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>组合模式的设计思路，与其说是一种设计模式，倒不如说是对业务场景的一种数据结构和算法的抽象。其中，数据可以表示成树这种数据结构，业务需求可以通过在树上的递归遍历算法来实现。</p><p>组合模式，将一组对象组织成树形结构，将单个对象和组合对象都看做树中的节点，以统一处理逻辑，并且它利用树形结构的特点，递归地处理每个子树，依次简化代码实现。使用组合模式的前提在于，你的业务场景必须能够表示成树形结构。所以，组合模式的应用场景也比较局限，它并不是一种很常用的设计模式。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>在文件系统那个例子中，countNumOfFiles()和countSizeOfFiles()这两个函数实现的效率并不高，因为每次调用它们的时候，都要重新遍历一遍子树。有没有什么办法可以提高这两个函数的执行效率呢（注意：文件系统还会涉及频繁的删除、添加文件操作，也就是对应Directory类中的addSubNode()和removeSubNode()函数）？</p><p>欢迎留言和我分享你的想法。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） 墨鱼 👍（4） 💬（1）组合模式： 当数据结构呈现树状，可以使用递归处理每一处节点的数据。</p><p>感觉名字有点迷惑，应该叫做树状模式2020-04-18Laughing 👍（1） 💬（1）把子数抽象成一类对象，并且增加数量等属性，这样就避免了多次的迭代。2020-11-20下雨天 👍（133） 💬（7）课堂讨论： 实质是&quot;递归代码要警惕重复计算&quot;问题！可以用散列表存储每个(path,size)，通过路径直接返回对应的size,删除或者添加的时候，维护这个size即可。</p><p>参看争哥《数据结构与算法之美》第十讲：为了避免重复计算，我们可以通过一个数据结构（比如散列表）来保存已经求解过的 f(k)。当递归调用到 f(k) 时，先看下是否已经求解过了。如果是，则直接从散列表中取值返回，不需要重复计算，这样就能避免刚讲的问题了。2020-03-06八戒 👍（59） 💬（2）课堂讨论 可以把计算文件数量和大小的逻辑抽出来，定义两个成员变量文件大小和文件数量； 在每次addSubNode()和removeSubNode()的时候去调用计算逻辑，更新文件大小和文件数量； 这样在调用countNumOfFiles和countSizeOfFiles的时候直接返回我们的成员变量就好了； 当然如果这么做的话，那countNumOfFiles和countSizeOfFiles这两个方法的名字也不合适了，应该叫numOfFiles和sizeOfFiles2020-03-04业余爱好者 👍（48） 💬（0）tomcat的多层容器也是使用了组合模式。只需要调用最外层容器Server的init方法，整个程序就起来了。客户端只需要处理最外层的容器，就把整个系统拎起来了。</p><p>组合模式使用了树形的数据结构以及递归算法，这里也可以看出知识的相通性（算法和设计模式）。想到这方面的另外一个例子就是责任链模式，责任链模式就是使用了数据结构中的链表和递归算法。2020-03-25test 👍（25） 💬（0）把计算逻辑放在addSubNode和removeSubNode里面2020-03-04辣么大 👍（21） 💬（6）我想的一个思路是：每个节点新增一个field：parent，父链接指向它的上层节点，同时增加字段numOfFiles，sizeOfFiles。对于File节点：numOfFiles=1， sizeOfFiles=它自己的大小。对于Directory节点，是其子节点的和。删除、增加subnode时，只需要从下向上遍历一个节点的parent link，修改numOfFiles和sizeOfFiles。这样的话删除、新增subnode修改值的复杂度为树的深度，查询返回numOfFiles和sizeOfFiles复杂度为O(1)。2020-03-04南山 👍（17） 💬（4）真的是没有最适合，只有更适合 实际工作中碰到过一个场景需要抽象出条件和表达式来解决的。一个表达式可以拥有N个子表达式以及条件，这个表达式还有一个属性and、or来决定所有子表达式/条件是全部成立还是只要有一个成立，这个表达式就成立。 当时做的时候真是各种绕，这种场景真的非常适合组合模式，能大大简化代码的实现难度，提高可读、可维护性2020-03-04李小四 👍（13） 💬（0）设计模式_53:</p><h1 id="作业" tabindex="-1">作业 <a class="header-anchor" href="#作业" aria-label="Permalink to &quot;作业&quot;">&amp;ZeroWidthSpace;</a></h1><p>可以做文件数和文件大小的缓存，更新缓存时要考虑实时性与性能的平衡。</p><h1 id="感想" tabindex="-1">感想 <a class="header-anchor" href="#感想" aria-label="Permalink to &quot;感想&quot;">&amp;ZeroWidthSpace;</a></h1><p>今天的内容，联想到Linux“一切皆文件”的设计思想。 好像天然就觉得应该这样做，但是，还能怎么做呢？</p><p>还能。。。把Directory和File设计成不想关的两个类，这样又有什么问题呢？ 不过是Directory维护两个List(file/directory),维护两套方法，add/removeFile,add/removeDirectory。。。这当然没有以前简洁，但也没有特别复杂吧。。。</p><p>后面又想到，如果File还分很多类型: TxtFile/ImageFile/ExeFile/...,Directory(这里是广义的集合)也可以有多种: LinearDirectory/GridDirectory/CircleDirectory/...</p><p>这样会不会导致处理逻辑的爆炸，你会说：当然不会啊，所有的类型最终会抽象为File和Directory两种类型啊！</p><p>既然都抽象了，何不彻底一点，把File和Directory也抽象为一种类型: Everything is a File.2020-03-15webmin 👍（6） 💬（4）//每一级目录保存本级目录中的文件数和文件Size，Count时递归统计所有子目录 public class Directory extends FileSystemNode { private List&lt;FileSystemNode&gt; subNodes = new ArrayList&lt;&gt;(); private Map&lt;String,FileSystemNode&gt; subDirectory = new HashMap&lt;&gt;(); private int _numOfFiles = 0; private long _sizeofFiles = 0;</p><pre><code>public Directory(String path) {
    super(path);
}

@Override
public int countNumOfFiles() {
    int numOfFiles = 0;
    for (FileSystemNode fileOrDir : subDirectory.values()) {
        numOfFiles += fileOrDir.countNumOfFiles();
    }
    return numOfFiles + _numOfFiles;
}

@Override
public long countSizeOfFiles() {
    long sizeofFiles = 0;
    for (FileSystemNode fileOrDir : subDirectory.values()) {
        sizeofFiles += fileOrDir.countSizeOfFiles();
    }
    return sizeofFiles + _sizeofFiles;
}

public void addSubNode(FileSystemNode fileOrDir) {
    if(fileOrDir instanceof Directory) {
        subDirectory.put(fileOrDir.getPath(),fileOrDir);
    } else {
        _numOfFiles++;
        _sizeofFiles += fileOrDir.countSizeOfFiles();
        subNodes.add(fileOrDir);
    }
}

public void removeSubNode(FileSystemNode fileOrDir) {
    if(fileOrDir instanceof Directory) {
        subDirectory.remove(fileOrDir.getPath());
        return;
    }
    int size = subNodes.size();
    int i = 0;
    for (; i &amp;lt; size; ++i) {
        if (subNodes.get(i).getPath().equalsIgnoreCase(fileOrDir.getPath())) {
            break;
        }
    }
    if (i &amp;lt; size) {
        subNodes.remove(i);
        _numOfFiles--;
        _sizeofFiles -= fileOrDir.countSizeOfFiles();
    }
}
</code></pre><p>}2020-03-05唐朝农民 👍（6） 💬（3）那个算薪资的在实际生产中也不回这么用吧，虽然使用设计模式提高代码的可扩展性，但是需要循环，递归调用数据仓储层，如果员工一多肯定造成很大的性能影响，这也是我经常纠结的地方，有个时候为了减少访问数据库的次数，而不得不放弃更优雅的代码，请问这种情况该怎么破？2020-03-04Heaven 👍（5） 💬（0）1.查询多而修改少的话那么我们可以维持三个属性,分别是数量 大小 父节点,那么在修改的时候,先递归向下的修改,修改到底(例如删除的情况),并且依次返回修改的大小和数量,在递归向上的时候,依次修改父类的数量和大小,直到没有父类,这样无论查询那一个,都能快速查找到 2.修改多而查询少的情况,则简单些,只需要定义两个属性,数量和大小,查找的时候,递归统计所有的子目录这个信息即可2020-03-11相逢是缘 👍（5） 💬（0）一、定义（理解）： 将一组对象组织（Compose）成树形结构，以表示一种“部分 - 整体”的层次结构。组合让客户端（在很多设计模式书籍中，“客户端”代指代码的使用者。）可以统一单个对象和组合对象的处理逻辑。 对业务场景的一种数据结构和算法的抽象。其中，数据可以表示成树这种数据结构，业务需求可以通过在树上的递归遍历算法来实现。 二、使用场景： 业务场景必须能够表示成树形结构。 三、实现方式： 组合模式，将一组对象组织成树形结构，将单个对象和组合对象都看做树中的节点，以统一处理逻辑，并且它利用树形结构的特点，递归地处理每个子树，依次简化代码实现。（在这里一般可以抽象出一个抽象类，叶子节点和中间节点（根节点）继承与抽象类，对中间节点（根节点）处理就是递归的调用）2020-03-07小晏子 👍（5） 💬（0）Directory中缓存子节点数量和大小的信息，每次addSubNode和removeSubNode时，失效缓存的节点数量和大小的信息，这样每次查询的时候，如果缓存的信息有效，那么就直接返回，反之就遍历一遍，有点类似于数据库和cache数据同步的cache-aside方式，另外如果file本身大小如果有变化，也要有办法去失效Directory中的缓存信息，这就需要实现新的接口通知机制。2020-03-04👽 👍（2） 💬（0）尝试将方法动态返回改为静态返回变量， 然后在添加数据时动态更新变量值。 思想： 1，是用空间换时间，占用了两个成员变量，但是返回时无需计算 2，是把部分操作打散到每一步去，从而减少返回数量的数值。（有点像是，数据结构之美中讲过的，集合在边长时，数据迁移的操作描述）</p><p>但是，其实还是存在问题。文件数量是用变量写死的，而不是由方法动态统计。则会存在数据不一致的问题。例如并发问题。再或者，通过程序外删除文件后，就无法保证返回值的正确性。</p><p>我还有一种折衷的解决方案，也类似于成员变量控制。就是——【引入缓存概念】。 获取文件数量时，把文件数量存入缓存，更新或者删除文件时，再清空缓存。同样，也可以手动清空或者定期清空。 在文件未做更新操作时，获取文件数量，直接从缓存中获取即可，在做文件插入或者更新操作后，将缓存清空。 这种情况，如果额外人为手动删除了文件，也可以手动清空缓存来使得下一次重新计算文件数量，也可以手动定期清空，以保证大部分时候，返回的文件数量都正确。</p><p>其实并不算一个新方法，只是对动态获取的一种改良。 但是适用场景有限，只适用于读频率，大幅度高于写频率的场景。毕竟缓存的思想嘛。 另一方面是，未命中缓存的查询性能会很差。</p><p>引入缓存的概念，需要考虑的因素太多。是否有点，，，得不偿失？或者还有没有更佳的方式？2020-06-09</p>`,56)])])}const b=n(l,[["render",i]]);export{m as __pageData,b as default};
