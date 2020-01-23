---
title: Leetcode刷题之Array
layout: mypost
categories: [Leetcode]
---



## [题目一：Container With Most Water](https://leetcode.com/problems/container-with-most-water/)

### 题目描述

> Given *n* non-negative integers *a1*, *a2*, ..., *an* , where each represents a point at coordinate (*i*, *ai*). *n* vertical lines are drawn such that the two endpoints of line *i* is at (*i*, *ai*) and (*i*, 0). Find two lines, which together with x-axis forms a container, such that the container contains the most water.
>
> **Note:** You may not slant the container and *n* is at least 2.

题目给出一个大小至少为2的正整数数组，要求取得数组中两个值a和b，使得以其中较小值作为高，其数组下标距离作为长，组成的一个矩形面积最大。得到这个最大的值。

### 我的解法

我的第一想法是无脑算，就是从左到右依次遍历穷举，时间复杂度为O(n^2)

C++代码

```c++
class Solution {
public:
    int maxArea(vector<int>& height) {
        int size = height.size();
        int maxArea = 0;
        int len = 0;
        for(int i=0; i<size-1; i++)
        {
            for(int j=i+1;j<size; j++)
            {
                len = (height[i]<height[j]?height[i]:height[j]);
                maxArea = maxArea > (j-i)*len?res:(j-i)*len;
            }
        }
        return maxArea;
    }
};
```

### 他人解法

由于是要求最大面积，所以我们一开始就先选中头和尾，此时得到一个值**maxarea**，接下来我们要想得到更大的值，就必须提高头尾中较小一方的值（因为面积高取决于较低的一方），也就是较小的一方向另一方移动，此时得到的值与之前的**maxarea**比较取其大者，以此类推。最终的形式是从两头向中间遍历，时间复杂度为O(n)，简直是天壤之别啊！

C++代码

```c++
class Solution {
public:
    int maxArea(vector<int>& height) {
        
        int maxArea = 0;
        
        int head = 0;
        int tail = height.size() - 1;
        
        while ( head < tail ){
            
            maxArea = max ( maxArea, ( tail - head ) * min( height.at(head), height.at(tail) ));
            
            if ( height[head] <= height[tail] ){
                head += 1;
            } 
            else {
                tail -=1;
            }            
        }
        
        return maxArea;
    }
};
```



## [题目二：3Sum](https://leetcode.com/problems/3sum/)

### 题目描述

> Given an array `nums` of *n* integers, are there elements *a*, *b*, *c* in `nums` such that *a* + *b* + *c* = 0? Find all unique triplets in the array which gives the sum of zero.
>
> **Note:**
>
> The solution set must not contain duplicate triplets.

题目意思是给出一个整数数组，要求返回一个二维数组，二维数组的元素是三元组，三元组的三个数之和为0，并且三元组不能重复。

### 我的解法

我的第一想法就是穷举遍历，先取出一个数，再从剩下的元素中找到两个数之和等于该数的相反数，要找到这样的两个数就再先取出一个数再穷举遍历找到另一个数。时间复杂度为O(n^3)，算法效率极低

C++代码

```c++
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> solution;
        for(int i=0;i<nums.size()-2;i++)
        {
            int a = nums[i];
            for(int j=i+1;j<nums.size()-1;j++)
            {
                for(int index=j+1;index<nums.size();index++)
                {
                    if(nums[index]+nums[j]+nums[i]==0)
                    {
                        solution.push_back({nums[i],nums[j],nums[index]});
                    }
                }
            }
        }
        return solution;
    }
};
```



### 他人解法

同样是先取出一个数，再从剩下的元素中找到正确的两个数。只是在操作之前要先做准备工作，即把数组排序（默认从小到大）。排序之后再从左到右依次遍历取出第一个数，得到第一个数之后再分别初始化第二个数和第三个数为第一个数后面一个数`left`和有序数组结尾的数`right`。再判断`left+right`之和的大小来调整`left`右移或`right`左移。

C++代码

```c++
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> solution;
        if(nums.size() < 3)
            return solution;
        sort(nums.begin(),nums.end());
        for (int i = 0; i < nums.size() - 2;){
            int l = i + 1;
            int r = nums.size() - 1;
            while (l < r){
                int sum = nums[i] + nums[l] + nums[r];
                if (sum > 0){
                    r--;
                }else if (sum < 0){
                    l++;
                }else{
                    vector<int> temp = {nums[i],nums[l],nums[r]};
                    solution.push_back(temp);
                    do{
                        l++;
                    }while (l < r && nums[l] == temp[1]);
                    do{
                        r--;
                    }while (l < r && nums[r] == temp[2]);          
                }
            }
            int curNum = nums[i];
            do{
                i++;
            }while (i < nums.size() - 2 && nums[i] == curNum);
        }
        return solution;
    }
};
```



## [题目三：3Sum Closest](https://leetcode.com/problems/3sum-closest/)

### 题目描述

> Given an array `nums` of *n* integers and an integer `target`, find three integers in `nums` such that the sum is closest to `target`. Return the sum of the three integers. You may assume that each input would have exactly one solution.
>
> **Example:**
>
> ```
> Given array nums = [-1, 2, 1, -4], and target = 1.
> 
> The sum that is closest to the target is 2. (-1 + 2 + 1 = 2).
> ```
> 

给出一个整型数组和一个target整型目标，要求在该数组中取出三个数，使得该三个数之和与target之差的绝对值最小

### 我的解法

这道题目我是借鉴上一道3Sum的解题思路，即先对数组排序，再固定一个`start`，再在其后分别取头尾`left`和`right`从两边向中间逼近，这个过程中不断记录三个数之和`sum`以及`sum`与`target`之差的绝对值，如果绝对值为`0`那么直接return返回，否则就不断调整`left`和`right`使的`sum`逼近`target`

C++代码

```c++
class Solution {
public:
    int threeSumClosest(vector<int>& nums, int target) {
        int closest = INT_MAX;
        int solution = 0;
        if (nums.size() <= 2){
            return solution;
        }
        sort(nums.begin(),nums.end());
        int start = 0;
        while(start < nums.size() - 2){
            int l = start + 1;
            int r = nums.size() - 1;
            while (l < r){
                int sum = nums[start] + nums[l] + nums[r];
                if (abs(sum - target) < closest){
                    closest = abs(sum - target);
                    solution = sum;
                }
                if (l < r && sum < target){
                    l++;
                }else if (l < r && sum > target){
                    r--;
                }else{
                    return solution;
                }
            }
            int curNum = nums[start];
            do{
                start++;
            }while(start < nums.size() - 2 && nums[start] == curNum);
        }
        return solution;
    }
};
```

### 他人解法

其他人用的方法也是如此，也有的人使用二叉查找树。



## [题目四：4Sum](https://leetcode.com/problems/4sum/)

### 题目描述

> Given an array `nums` of *n* integers and an integer `target`, are there elements *a*, *b*, *c*, and *d* in `nums` such that *a* + *b* + *c* + *d* = `target`? Find all unique quadruplets in the array which gives the sum of `target`.
>
> **Note:**
>
> The solution set must not contain duplicate quadruplets.
>
> **Example:**
>
> ```
> Given array nums = [1, 0, -1, 0, -2, 2], and target = 0.
> 
> A solution set is:
> [
>   [-1,  0, 0, 1],
>   [-2, -1, 1, 2],
>   [-2,  0, 0, 2]
> ]
> ```

给出一个整型数组`nums`和一个目标`target`，要求在该数组中找到所有的四元组，使得四个数之和等于`target`。

### 我的解法

解这类题目的方法本质上是将`nSum`问题降级为`n-1Sum`问题，最终转化为解`2Sum`问题。

当然，在转化的过程中我们可以利用隐藏的限制条件进行剪枝，如：我们先对数组进行升序排序，如果前4个之和大于`target`，那么后面的遍历就可以舍弃了；同理如果第一个数（位置不定）与最后3个数之和小于`target`，那么就可以直接跳到下一轮循环了（第一个数右移）

```c++
class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        vector<vector<int>> solution;
        int n = nums.size();
        if (n <= 3) return solution;
        sort(nums.begin(), nums.end());
        for (int first = 0; first < n - 3; first++) {
            if (first > 0 && nums[first] == nums[first - 1]) continue;
            if (nums[first] + nums[first+1] + nums[first+2] + nums[first+3] > target) break;
            if (nums[first] + nums[n-3] + nums[n-2] + nums[n-1] < target) continue;
            for (int second = first + 1; second < n - 2; second++) {
                if (second > first + 1 && nums[second] == nums[second - 1]) continue;
                if (nums[first] + nums[first+1] + nums[first+2] + nums[first+3] > target) break;
                if (nums[first] + nums[n-3] + nums[n-2] + nums[n-1] < target) continue;
                int l = second + 1;
                int r = n - 1;
                while (l < r){
                    int sum = nums[first] + nums[second] + nums[l] + nums[r];
                    if (sum < target){
                        l++;
                    }else if (sum > target){
                        r--;
                    }else{
                        vector<int> one = {nums[first], nums[second], nums[l], nums[r]};
                        solution.push_back(one);
                        do{l++;} while (nums[l]==one[2] && l < r);
                        do{r--;} while (nums[r]==one[3] && l < r);
                    }
                }
            }
        }
        return solution;
    }
};
```



### 他人解法

别人的解法绝大多数也都是这个思路，不过各有各的实现，这里就有一种递归的实现

```c++
class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        vector<vector<int>>res;
        vector<int>path;
        DFS(res, nums, 0, target, 0, 0, path);
        return res;
    }
    
    void DFS(vector<vector<int>>& res, vector<int>& nums, int pos, int target, int count, int sum, vector<int>& path){
        if(count == 4){
            if(sum == target) res.push_back(path);
            return;
        }
        for(int i = pos; i < nums.size(); i++){
            if(i != pos && nums[i] == nums[i - 1]) continue;
            if(sum + nums[i] + (3 - count) * nums[nums.size() - 1] < target) continue;
            if(sum + (4 - count)* nums[i] > target) break;
            path.push_back(nums[i]);
            DFS(res, nums, i + 1, target, count + 1, sum + nums[i], path);
            path.pop_back();
        }
    }
};
```



## [题目五：Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)

### 题目描述

> Given a sorted array *nums*, remove the duplicates **in-place** such that each element appear only *once* and return the new length.
>
> Do not allocate extra space for another array, you must do this by **modifying the input array in-place** with O(1) extra memory.

题目给出一个有序数组，包含`n`个元素，其中有`m`个是互不相同的（m<=n），要求把这`m`个元素放置在该数组的前`m`个位置，并返回`m`。

### 我的解法

我的解法很简单，就是简单地遍历一遍数组，遇到有重复的就跳过，不重复的就顺序填充到数组前面

C++代码

```c++
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int length = 0;
        for (int i = 0; i < nums.size(); i++){
            if(i > 0 && nums[i] == nums[i - 1]){
                continue;
            }else{
            nums[length++] = nums[i];
            }
        }
        return length;
    }
};
```





## [题目六：Remove Element](https://leetcode.com/problems/remove-element/)

### 题目描述

> Given an array *nums* and a value *val*, remove all instances of that value **in-place** and return the new length.
>
> Do not allocate extra space for another array, you must do this by **modifying the input array in-place** with O(1) extra memory.
>
> The order of elements can be changed. It doesn't matter what you leave beyond the new length.
>
> **Example 1:**
>
> ```
> Given nums = [3,2,2,3], val = 3,
> 
> Your function should return length = 2, with the first two elements of nums being 2.
> 
> It doesn't matter what you leave beyond the returned length.
> ```
>
> **Example 2:**
>
> ```
> Given nums = [0,1,2,2,3,0,4,2], val = 2,
> 
> Your function should return length = 5, with the first five elements of nums containing 0, 1, 3, 0, and 4.
> 
> Note that the order of those five elements can be arbitrary.
> 
> It doesn't matter what values are set beyond the returned length.
> ```
>
> **Clarification:**
>
> Confused why the returned value is an integer but your answer is an array?
>
> Note that the input array is passed in by **reference**, which means modification to the input array will be known to the caller as well.
>
> Internally you can think of this:
>
> ```
> // nums is passed in by reference. (i.e., without making a copy)
> int len = removeElement(nums, val);
> 
> // any modification to nums in your function would be known by the caller.
> // using the length returned by your function, it prints the first len elements.
> for (int i = 0; i < len; i++) {
>     print(nums[i]);
> }
> ```

题目给出一个整型数组`nums`和一个整数`val`，要求返回数组中除`val`之外的元素的个数`len`，并使得更改后的数组`nums`的前`len`个元素都不等于`val`

### 我的解法

我的思路很简单，就是从左到右依次遍历数组，遇到不等于`val`的元素就依次并按顺序放在数组的左边

C++代码

```c++
class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int n = nums.size();
        if (n == 0) return 0;
        int len = 0;
        for (int i = 0; i < n; i++){
            if (nums[i] != val){
                nums[len++] = nums[i];
            }
        }
        return len;
    }
};
```



### 他人解法

如果不考虑数组元素原来的顺序，那么可以使用以下方法来减少元素移动。即从左到右遍历数组，遇到相等的就是可以删除的元素，此时我们将其与数组下标为`n-1`的元素对调，然后`n--`操作，下一轮循环再次从当前位置开始，直到`i=n`，即剩下的全部都是不等于`val`的元素

```c++
class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int n = nums.size();
        int i = 0;
        while (i < n){
            if (nums[i] == val){
                nums[i] = nums[n-1];
                n--;
            }else{
                i++;
            }
        }
        return n;
    }
};
```



## [题目七：Next Permutation](https://leetcode.com/problems/next-permutation/)

### 题目描述

> Implement **next permutation**, which rearranges numbers into the lexicographically next greater permutation of numbers.
>
> If such arrangement is not possible, it must rearrange it as the lowest possible order (ie, sorted in ascending order).
>
> The replacement must be **in-place** and use only constant extra memory.
>
> Here are some examples. Inputs are in the left-hand column and its corresponding outputs are in the right-hand column.
>
> ```
> 1,2,3` → `1,3,2`
> `3,2,1` → `1,2,3`
> `1,1,5` → `1,5,1
> ```

题目意思比较难以理解，我读了好几遍才明白过来。题目给出一个整型数组`nums`，数组看成一个字典，要求通过更改数组元素顺序按照字典排序的方法将其更改为其字典排序的下一个大小的字典。如果数组是完全降序排列（即字典的最大表示），则其下一个大小是完全升序排列（字典的最小表示）

### 我的解法

我的思路是在数组末尾找到一个降序排列的数列`nums[index]`、`nums[index+1]`...`nums[nums.size()-1]`。找到该序列后，若`index`等于`0`，那么该数组是一个字典的最大的表示，则只需将其升序排列即可；如果`index`大于`0`，那么我们找到`nums[index-1]`,将降序列`nums[index:]`改为升序列，并从左到右逐个扫描找到刚好大于`nums[index-1]`的元素并使之交换

C++代码

```c++
class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        if (nums.size() <= 1){
            return;
        }
        int index = nums.size() - 1;
        while (index > 0){
            if (nums[index] <= nums[index-1]){
                index--;
            }else{
                break;
            }
        }
        for (int i = index; i < nums.size()-1; i++){
            int min = i;
            for (int j = i+1; j < nums.size(); j++){
                if (nums[j] < nums[i]){
                    min = j;
                }
            }
            int temp = nums[i];
            nums[i] = nums[min];
            nums[min] = temp;
        }
        if (index == 0){
            return;
        }
        for (int i = index; i < nums.size(); i++){
            if (nums[i] > nums[index-1]){
                int temp = nums[i];
                nums[i] = nums[index-1];
                nums[index-1] = temp;
                break;
            }
        }
    }
};
```

### 他人解法

和我的异曲同工，只不过我是先将后面的序列转化成升序，然后再交换，而下面这个是先交换再反转，同时我是自己写排序，而下面是调用库函数。

```c++
class Solution {
public:
    void nextPermutation(vector<int>& nums) {
    	int n = nums.size(), k, l;
    	for (k = n - 2; k >= 0; k--) {
            if (nums[k] < nums[k + 1]) {
                break;
            }
        }
    	if (k < 0) {
    	    reverse(nums.begin(), nums.end());
    	} else {
    	    for (l = n - 1; l > k; l--) {
                if (nums[l] > nums[k]) {
                    break;
                }
            } 
    	    swap(nums[k], nums[l]);
    	    reverse(nums.begin() + k + 1, nums.end());
        }
    }
}; 
```

以及使用库函数与反向迭代器结合

```c++
void nextPermutation(vector<int>& nums) {
    auto i = is_sorted_until(nums.rbegin(), nums.rend());
    if (i != nums.rend())
        swap(*i, *upper_bound(nums.rbegin(), i, *i));
    reverse(nums.rbegin(), i);
}
```

甚至有专门的库函数

```c++
class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        next_permutation(begin(nums), end(nums));
    }
};
```



## [题目八：Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)

### 题目描述

> Suppose an array sorted in ascending order is rotated at some pivot unknown to you beforehand.
>
> (i.e., `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`).
>
> You are given a target value to search. If found in the array return its index, otherwise return `-1`.
>
> You may assume no duplicate exists in the array.
>
> Your algorithm's runtime complexity must be in the order of *O*(log *n*).
>
> **Example 1:**
>
> ```
> Input: nums = [4,5,6,7,0,1,2], target = 0
> Output: 4
> ```
>
> **Example 2:**
>
> ```
> Input: nums = [4,5,6,7,0,1,2], target = 3
> Output: -1
> ```

题目给出一个变形的有序数组（原本是升序，但从某个位置旋转后变成两个升序序列，前者大后者小）`nums`和一个目标整数`target`，要求从`nums`中找到该`target`并返回其数组索引，若找不到则返回`-1`.

### 我的解法

题目本身不难，但是有点点复杂，我这里是用类似于二分法再做分类讨论的方法。首先确定首尾和中点`left`、`right`、`mid`，再用`mid`做分类讨论：

1. 如果`nums[mid] == target`：则返回`mid`;
2. 如果`nums[mid] < target`：继续讨论：
   1. 如果`mid`在左边，则`mid`往左都是小于`target`的，则可以令`left = mid`
   2. 如果`mid`在右边，则继续讨论：
      1. 如果`nums[right] < target`，则右边全部小于`target`，则可以令`right = mid`
      2. 如果`nums[right] >= target`，则左边全部都大于`target`，可以令`left = mid`
3. 如果`nums[mid] > target`：继续讨论：
   1. 如果`mid`在右边，则`mid`右边全部大于`target`，令`right = mid`
   2. 如果`mid`在左边，则继续讨论：
      1. 如果`nums[left] > target`，则令`left = mid`
      2. 如果`nums[left] < target`，则令`right = mid`
4. 如此不断讨论，不断逼近`target`，如果最后`right == left + 1`的时候`nums[left]`和`nums[right]`都不等于`target`，那么退出循环，返回`-1`

C++代码

```c++
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int n = nums.size();
        int left = 0, right = n - 1;
        int mid = left + (right - left)/2;
        while (left <= right){
            if (nums[mid] == target){
                return mid;
            }else if (nums[left] == target){
                return left;
            }else if (nums[right] == target){
                return right;
            }
            if (nums[mid] < target){
                if (nums[left] < nums[mid]){
                    left = mid;
                }else if (nums[right] > target){
                    left = mid;
                }else{
                    right = mid;
                }
            }
            if (nums[mid] > target){
                if (nums[left] > nums[mid]){
                    right = mid;
                }else if (nums[left] > target){
                    left = mid;
                }else{
                    right = mid;
                }
            } 
            if (right <= left + 1){
                break;//防止出现死循环
            }
            mid = left + (right - left)/2;
        }
        return -1;
    }
};
```



### 他人解法

别人的这个解法就很棒了！

我们首先找到旋转数组中最小的数的下标`rot`，即数组旋转的位置。找到后我们就可以把当前旋转数组的每一个元素对应到原来有序数组的每一个元素，即 `NUMS[A] = nums[a + rot]`，如此一来，旋转数组就是个纸老虎，其本质上已经被我们看成了有序数组，那么就可以使用简单的二分查找了。

而要找到`rot`也很简单，使用二分查找的方法，每次将`nums[mid]`与`nums[right]`比较，如果后者大，说明`rot`在`mid`左边，则`right = mid;`,否则，说明`rot`在`mid`右边，则`left = mid + 1;`(+1是因为此时`mid`不可能等于`rot`)

```c++
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int n = nums.size();
        int left = 0, right = n - 1;
        int mid;
        while (left < right){
            mid = left + (right - left)/2;
            if (nums[mid] < nums[right]){
                right = mid;
            }else {
                left = mid + 1;
            }
        }
        int rot = left;
        left = 0;
        right = n - 1;
        int relmid;
        while (left <= right){
            mid = left + (right - left)/2;
            relmid = (rot + mid)%n;
            if (nums[relmid] == target){
                return relmid;
            }else if (nums[relmid] < target){
                left = mid + 1;
            }else {
                right = mid - 1; 
            }
        }
        return -1;
    }
};
```









## [题目九：Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

### 题目描述

> Given an array of integers `nums` sorted in ascending order, find the starting and ending position of a given `target` value.
>
> Your algorithm's runtime complexity must be in the order of *O*(log *n*).
>
> If the target is not found in the array, return `[-1, -1]`.
>
> **Example 1:**
>
> ```
> Input: nums = [5,7,7,8,8,10], target = 8
> Output: [3,4]
> ```
>
> **Example 2:**
>
> ```
> Input: nums = [5,7,7,8,8,10], target = 6
> Output: [-1,-1]
> ```

题目给出一个升序整数数组`nums`和一个目标整数`target`，要求在数组中找到所有等于`target`的元素并返回它们的首尾索引，如果没找到则返回`[-1,-1]`

### 我的解法

我的思路是分两次二分查找，第一次找到索引`start`，第二次再找到索引`end`

这里有几个地方容易出错，第一个就是空数组。空数组必须先判断，否则会发生空指针错误；

第二个就是在计算`end`的步骤中，如果`nums[mid] <= target`那么就说明`target`在`mid`或是`mid`右边，所以我们令`left = mid`，如果此时`mid`本身就是`left`，那么`mid`的下一轮计算`mid = left + (right - left)/2`还是原来的`mid`，这样`left`就永远不会变化，那么`while（left < right)`循环就变成了死循环。因此我们使`mid = left + (right - left)/2 + 1`，使得无论如何`mid`不会原地打转，循环就会正确运行。

C++代码

```c++
class Solution {
public:
	vector<int> searchRange(vector<int>& nums, int target) {
		int start = -1, end = -1;
		int n = nums.size();
        if (n == 0) return {-1, -1};
		int left = 0, right = n - 1;
		while (left < right) {
			int mid = left + (right - left) / 2;
			if (nums[mid] >= target) {
				right = mid;
			}
			else {
				left = mid + 1;
			}
		}
		if (nums[left] == target) {
			start = left;
		}
		right = n - 1;
		while (left < right) {
			int mid = left + (right - left) / 2 + 1;
			if (nums[mid] <= target) {
				left = mid;
			}
			else {
				right = mid - 1;
			}
		}
		if (nums[right] == target) {
			end = right;
		}
		return { start, end };
	}
};
```



### 他人解法

高票回答也是和我的方法一样，使用两次独立的二分查找，分别得到`start`和`end`，但是还有一种解法与众不同，其将两个独立的二分查找同化为一个方法，采用查找`target+1`的策略使得我们查找`end`的时候也只需要与查找`start`同样的步骤。

因为我们使用函数查找`target`的时候，函数返回的一定是数组中大于等于`target`的最小的元素的索引。那么我们要查找`end`，其实可以把问题转换为查找`target+1`的`start`然后再`-1`，即数组中等于target的所有元素一定是`[searchLeft(nums, target), searchLeft(nums, target+1))-1]`

```c++
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        if (nums.size() < 1){
            return {-1, -1};
        }
        int left = searchLeft(nums, target);
        if (left == nums.size() || nums[left] != target){
            return {-1, -1};
        }
        int right = searchLeft(nums, target + 1) - 1;
        return {left, right};
    }
    int searchLeft(vector<int> nums, int target) {
        int i = 0, j = nums.size();
        while (i < j) {
            int mid = i + (j - i)/2;
            if (nums[mid] >= target){
                j = mid;
            }else{
                i = mid + 1;
            }
        }
        return i;
    }
};
```



## [题目十：Search Insert Position](https://leetcode.com/problems/search-insert-position/)

### 题目描述

> Given a sorted array and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.
>
> You may assume no duplicates in the array.
>
> **Example 1:**
>
> ```
> Input: [1,3,5,6], 5
> Output: 2
> ```
>
> **Example 2:**
>
> ```
> Input: [1,3,5,6], 2
> Output: 1
> ```
>
> **Example 3:**
>
> ```
> Input: [1,3,5,6], 7
> Output: 4
> ```
>
> **Example 4:**
>
> ```
> Input: [1,3,5,6], 0
> Output: 0
> ```
>
> Accepted
>
> 506,735
>
> Submissions
>
> 1,224,131

题目给出一个升序数组`nums`和一个待插入的目标整数`target`，要求将`target`插入升序数组`nums`并保持其升序的性质，返回插入后`target`的数组下标

### 我的解法

使用二分法，如果:

- `nums[mid] == target`，则返回`mid`，
- `nums[mid] < target`，说明`target`在`mid`右边，则`left = mid + 1`，
- `nums[mid] > target`，说明`target`在`mid`左边，则`right = mid`，

这里有一个地方需要注意，就是right一定要初始化为`nums.size()`，而不是其减一，这是因为返回的值有可能是`nums.size()`，而如果right初始化为`nums.size() - 1`，那么返回的值就不可能是`nums.size()-1`了

至于为什么小于的时候需要`+1`，而大于的时候就不`+1`，这是因为不论是多大的数组，最终二分之后就是两个数，即`left`和`right`，而此时`mid = left + (right - left)/2 = left`，所以如果`nums[mid] < target`，那么令`left = mid`，`left`和`mid`就永远相等，`right`根本没有改变的机会，最终`while（left < right)` 沦为死循环。也正因为如此，`right = mid`就可以更改`right`的值了，如果`right = mid - 1`则反而会出错，因为其导致提前终止了循环

C++代码

```c++
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int left = 0, right = nums.size();
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target){
                return mid;
            }else if (nums[mid] < target){
                left = mid + 1;
            }else {
                right = mid;
            }
        }
        return left;
    }
};
```

### 他人解法

别人的做法大致也是如此，只不过是把high初始化为`nums.size() - 1`，这样返回值`index`的取值范围就是`[0, high+1]`

使用二分法，如果`nums[mid] < target`，那么`low = mid + 1`，否则，`high = mid - 1`，直到`low > high`，即`low == high + 1`，此时在范围`[low, high + 1]`就变成了一个数——`low`或者`high+1`，即要求返回的值。

```c++
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int low = 0, high = nums.size()-1;
        // Invariant: the desired index is between [low, high+1]
        while (low <= high) {
            int mid = low + (high-low)/2;

            if (nums[mid] < target)
                low = mid+1;
            else
                high = mid-1;
        }
        // (1) At this point, low > high. That is, low >= high+1
        // (2) From the invariant, we know that the index is between [low, high+1], so low <= high+1. Follwing from (1), now we know low == high+1.
        // (3) Following from (2), the index is between [low, high+1] = [low, low], which means that low is the desired index
        //     Therefore, we return low as the answer. You can also return high+1 as the result, since low == high+1
        return low;
    }
};
```



