---
title: Leetcode 刷题之 linked list
layout: mypost
categories: [Leetcode]
---



### [题目一：Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)

#### 题目描述

> You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order** and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.
>
> You may assume the two numbers do not contain any leading zero, except the number 0 itself.
>
> **Example:**
>
> ```
> Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
> Output: 7 -> 0 -> 8
> Explanation: 342 + 465 = 807.
> ```

题目给出两个非空单向链表，这两个链表分别是两个非负整数的十进制的每一位。整数的每一位数字在链表中倒序排列。要求根据给出的两个链表求出其代表的两个整数的加和并以链表的形式返回。

链表的内部构造：

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
```



#### 我的解法

我的解法很简单，就是普通的从低位开始相加，用一个变量存储进位。这样一步步得到一条新的单向链表。

下面是我的一开始通过的代码，无论是空间还是时间效率都很低。

```c++
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode sums(0);
        ListNode *sum = &sums;
        int flag = 0;
        while (l1 != NULL){
            ListNode* temp = new ListNode(0);
            int tempSum = flag + l1->val + (l2 == NULL ? 0 : l2->val);
            flag = tempSum / 10;
            temp->val = tempSum % 10;
            sum->next = temp;
            sum = sum->next;
            l1 = l1->next;
            if (l2 != NULL){
                l2 = l2->next;
            }
        }
        while (l2 != NULL){
            ListNode* temp = new ListNode(0);
            int tempSum = flag + l2->val;
            flag = tempSum / 10;
            temp->val = tempSum % 10;
            sum->next = temp;
            sum = sum->next;
            l2 = l2->next;
        }
        if (1 == flag){
            ListNode* temp = new ListNode(1);
            sum->next = temp;
        }
        return sums.next;
    }
};
```

#### 他人解法

几乎只用了我代码量的三分之一却与我的代码运行效果一样。

```c++
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode List(0), *temp = &List;
        int flag = 0;
        while (l1 || l2 || flag) {
            int sum = (l1 ? l1->val : 0) + (l2 ? l2->val : 0) + flag;
            flag = sum / 10;
            temp->next = new ListNode(sum % 10);
            temp = temp->next;
            l1 = (l1 ? l1->next : l1);
            l2 = (l2 ? l2->next : l2);
        }
        return List.next;
    }
};
```

以及更加优雅的实现：

```c++
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode head(0), *node = &head;
        int extra = 0;
        while (l1 || l2 || extra) {
            if (l1) {
                extra += l1->val;
                l1 = l1->next;
            }
            if (l2) {
                extra += l2->val;
                l2 = l2->next;
            }
            node->next = new ListNode(extra % 10);
            extra /= 10;
            node = node->next;
        }
        return head.next;
    }
};
```

使用C标准库函数**div**:

```c++
class Solution {
public:
    ListNode *addTwoNumbers(ListNode *l1, ListNode *l2) {
        ListNode stackAnchor(0);
        ListNode* tail = &stackAnchor;
        div_t sum = { 0, 0 };
        while(sum.quot > 0 || l1 || l2) {
            if (l1) {
                sum.quot += l1->val;
                l1 = l1->next;
            }
            if (l2) {
                sum.quot += l2->val;
                l2 = l2->next;
            }
            sum = div(sum.quot, 10);
            tail->next = new ListNode(sum.rem);
            tail = tail->next;
        }
        return stackAnchor.next;
    }
};
```



### [题目二：Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)

#### 题目描述

> Given a linked list, remove the *n*-th node from the end of list and return its head.
>
> **Example:**
>
> ```
> Given linked list: 1->2->3->4->5, and n = 2.
> 
> After removing the second node from the end, the linked list becomes 1->2->3->5.
> ```
>
> **Note:**
>
> Given *n* will always be valid.
>
> **Follow up:**
>
> Could you do this in one pass?

题目给出一个单向链表和一个整数n，要求删除链表倒数第n个节点，并返回更新后的新链表。

#### 我的解法

我是定义了两个指针**left**和**right**，两者之间的距离为**n**，两者之间有**n-1**个节点。这样当**right**为空指针的时候，删除的就是**left**节点；若**right->next**为空的时候，删除的就是**left->next**节点。

```c++
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode *left = head, *right = head;
        while (n-- && right) {
            right = right->next;
        }
        while (right && right->next) {
            right = right->next;
            left = left->next;
        }
        if (right == NULL) {
            return head->next;
        } else {  //right->next == NULL && left != right
            left->next = left->next->next;
            return head;
        }
    }
};
```

#### 他人解法

**两个指针**

与我的思路一样，但却更优雅

使用二级指针作为慢指针，存储当前节点的内存地址。两个循环之后，left存储的节点就是要删除的节点。所以只需一行代码将其指向的节点内存地址改为下一节点的内存地址就OK啦！

可参考文章：[Linus：利用二级指针删除单向链表](https://blogread.cn//it/article/6243?f=wb)

```c++
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode **left = &head, *right = head;
        for (int i = 1; i < n; i++) {
            right = right->next;
        }
        while (right->next) {
            right = right->next;
            left = &((*left)->next);
        }
        *left = (*left)->next;
        return head;
    }
};
```

**递归法**

利用递归从尾部倒推至倒数第n个节点，并删除。

```c++
class Solution {
public:
    int countAndRemove(struct ListNode *node, int n){  
        //Once the stack frame reaches the tail, counting starts.
        if(!node->next) return n-1;
        int NumOfNodesLeft = countAndRemove(node->next, n);

        //If there are exactly n nodes in the rest of the list, delete next node.
        if(NumOfNodesLeft  == 0)  node->next = (node->next)->next;

        //Count decremented.         
        return NumOfNodesLeft - 1;
    }
    
    ListNode* removeNthFromEnd(ListNode* head, int n) {
         return (countAndRemove(head, n) == 0)? head->next : head;
    }
};
```



### [题目三：Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)

#### 题目描述

> Merge two sorted linked lists and return it as a new list. The new list should be made by splicing together the nodes of the first two lists.
>
> **Example:**
>
> ```
> Input: 1->2->4, 1->3->4
> Output: 1->1->2->3->4->4
> ```

题目给出两个升序单链表，要求返回一个由该两个有序链表组合而成的升序单链表。

#### 我的解法

我是重新定义了一个单链表，首先一个**while**循环遍历二者都不为空的情况，选择二者元素中较小者加入链表并更新选择的链表。如果出现了一方为空则退出循环，另一方直接接在我们的链表尾部。

当然，**l3**可以是这样

```c++
ListNode l3 = ListNode(0), *list3 = &l3;
```

但返回时只能是这样

```c++
return l3.next
```



```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        ListNode *l3 = new ListNode(0), *list3 = l3;
        while (l1 && l2) {
            if (l1->val < l2->val) {
                list3->next = new ListNode(l1->val);
                l1 = l1->next;
            } else {
                list3->next = new ListNode(l2->val);
                l2 = l2->next;
            }
            list3 = list3->next;
        }
        if (l1) {
            list3->next = l1;
        }
        if (l2) {
            list3->next = l2;
        }
        return l3->next;
    }
};
```

#### 他人解法

**利用引用**

我惊喜的发现有人的代码和我的一摸一样。还有人的是我们的简洁版

利用&引用而不用定义节点，节约空间。

```c++
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        ListNode l3 = ListNode(0), *list3 = &l3;
        while (l1 && l2) {
            ListNode *& node = (l1->val < l2->val ? l1 : l2);
            list3->next = node;
            node = node->next;
            list3 = list3->next;
        }

        list3->next = l1 ? l1 : l2;
        return l3.next;
    }
};
```

**利用二级指针**

或者使用二级指针也可以达到同样的效果

```c++
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        ListNode l3 = ListNode(0), *list3 = &l3;
        while (l1 && l2) {
            ListNode ** node = (l1->val < l2->val ? &l1 : &l2);
            list3->next = *node;
            *node = (*node)->next;
            list3 = list3->next;
        }

        list3->next = l1 ? l1 : l2;
        return l3.next;
    }
};
```



### [题目四：Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)

#### 题目描述

> Merge *k* sorted linked lists and return it as one sorted list. Analyze and describe its complexity.
>
> **Example:**
>
> ```
> Input:
> [
>   1->4->5,
>   1->3->4,
>   2->6
> ]
> Output: 1->1->2->3->4->4->5->6
> ```

题目给出一个包含**k**条链表的数组，链表都是已排序的升序单向链表，要求合并这**k**条链表使得得到的一条升序单向链表并返回合并后的链表。

#### 我的解法

暴力遍历所有链表，找到包含当前最小值的节点加入我的节点，并更新包含最小值节点的链表，直到所有链表为空。

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        int n = lists.size();
        if (1 == n) return lists[0];
        vector<bool> isList(n, true);
        bool flag = true;  //continue
        ListNode target(0), *curNode = &target;
        while (flag) { //flag == false means all linked lists are NULL
            int min = INT_MAX;
            int minIndex = -1;
            flag = false;
            for (int i = 0; i < n; i++) {
                if (lists[i] == NULL) {
                    isList[i] = false;
                    continue;
                }
                if (lists[i]->val < min) {
                    min = lists[i]->val;
                    minIndex = i;
                }
                flag = true;
            }
            if (flag) {
                curNode->next = new ListNode(min);
                curNode = curNode->next;
                lists[minIndex] = lists[minIndex]->next; 
            }
        }
        return target.next;
    }
};
```

#### 他人解法

**利用容器递归解法**

本质上是求两个链表的合并。当容器中有多于1个链表时，将前两个链表合并，并将合并后的链表插入容器末尾。直到容器中只有一条链表，这就是我们所求的链表。

```c++
class Solution {
public:
    ListNode *mergeKLists(vector<ListNode *> &lists) {
        if(lists.empty()){
            return nullptr;
        }
        while(lists.size() > 1){
            lists.push_back(mergeTwoLists(lists[0], lists[1]));
            lists.erase(lists.begin());
            lists.erase(lists.begin());
        }
        return lists.front();
    }
    ListNode *mergeTwoLists(ListNode *l1, ListNode *l2) {
        if(l1 == nullptr){
            return l2;
        }
        if(l2 == nullptr){
            return l1;
        }
        if(l1->val <= l2->val){
            l1->next = mergeTwoLists(l1->next, l2);
            return l1;
        }
        else{
            l2->next = mergeTwoLists(l1, l2->next);
            return l2;
        }
    }
};
```

**解法二，分而治之，由上至下**

同样的递归实现两条链表的合并，但是调用递归方法却非常聪明。上面的方法是调用递归方法合并前两条链表得到一条新链表插入尾部，但同时却要两行代码去除前两条链表，这消耗了大量的时间。

而下面的方法却不用调用**erase**方法和**push_back**方法。而是使用一个变量**len**，表示链表容器的逻辑大小，逻辑大小不影响实际大小。当逻辑大小**len**减小到1时，就得到了所求的链表。

具体过程是这样的：首先**len**初始化为实际大小，然后开始**while**循环，从两头分别取两个链表合并，合并后的链表赋值为前者，即两头中的前面那个，直到**i = len/2**，然后len更新为**len/2**，这样就是一轮循环。判断len是否大于**1**，如果大于**1**则继续下一轮循环，否则输出第一条链表。

时间复杂度已经有人分析过了，这里就直接拿来用了：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2020/02/20200211140208.png)

时间复杂度为 `O(nk*logk)` (n为链表平均长度，k为链表数量)

```c++
class Solution {
public:
    ListNode *mergeTwoLists(ListNode* l1, ListNode* l2) {
        if (NULL == l1) return l2;
        else if (NULL == l2) return l1;
        if (l1->val <= l2->val) {
            l1->next = mergeTwoLists(l1->next, l2);
            return l1;
        }
        else {
            l2->next = mergeTwoLists(l1, l2->next);
            return l2;
        }
    }
    ListNode *mergeKLists(vector<ListNode *> &lists) {
        if (lists.empty()) return NULL;
        int len = lists.size();
        while (len > 1) {
            for (int i = 0; i < len / 2; ++i) {
                lists[i] = mergeTwoLists(lists[i], lists[len - 1 - i]);
            }
            len = (len + 1) / 2;
        }
        
        return lists.front();
    }
};
```

**解法三，分而治之，由下至上**

上面是递归，由上至下，这次是分而治之，由下至上

```c++
 ListNode* mergeKLists(vector<ListNode*>& lists) {  
        if (lists.size() == 0) return nullptr;
        int count = lists.size(), interval = 1;
        while (interval < count) {
            for (int i = 0; i < count - interval; i += interval *2)
                lists[i] = mergeTwoLists(lists[i], lists[i + interval]);
            interval = interval * 2;
        }
        return lists[0];
    }
```



### [题目五：Swap Nodes in Pairs](https://leetcode.com/problems/swap-nodes-in-pairs/) 

#### 题目描述

> Given a linked list, swap every two adjacent nodes and return its head.
>
> You may **not** modify the values in the list's nodes, only nodes itself may be changed.
>
>  
>
> **Example:**
>
> ```
> Given 1->2->3->4, you should return the list as 2->1->4->3.
> ```

题目给出一个单向链表，链表每一个节点包含一个整数。要求在不改变节点中整数的前提下，将给出的链表的节点两两之间调换位置，若为奇数个节点，则最后一个节点位置不变。返回调换位置后的新链表。

#### 我的解法

我的思路是定义两个指针跟踪原链表中需要两两交换的左右结点**left**和**right**，当左右结点都不为空的情况下进入循环：

- 右结点接入我的链表，更新我的链表；
- 左节点接入我的链表，更新我的链表；
- 更新左结点
- 更新右结点
- ……

跳出循环时右结点**right**一定为空，这点是可以肯定的，但是左结点不一定不空。所以我们最好是直接将左节点赋值为我的链表的尾结点。

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        if (NULL == head) return head;
        ListNode *left = head, *right = head->next;
        ListNode preHead(0), *mylist = &preHead;
        
        while (left && right) {
            mylist->next = new ListNode(right->val);
            mylist = mylist->next;
            mylist->next = new ListNode(left->val);
            mylist = mylist->next;
            
            left = right->next;
            right = left ? left->next : NULL;
        }
        mylist->next = left; //right is NULL and left maybe NULL
        return preHead.next;
    }
};
```

#### 他人解法

**二维指针**

```c++
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        ListNode **pp = &head, *left, *right;
        while ((left = *pp) && (right = left->next)) {
            left->next = right->next;
            right->next = left;
            *pp = right;
            pp = &(left->next);
        }
        return head;
    }
};
```

**递归**

```c++
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        if (NULL == head || NULL == head->next) {
            return head;
        }
        ListNode *right = head->next, *left = head;
        left->next = swapPairs(right->next);
        right->next = left;
        return right;
    }
};
```



### [题目六：Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/)

#### 题目描述

> Given a linked list, reverse the nodes of a linked list *k* at a time and return its modified list.
>
> *k* is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of *k* then left-out nodes in the end should remain as it is.
>
> 
>
> **Example:**
>
> Given this linked list: `1->2->3->4->5`
>
> For *k* = 2, you should return: `2->1->4->3->5`
>
> For *k* = 3, you should return: `3->2->1->4->5`
>
> **Note:**
>
> - Only constant extra memory is allowed.
> - You may not alter the values in the list's nodes, only nodes itself may be changed.

题目给出一个链表和一个正整数**k**，要求在不改变每一个结点的值并且使用恒定的空间的情况下，依次反转链表的第`1——k`个结点、`k+1——2k`个结点、`(m-1)k+1——mk`（链表长度在`mk`与`(m+1)*k`之间）个结点。如果。返回反转后的新链表。**k**的值一定不会大于链表长度。

#### 我的解法

我一开始理解错了题意，我以为只需要把链表前**k**个结点翻转就好了。但是呢，就这么简单的问题我却没弄出来，看来我对指针的理解还是没有到位。

#### 他人解法

**迭代法**

从前往后依次遍历链表，把每个结点指向当前头结点并更新头结点（把当前结点翻转到头结点），翻转k个结点后再进行下一轮翻转。

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode *preNode = new ListNode(-1), *pre = preNode;
        pre->next = head;
        ListNode *cur = pre, *net = NULL;
        int num = 0;
        while (cur = cur->next) {
            num++;
        }
        while (num >= k) {  //k个结点作为一组来翻转
            cur = pre->next;
            net = cur->next;
            for (int i = 1; i < k; i++) {
                cur->next = net->next;  //cur为将要翻转的尾结点，让其指向下一个待翻转结点
                net->next = pre->next;  //当前尾结点指向头结点
                pre->next = net;  //更新头结点
                net = cur->next;  //net赋值为下一个待翻转结点
            }
            pre = cur;
            num -= k;
        }

        return preNode->next;
    }
};
```

为了防止内存泄漏，我们可以再稍作改正：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2020/02/20200212125049.png)



**递归方法**

用递归的方法先翻转前面的k个结点，如果剩下的结点不足k个，则直接返回剩下结点，否则继续递归。

具体实现：

首先从左到右依次遍历当前的k个结点，**将每个结点的`next`指针指向其前面结点`prev`**，`prev`存储的结点地址也不断向后移动，直到`prev`存储的结点地址为当前这组`k`个结点中第`k`个时，`cur`存储的结点地址为第`k+1`个结点的地址。此时一条长度为`k`的链表翻转完成了。其头结点为`prev`所指向的结点，尾结点为`head`所指向的结点，即第一个结点，其`next`指针被我们在`for`循环前赋值为`NULL`，这里我们要将其指向下一轮递归的结果。

由于递归调用在实现（`for`循环）之后，所以递归的效果是：将链表按`k`个一组从前往后依次翻转，直到最后一组长度小于`k`，则返回剩下的结点接在上一组已经翻转的链表结尾，接好后的链表又接在上上一组已经翻转的链表结尾，依次向前接上。直到接到第一组的已经翻转的链表结尾，那么整个的链表就已经翻转完成。新链表的头结点为第一组的`prev`所指向的结点。

```c++
class Solution {
public:
    int length(ListNode * node) {
        int count = 0;
        while (node) { 
            count++;
            node = node->next;
        }
        return count;
    }
    ListNode* reverseKGroup(ListNode* head, int k) {
       if(length(head) < k) return head;
       ListNode * cur = head;
       ListNode * prev = NULL, *next = NULL;
       for (int i = 0; i < k; i++) {
           next = cur->next;
           cur->next = prev;
           prev = cur;
           cur = next;
       }
       head->next = reverseKGroup(cur, k);
       return prev;
     }
};
```



### [题目七：Rotate List](https://leetcode.com/problems/rotate-list/)

#### 题目描述

> Given a linked list, rotate the list to the right by *k* places, where *k* is non-negative.
>
> **Example 1:**
>
> ```
> Input: 1->2->3->4->5->NULL, k = 2
> Output: 4->5->1->2->3->NULL
> Explanation:
> rotate 1 steps to the right: 5->1->2->3->4->NULL
> rotate 2 steps to the right: 4->5->1->2->3->NULL
> ```
>
> **Example 2:**
>
> ```
> Input: 0->1->2->NULL, k = 4
> Output: 2->0->1->NULL
> Explanation:
> rotate 1 steps to the right: 2->0->1->NULL
> rotate 2 steps to the right: 1->2->0->NULL
> rotate 3 steps to the right: 0->1->2->NULL
> rotate 4 steps to the right: 2->0->1->NULL
> ```

题目给出一个单向链表，和一个非负整数**k**，**k**的大小可能大于链表长度。要求做**k**次操作，每一次都把链表尾结点连接到头结点，并更新新的头结点和尾结点。相当于把链表向右循环右移**k**个结点。

#### 我的解法

我的思路很简单，首先将**k**对链表长度求模，得到新的**k1**，然后将链表后面**k1**的长度一次性移动到链表头部，并更新新的头结点和尾结点。

在求后面**k1**长度时利用双指针。两个指针的偏移为**k1**，这样在一起右移，当右指针的下一节点为**NULL**时，左指针的下一节点就为倒数第**k1**个结点。

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    int len(ListNode *node) {
        int num = 0;
        while (node) {
            num++;
            node = node->next;
        }
        return num;
    }
    
    ListNode* rotateRight(ListNode* head, int k) {
        if (NULL == head || NULL == head->next) {
            return head;
        }
        ListNode *left = head, *right = head;
        int num = len(head);
        k %= num;
        if (0 == k) {
            return head;
        }
        
        for (int i = 0; i < k; ++i) {
            right = right->next;
        }
        while (right->next) {
            left = left->next;
            right = right->next;
        }
        ListNode *temp = left->next;
        left->next = NULL;
        right->next = head;
        return temp;
    }
};
```

#### 他人解法

**建环**

一定义一个尾指针**tail**，当尾指针到达链表尾结点时，此时得到链表长度**len**，并且将链表头尾连结起来形成一个闭环。此时将k做求模运算以减少不必要的操作。然后尾指针继续前进**len-k**个结点，此时尾指针所指就是新的尾结点，其下一个结点就是新的头结点。

这个方法确实要比我的方法更快那么一点。因为其时间复杂度为**2n-k**，而我的算法的复杂度为**3n-k**，因为我先遍历一遍得到链表长度，然后是双指针同时移动。但都是一个数量级，也差不了多少。

```c++
class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k) {
        if (NULL == head || NULL == head->next || 0 == k) {
            return head;
        }
        int len = 1;
        ListNode *newHead, *tail;
        newHead = tail = head;
        while (tail->next) {
            len++;
            tail = tail->next;
        }
        tail->next = head;  //circle the link
        k %= len;
        if (k) {
            for (int i = 0; i < len - k; i++) {
                tail = tail->next;
            }
        }

        newHead = tail->next;
        tail->next = NULL;  //break the circle
        return newHead;
    }
};
```



### [题目八：Remove Duplicates from Sorted List II](https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/)

#### 题目描述

> Given a sorted linked list, delete all nodes that have duplicate numbers, leaving only *distinct* numbers from the original list.
>
> **Example 1:**
>
> ```
> Input: 1->2->3->3->4->4->5
> Output: 1->2->5
> ```
>
> **Example 2:**
>
> ```
> Input: 1->1->1->2->3
> Output: 2->3
> ```

题目给出一个单向链表，链表中每个结点包含一个整数，链表结点中整数已经按升序排序。要求删除链表中所有整数重复出现的结点。返回新的链表。

#### 我的解法

**递归解法**

我刚开始没想用递归，我想的是依次扫描，遇到重复的就跳过（将指针指向下一个结点），但是头结点这里不太好处理。所以我就突然想到递归了，递归就不用考虑那么多。如果前两个结点不等，则从第二个结点继续递归，将第一个结点**next**指针指向递归结果；如果前两个结点相等，则去掉前面两个结点，从第3个结点开始递归，返回递归结果。如果没有两个结点，则直接返回。

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        if (!head || !head->next) { //0 or 1
            return head;
        }
        ListNode *nowNode = head->next;
        if (head->val != nowNode->val) {
            head->next = deleteDuplicates(nowNode);
            return head;
        }
        nowNode = nowNode->next;
        while (nowNode) {
            if (head->val == nowNode->val) {
                nowNode = nowNode->next;
            } else {
                return deleteDuplicates(nowNode);
            }
        }
        return NULL;  //nowNode == NULL
    }
};
```

#### 他人解法

**二维指针**

二维指针pp存储一维指针的地址。首先初始化二维指针为指针变量head的地址（变量pp存储的值&head-->内存块结点1的起始地址：&结点1）。如果以`*pp`所指向的结点开头的几个结点的值相等，那么就把后续第一个不等的结点内存地址赋值为二维指针pp所指向的最终地址（此时head所指向的结点可能会改变）；如果以`*pp`所指向的结点开头的两个结点不相等，那么就将第二个结点地址赋值为pp的值（相当于pp后移）。

二维指针可真是难以理解，不过确实比较好用。

```c++
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        if (!head || !head->next) {  //0 or 1
            return head;
        }
        ListNode **pp = &head;
        while (*pp) {
            if ((*pp)->next && (*pp)->val == (*pp)->next->val) {
                ListNode *temp = (*pp)->next;
                while (temp && (*pp)->val == temp->val) {
                    temp = temp->next;
                }
                *pp = temp;
            } else {
                pp = &((*pp)->next);
            }
        }
        return head;
    }
};
```

**头结点法**

头结点法就是在原有链表的基础上额外加上一个自己新建的虚拟结点，这样可以使得原有的头结点不用因为特殊的位置而需要特殊操作，而只需要将其当作其他结点一样就行了

我们要删除链表中的结点其实就是控制链表结点的指针嘛，如果我们需要某一个结点，那么我们只需要将其前面结点的**next**指针指向待删除结点的下一个结点就好了。

我们具体方法是定义3个指针变量pre，cur，next。pre的每一次赋值就是我们最终结果的每一个结点，cur是我们遍历过程中的当前结点，next是其下一个结点。根据cur和next结点，我们将遍历的情况分为两种情况：

1. 如果cur和next结点的值相等，那么说明我们遇到了重复结点，我们需要找到重复的尽头，然后跳过，即保持cur不变，next一直前进直到cur和next的值不等或者next为空，那么就`cur = next; pre->next=next;`就跳过了这些重复的结点了；
2. 如果cur和next结点的值不等，那么说明cur是不重复的，可以加入我们的链表（实际上是在原链表中保留该结点），并将cur赋值为next继续扫描

```c++
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode preNode(0);
        preNode.next = head;
        ListNode *pre, *cur, *next;
        pre = &preNode;
        cur = head;
        while (cur) {
            next = cur->next;
            if (next && next->val == cur->val) {
                while (next && next->val == cur->val) {
                    next = next->next;
                }
                cur = next;
                pre->next = next;  //skip the duplicates
            } else {
                pre = cur;  //get a node
                cur = next;
            }
        }
        return preNode.next;
    }
};
```



### [题目九：Remove Duplicates from Sorted List](https://leetcode.com/problems/remove-duplicates-from-sorted-list/)

#### 题目描述

> Given a sorted linked list, delete all duplicates such that each element appear only *once*.
>
> **Example 1:**
>
> ```
> Input: 1->1->2
> Output: 1->2
> ```
>
> **Example 2:**
>
> ```
> Input: 1->1->2->3->3
> Output: 1->2->3
> ```

从名字我们就知道该题是上一题的弱化版。题目给出一条单向链表，链表中结点大小按升序排序。要求删除重复元素使得链表中元素值的数量和原来一样但不含有重复元素。即所有重复元素都删掉直至剩下一个。如`1>1>2>3>3>4`删除重复元素后就为`1>2>3>4`

#### 我的解法

定义一个结点指针**cur**，**cur**遍历链表并形成一个新的链表。要删除重复元素就需要比较**cur**与其相邻的结点是否相同。如果相等则跳过所有相等，直到一个不相等的结点出现，再将**cur**的**next**指针指向那个不相等的结点。这样重复的元素保留了一个但其它都被跳过了。如果一开始就不等，其实**cur**的**next**指针已经是指向其下一个结点，但是为了统一步伐（代码统一），还是让**cur**的**next**指针指向**cur**的下一个结点。

最后再更新**cur**为其下一个结点。

如此一来，直到**cur**遍历到链表结尾，那么原来的head链表就已经被我们更新为不包含重复结点的新的链表了。

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        ListNode *cur = head;
        while (cur) {
            ListNode *temp = cur->next;
            while (temp && temp->val == cur->val) {
                temp = temp->next;
            }
            cur->next = temp;
            cur = temp;
        }
        return head;
    }
};
```

有人说上面的代码会造成内存泄漏，因为c++没有gc机制，所以我们只需要在while循环中加上两行代码：

```c++
      ListNode *toDelete = temp;
      temp = temp->next;
      delete toDelete;
```

但也有人说没有必要管他，因为我们的目的是做题而不是其它，不管他还能加快我们代码运行速度；也有人说你不知道内存块是如果申请来的，所以你不能贸然用delete去释放它。最好的办法就是不去管他。

**下面是我的递归法**

思路与上面的迭代一样。但是人们都说使用递归的方法不好，由于空间复杂度为O(n)，所以很容易出现**StackOverflow**栈溢出。递归是一个很好用的工具，递归的实现往往简洁而又优雅。但是我们必须明确什么时候可以使用递归。

```c++
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        if (!head || !head->next) return head;
        if (head->val == head->next->val) {
            head = deleteDuplicates(head->next);
        } else {
            head->next = deleteDuplicates(head->next);
        }
        return head;
    }
};
```



#### 他人解法

大同小异

```c++
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        if (!head) return head;
        ListNode *cur = head, *next = cur->next;
        while (next) {
            if (cur->val == next->val) {
                cur->next = next->next;
            } else {
                cur = next;
            }
            next = next->next;
        }
        return head;
    }
};
```



### [题目十：Partition List](https://leetcode.com/problems/partition-list/)

#### 题目描述

> Given a linked list and a value *x*, partition it such that all nodes less than *x* come before nodes greater than or equal to *x*.
>
> You should preserve the original relative order of the nodes in each of the two partitions.
>
> **Example:**
>
> ```
> Input: head = 1->4->3->2->5->2, x = 3
> Output: 1->2->2->4->3->5
> ```

题目给出一个单向链表和一个整数x，要求使用x值将链表分成左右两个部分，左边全部是小于整数x的部分，右边则是大于等于x的部分。注意：在操作链表的过程中一定要保持结点间相对位置和原链表一致。

#### 我的解法

变量说明：

- preNode是我定义的fake头结点，用于简化头结点的操作

- cur存储当前确定的小于x值得结点
- big指针是存储第一个大于等于x值的结点
- small是向前遍历的指针
- pre指针存储small上一个结点。

首先直接判断small的值是否小于x：

1. 如果小于x，那么再判断small是否是cur的下一个结点

   1. 如果是，那么直接将`cur = cur->next`就好了
   2. 否则，将改变指针变量pre、small、cur的next指针并将执行`cur = cur->next`，达到将该结点拉到前面去，并且让big后面都是连续的大于等于x的结点的效果。

   然后再更新small和pre

2. 如果大于等于x，那么判断big是否已经赋值，如果已经赋值就不再赋值，只需更新small和pre就好了，否则就给big赋值再更新small和pre

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* partition(ListNode* head, int x) {
        if (!head || !head->next) return head;
        ListNode preNode(0);
        preNode.next = head;
        ListNode *cur = &preNode;
        ListNode *big = NULL, *pre = NULL, *small = head;
     
        while (small) {
            if (small->val < x) {
                if (pre) {
                    pre->next = small->next;
                }
                if (small != cur->next) {
                    small->next = cur->next;
                    cur->next = small;
                }
                cur = cur->next;
            } else {
                big = big ? big : small;
            }
            pre = small;
            small = small->next;
        }
        return preNode.next;
    }
};
```

#### 他人解法

从上面的分析中我们已经得知题目是要我们使用整数x将链表分成左右两个部分，左边小于x，右边大于等于x。所以该解法就是顺水推舟将原来链表head分成left和right两个子链表，最后再将其合并得到我们需要的链表。



```c++
class Solution {
public:
    ListNode* partition(ListNode* head, int x) {
        if (!head || !head->next) return head;
        ListNode Left(0), Right(0);
        ListNode *left = &Left, *right = &Right;
        while (head) {
            if (head->val < x) {
                left->next = head;
                left = left->next;
            } else {
                right->next = head;
                right = right->next;
            }
            head = head->next;
        }
        right->next = NULL;
        left->next = Right.next;
        return Left.next;
    }
};
```

时间复杂度O(n)，空间复杂度O(1)