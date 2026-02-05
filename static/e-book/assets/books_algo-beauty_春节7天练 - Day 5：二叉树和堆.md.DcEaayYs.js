import{_ as t,o as r,c as n,ae as o}from"./chunks/framework.Iv6F95cJ.js";const s=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/algo-beauty/春节7天练 - Day 5：二叉树和堆.md","filePath":"books/algo-beauty/春节7天练 - Day 5：二叉树和堆.md"}'),a={name:"books/algo-beauty/春节7天练 - Day 5：二叉树和堆.md"};function l(p,e,i,u,d,m){return r(),n("div",null,[...e[0]||(e[0]=[o(`<p>你好，我是王争。春节假期进入尾声了。你现在是否已经准备返回工作岗位了呢？今天更新的是测试题的第五篇，我们继续来复习。</p><hr><h2 id="关于二叉树和堆的7个必知必会的代码实现" tabindex="-1">关于二叉树和堆的7个必知必会的代码实现 <a class="header-anchor" href="#关于二叉树和堆的7个必知必会的代码实现" aria-label="Permalink to &quot;关于二叉树和堆的7个必知必会的代码实现&quot;">&amp;ZeroWidthSpace;</a></h2><h3 id="二叉树" tabindex="-1">二叉树 <a class="header-anchor" href="#二叉树" aria-label="Permalink to &quot;二叉树&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>实现一个二叉查找树，并且支持插入、删除、查找操作</li><li>实现查找二叉查找树中某个节点的后继、前驱节点</li><li>实现二叉树前、中、后序以及按层遍历</li></ul><h3 id="堆" tabindex="-1">堆 <a class="header-anchor" href="#堆" aria-label="Permalink to &quot;堆&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>实现一个小顶堆、大顶堆、优先级队列</li><li>实现堆排序</li><li>利用优先级队列合并K个有序数组</li><li>求一组动态数据集合的最大Top K</li></ul><h2 id="对应的leetcode练习题-smallfly-整理" tabindex="-1">对应的LeetCode练习题（@Smallfly 整理） <a class="header-anchor" href="#对应的leetcode练习题-smallfly-整理" aria-label="Permalink to &quot;对应的LeetCode练习题（@Smallfly 整理）&quot;">&amp;ZeroWidthSpace;</a></h2><ul><li>Invert Binary Tree（翻转二叉树）</li></ul><p>英文版：<a href="https://leetcode.com/problems/invert-binary-tree/" target="_blank" rel="noreferrer">https://leetcode.com/problems/invert-binary-tree/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/invert-binary-tree/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/invert-binary-tree/</a></p><ul><li>Maximum Depth of Binary Tree（二叉树的最大深度）</li></ul><p>英文版：<a href="https://leetcode.com/problems/maximum-depth-of-binary-tree/" target="_blank" rel="noreferrer">https://leetcode.com/problems/maximum-depth-of-binary-tree/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/</a></p><ul><li>Validate Binary Search Tree（验证二叉查找树）</li></ul><p>英文版：<a href="https://leetcode.com/problems/validate-binary-search-tree/" target="_blank" rel="noreferrer">https://leetcode.com/problems/validate-binary-search-tree/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/validate-binary-search-tree/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/validate-binary-search-tree/</a></p><ul><li>Path Sum（路径总和）</li></ul><p>英文版：<a href="https://leetcode.com/problems/path-sum/" target="_blank" rel="noreferrer">https://leetcode.com/problems/path-sum/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/path-sum/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/path-sum/</a></p><hr><p>做完题目之后，你可以点击“请朋友读”，把测试题分享给你的朋友。</p><p>祝你取得好成绩！明天见！ 精选留言（15） 失火的夏天 👍（4） 💬（1）// 翻转二叉树 public TreeNode invertTree(TreeNode root) { if(root == null){ return root; } TreeNode node = root; Queue&lt;TreeNode&gt; queue = new LinkedList&lt;&gt;(); queue.add(node); while(!queue.isEmpty()){ node = queue.poll(); TreeNode tempNode = node.left; node.left = node.right; node.right = tempNode; if(node.left != null){ queue.offer(node.left); } if(node.right != null){ queue.offer(node.right); } } return root; } // 二叉树的最大深度 public int maxDepth(TreeNode root) { if(root == null) return 0; return Math.max(maxDepth(root.left), maxDepth(root.right))+1;<br> } // 验证二叉查找树 public boolean isValidBST(TreeNode root) { if (root == null) { return true; } Stack&lt;TreeNode&gt; stack = new Stack&lt;&gt;(); TreeNode node = root; TreeNode preNode = null; while(node != null || !stack.isEmpty()){ stack.push(node); node = node.left; while(node == null &amp;&amp; !stack.isEmpty()){ node = stack.pop(); if(preNode != null){ if(preNode.val &gt;= node.val){ return false; } } preNode = node; node = node.right; } } return true; } // 路径总和 public boolean hasPathSum(TreeNode root, int sum) { if (root == null) { return false; } return hasPathSum(root, root.val, sum); }</p><pre><code>public boolean hasPathSum(TreeNode root, int tmp, int sum) {
    if (root == null) {
        return false;
    }
    if (root.left == null &amp;amp;&amp;amp; root.right == null) {
        return tmp == sum;
    }
    if (root.left == null) {
        return hasPathSum(root.right, root.right.val + tmp, sum);
    }
    if (root.right == null) {
        return hasPathSum(root.left, root.left.val + tmp, sum);
    }
    return hasPathSum(root.left, root.left.val + tmp, sum) ||
            hasPathSum(root.right, root.right.val + tmp, sum);
}2019-02-09啵啵啵 👍（0） 💬（1）作者可以提供pdf版的课程资料吗，不然我觉得不值，因为不能大量复制，不能形成书面笔记，毕竟我付费了。2019-10-06虎虎❤️ 👍（0） 💬（1）Golang max depth
</code></pre><p>/**</p><ul><li><p>Definition for a binary tree node.</p></li><li><p>type TreeNode struct {</p></li><li><pre><code>Val int
</code></pre></li><li><pre><code>Left *TreeNode
</code></pre></li><li><pre><code>Right *TreeNode
</code></pre></li><li><p>} */ func maxDepth(root *TreeNode) int {</p><p>if root == nil { return 0 }</p><p>if root.Left == nil &amp;&amp; root.Right == nil { return 1 }</p><p>return int(math.Max(float64(maxDepth(root.Left)), float64(maxDepth(root.Right)))) + 1</p></li></ul><p>}2019-02-09黄丹 👍（0） 💬（1）王争老师新年的第五天快乐！ 放上今天LeetCode四题的代码和思路 解题思路：对于树，这个结构很特殊，树是由根节点，根节点的左子树，根节点的右子树组成的，定义的时候就是一个递归的定义。因此在解决与树相关的问题的时候，经常会用到递归。今天的四题都不例外。 翻转二叉树：就是递归的让节点的左子树指向右子树，右子树指向左子树。 二叉树的最大深度：当前深度=1+Max(左子树深度，右子树深度)，递归的结束条件为节点为null，或者是一个叶节点。 验证二叉查找树：一颗树是二叉查找树必须满足：当前的节点&gt;=左子树&amp;&amp;当前的节点&lt;=右子树，左子树是二叉查找树，右子树是二叉查找树，也是递归的定义。 路径总和：遍历树的路径，看是否和为sum值（树的遍历也是递归的哦） 四道题的代码在：https://github.com/yyxd/leetcode/tree/master/src/leetcode/tree 2019-02-09李皮皮皮皮皮 👍（20） 💬（0）平衡树的各种操作太烧脑了，左旋右旋，红黑树就更别提了。过段时间就忘。😢2019-02-09kai 👍（5） 💬（0）树的前中后序遍历-递归实现：</p><p>public class TreeTraversal {</p><pre><code>public static class Node {
    public int value;
    public Node left;
    public Node right;

    public Node(int value) {
        this.value = value;
    }
}

&amp;#47;&amp;#47; 二叉树的递归遍历
public static void preOrderRecursive(Node head) {
    if (head == null) {
        return;
    }

    System.out.print(head.value + &amp;quot; &amp;quot;);
    preOrderRecursive(head.left);
    preOrderRecursive(head.right);
}

public static void inOrderRecursive(Node head) {
    if (head == null) {
        return;
    }

    inOrderRecursive(head.left);
    System.out.print(head.value + &amp;quot; &amp;quot;);
    inOrderRecursive(head.right);
}

public static void postOrderRecursive(Node head) {
    if (head == null) {
        return;
    }

    postOrderRecursive(head.left);
    postOrderRecursive(head.right);
    System.out.print(head.value + &amp;quot; &amp;quot;);
}
</code></pre><p>} 2019-02-11kai 👍（2） 💬（0）树的前中后序遍历-非递归实现： import java.util.Stack;</p><p>public class TreeTraversal { public static class Node { public int value; public Node left; public Node right; public Node(int value) { this.value = value; } } // 二叉树的非递归遍历 public static void preOrder(Node head) { System.out.print(&quot;pre-order: &quot;); if (head == null) { return; } Stack&lt;Node&gt; s = new Stack&lt;&gt;(); s.push(head); while (!s.isEmpty()) { head = s.pop(); System.out.print(head.value + &quot; &quot;); if (head.right != null) { s.push(head.right); }</p><pre><code>        if (head.left != null) {
            s.push(head.left);
        }
    }
    System.out.println();
}

public static void inOrder(Node head) {
    System.out.print(&amp;quot;in-order: &amp;quot;);
    if (head == null) {
        return;
    }
    Stack&amp;lt;Node&amp;gt; s = new Stack&amp;lt;&amp;gt;();
    while (!s.isEmpty() || head != null) {
        if (head != null) {
            s.push(head);
            head = head.left;
        } else {
            head = s.pop();
            System.out.print(head.value + &amp;quot; &amp;quot;);
            head = head.right;
        }
    }
    System.out.println();
}

public static void postOrder(Node head) {
    System.out.print(&amp;quot;pos-order: &amp;quot;);
    if (head == null) {
        return;
    }

    Stack&amp;lt;Node&amp;gt; tmp = new Stack&amp;lt;&amp;gt;();
    Stack&amp;lt;Node&amp;gt; s = new Stack&amp;lt;&amp;gt;();

    tmp.push(head);
    while(!tmp.isEmpty()) {
        head = tmp.pop();
        s.push(head);

        if (head.left != null) {
            tmp.push(head.left);
        }

        if (head.right != null) {
            tmp.push(head.right);
        }
    }

    while (!s.isEmpty()) {
        System.out.print(s.pop().value + &amp;quot; &amp;quot;);
    }

    System.out.println();
}
</code></pre><p>} 2019-02-11星夜 👍（1） 💬（0）二叉查找树节点删除逻辑，不知道对不对： public boolean removeNode(int val) { if (null == root) { return false; }</p><pre><code>    if (root.val == val) {
        &amp;#47;&amp;#47; 根节点
        root = replace(root);
    } else {
        Node parent = findParent(val);
        if (null == parent) {
            return false;
        }
        if (parent.left.val == val) {
            parent.left = replace(parent.left);
        } else if (parent.right.val == val) {
            parent.right = replace(parent.right);
        }
    }
    return true;
}

private Node replace(Node cur) {
    Node res = null;
    if (cur.left != null &amp;amp;&amp;amp; cur.right != null) {
        res = cur.left;
        res.left = replace(cur.left);
        res.right = cur.right;
    } else if (cur.left != null) {
        res = cur.left;
    } else if (cur.right != null) {
        return cur.right;
    }
    &amp;#47;&amp;#47; 置空
    cur.left = null;
    cur.right = null;
    return res;
}2020-11-27Abner 👍（1） 💬（0）java实现二叉树前序、中序、后序和层次遍历
</code></pre><p>代码如下： package tree;</p><p>import java.util.LinkedList; import java.util.Queue;</p><p>public class BinaryTree {</p><pre><code>private Node root = null;

public static class Node {
    
    private String data;
    private Node left;
    private Node right;
    
    public Node(String data, Node left, Node right) {
        this.data = data;
        this.left = left;
        this.right = right;
    }
}

public void preOrder(Node root) {
    if (null == root) {
        return ;
    }
    System.out.print(root.data + &amp;quot; &amp;quot;);
    preOrder(root.left);
    preOrder(root.right);
}

public void inOrder(Node root) {
    if (null == root) {
        return ;
    }
    inOrder(root.left);
    System.out.print(root.data + &amp;quot; &amp;quot;);
    inOrder(root.right);
}

public void postOrder(Node root) {
    if (null == root) {
        return ;
    }
    postOrder(root.left);
    postOrder(root.right);
    System.out.print(root.data + &amp;quot; &amp;quot;);
}

public void traverseByLayer(Node root) {
    if (null == root) {
        return ;
    }
    Queue&amp;lt;Node&amp;gt; queue = new LinkedList&amp;lt;Node&amp;gt;();
    queue.add(root);
    while (!queue.isEmpty()) {
        Node pNode = queue.peek();
        System.out.print(pNode.data + &amp;quot; &amp;quot;);
        queue.poll();
        if (root.left != null) {
            queue.add(root.left);
        }
        if (root.right != null) {
            queue.add(root.right);
        }
    }
}
</code></pre><p>} 2019-02-14kai 👍（1） 💬（0）今天看了一下这一节的题目，发现校招面试的时候都考过，今天又刷了一下，总结了一波，相应的知识点也总结了一下~2019-02-10纯洁的憎恶 👍（1） 💬（0）今天的题目很适合递归实现，当然递归公式离代码实现还是存在一定距离。 1.翻转二叉树（T）｛ 当T为Null时则返回； 翻转二叉树（T的左子树）； 翻转二叉树（T的右子树）； 若T不为叶节点，则交换T的左右子树位置； ｝</p><p>2.最大深度（T）｛ 当T为Null时，return 0； return Max（最大深度（T左子树）+1，最大深度（T右子树）+1）； ｝ 函数返回值即为最大深度。</p><p>3.验证二叉查找树（T，&amp;最大值，&amp;最小值）｛ 当T为Null时，return true； 当T为叶节点时，最小值=最大值=当前节点，返回true； 左最大值=左最小值=T的值； 验证二叉查找树（T的左子树，&amp;左最大值，&amp;左最小值）； 右最大值=右最小值=T的值； 验证（T的右子树，&amp;右最大值，&amp;右最小值）； T的值小于等于右最小值，并且大于等于左最大值时，最大值=右最大值，最小值=左最小值，之后返回true，否则返回false并结束。 ｝ 函数最终返回true则验证成功。</p><p>4.计算路径和（T，sum）｛ 若T为Null返回false； 若T是叶节点，如果sum+T的值=目标值则返回true并结束，否则返回false； 计算路径和（T的左子树，sum+T的值）； 计算路径和（T的右子树，sum+T的值）； ｝ 计算路径和（T，0）返回true时则存在于目标值相同的路径之和；2019-02-10mgxian 👍（1） 💬（0）二叉树的最大深度 go 语言实现 /**</p><ul><li><p>Definition for a binary tree node.</p></li><li><p>type TreeNode struct {</p></li><li><pre><code>Val int
</code></pre></li><li><pre><code>Left *TreeNode
</code></pre></li><li><pre><code>Right *TreeNode
</code></pre></li><li><p>} */ func maxDepth(root *TreeNode) int { if root == nil { return 0 }</p><p>leftDepth :=0 rightDepth :=0 if root.Left != nil { leftDepth = maxDepth(root.Left) }</p><p>if root.Right != nil { rightDepth = maxDepth(root.Right) }</p><p>if leftDepth &gt;= rightDepth { return leftDepth + 1 } else { return rightDepth + 1 } }2019-02-09杨建斌(young) 👍（0） 💬（0）路径总和 private static boolean deep(TreeNode treeNode, int targetSum, int curr) { if (treeNode == null &amp;&amp; curr == targetSum) { return true; } if (treeNode == null) { return false; } if (curr &gt;= targetSum) { return false; } return deep(treeNode.left, targetSum, curr + treeNode.val) || deep(treeNode.right, targetSum, curr + treeNode.val); }2023-07-03杨建斌(young) 👍（0） 💬（0）验证二叉查找树 private static boolean deep(TreeNode treeNode) { if (treeNode == null) { return true; } int val = treeNode.val; if (treeNode.left != null &amp;&amp; treeNode.left.val &gt; val) { return false; } if (treeNode.right != null &amp;&amp; treeNode.right.val &lt; val) { return false; } return deep(treeNode.left) &amp;&amp; deep(treeNode.right); }2023-07-03杨建斌(young) 👍（0） 💬（0）最大深度 private static int deep(TreeNode treeNode, int dep) { if (treeNode == null) { return dep; } return Math.max(deep(treeNode.left, dep + 1), deep(treeNode.right, dep + 1)); }2023-07-03</p></li></ul>`,43)])])}const c=t(a,[["render",l]]);export{s as __pageData,c as default};
