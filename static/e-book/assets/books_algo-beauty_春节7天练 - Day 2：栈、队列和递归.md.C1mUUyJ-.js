import{_ as n,o as t,c as a,ae as r}from"./chunks/framework.Iv6F95cJ.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/algo-beauty/春节7天练 - Day 2：栈、队列和递归.md","filePath":"books/algo-beauty/春节7天练 - Day 2：栈、队列和递归.md"}'),i={name:"books/algo-beauty/春节7天练 - Day 2：栈、队列和递归.md"};function l(p,e,o,u,c,s){return t(),a("div",null,[...e[0]||(e[0]=[r(`<p>你好，我是王争。初二好！</p><p>为了帮你巩固所学，真正掌握数据结构和算法，我整理了数据结构和算法中，必知必会的30个代码实现，分7天发布出来，供你复习巩固所用。今天是第二篇。</p><p>和昨天一样，你可以花一点时间，来完成测验。测验完成后，你可以根据结果，回到相应章节，有针对性地进行复习。</p><hr><h2 id="关于栈、队列和递归的几个必知必会的代码实现" tabindex="-1">关于栈、队列和递归的几个必知必会的代码实现 <a class="header-anchor" href="#关于栈、队列和递归的几个必知必会的代码实现" aria-label="Permalink to &quot;关于栈、队列和递归的几个必知必会的代码实现&quot;">&amp;ZeroWidthSpace;</a></h2><h3 id="栈" tabindex="-1">栈 <a class="header-anchor" href="#栈" aria-label="Permalink to &quot;栈&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>用数组实现一个顺序栈</li><li>用链表实现一个链式栈</li><li>编程模拟实现一个浏览器的前进、后退功能</li></ul><h3 id="队列" tabindex="-1">队列 <a class="header-anchor" href="#队列" aria-label="Permalink to &quot;队列&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>用数组实现一个顺序队列</li><li>用链表实现一个链式队列</li><li>实现一个循环队列</li></ul><h3 id="递归" tabindex="-1">递归 <a class="header-anchor" href="#递归" aria-label="Permalink to &quot;递归&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>编程实现斐波那契数列求值f(n)=f(n-1)+f(n-2)</li><li>编程实现求阶乘n!</li><li>编程实现一组数据集合的全排列</li></ul><h2 id="对应的leetcode练习题-smallfly-整理" tabindex="-1">对应的LeetCode练习题（@Smallfly 整理） <a class="header-anchor" href="#对应的leetcode练习题-smallfly-整理" aria-label="Permalink to &quot;对应的LeetCode练习题（@Smallfly 整理）&quot;">&amp;ZeroWidthSpace;</a></h2><h3 id="栈-1" tabindex="-1">栈 <a class="header-anchor" href="#栈-1" aria-label="Permalink to &quot;栈&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>Valid Parentheses（有效的括号）</li></ul><p>英文版：<a href="https://leetcode.com/problems/valid-parentheses/" target="_blank" rel="noreferrer">https://leetcode.com/problems/valid-parentheses/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/valid-parentheses/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/valid-parentheses/</a></p><ul><li>Longest Valid Parentheses（最长有效的括号）</li></ul><p>英文版：<a href="https://leetcode.com/problems/longest-valid-parentheses/" target="_blank" rel="noreferrer">https://leetcode.com/problems/longest-valid-parentheses/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/longest-valid-parentheses/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/longest-valid-parentheses/</a></p><ul><li>Evaluate Reverse Polish Notatio（逆波兰表达式求值）</li></ul><p>英文版：<a href="https://leetcode.com/problems/evaluate-reverse-polish-notation/" target="_blank" rel="noreferrer">https://leetcode.com/problems/evaluate-reverse-polish-notation/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/</a></p><h3 id="队列-1" tabindex="-1">队列 <a class="header-anchor" href="#队列-1" aria-label="Permalink to &quot;队列&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>Design Circular Deque（设计一个双端队列）</li></ul><p>英文版：<a href="https://leetcode.com/problems/design-circular-deque/" target="_blank" rel="noreferrer">https://leetcode.com/problems/design-circular-deque/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/design-circular-deque/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/design-circular-deque/</a></p><ul><li>Sliding Window Maximum（滑动窗口最大值）</li></ul><p>英文版：<a href="https://leetcode.com/problems/sliding-window-maximum/" target="_blank" rel="noreferrer">https://leetcode.com/problems/sliding-window-maximum/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/sliding-window-maximum/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/sliding-window-maximum/</a></p><h3 id="递归-1" tabindex="-1">递归 <a class="header-anchor" href="#递归-1" aria-label="Permalink to &quot;递归&quot;">&amp;ZeroWidthSpace;</a></h3><ul><li>Climbing Stairs（爬楼梯）</li></ul><p>英文版：<a href="https://leetcode.com/problems/climbing-stairs/" target="_blank" rel="noreferrer">https://leetcode.com/problems/climbing-stairs/</a></p><p>中文版：<a href="https://leetcode-cn.com/problems/climbing-stairs/" target="_blank" rel="noreferrer">https://leetcode-cn.com/problems/climbing-stairs/</a></p><hr><p>昨天的第一篇，是关于数组和链表的，如果你错过了，点击文末的“上一篇”，即可进入测试。</p><p>祝你取得好成绩！明天见！ 精选留言（15） Abner 👍（0） 💬（1）java实现一个循环队列 代码如下： package queue;</p><p>public class CircularQueue {</p><pre><code>private String[] data;
private int size;
private int head;
private int tail;

public CircularQueue(int capacity) {
    data = new String[capacity];
    size = capacity;
    head = 0;
    tail = 0;
}

public boolean enqueue(String item) {
    if ((tail + 1) % size == head) {
        return false;
    }
    data[tail] = item;
    tail = (tail + 1) % size;
    return true;
}

public String dequeue() {
    if (head == tail) {
        return null;
    }
    String value = data[head];
    head = (head + 1) % size;
    return value;
}

public void printAll() {
    if (0 == size) {
        return ;
    }
    for (int i = head;i % size != tail;i++) {
        System.out.print(data[i] + &amp;quot; &amp;quot;);
    }
    System.out.println();
}

public static void main(String[] args) {
    CircularQueue circularQueue = new CircularQueue(5);
    circularQueue.enqueue(&amp;quot;hello1&amp;quot;);
    circularQueue.enqueue(&amp;quot;hello2&amp;quot;);
    circularQueue.enqueue(&amp;quot;hello3&amp;quot;);
    circularQueue.enqueue(&amp;quot;hello4&amp;quot;);
    circularQueue.dequeue();
    circularQueue.printAll();
}
</code></pre><p>} 2019-02-12神盾局闹别扭 👍（0） 💬（1）全排列实现： void Dopermute(char *pstr, char *pBegin) { if (*pBegin == &#39;\\0&#39;) printf(&quot;%s\\n&quot;, pstr);</p><pre><code>for (char *pCur = pBegin; *pCur != &amp;#39;\\0&amp;#39;; pCur++)
{

	char temp = *pBegin;
	*pBegin = *pCur;
	*pCur = temp;

	Dopermute_v2(pstr, pBegin + 1);

	temp = *pBegin;
	*pBegin = *pCur;
	*pCur = temp;

}
</code></pre><p>} void Permute(char* pstr) { if (pstr == nullptr) return; Dopermute(pstr, pstr); }2019-02-09molybdenum 👍（0） 💬（1）老师新年好 这是我的作业</p><p>https://blog.csdn.net/github_38313296/article/details/868196842019-02-09菜菜 👍（0） 💬（1）求斐波那契数列，当然最经典的算法就是递归，但是递归的效率非常低，因为中间过车会计算大量重复的子节点。在《剑指Offer》一书中，提到了一个自下而上计算的方法。我们知道f(0)=0,f(1)=1,再计算f(2),f(3)一直到f(n)。这样，时间复杂度就是O(n)。2019-02-06李皮皮皮皮皮 👍（11） 💬（1）基础数据结构和算法是基石，灵活运用是解题的关键。栈，队列这些数据结构说到底就是给顺序表添加约束，更便于解决某一类问题。学习中培养算法的设计思想是非常关键的。而且思想是可以通用的。之前读《暗时间》一书，收获颇深。书中介绍之正推反推我在做程序题时竟出奇的好用。2019-02-05Abner 👍（3） 💬（0）java用数组实现一个顺序栈 代码如下： package stack;</p><p>public class ArrayStack {</p><pre><code>private String[] data;
private int count;
private int size;

public ArrayStack(int n) {
    this.data = new String[n];
    this.count = 0;
    this.size = n;
}

public boolean push(String value) {
    if (count == size) {
        return false;
    } else {
        data[count] = value;
        count++;
        return true;
    }
}

public String pop() {
    if (count == 0) {
        return null;
    } else {
        count--;
        return data[count];
    }
}
</code></pre><p>} 2019-02-11Abner 👍（2） 💬（0）java用递归实现斐波那契数列 代码如下： package recursion;</p><p>public class Fib {</p><pre><code>public long calFib(long n) {
    if (n == 0 || n == 1) {
        return 1;
    } else {
        return calFib(n - 1) + calFib(n - 2);
    }
}

public static void main(String[] args) {
    Fib fib = new Fib();
    long result = fib.calFib(5);
    System.out.println(result);
}
</code></pre><p>} 2019-02-11Abner 👍（2） 💬（0）java用递归实现求解n! 代码如下： package recursion;</p><p>public class Fac {</p><pre><code>public long calFac(long n) {
    if (n == 0) {
        return 1;
    } 
    return calFac(n - 1) * n;
}

public static void main(String[] args) {
    Fac fac = new Fac();
    long result = fac.calFac(10);
    System.out.println(result);
}
</code></pre><p>}2019-02-11kai 👍（2） 💬（0）1. 编程实现斐波那契数列求值 f(n)=f(n-1)+f(n-2） public class Fibonacci { public static int fib(int n) { if (n &lt;= 0) { return 0; } if (n == 1) { return 1; }</p><pre><code>    return  fib(n-1) + fib(n-2);
}
</code></pre><p>}</p><ol start="2"><li><p>Climbing Stairs（爬楼梯） public class ClimbStairs { public int climbFloor(int n) { if (n == 1 || n == 2) { return n; }</p><pre><code> return climbFloor(n - 1) + climbFloor(n - 2);
</code></pre><p>}</p><p>public int climbFloorIter(int n) { if (n == 1 || n == 2) { return n; }</p><pre><code> int jump1 = 1;
 int jump2 = 2;
 int jumpN = 0;

 for (int i = 3; i &amp;lt;= n; i++) {
     jumpN = jump1 + jump2;

     jump1 = jump2;
     jump2 = jumpN;
 }

 return jumpN;
</code></pre><p>} }</p></li><li><p>Sliding Window Maximum（滑动窗口最大值) import java.util.ArrayList; import java.util.LinkedList;</p></li></ol><p>public class MaxNumOfSlidingWindow { public ArrayList&lt;Integer&gt; maxInWindows(int [] num, int size) { ArrayList&lt;Integer&gt; res = new ArrayList&lt;&gt;();</p><pre><code>    if (num == null || num.length &amp;lt;= 0 || size &amp;lt;= 0 || size &amp;gt; num.length) {
        return res;
    }

    LinkedList&amp;lt;Integer&amp;gt; qMax = new LinkedList&amp;lt;&amp;gt;();  &amp;#47;&amp;#47; 双端队列：左端更新max,右端添加数据

    int left = 0;

    for (int right = 0; right &amp;lt; num.length; right++) {
        &amp;#47;&amp;#47; 更新右端数据
        while (!qMax.isEmpty() &amp;amp;&amp;amp; num[qMax.peekLast()] &amp;lt;= num[right]) {
            qMax.pollLast();
        }

        qMax.addLast(right);

        &amp;#47;&amp;#47; 更新max：如果max的索引不在窗口内,则更新
        if (qMax.peekFirst() == right - size) {
            qMax.pollFirst();
        }

        &amp;#47;&amp;#47; 待窗口达到size，输出max
        if (right &amp;gt;= size-1) {
            res.add(num[qMax.peekFirst()]);
            left++;
        }
    }

    return res;
}
</code></pre><p>}2019-02-11Abner 👍（1） 💬（0）java用链表实现一个链式栈 代码如下： package stack;</p><p>public class LinkedStack {</p><pre><code>private Node top = null;

public static class Node {
    
    private String data;
    private Node next;
    
    public Node(String data, Node next) {
        this.data = data;
        this.next = next;
    }
    
    public String getData() {
        return data;
    }
}

public void push(String item) {
    Node newNode = new Node(item, null);
    if (top == null) {
        top = newNode;
    } else {
        newNode.next = top;
        top = newNode;
    }
}

public String pop() {
    if (top == null) {
        return null;
    }
    String value = top.data;
    top = top.next;
    return value;
}

public void printAll() {
    Node pNode = top;
    while (pNode != null) {
        System.out.print(pNode.data + &amp;quot; &amp;quot;);
        pNode = pNode.next;
    }
    System.out.println();
}

public static void main(String[] args) {
    LinkedStack linkedStack = new LinkedStack();
    linkedStack.push(&amp;quot;haha&amp;quot;);
    linkedStack.push(&amp;quot;nihao&amp;quot;);
    linkedStack.printAll();
}
</code></pre><p>} 2019-02-12Abner 👍（1） 💬（0）java用数组实现一个顺序队列 代码如下： package queue;</p><p>public class ArrayQueue {</p><pre><code>private String[] data;
private int size;
private int head;
private int tail;

public ArrayQueue(int capacity) {
    data = new String[capacity];
    size = capacity;
    head = 0;
    tail = 0;
}

public boolean enqueue(String value) {
    if (tail == size) {
        return false;
    }
    data[tail] = value;
    tail++;
    return true;
}

public String dequeue() {
    if (tail == 0) {
        return null;
    }
    String value = data[head];
    head++;
    return value;
}
</code></pre><p>} 2019-02-11ALAN 👍（1） 💬（0）import java.util.Arrays;</p><p>/** * *Stack 1 solution */ public class StackArray {</p><pre><code>public Object[] arr = new Object[10];
public int count;

public void push(Object ele) {
	if (count == arr.length) { &amp;#47;&amp;#47; expand size
		arr = Arrays.copyOf(arr, arr.length * 2);
	}
	arr[count] = ele;
	count++;
}

public Object pop() {
	if (count == 0)
		return null;
	if (count &amp;lt; arr.length &amp;#47; 2) {
		arr = Arrays.copyOf(arr, arr.length &amp;#47; 2);
	}
	return arr[--count];

}
</code></pre><p>}</p><p>/** * *Stack 2 solution */ class StackLinked { Node head; Node tail;</p><pre><code>public void push(Object ele) {

	if (head == null) {
		head = new Node(ele);
		tail = head;
	} else {
		Node node = new Node(ele);
		tail.next = node;
		node.prev = tail;
		tail = node;
	}
}

public Object pop() {
	if (tail == null)
		return null;
	Node node = tail;
	if (tail == head) {
		head = null;
		tail = null;
	} else
		tail = tail.prev;
	return node;

}
</code></pre><p>} class Node { Node prev; Node next; Object value;</p><pre><code>public Node(Object ele) {
	value = ele;
}
</code></pre><p>}2019-02-08TryTs 👍（1） 💬（0）之前有个类似的题，走楼梯，装苹果，就是把苹果装入盘子，可以分为有一个盘子为空（递归），和全部装满没有空的情况，找出状态方程，递归就可以列出来了。我觉得最关键是要列出状态方程，之前老师类似于说的不需要关注特别细节，不要想把每一步都要想明白，快速排序与递归排序之类的算法，之前总是想把很细节的弄懂，却发现理解有困难。2019-02-06杨建斌(young) 👍（0） 💬（0）滑动窗口最大值 public static void main(String[] args) {</p><pre><code>    PriorityQueue&amp;lt;Integer[]&amp;gt; queue = new PriorityQueue(3, new Comparator&amp;lt;Integer[]&amp;gt;() {
        @Override
        public int compare(Integer[] o1, Integer[] o2) {
            if (o1[0] == o2[0]) {
                return o2[1] - o1[1];
            }
            return o2[0] - o1[0];
        }
    });

    int[] nums = new int[]{7, 3, -1, -3, 5, 3, 6, 7};
    for (int i = 0; i &amp;lt; 3; i++) {
        queue.add(new Integer[]{nums[i], i});
    }

    int[] ret = new int[nums.length - 3 + 1];
    ret[0] = queue.peek()[0];
    for (int i = 3; i &amp;lt; nums.length; i++) {
        queue.add(new Integer[]{nums[i], i});
        if (queue.peek()[1] &amp;lt; i - 3 + 1) {
            queue.poll();
        }
        ret[i - 3 + 1] = queue.peek()[0];
    }

    System.out.println(ret);


}2023-06-29杨建斌(young) 👍（0） 💬（0）双端队列
static class MyCircularDeque {
    private int[] elements;
    &amp;#47;&amp;#47;获得双端队列的最后rear一个元素

    private int rear, front;
    &amp;#47;&amp;#47;内容个数
    private int capacity;

   

    public boolean insertFront(int value) {
        if (elements.length == capacity) {
            return false;
        }
        if (capacity == 0) {
            rear = front = 0;
        } else {
            front = front - 1;
            if (front &amp;lt; 0) {
                front += elements.length;
            }
        }
        elements[front] = value;
        capacity++;
        return true;
    }

    public boolean insertLast(int value) {
        if (elements.length == capacity) {
            return false;
        }
        if (capacity == 0) {
            rear = front = 0;
        } else {
            rear = (rear + 1) % elements.length;
        }
        elements[rear] = value;
        capacity++;
        return true;
    }

    public boolean deleteFront() {
        if (capacity == 0) {
            return false;
        }
        int idx = front;
        front = front + 1;
        if (front &amp;gt; elements.length) {
            front = 0;
        }
        elements[idx] = -1;
        capacity--;
        return true;
    }

    public boolean deleteLast() {
        if (capacity == 0) {
            return false;
        }
        int idx = rear;
        rear = rear - 1;
        elements[idx] = -1;
        capacity--;
        return true;
    }

    public int getFront() {
        if (front != -1) {
            return elements[front];
        }
        return -1;
    }

    public int getRear() {
        if (rear != -1) {
            return elements[rear];
        }
        return -1;
    }
}2023-06-29
</code></pre>`,72)])])}const h=n(i,[["render",l]]);export{m as __pageData,h as default};
