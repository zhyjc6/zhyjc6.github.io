---
title: Leetcode 刷题之 Tree
layout: mypost
categories: [Leetcode]
---



### [题目一：Binary Tree Inorder Traversal](https://leetcode.com/problems/binary-tree-inorder-traversal/)

#### 题目描述

> Given a binary tree, return the *inorder* traversal of its nodes' values.
>
> **Example:**
>
> ```
> Input: [1,null,2,3]
>    1
>     \
>      2
>     /
>    3
> 
> Output: [1,3,2]
> ```
>
> **Follow up:** Recursive solution is trivial, could you do it iteratively?

题目给出一个二叉树，要求返回一个中序遍历结点的值的数组。（中序遍历就是根节点顺序在左右子节点中间）

#### 我的解法

题目已经说明不用递归，因为这道题用递归实在是太简单了。于是乎我就想看看到底有多简单。递归解法很快就通过了。但是当我准备迭代解法时却迟迟没有想法。

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    vector<int> res;
    vector<int> inorderTraversal(TreeNode* root) {
        recursive(root);
        return res;
    }
    void recursive(TreeNode* root) {
        if (root) {
            recursive(root->left);                
            res.push_back(root->val);
            recursive(root->right);                
        }
    }
};
```

#### 他人解法

**解法一：使用栈、迭代**

第二个**while**循环是遍历当前结点的所有左边界上的左结点直到叶子结点，全部入栈。然后反弹并存储当前结点的值，再对当前结点的右结点做同样操作，最终遍历全部结点。

```c++
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> res;
        stack<TreeNode*> nodes;
        TreeNode *cur = root;
        while (cur || !nodes.empty()) {
            while (cur) {
                nodes.push(cur);
                cur = cur->left;
            }
            cur = nodes.top();
            nodes.pop();
            res.push_back(cur->val);
            cur = cur->right;
        }
        return res;
    }
};
```

时间复杂度和空间复杂度都是`O(n)`

**解法二：Morris traversal**

莫里斯遍历。我想‘官方’解释已经说的很明白了

> Step 1: Initialize current as root
>
> Step 2: While current is not NULL,
>
> ```
> If current does not have left child
> 
>     a. Add current’s value
> 
>     b. Go to the right, i.e., current = current.right
> 
> Else
> 
>     a. In current's left subtree, make current the right child of the rightmost node
> 
>     b. Go to this left child, i.e., current = current.left
> ```

最终遍历完后树成了一个升序链表，呈一条直线状，类似于这样的结构:

```
1
 \
  2
   \
    3
     \
      ...
       \
        n
```



```c++
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> res;
        TreeNode* cur = root;
        while (cur) {
            if (!cur->left) {
                res.push_back(cur->val);
                cur = cur->right;
            } else {
                TreeNode* temp = cur->left;
                while (temp->right) { //find the rightmost 
                    temp = temp->right;
                }
                temp->right = cur;
                temp = cur;
                cur = cur->left;
                temp->left = NULL;  //断开原cur与原左子树的联系，防止死循环
            }
        }
        return res;
    }
};
```

时间复杂度和空间复杂度都是`O(n)`



### [题目二：Unique Binary Search Trees II](https://leetcode.com/problems/unique-binary-search-trees-ii/)

#### 题目描述

> Given an integer *n*, generate all structurally unique **BST's** (binary search trees) that store values 1 ... *n*.
>
> **Example:**
>
> ```
> Input: 3
> Output:
> [
>   [1,null,3,2],
>   [3,2,null,1],
>   [3,1,null,null,2],
>   [2,1,3],
>   [1,null,2,null,3]
> ]
> Explanation:
> The above output corresponds to the 5 unique BST's shown below:
> 
>    1         3     3      2      1
>     \       /     /      / \      \
>      3     2     1      1   3      2
>     /     /       \                 \
>    2     1         2                 3
> ```

题目给出一个整数n，要求以整数1-n为结点的值，将这n个结点做成一个二叉搜索树，问有多少种结构的树。

二叉搜索树也叫有序二叉树，即**根结点的左子树上的所有结点值 < 根节点的值 < 根节点右子树上所有结点的值**

#### 我的解法

题目问有多少种不同结构的有序二叉树，但由于限定了条件是有序二叉树，所以相同结构的两棵树必定完全相同。因此题目的问题可以构成多少种不同结构的树相当于是可以构成多少种有序二叉树。

这点其实我是看了别人的解法才自己顿悟的，但奈何树的题目对于我来说实在是太难了。我在看了别人的不同解法后理解得还是不够深入，树这一块实在是太难了。

#### 他人解法

**解法一：Divide-and-conquer.**

*分而治之，即将一个问题分解为一个个小问题，小问题解决了大问题也就容易解决了。载体一般是递归。*

我们注意到给出得n个结点，其中得每一个都可以拿来作为root结点，比如n=3的时候：

- 当root=1：树为[1 # 2 # 3]、[1 # 3 2]
- 当root=2：树为[2 1 3]
- 当root=3：树为[3 2 # 1]、[3 1 # # 2 ]

所以我们思路就慢慢显现了，我们要求由整数1..n组成的所有有序二叉树，那么我们就可以遍历这些整数，并以当前的整数i为root，再递归求解1..(i-1)的所有有序二叉树作为所有可能的root的左子树（因左子树结点必须小于根节点）；递归求解(i+1)..n的所有有序二叉树作为root结点的所有可能的右子树，这样再进行两层循环将root和其左右子树连接起来。

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    vector<TreeNode *> generateTree(int from, int to) {
        vector<TreeNode *> ret;
        if(to - from < 0) ret.push_back(0);
        if(to - from == 0) ret.push_back(new TreeNode(from));
        if(to - from > 0) {
            for(int i = from; i <= to; i++) {
                // root's all left subtrees
                vector<TreeNode *> l = generateTree(from, i - 1);
                //root's all right subtrees
                vector<TreeNode *> r = generateTree(i + 1, to);

                for(int j = 0; j < l.size(); j++) {
                    for(int k = 0; k < r.size(); k++) {
                        TreeNode * h = new TreeNode (i);
                        h->left = l[j];
                        h->right = r[k];
                        ret.push_back(h);
                    }
                }
            }
        }
        return ret;
    }

    vector<TreeNode *> generateTrees(int n) {
        if (0 == n) return {};
        return generateTree(1, n);
    }
};
```

**解法二：动态规划**

该动态规划理解起来一度让人头疼，在我认为其精髓在于充分利用了从1..n的这n个结点的值与1..n一一对应，这让左子树和右子树可以只处理一遍。例如我们给出的n是100：

我们肯定是遍历1..100，并将每个结点作为root结点，当以k为root结点时（1<=k<=100），我们需要求两个子问题：

1. 1..k-1 这k-1个结点组成的所有有序二叉树
2. k+1..n 这n-k个结点组成的所有有序二叉树

我们将子问题一得到的结果作为root结点的左子树，把子问题二的结果作为root结点的右子树，再使用两层循环将root结点及其左右子树连结起来就得到了我们最初的1..100的遍历中的k的结果。

假设我们在求trees(n)时，已经求得了trees(n-1)，那么很容易知道trees(1)..trees(n-1)都已求得。这就说明上述的子问题一我们已经求得，只需要求子问题二。两个子问题的结点数范围都一样（0..99)，且结点值都是连续的自然数，唯一不同点在于子问题二的结点值的起始值为k+1，那么我们如何将两个子问题联系起来呢？

我们来看一个例子：1 2 3所组成的有序二叉树和 4 5 6 所组成的有序二叉树有什么不同呢？没什么不同！形状完全一样，唯一不同点就是结点值。其实，1 2 3 与 1 2 4、2 3 4、 1 10 100、i j k(i<j<k)所组成的有序二叉树完全一样，但只有1 2 3与2 3 4是可以直接建立联系的（这就是该算法的精髓了）。因为我们只需要将前者的树的结点值加上一个偏移值1后就能得到后者的树了。相当于直接copy了一整棵树再统一给每一个结点值加上一个偏移值。

所以我们需要定义一个特殊的克隆函数`clone(TreeNode* node, int offset)`，其中参数node是我们要克隆的树的根结点，offset是我们右子树结点值与左子树的偏移值，其实就是两者的根结点值。

值得注意的一点是我们给出答案中所有的有序二叉树中的左子树其实都是引用的，而右子树才是新分配的内存空间。当然，左子树引用的也是之前我们右子树申请的内存空间。



```c++
class Solution {
public:
    vector<TreeNode*> generateTrees(int n) {
        if (0 == n) return {};
        vector<TreeNode*> emptyList = {};
        vector<vector<TreeNode*>> ret(n+1, emptyList);
        ret[0].push_back(NULL);
        
        for (int len = 1; len <= n; len++) {
            for (int root_index = 0; root_index < len; root_index++) {
                //left subtrees
                for (TreeNode* ltree : ret[root_index]) {  
                    //right subtrees
                    for (TreeNode* rtree : ret[len-root_index-1]) {  
                        TreeNode* newroot = new TreeNode(root_index + 1);
                        //the left subtree is shared
                        newroot->left = ltree;  
                        //the struct is shared but value is changed
                        newroot->right = clone(rtree, root_index+1);
                        ret[len].push_back(newroot);
                    }
                }
            }
        }
        return ret[n];
    }
    
    TreeNode* clone(TreeNode* node, int offset) {
        if (NULL == node) return NULL;
        TreeNode* newNode = new TreeNode(node->val + offset);
        newNode->left = clone(node->left, offset);
        newNode->right = clone(node->right, offset);
        return newNode;
    }
};
```

**解法三：动态规划**

此动态规划非彼动态规划，是属于一般人想到的解法。利用了有序二叉树的性质将结点一个一个插入从而得到想要的结点数的树。

由于有序二叉树的左结点<根结点<右结点，而一棵树只要结点数大于1，那么其必有左子树、根结点、右子树中的其二。如果我们从0开始，将1..n的所有值按顺序一一插入，那么插入的结点位置只能有两个，即根结点或者右结点（因为插入的值大于已有的所有结点）：

```
例如原有序二叉树：
    3
   /
  2
 /
1
插入值为4的结点：
case 1: 替换为根结点
      4
     /
    3
   /
  2
 /
1
case 2: 替换为最右结点
    3
   / \
  2   4
 /
1
```
上述情况是在根结点没有右子树的前提下，逻辑比较简单，那么如果有右子树呢？
```
例如原有序二叉树：
1
 \
  2
   \
    3
插入值为4的新结点：
case 1: 替换为根结点
  4
 /
1
 \
  2
   \
    3
case 2: 替换为最右结点
1                    1                  1
 \                    \                  \
  4                    2                  2
 /                      \                  \
2                        4                  3
 \                      /                    \
  3                    3                      4
```

我们发现，在根结点一路right下去的结点所在位置都可以用来插入新结点（包括根结点和`NULL`），而原来的结点只需要将其接在新结点的左子树上。

但是有一点我们需要注意，那就是当我们新申请的结点加入了现有的树后，我们也调用了克隆函数clone了所有结点，并将新的根结点存入容器中。这时候我们需要把被新结点扰乱的树复原，因为我们很可能马上就要再次使用。

```c++
class Solution {
public:
    TreeNode* clone(TreeNode* root){
        if(root == nullptr)
            return nullptr;
        TreeNode* newroot = new TreeNode(root->val);
        newroot->left = clone(root->left);
        newroot->right = clone(root->right);
        return newroot;
    }
    vector<TreeNode *> generateTrees(int n) {
        if (n < 1) return {};
        vector<TreeNode*> res(1,nullptr);
        //add node(i) one by one
        for(int i = 1; i <= n; i++) {
            vector<TreeNode *> tmp;
            for(int j = 0; j < res.size(); j++) {
                TreeNode* oldroot = res[j];
                //case 1: new node is new root
                TreeNode* root = new TreeNode(i);
                TreeNode* target = clone(oldroot);
                root->left = target;
                tmp.push_back(root);

                //case 2: new node is the rightest node
                TreeNode* tmpold = oldroot;
                while(tmpold != nullptr){
                    TreeNode* newNode = new TreeNode(i);
                    TreeNode *oldRight = tmpold->right;
                    tmpold->right = newNode;
                    newNode->left = oldRight;
                    TreeNode *target = clone(oldroot);
                    tmp.push_back(target);
                    //recover old tree
                    tmpold->right = oldRight;
                    //forward right
                    tmpold = tmpold->right;
                }
            }
            res = tmp; // dp
        }
        return res;
    }
};
```



### [题目三：Unique Binary Search Trees](https://leetcode.com/problems/unique-binary-search-trees/)

#### 题目描述

> Given *n*, how many structurally unique **BST's** (binary search trees) that store values 1 ... *n*?
>
> **Example:**
>
> ```
> Input: 3
> Output: 5
> Explanation:
> Given n = 3, there are a total of 5 unique BST's:
> 
>    1         3     3      2      1
>     \       /     /      / \      \
>      3     2     1      1   3      2
>     /     /       \                 \
>    2     1         2                 3
> ```

该题是题目二的前身，也就是说题目二那么难，就是因为它是该题的变体。那么该题应该也就没有那么难了。

该题给出一个整数n，要求我们求出由1..n这n个值能组成的所有有序二叉树的总数。

#### 我的解法

这种题目给我的第一感觉就是要找规律。当我进一步思考后，我在想按照结点值大小从小到大按次序插入，而每次插入的位置只能是根结点或最右结点。根结点的数量很容易得知，就是上一轮的所有二叉树，但最右结点就麻烦了。这里我在想使用二维数组去表示根结点的每一级右结点的数量，但是会比较乱。

于是我就在草稿上画图，演算，突然发现还有更简单的算法！！当结点数为3时，根结点可以为1、2、3，根结点为1时，左子树结点数为0，右子树结点数为2；根结点为2时，左子树和右子树结点数都为1；根结点为3时，左子树结点数为2，右子树结点数为0。而在该题的条件下，结点数相同所得到的有序二叉树结构完全一样。所以当一个值为根结点时，其所构成的有序二叉树的总数为其**左右子树的数量的乘积**，结点数为1只能构成1棵树，结点数为2只能构成2棵树。结点数为0肯定是0棵树，但是为了统一计算，我们将结点数为0所构成的有序二叉树数量设为1。

所以结点数为3时要计算其所能构成的**BST**数量就很简单了：

`sum = 1*2 + 1*1 + 2*1`

即结点数为3所能构成的**BST**数量为5

由此我们可以得到`dp[n] = dp[0]*dp[n-1] + dp[1]*dp[n-2] +... +dp[n-1]*dp[0]`，其中dp[n]表示n个结点所能构成的**BST**的数量。

```c++
class Solution {
public:
    int numTrees(int n) {
        vector<int> dp(n+1, 0);
        dp[0] = dp[1] = 1;
        for (int len = 2; len <= n; len++) {
            for (int k = 1; k <= len; k++) {
                //the num of left-subtree and right-subtree
                int left = k - 1;
                int right = len - k;
                dp[len] += dp[left] * dp[right];
            }
        }
        return dp[n];
    }
};
```

#### 他人解法

经过浏览讨论区我才发现，原来这其实就是[卡特兰数](https://baike.baidu.com/item/%E5%8D%A1%E7%89%B9%E5%85%B0%E6%95%B0/6125746?fr=aladdin)啊！而且讨论区高票答案都是这种解法，看来这就是最优解了，没想到我一开始就能想到最优解，哈哈！

其他人的解法基本雷同，只有少部分人有一些区别，比如下面的解法，就是利用卡特兰数计算的过程具有对称性，将遍历的长度缩短为原来的一半了。

```c++
class Solution {
public:
    int numTrees(int n) {
        vector<int> dp(n+1, 0);
        dp[0] = dp[1] = 1;
        for (int len = 2; len <= n; len++) {
            for (int k = 1; k <= len / 2; k++) {
                dp[len] += dp[k-1] * dp[len-k];
            }
            dp[len] *= 2;
            //左右对称的情况
            if (len & 1) {
                dp[len] += dp[len/2] * dp[len/2];
            }
        }
        return dp[n];
    }
};
```



### [题目四：Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)

#### 题目描述

> Given a binary tree, determine if it is a valid binary search tree (BST).
>
> Assume a BST is defined as follows:
>
> - The left subtree of a node contains only nodes with keys **less than** the node's key.
> - The right subtree of a node contains only nodes with keys **greater than** the node's key.
> - Both the left and right subtrees must also be binary search trees.
>
>  
>
> **Example 1:**
>
> ```
>     2
>    / \
>   1   3
> 
> Input: [2,1,3]
> Output: true
> ```
>
> **Example 2:**
>
> ```
>     5
>    / \
>   1   4
>      / \
>     3   6
> 
> Input: [5,1,4,null,null,3,6]
> Output: false
> Explanation: The root node's value is 5 but its right child's value is 4.
> ```

题目意思很简单，给出一棵二叉树，要我们判断其是否为**BST**，即有序二叉树。

#### 我的解法

**每个结点都有上下限**

我起初的想法是使用中序遍历该二叉树，如果是有序二叉树，那么中序遍历的结果应该是一个有序且升序的序列。但是该想法一时竟不知怎么实现，于是乎我便想到换一个思路，先用递归来试试看，因为递归的实现往往远比迭代的实现要简单。

我刚开始递归的思路是一个结点应该大于其左节点而小于其右结点，递归版本很快就写出来了，也实现了我的想法。但是却不能通过，因为**BST**不是简单的要求每一个结点的左子节点都小于该结点、又子结点都大于该结点。例如：

```
    3
   / \
  2   5
 /   / \
1   0   6
 \
  100
```

结点100是1的右子结点，满足了大于父结点1的要求，但是它也是属于结点2和结点3的左子树，却都没有小于2和小于3；同样结点0是5的左子结点，满足了小于父节点5的要求，但是却小于了结点3。

我一开始没通过的问题就出现在这。然后我看了官方解答才恍然大悟：我们只需要在原来的递归上加上一个上下限的限定，那么就不会有什么问题了。为什么这么说呢？

这是因为，**BST**就相当于一个有序数组，除了两头的最大值和最小值，中间的其他值的大小都有一定的限制，即有一个大小的上下限的区间。如果你在草稿上画图仔细观察，你一定会发现在树的拐点（结点1、5）的地方上下限中的一方会更新，如结点1的范围为（INT_MIN, 2)，而其”拐弯“后子节点100的取值范围为（1，2），更新了下限。

下面是添加了上下限的递归代码，比较难以理解。

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return helper(root, nullptr, nullptr);
    }
    bool helper(TreeNode* root, TreeNode* min, TreeNode* max) {
        if (root == nullptr) {
            return true;
        }
        if (min && root->val <= min->val) {
            return false;
        }
        if (max && root->val >= max->val) {
            return false;
        }
        return helper(root->left, min, root) && helper(root->right, root, max);
    }
};
```

**顺序递归**

受到树对于我来说太难了的影响，我在做下一题的时候理解了好久，不断翻看别人的解法，最终看到一个递归的思路，于是将其转接应用到该题。

我上面的解法不是也是递归嘛？那么两者有什么区别呢？上面的解法我们在递归的过程中给每一个结点都设置了一个上下限，导致理解起来不是很直观。而现在我们换种思路，为什么我们不能控制递归的顺序，使得遍历的效果和中序遍历一样呢？其实是可以的。

我们首先将递归深入到左子树，再左子树回溯的过程中判断相邻两结点的大小关系，当一个左子树遍历完成，就进入右子树的递归。递归的返回条件是根结点为空。

```c++
class Solution {
    TreeNode *preNode = nullptr;
    bool isValid = true;
public:
    void helper(TreeNode* root) {
        if (nullptr == root) return;
        helper(root->left);
        if (preNode && preNode->val >= root->val) {
            isValid = false;
            return;
        }
        preNode = root;
        helper(root->right);
    }
    bool isValidBST(TreeNode* root) {
        helper(root);
        return isValid;
    }
};
```



#### 他人解法

**解法一：利用栈迭代**

思路与上面的递归一样，就是利用栈来辅助，使得迭代有递归的效果

```c++
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        if (root == nullptr) return true;
        
        TreeNode *min = nullptr, *max = nullptr;
        stack<vector<TreeNode*>> stack;
        stack.push({root, min, max});
        while (!stack.empty()) {
            vector<TreeNode*> top = stack.top();
            root = top[0];
            min = top[1];
            max = top[2];
            stack.pop();
            if (root == nullptr) {
                continue;
            }
            if (min != nullptr && root->val <= min->val) return false;
            if (max != nullptr && root->val >= max->val) return false;
            stack.push({root->left, min, root});
            stack.push({root->right, root, max});
        }
        return true;
    }
};
```

**解法二：利用栈中序遍历**

没想到啊，我的最初想法竟然也是官方解法！不错。因为有序二叉树就是意思很明显了，就是已经排序的二叉树。如果我们中序遍历出来发现不是升序的，那么该树就一定不是有序二叉树。

```c++
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        double pre = -DBL_MAX;
        stack<TreeNode*> stack;
        while (!stack.empty() || root != nullptr) {
            while (root != nullptr) {
                stack.push(root);
                root = root->left;
            }
            root = stack.top();
            stack.pop();
            if (root->val <= pre) {
                return false;
            }
            pre = root->val;
            root = root->right;
        }
        return true;
    }
};
```



### [题目五：Recover Binary Search Tree](https://leetcode.com/problems/recover-binary-search-tree/)

#### 题目描述

> Two elements of a binary search tree (BST) are swapped by mistake.
>
> Recover the tree without changing its structure.
>
> **Example 1:**
>
> ```
> Input: [1,3,null,null,2]
> 
>    1
>   /
>  3
>   \
>    2
> 
> Output: [3,1,null,null,2]
> 
>    3
>   /
>  1
>   \
>    2
> ```
>
> **Example 2:**
>
> ```
> Input: [3,1,4,null,null,2]
> 
>   3
>  / \
> 1   4
>    /
>   2
> 
> Output: [2,1,4,null,null,3]
> 
>   2
>  / \
> 1   4
>    /
>   3
> ```
>
> **Follow up:**
>
> - A solution using O(*n*) space is pretty straight forward.
> - Could you devise a constant space solution?

题目给出一颗有序二叉树，其中有两个结点的位置被错误地调换了，要求我们在不改变原来树的结构的前提下让该二叉树重新有序（把两个错误位置的结点调换回来）

#### 我的解法

**利用栈中序遍历法**

一个有序二叉树中序遍历的结果应该是一个升序的序列，如果其中某两个地方不满足该升序的规律，那么就找出那两个结点，互换两者结点的值。具体有以下两种情况：

- 情况一：两结点相邻

  如1 2 3 4 5 ->  1 2 4 3 5，两交换结点分别是3和4。这里就只有一组逆序对（4，3）

- 情况二：两结点不相邻

  如1 2 3 4 5 -> 1 2 5 4 3，两交换结点分别是3和5。这里就有两组逆序对（5，4）、（4，3）

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    void recoverTree(TreeNode* root) {
        if (root == nullptr) return;
        TreeNode *big = nullptr, *sma = nullptr, *pre = nullptr;
        stack<TreeNode*> stack;
        while (!stack.empty() || root) {
            while (root) {
                stack.push(root);
                root = root->left;
            }
            root = stack.top();
            stack.pop();
         
            if (!big && pre && pre->val > root->val) {
                big = pre;
                sma = root;  //情况一，两结点相邻
            } else if (big && pre->val > root->val) {
                sma = root;
                break;
            }
            pre = root;
            root = root->right;
        }
        if (sma && big) {
            swap(sma->val, big->val);
        }
    }
};
```
时间复杂度分析：
- 时间复杂度`O(n)`
- 空间复杂度：最大是 `O(H)` 来维持栈的大小，其中 `H` 指的是树的高度。

#### 他人解法

**解法一：顺序递归**

递归与中序遍历的结合，结合了二者代码简洁与易于理解的优点。

```c++
class Solution {
    TreeNode *wrongNode0 = nullptr, *wrongNode1 = nullptr, *preNode = nullptr;
public:
    void helper(TreeNode *root) {
        if (nullptr == root) return;
        helper(root->left);
        if (preNode && preNode->val > root->val) {
            if (!wrongNode0) {
                wrongNode0 = preNode;
                wrongNode1 = root;
            } else {
                wrongNode1 = root;
                return;
            }
        }
        preNode = root;
        helper(root->right);
    }
    void recoverTree(TreeNode* root) {
        helper(root);
        if (wrongNode0 && wrongNode1) {
            swap(wrongNode0->val, wrongNode1->val);
        }
    }
};
```

时间复杂度分析：

- 时间复杂度`O(n)`
- 空间复杂度：最大是 `O(H)` 来维持栈的大小，其中 `H` 指的是树的高度。

**解法二：Morris中序遍历**

上述的代码空间复杂度都没有做到题目要求的O(1)，即恒定空间。而Morris能做到！

Morris算法的思想是：仅仅遍历树而不用其它类似于栈的空间。具体来说是在节点和它的直接前驱之间设置一个临时的链接：predecessor.right = root，从该节点开始，找到它的直接前驱并验证是否存在链接。

- 如果没有链接，设置连接并走向左子树。
- 如果有连接，断开连接并走向右子树。
- 如果该节点没有左子树，那么直接走向右子树。

总的来说就是：尽可能地向左走，走到尽头就**回退**再向右走一步，重复这个过程。（详细解释可参考Leetcode中文网站官方题解：https://leetcode-cn.com/problems/recover-binary-search-tree/solution/hui-fu-er-cha-sou-suo-shu-by-leetcode/）

```c++
class Solution {
    TreeNode *pre = nullptr, *first = nullptr, *second = nullptr;
    void compare(TreeNode* cur) {
        if (pre && pre->val > cur->val) {
            if (first == nullptr) {
                first = pre;
                second = cur;
            } else {
                second = cur;
            }
        }
        pre = cur;
    }
public:
    void recoverTree(TreeNode* root) {
        TreeNode *cur = root;
        while (cur) {
            if (cur->left == nullptr) {
                compare(cur);
                cur = cur->right; //右拐或者回溯
            } else {
                //find the rightest node of left-subtree
                TreeNode* temp = cur->left;
                while (temp->right && temp->right != cur) {
                    temp = temp->right;
                }
                //the connecting already exists
                //只有触底完回溯后才会发生
                if (temp->right == cur) {
                    temp->right = nullptr;
                    compare(cur);
                    cur = cur->right;
                } else {
                    //construct the connecting
                    temp->right = cur;
                    cur = cur->left;
                }
            }
        }
        if (first && second) {
            swap(first->val, second->val);
        }
    }
};
```

复杂度分析：

- 时间复杂度：`O(N)`，但我们访问每个节点两次。
- 空间复杂度：`O(1)`。

### [题目六：Same Tree](https://leetcode.com/problems/same-tree/)

#### 题目描述

> Given two binary trees, write a function to check if they are the same or not.
>
> Two binary trees are considered the same if they are structurally identical and the nodes have the same value.
>
> **Example 1:**
>
> ```
> Input:     1         1
>           / \       / \
>          2   3     2   3
> 
>         [1,2,3],   [1,2,3]
> 
> Output: true
> ```
>
> **Example 2:**
>
> ```
> Input:     1         1
>           /           \
>          2             2
> 
>         [1,2],     [1,null,2]
> 
> Output: false
> ```
>
> **Example 3:**
>
> ```
> Input:     1         1
>           / \       / \
>          2   1     1   2
> 
>         [1,2,1],   [1,1,2]
> 
> Output: false
> ```

题目给出两个二叉树，要求我们判断二者是否相等。即二者结构及其对应位置的结点值相等。

#### 我的解法

**递归**

接着上面的解法，会了遍历一棵树，那这道题就简单了。就是简单的同时遍历两棵树，比较对应结点的值，不相等则退出，返回false，否则继续递归遍历。

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
    bool isSame = true;
public:
    void helper(TreeNode* p, TreeNode* q) {
        if (!p && !q) return;
        if (!p && q || !q && p) {
            isSame = false;
            return;
        }
        if (p->val != q->val) {
            isSame = false;
            return;
        }
        helper(p->left, q->left);
        helper(p->right, q->right);
    }
    bool isSameTree(TreeNode* p, TreeNode* q) {
        helper(p, q);
        return isSame;
    }
};
```

**迭代**

同样的中序遍历，迭代需要借助类似于栈的工具。

```c++
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        stack<TreeNode*> myStack;
        while (!myStack.empty() || p && q) {
            while (p && q) {
                myStack.push(p);
                myStack.push(q);
                p = p->left;
                q = q->left;
            }
            if (!p && q || p && !q) {
                return false;
            }
            TreeNode *node2 = myStack.top();  //q
            myStack.pop();
            TreeNode *node1 = myStack.top();  //p
            myStack.pop();
            if (node1->val != node2->val) {
                return false;
            }
            p = node1->right;
            q = node2->right;
        }
        if (!p && q || p && !q) return false;
        return true;
    }
};
```



#### 他人解法

**真递归**

上面的递归是我们自己额外定义的一个递归函数，而事实上不用额外定义其它函数，只需要将当前函数定义为递归函数就好了。看来我是上面的递归形式写多了，有点思维定势了。

```c++
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p || !q) return p == q; //至少有一方为nullptr
        if (p->val != q->val) return false; //可以比较值大小了
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};
```



### [题目七：Symmetric Tree](https://leetcode.com/problems/symmetric-tree/)

#### 题目描述

> Given a binary tree, check whether it is a mirror of itself (ie, symmetric around its center).
>
> For example, this binary tree `[1,2,2,3,4,4,3]` is symmetric:
>
> ```
>     1
>    / \
>   2   2
>  / \ / \
> 3  4 4  3
> ```
>
>  
>
> But the following `[1,2,2,null,3,null,3]` is not:
>
> ```
>     1
>    / \
>   2   2
>    \   \
>    3    3
> ```
>
>  
>
> **Note:**
> Bonus points if you could solve it both recursively and iteratively.

题目给出一颗二叉树，要求我们判断是否是对称树。注意：对称范围包含树的结构和结点的值。

#### 我的解法

题目说我们如果能同时使用迭代和递归解决这个问题，就会有额外奖励哦！这个我们不管它，直接开干吧！

**迭代法**

利用栈保存结点，然后从上到下从树的两边向中间移动，判断是否对称。如

```
                 1 (root)
                / \
               2   3
              /     \
             4       5
            / \     / \
           6   7   8   9
              /     \
             10      11
```

我们先判断root是否为空，若为空，那肯定就是对称了。不为空则判断（2，3），若相等则判断（4，5），若相等则继续向下判断，判断的顺序为（6，9）-> （7，8） -> （10，11）。

当然也可以从树的中间向两边移动，只需要改动左右结点入栈的顺序就好了。

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    bool isSymmetric(TreeNode* root) {
        if (!root) return true;
        TreeNode *left, *right;
        stack<TreeNode*> leftNodes, rightNodes;
        leftNodes.push(root->left);
        rightNodes.push(root->right);
        
        while (!leftNodes.empty() && !rightNodes.empty() || left && right) {
            left = leftNodes.top();
            right = rightNodes.top();
            leftNodes.pop();
            rightNodes.pop();
            if (left && right) {
                if (left->val != right->val) {
                    return false;
                }
                leftNodes.push(left->right);
                leftNodes.push(left->left);
                rightNodes.push(right->left);
                rightNodes.push(right->right);
            }
            if (!left && right || left && !right) {
                return false;
            }
        }
        if (!left && right || left && !right) return false;
        return true;
    }
};
```

**递归法**

由于我们是对比是否对称，所以每次递归我们都要涉及到两个结点，所以理所当然的我们就自定义了一个递归函数，包含两个参数。第一个版本是我第一次想到的，第二个是我在写第一个的时候想到的，两个都一次通过了。

```c++
class Solution {
    bool isSy = true;
public:
    void helper(TreeNode* left, TreeNode* right) {
        if (left && right) {
            if (left->val != right->val) {
                isSy = false;
                return;
            }
            helper(left->left, right->right);
            helper(left->right, right->left);
        }
        if (!left && right || left && !right) {
            isSy = false;
        }
        return;
    }
    bool isSymmetric(TreeNode* root) {
        if (nullptr == root) return true;
        helper(root->left, root->right);
        return isSy;
    }
};
```

上面的递归不算简洁，我们可以不用定义额外变量，而是直接定义bool型的递归函数，使用函数返回值传递值而不是用全局变量。

```c++
class Solution {
public:
    bool helper(TreeNode* left, TreeNode* right) {
        if (left && right) {
            if (left->val != right->val) {
                return false;
            }
            return helper(left->left, right->right) && helper(left->right, right->left);
        }
        if (!left && right || left && !right) {
            return false;
        }
        return true;
    }
    bool isSymmetric(TreeNode* root) {
        if (nullptr == root) return true;
        return helper(root->left, root->right);
    }
};
```

#### 他人解法

**解法一：递归**

```c++
class Solution {
public:
    bool helper(TreeNode* left, TreeNode* right) {
        if (left && right) {
            return left->val == right->val && helper(left->left, right->right) && helper(left->right, right->left);
        }
        return nullptr == left && nullptr == right;
    }
    bool isSymmetric(TreeNode* root) {
        return nullptr == root || helper(root->left, root->right);
    }
};
```

**解法二：迭代**

这条件语句多么优雅！一个栈实现，每次都把左右对称的两个结点压入栈中。

```c++
class Solution {
public:
    bool isSymmetric(TreeNode* root) {
        if (nullptr == root) return true;
        stack<TreeNode*> stack;
        stack.push(root->left);
        stack.push(root->right);
        while (!stack.empty()) {
            TreeNode *right = stack.top();
            stack.pop();
            TreeNode *left = stack.top();
            stack.pop();
            if (!left && !right) continue;
            if (!left || !right || left->val != right->val) return false;
            stack.push(left->left);
            stack.push(right->right);
            stack.push(left->right);
            stack.push(right->left);
        }
        return true;
    }
};
```



### [题目八：Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)

#### 题目描述

> Given a binary tree, return the *level order* traversal of its nodes' values. (ie, from left to right, level by level).
>
> For example:
> Given binary tree `[3,9,20,null,null,15,7]`,
>
> ```
>     3
>    / \
>   9  20
>     /  \
>    15   7
> ```
>
> 
>
> return its level order traversal as:
>
> ```
> [
>   [3],
>   [9,20],
>   [15,7]
> ]
> ```

题目给出一棵二叉树，要我们从上到下从左到右一级一级地遍历整棵树，也就是**BFS**广度优先遍历，其中每一级地结点放在一个容器里，最终以二维容器返回。

#### 我的解法

**递归大法**

虽然我们无法控制递归的方向，使其从上到下、从左到右进行遍历（至少我不能），但是我们可以使用参数来确定递归函数的当前位置，从而可以把正确的结点放在正确的位置！

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
    vector<vector<int>> ret;
public:
    void helper(TreeNode* root, int level) {
        if (nullptr == root) return;
        if (ret.size() < level) ret.push_back(vector<int>());
        ret[level-1].push_back(root->val);
        helper(root->left, level + 1);
        helper(root->right, level + 1);
    }
    vector<vector<int>> levelOrder(TreeNode* root) {
        helper(root, 1);
        return ret;
    }
};
```

**迭代**

由于迭代的方向是横向一级一级地遍历，因此我们使用栈不方便实现，但是队列就很合适了。我们这里的队列是先进先出**FIFO**队列，因此我们可以将二叉树的某一层从左到右放入队列中，再依次遍历这些结点，并按顺序将其左右结点依次放入队列中，新放入的结点会加在队尾，而我们处理的结点是队首结点，并且每次处理完都要将其弹出队列。（不断循环直至队列为空）

```c++
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        if (nullptr == root) return {};
        vector<vector<int>> ret;
        queue<TreeNode*> queue;
        queue.push(root);
        vector<int> nodes;
        while (!queue.empty()) {
            int len = queue.size();
            for (int i = 0; i < len; i++) {
                TreeNode *cur = queue.front();
                nodes.push_back(cur->val);
                if (cur->left) queue.push(cur->left);
                if (cur->right) queue.push(cur->right);
                queue.pop();
            }
            ret.push_back(nodes);
            nodes.clear();
        }
        return ret;
    }
};
```

#### 他人解法

都是一样的套路，不是递归就是使用队列的迭代实现。



### [题目九：Binary Tree Zigzag Level Order Traversal](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/)

#### 题目描述

> Given a binary tree, return the *zigzag level order* traversal of its nodes' values. (ie, from left to right, then right to left for the next level and alternate between).
>
> For example:
> Given binary tree `[3,9,20,null,null,15,7]`,
>
> ```
>     3
>    / \
>   9  20
>     /  \
>    15   7
> ```
>
> 
>
> return its zigzag level order traversal as:
>
> ```
> [
>   [3],
>   [20,9],
>   [15,7]
> ]
> ```

题目给出一棵二叉树，要求我们使用**Z**字形遍历该二叉树，结果以二维整型数组形式返回。其中每一级的结点保存为一个数组。

#### 我的解法

**层数控制递归**

刚开始我想使用递归的思路硬刚，如果层数是奇数就正序，层数是偶数就逆序，但发现还是行不通。因为递归函数上一层是正序时，其子函数也是正序调用，即使我使用层数控制，我能改变的只有每一个结点先遍历左节点还是右结点。

硬刚失败我就想找点投机取巧的方法，返回的不是二维数组嘛，我们可以全部都正序遍历一遍得到我们的最初的结果啊！然后我们再遍历该结果按照要求将对应索引的数组逆序，再将其返回，这样就不会有错了。效果还不错！

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    vector<vector<int>> ret;
    void helper(TreeNode* cur, int level) {
        if (nullptr == cur) return;
        if (ret.size() < level) ret.push_back(vector<int>() );
        ret[level-1].push_back(cur->val);
        if (cur->left) helper(cur->left, level+1);
        if (cur->right) helper(cur->right, level+1);            
    }
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        helper(root, 1);
        for (int i = 0; i < ret.size(); i++) {
            if (i & 1) {
                reverse(ret[i].begin(), ret[i].end());
            }
        }
        return ret;
    }
};
```

**两个栈迭代**

题目不是要求**Z**字形遍历嘛，那不就是要求正序+逆序嘛。巧了，我就想到一个数据结构刚好符合这个特点，没错，那就是栈！栈不是先进后出嘛，比如1 2 3 顺序入栈，再出栈就是3 2 1，再顺序入栈再出栈就是1 2 3 。完美！

```
         1        step1:         栈1：1                    栈2：空
        / \
       2   3      step2:         栈1：空                    栈2：3 2                    
      /   / \
     4   5   6    step3:         栈1：4 5 6                 栈2：空
                  返回：          栈1：空                    栈2：空
```



```c++
class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        if (root == nullptr) return {};
        vector<vector<int>> ret;
        stack<TreeNode*> stack, rstack;
        stack.push(root);
        int level = 1;
        TreeNode *cur;
        while (!stack.empty()) {
            if (ret.size() < level) {
                ret.push_back(vector<int>());
            }
            while (!stack.empty()) {
                cur = stack.top();
                stack.pop();
                ret[level-1].push_back(cur->val);
                if (cur->left) rstack.push(cur->left);
                if (cur->right) rstack.push(cur->right);
            }
            if (rstack.empty()) break;
            level++;
            
            if (ret.size() < level) {
                ret.push_back(vector<int>());
            }
            while (!rstack.empty()) {
                cur = rstack.top();
                rstack.pop();
                ret[level-1].push_back(cur->val);
                if (cur->right) stack.push(cur->right);
                if (cur->left) stack.push(cur->left);
            }
            level++;

        }
        return ret;
    }
};
```

#### 他人解法

居然看到高赞中有和我两个解法都一样的答案。递归也是使用**DFS**，迭代也是使用两个栈。不过自古评论区出人才，我还看到了更简洁的写法。小技巧在于**vector**，如果我们是正序访问，但需要逆序保存，仅仅改变插入的方法就ok了。插入到末尾不会改变元素的相对位置，但是插入首部就能得到逆序了！

**递归版本**

```c++
class Solution {
public:
    vector<vector<int>> ret;
    void helper(TreeNode* cur, int level) {
        if (nullptr == cur) return;
        if (ret.size() < level) ret.push_back(vector<int>());
        if (level & 1) {
            ret[level-1].push_back(cur->val);
        } else {
            ret[level-1].insert(ret[level-1].begin(), cur->val);
        }
        if (cur->left) helper(cur->left, level+1);
        if (cur->right) helper(cur->right, level+1);
    }
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        helper(root, 1);
        return ret;
    }
};
```

**迭代版本**

只需要一个队列

```c++
class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        if (root == nullptr) return {};
        vector<vector<int>> ret;
        queue<TreeNode*> q;
        q.push(root);
        bool isZig = true;
        while (!q.empty()) {
            vector<int> nodes;
            int n = q.size();
            for (int i = 0; i < n; i++) {
                TreeNode *cur = q.front();
                q.pop();
                if (isZig) {
                    nodes.push_back(cur->val);
                } else {
                    nodes.insert(nodes.begin(), cur->val);
                }
                if (cur->left) q.push(cur->left);
                if (cur->right) q.push(cur->right);
            }
            ret.push_back(nodes);
            isZig = !isZig;
        }
        return ret;
    }
};
```



### [题目十：Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/)

#### 题目描述

> Given a binary tree, find its maximum depth.
>
> The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.
>
> **Note:** A leaf is a node with no children.
>
> **Example:**
>
> Given binary tree `[3,9,20,null,null,15,7]`,
>
> ```
>     3
>    / \
>   9  20
>     /  \
>    15   7
> ```
>
> return its depth = 3.

题目给出一棵二叉树，要求我们求出其最大深度。即根结点到其叶结点的最大距离。

#### 我的解法

**递归法**

以任意顺序遍历整棵树，直到到达叶子结点，判断当前走过的路径长度与当前的最大长度。

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    int maxdepth = 0;
    void helper(TreeNode *cur, int depth) {
        if (nullptr == cur) {
            maxdepth = max(maxdepth, depth);
            return;
        }
        helper(cur->left, depth+1);
        helper(cur->right, depth+1);
    }
    
    int maxDelpth(TreeNode* root) {
        helper(root, 0);
        return maxdepth;
    }
};
```

**迭代**

方法同上题，一个队列实现。队列加满几次，树就有几层，也就是树的最大深度。

```c++
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (nullptr == root) return 0;
        int depth = 0;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            depth++;
            int n= q.size();
            for (int i = 0; i < n; i++) {
                TreeNode* cur = q.front();
                q.pop();
                if (cur->left) q.push(cur->left);
                if (cur->right) q.push(cur->right);
            }
        }
        return depth;
    }
};
```

#### 他人解法

**解法一：递归+分治**

我本以为自己的已经够简洁了，但事实并非如此。事实上只需要两行代码甚至一行就可以解决。

该算法其本质上是分治法，即分而治之，将一个问题分为两个子问题。即将求当前树的最大深度 转化为 求当前左右子树的最大深度的较大值+1。不断地分割，直到触底反弹。

```c++
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (nullptr == root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};
```

其它解法也没有看到脱离以上思路的了。基本都是基于递归的**DFS**，或者基于一个队列的**BFS**