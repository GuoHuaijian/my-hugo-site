import{_ as t,o as i,c as e,ae as r}from"./chunks/framework.Iv6F95cJ.js";const c=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/algo-beauty/春节7天练 - Day 6：图.md","filePath":"books/algo-beauty/春节7天练 - Day 6：图.md"}'),a={name:"books/algo-beauty/春节7天练 - Day 6：图.md"};function o(l,n,p,d,u,s){return i(),e("div",null,[...n[0]||(n[0]=[r(`<p>你好，我是王争。初六好！</p><p>为了帮你巩固所学，真正掌握数据结构和算法，我整理了数据结构和算法中，必知必会的30个代码实现，分7天发布出来，供你复习巩固所用。今天是第六篇。</p><p>和之前一样，你可以花一点时间，来手写这些必知必会的代码。写完之后，你可以根据结果，回到相应章节，有针对性地进行复习。做到这些，相信你会有不一样的收获。</p><hr><h2 id="关于图的几个必知必会的代码实现" tabindex="-1">关于图的几个必知必会的代码实现 <a class="header-anchor" href="#关于图的几个必知必会的代码实现" aria-label="Permalink to &quot;关于图的几个必知必会的代码实现&quot;">&amp;ZeroWidthSpace;</a></h2><h3 id="图" tabindex="-1">图 <a class="header-anchor" href="#图" aria-label="Permalink to &quot;图&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>实现有向图、无向图、有权图、无权图的邻接矩阵和邻接表表示方法</li><li>实现图的深度优先搜索、广度优先搜索</li><li>实现Dijkstra算法、A*算法</li><li>实现拓扑排序的Kahn算法、DFS算法</li></ul><h2 id="对应的leetcode练习题-smallfly-整理" tabindex="-1">对应的LeetCode练习题（@Smallfly 整理） <a class="header-anchor" href="#对应的leetcode练习题-smallfly-整理" aria-label="Permalink to &quot;对应的LeetCode练习题（@Smallfly 整理）&quot;">&amp;ZeroWidthSpace;</a></h2><ul><li>Number of Islands（岛屿的个数）</li></ul><p>英文版：<a href="https://leetcode.com/problems/number-of-islands/description/" target="_blank" rel="noreferrer">https://leetcode.com/problems/number-of-islands/description/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/number-of-islands/description/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/number-of-islands/description/</a></p><ul><li>Valid Sudoku（有效的数独）</li></ul><p>英文版：<a href="https://leetcode.com/problems/valid-sudoku/" target="_blank" rel="noreferrer">https://leetcode.com/problems/valid-sudoku/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/valid-sudoku/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/valid-sudoku/</a></p><hr><p>做完题目之后，你可以点击“请朋友读”，把测试题分享给你的朋友，说不定就帮他解决了一个难题。</p><p>祝你取得好成绩！明天见！ 精选留言（15） 色即是空 👍（2） 💬（1）有效数独，就是穷举遍历方法求解，跟这一节练习的图，没有什么关系啊！放这个题目的时候是怎么考虑的啊？2019-06-27ext4 👍（1） 💬（1）有效的数独 class Solution { public: bool isValidSudoku(vector&lt; vector&lt;char&gt; &gt;&amp; board) { set&lt;char&gt; numset; for (int i = 0; i &lt; 9; i++) { numset.clear(); for (int j = 0; j &lt; 9; j++) { char val = board[i][j]; if (val != &#39;.&#39;) { if (numset.count(val) != 0) return false; numset.insert(val); } } } for (int j = 0; j &lt; 9; j++) { numset.clear(); for (int i = 0; i &lt; 9; i++) { char val = board[i][j]; if (val != &#39;.&#39;) { if (numset.count(val) != 0) return false; numset.insert(val); } } } for (int i = 0; i &lt; 3; i++) { for (int j = 0; j &lt; 3; j++) { numset.clear(); for (int p = 0; p &lt; 3; p++) { for (int q = 0; q &lt; 3; q++) { char val = board[i * 3 + p][j * 3 + q]; if (val != &#39;.&#39;) { if (numset.count(val) != 0) return false; numset.insert(val); } } } } } return true; } };2019-02-10Nereus 👍（0） 💬（1） 并查集—go实现 func numIslands(grid [][]byte) int { if len(grid) == 0 { return 0 }</p><pre><code>N := len(grid)*len(grid[0]) + 1

u := NewUnionSet(N)

for i := 0; i &amp;lt; len(grid); i ++ {
	for j := 0; j &amp;lt; len(grid[i]); j ++ {
		if grid[i][j] == &amp;#39;1&amp;#39; {
			&amp;#47;&amp;#47; 联通下边
			if i+1 &amp;lt; len(grid) {
				if grid[i+1][j] == &amp;#39;1&amp;#39; {
					u.join(i*len(grid[i])+j, (i+1)*len(grid[i])+j)
				}
			}

			&amp;#47;&amp;#47; 联通右边
			if j+1 &amp;lt; len(grid[i]) {
				if grid[i][j+1] == &amp;#39;1&amp;#39; {
					u.join(i*len(grid[i])+j, i*len(grid[i])+j+1)
				}
			}
		} else {
			u.join(i*len(grid[i])+j, N-1)
		}
	}
}

return  u.counts() -1
</code></pre><p>}</p><p>type UnionSet []int</p><p>func NewUnionSet(n int) UnionSet { var u UnionSet u = make([]int, n) for i := 0; i &lt; len(u); i ++ { u[i] = i } return u</p><p>}</p><p>func (u UnionSet) find(i int) int { tmp := i for u[tmp] != tmp { tmp = u[tmp] }</p><pre><code>j := i
for j != tmp {
	tt := u[j]
	u[j] = tmp
	j = tt
}

return tmp
</code></pre><p>}</p><p>func (u UnionSet) connected(i, j int) bool { return u.find(i) == u.find(j) }</p><p>func (u UnionSet) counts() int { var count int for idx, rec := range u { if idx == rec { count++ } } return count }</p><p>func (u UnionSet) join(i, j int) { x, y := u.find(i), u.find(j) if x != y { if y &gt; x { u[x] = y } else { u[y] = x } } } 2019-02-14拉欧 👍（0） 💬（1）Number of Islands（岛屿的个数）go语言实现，亲测通过： func numIslands(grid [][]byte) int {</p><pre><code>isSearch:=make([][]int,len(grid))
island:=0
for i:=0;i&amp;lt;len(isSearch);i++{
	isSearch[i]=make([]int,len(grid[0]))
}
for i,line:=range grid{
	for j,_:=range line{
		if isSearch[i][j]==0 &amp;amp;&amp;amp; grid[i][j]==&amp;#39;1&amp;#39;{
			Search(grid,isSearch,i,j)
			island++
		}

	}
}
return island
</code></pre><p>}</p><p>func Search(grid [][]byte,isSearch [][]int, i int,j int){ if isSearch[i][j]==1{ return } isSearch[i][j]=1 if grid[i][j]==&#39;1&#39;{ if i&gt;=1{ Search(grid,isSearch,i-1,j) } if i&lt;len(grid)-1{ Search(grid,isSearch,i+1,j) } if j&gt;=1{ Search(grid,isSearch,i,j-1) } if j&lt;len(grid[0])-1{ Search(grid,isSearch,i,j+1) } }else{ return } } 2019-02-14蚂蚁内推+v 👍（0） 💬（1） 岛屿数Java实现 public int numIslands(char[][] grid) { int m = grid.length; if (m == 0) return 0; int n = grid[0].length;</p><pre><code>    int ans = 0;
    for (int y = 0; y &amp;lt; m; ++y)
        for (int x = 0; x &amp;lt; n; ++x)
            if (grid[y][x] == &amp;#39;1&amp;#39;) {
                ++ans;
                dfs(grid, x, y, n, m);
            }
    
    return ans;
}

private void dfs(char[][] grid, int x, int y, int n, int m) {
    if (x &amp;lt; 0 || y &amp;lt; 0 || x &amp;gt;= n || y &amp;gt;= m || grid[y][x] == &amp;#39;0&amp;#39;)
        return;
    grid[y][x] = &amp;#39;0&amp;#39;;
    dfs(grid, x + 1, y, n, m);
    dfs(grid, x - 1, y, n, m);
    dfs(grid, x, y + 1, n, m);
    dfs(grid, x, y - 1, n, m);
}2019-02-11mgxian 👍（0） 💬（1）有效的数独 go 语言实现
</code></pre><p>package main</p><p>import ( &quot;fmt&quot; )</p><p>func hasRepeatedNumbers(numbers []byte) bool { var numbersExistFlag [9]bool for _, num := range numbers { if num == &#39;.&#39; { continue } index := num - &#39;0&#39; - 1 if numbersExistFlag[index] { return true } numbersExistFlag[index] = true } return false }</p><p>func isValidSudoku(board [][]byte) bool { sudokuSize := 9 sudokuUnitSize := 3 for _, line := range board { if hasRepeatedNumbers(line) { return false } }</p><pre><code>for columnIndex := 0; columnIndex &amp;lt; sudokuSize; columnIndex++ {
	columnNumbers := make([]byte, 0)
	for lineIndex := 0; lineIndex &amp;lt; sudokuSize; lineIndex++ {
		columnNumbers = append(columnNumbers, board[lineIndex][columnIndex])
	}
	if hasRepeatedNumbers(columnNumbers) {
		return false
	}
}

sudokuUnitCountEachLine := sudokuSize &amp;#47; sudokuUnitSize
for i := 0; i &amp;lt; sudokuUnitCountEachLine; i++ {
	for j := 0; j &amp;lt; sudokuUnitCountEachLine; j++ {
		sudokuUnitNumbers := make([]byte, 0)
		for _, line := range board[i*3 : (i+1)*3] {
			sudokuUnitNumbers = append(sudokuUnitNumbers, line[j*3:(j+1)*3]...)
		}

		if hasRepeatedNumbers(sudokuUnitNumbers) {
			return false
		}
	}
}

return true
</code></pre><p>}</p><p>func main() { testData1 := [][]byte{ {&#39;5&#39;, &#39;3&#39;, &#39;.&#39;, &#39;.&#39;, &#39;7&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;}, {&#39;6&#39;, &#39;.&#39;, &#39;.&#39;, &#39;1&#39;, &#39;9&#39;, &#39;5&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;}, {&#39;.&#39;, &#39;9&#39;, &#39;8&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;6&#39;, &#39;.&#39;}, {&#39;8&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;6&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;3&#39;}, {&#39;4&#39;, &#39;.&#39;, &#39;.&#39;, &#39;8&#39;, &#39;.&#39;, &#39;3&#39;, &#39;.&#39;, &#39;.&#39;, &#39;1&#39;}, {&#39;7&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;2&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;6&#39;}, {&#39;.&#39;, &#39;6&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;2&#39;, &#39;8&#39;, &#39;.&#39;}, {&#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;4&#39;, &#39;1&#39;, &#39;9&#39;, &#39;.&#39;, &#39;.&#39;, &#39;5&#39;}, {&#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;.&#39;, &#39;8&#39;, &#39;.&#39;, &#39;.&#39;, &#39;7&#39;, &#39;9&#39;}} fmt.Println(isValidSudoku(testData1)) }2019-02-10kai 👍（3） 💬（0）今天根据老师的课程，总结了一下图的相关知识点，然后用代码实现了一下图的相关的算法，感觉图还是要难于其他数据结构，需要接着多练习~2019-02-10李皮皮皮皮皮 👍（3） 💬（0）图很复杂😢2019-02-10kai 👍（1） 💬（0）实现图的深度优先搜索、广度优先搜索:</p><p>import java.util.ArrayList; import java.util.HashSet; import java.util.LinkedList; import java.util.Queue;</p><p>public class BFSAndDFS {</p><pre><code>class Node {
    public int value; &amp;#47;&amp;#47;Node 值
    public int in;    &amp;#47;&amp;#47;入度：指向该节点的边有几条
	public int out;   &amp;#47;&amp;#47;出度：指向其他节点的边有几条
	public ArrayList&amp;lt;Node&amp;gt; nexts;
	public ArrayList&amp;lt;Edge&amp;gt; edges;

	public Node(int value) {
		this.value = value;
		this.in = 0;
		this.out = 0;
		this.nexts = new ArrayList&amp;lt;&amp;gt;();
		this.edges = new ArrayList&amp;lt;&amp;gt;();
	}
}

public static void bfs(Node node) {
    if (node == null) {
        return;
    }

    Queue&amp;lt;Node&amp;gt; queue = new LinkedList&amp;lt;&amp;gt;();
    HashSet&amp;lt;Node&amp;gt; set = new HashSet&amp;lt;&amp;gt;();
    queue.add(node);
    set.add(node);
    while (!queue.isEmpty()) {
        Node cur = queue.poll();
        System.out.print(cur.value + &amp;quot; &amp;quot;);
        for (Node next : cur.nexts) {
            if (!set.contains(next)) {
                queue.add(next);
                set.add(next);
            }
        }
    }
}

public static void dfs(Node node) {
    if (node == null) {
        return;
    }

    Stack&amp;lt;Node&amp;gt; stack = new Stack&amp;lt;&amp;gt;();
    HashSet&amp;lt;Node&amp;gt; set = new HashSet&amp;lt;&amp;gt;();
    stack.push(node);
    set.add(node);
    System.out.print(node.value + &amp;quot; &amp;quot;);
    while (!stack.isEmpty()) {
        Node cur = stack.pop();
        for (Node next : cur.nexts) {
            if (!set.contains(next)) { 
                stack.push(cur);       
                stack.push(next);
                set.add(next);         
                System.out.print(next.value + &amp;quot; &amp;quot;);
                break;                
            }
        }
    }
}
</code></pre><p>}2019-02-11纯洁的憎恶 👍（1） 💬（1）1.在邻接矩阵中找出连通图个数即可。在每个顶点执行DFS或BFS，执行次数即为岛屿数，也可以使用并查集。</p><ol start="2"><li><p>依次考察9✖️9数独各行各列是否有重复数字（可以用9位数组统计），然后再考察每个3✖️3子矩阵是否有重复数字。都没有则成功。2019-02-10杨建斌(young) 👍（0） 💬（0）有效数独 int[][] row = new int[10][10]; int[][] col = new int[10][10];</p><pre><code> boolean retFlag = true;
 for (int i = 0; i &amp;lt; grid.length; i += 3) {
     for (int j = 0; j &amp;lt; grid[0].length; j += 3) {
         boolean xx = xx(row, col, grid, i, j);&amp;#47;&amp;#47;模块左上角第一个元素位置
         if (!xx) {
             retFlag = false;
             break;
         }
     }
     if (!retFlag) {
         break;
     }
 }
</code></pre></li></ol><p>public static boolean xx(int[][] row, int[][] col, String[][] grid, int i, int j) { Map map = new HashMap(); for (int ii = i; ii &lt; i + 3; ii++) { for (int jj = j; jj &lt; j + 3; jj++) { if (map.get(grid[ii][jj]) != null) { return false; } if (!&quot;.&quot;.equals(grid[ii][jj])) { map.put(grid[ii][jj], &quot;1&quot;); int haveRow = row[ii][Integer.parseInt(grid[ii][jj])]; int haveCol = col[jj][Integer.parseInt(grid[ii][jj])]; if (haveCol == 1 || haveRow == 1) { return false; } row[ii][Integer.parseInt(grid[ii][jj])] = col[jj][Integer.parseInt(grid[ii][jj])] = 1; } } } return true; }2023-07-03杨建斌(young) 👍（0） 💬（0）岛屿的个数 public static void main(String[] args) { int[][] grid = new int[][]{ {1, 1, 0, 0, 0}, {1, 1, 0, 0, 0}, {0, 0, 1, 0, 0}, {0, 0, 0, 1, 1} }; int cnt = 0; for (int i = 0; i &lt; grid.length; i++) { for (int j = 0; j &lt; grid[0].length; j++) { if (grid[i][j] == 1) { xx(grid, i, j); cnt++; } } }</p><pre><code>    System.out.println(cnt);
}

public static void xx(int[][] grid, int i, int j) {
    if (i &amp;lt; 0 || j &amp;lt; 0 || i &amp;gt;= grid.length || j &amp;gt;= grid[0].length) {
        return;
    }
    if (grid[i][j] == 0) {
        return;
    }
    &amp;#47;&amp;#47;等于1
    grid[i][j] = 0;
    if (i &amp;gt; 0) {
        xx(grid, i - 1, j);
    }
    if (j &amp;gt; 0) {
        xx(grid, i, j - 1);
    }
    if (i &amp;lt; grid.length - 1) {
        xx(grid, i + 1, j);
    }
    if (j &amp;lt; grid[0].length - 1) {
        xx(grid, i, j + 1);
    }
}2023-07-03Geek_97afb1 👍（0） 💬（0）入坑第一百天
                   -brandon2022-06-22Bax 👍（0） 💬（0）数独，还没测试2022-02-18阿甘 👍（0） 💬（0）class Solution {
</code></pre><p>public int numIslands(char[][] grid) { int num = 0; for (int i = 0; i &lt; grid.length; i++) { // rows for (int j = 0; j &lt; grid[i].length; j++) { // cols if (grid[i][j] == &#39;1&#39;) { num++; dfs(grid, i, j, grid.length, grid[i].length); } } } return num; }</p><pre><code>private void dfs(char[][] grid, int i, int j, int rows, int cols) {
    if (i &amp;lt; 0 || j &amp;lt; 0 || i &amp;gt;= rows || j &amp;gt;= cols || grid[i][j] == &amp;#39;0&amp;#39;) {
        return;
    }
    grid[i][j] = &amp;#39;0&amp;#39;; &amp;#47;&amp;#47; visit

    dfs(grid, i - 1, j, rows, cols);
    dfs(grid, i, j - 1, rows, cols);
    dfs(grid, i + 1, j, rows, cols);
    dfs(grid, i, j + 1, rows, cols);
}
</code></pre><p>}2021-06-29</p>`,49)])])}const g=t(a,[["render",o]]);export{c as __pageData,g as default};
