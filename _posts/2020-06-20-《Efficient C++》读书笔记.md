---
title: 《Efficient C++》读书笔记
layout: mypost
categories: [读书笔记]
---



以下笔记大部分是照搬原书，因为我的知识深度还没有达到作者书中的深度，我们之间存在着知识断层，我得先去把这断层补起来，然后才能更好地阅读此书，才能写出真正地读书笔记。本文前半部分对应的书中的内容我是比较认真地看了的，所以有一点自己的理解在里面。但是文章后面部分全部是照搬原书，就算为了完成一个框架吧！后面我会回来的！

## 1. 让自己习惯 C++

### 条款01：视C++为一个语言联邦

> 视C++为一个语言联邦
>
> View C++ as a federation of languages.

为了更好的理解和运用C++，我们将C++看成一个语言联邦，包含以下四个部分：

- **C**。因为C++是以C为基础的高级语言。没有模板、异常、重载等特性。
- **Object-Oriented C++**。面向对象的C++，也就是C with classes的诉求：classes（构造函数和析构函数）、封装、继承、多态、动态绑定（虚函数）等等。
- **Template C++**。模板编程。
- **STL**。标准模板库，包含容器、迭代器、算法、函数对象等特性。



### 条款02：尽量以const，enum，inline替换 #define

> 尽量以const，enum，inline替换 #define
>
> Prefer consts, enums, and inlines to #define.

本质是“**宁可使用编译器替换预处理器**”。程序的处理是先经过预处理器的处理，然后才到编译器。预处理器仅仅是简单地将宏替换掉，而编译器才会生成符号表（symbol table）。使用#define定义的常量不在符号表里，因此调用时会发生编译错误。

- 对于单纯常量，最好以const或enums替换#defines。
- 对于形似函数的宏，最好以inline函数替换#defines。



### 条款03：尽可能使用const

> 尽可能使用const
>
> Use const whenever possible.

表示常量，不可通过某种方式更改。



### 条款04：确定对象被使用前已先被初始化

> 确定对象被使用前已先被初始化
>
> Make sure that objects are initialized before they're used.

int x；在某些环境下会初始化（为0），但其它环境下不会。

对于内置类型（比如int, array等），我们必须手动初始化；而对于其它类型（如string或用户自定义类型），必须靠构造函数初始化。此时必须区分赋值与初始化：构造函数体中的都是赋值，初始化是在构造函数之前。

注意：类中的初始化列表的初始化顺序不是初始化列表中的顺序，而是元素的声明顺序。



## 2. 构造/析构/赋值运算

### 条款05：了解C++默默编写并调用哪些函数

> 了解C++默认编写并调用哪些函数
>
> Know what functions C++ silently writes and calls.

每个类都会有自己的构造函数、析构函数和赋值操作符，如果我们没有定义，那么编译器也会为我们定义。

比如我们定义一个空类：

`class Empty{};`

编译器就会为我们构造成以下模样：

```c++
class Empty{
public:
    Empty(){}								//default构造函数
    Empty(const Empty& rhs){}				//copy构造函数
    ~Empty(){}								//析构函数，是个non-virtual
    
    Empty& operator=(const Empty& rhs) {}	//copy assignment操作符
};
```

注意：编译器创建以上函数的前提是编译器发现程序下文中出现了调用该函数的现象。也就是说只有该函数会被调用时，编译器才会自动生成该函数。



### 条款06：若不想使用编译器自动生成的函数，就该明确拒绝

> 若不想使用编译器自动生成的函数，就该明确拒绝
>
> Explicitly disallow the use of compiler-generated functions you do not want.

如果我们不想使用编译器自动生成的函数，那么很简单，我们自己定义函数，这样编译器就不会自动生成函数了。但如果要求该类不具有该函数的功能，那么我们可以将函数定义为**private**，这样函数就不会暴露给外部，但是友元函数和成员函数还是可以调用该函数。因此达不到原来的要求。

要求一个类不具有某种功能，在可能调用该功能时又不让编译器自动生成函数，那么只有一种方式了，那就是只声明函数名不定义具体实现。自己声明一个对应的**private**的特定函数。但是不去具体实现。这样编译器就能检测到相关函数已存在而不会自动生成了。



### 条款07：为多态基类声明virtual析构函数

> 为多态基类声明virtual析构函数
>
> Declare destructors virtual in polymorphic base classes.

如果一个类被设计为基类，那么其析构函数应该被定义为virtual，即虚析构函数。这是因为如果存在一个基类的指针指向子类的对象，那么当delete该基类指针时，仅仅会调用该基类的虚构函数，而不会调用子类的虚构函数，子类的内存没有释放，从而导致内存泄漏。

因此，只要类中出现virtual函数，那么就表示该类是作为基类而设计的，那么其析构函数也应该定义为**virtual**。



### 条款08：别让异常逃离析构函数

> 别让异常逃离析构函数
>
> Prevent exceptions from leaving destructors.

如果一个被析构函数调用的函数抛出异常，析构函数应该捕获该异常，然后吞下异常（不传播）或结束程序。



### 条款09：绝不在构造和析构过程中调用virtual函数

> 绝不在构造和析构过程中调用virtual函数
>
> Never call virtual functions during construction or destruction.

构造函数中的virtual函数不是virtual函数，因为它只会调用当前类（不会调用子类）的虚函数，因而虚函数失去了多态性，也就不是virtual函数了。

在**构造函数**中，虚拟机制不会发生作用，因为基类的构造函数在派生类构造函数之前执行，当基类构造函数运行时，派生类数据成员还没有被初始化。如果基类构造期间调用的虚函数向下匹配到派生类，派生类的函数理所当然会涉及本地数据成员，但是那些数据成员还没有被初始化，而调用涉及一个对象还没有被初始化的部分自然是危险的，所以 C++会提示此路不通。因此，虚函数不会向下匹配到派生类，而是直接执行基类的函数。

更深层次的理解是：在derived class对象的base class构造期间，对象的类型就是base class 而不是 derived class。

在**析构函数**中也是同样道理，由于是先执行继承类的析构函数再执行基类的析构函数，因此一旦 derived class 析构函数开始执行，对象内的 derived class 成员变量便呈现未定义值，所以C++将视它们为不存在。而进入 base class 析构函数后对象就成为一个 base class 对象。

 

### 条款10：令operator=返回一个reference to *this

> 令operator=返回一个reference to *this
>
> Have assignment operators return a reference to *this.

重载赋值运算符的时候，最好将返回值设置为引用形式，这样可以实现连续赋值。当然，不设置为引用形式的返回值也不会导致代码问题，仅仅是不能实现连续赋值。

以上建议对 “ **=、+=、-=、*=** ” 等等。



### 条款11：在operator=中处理”自我赋值“

> 在operator=中处理”自我赋值“
>
> Handle assignment to self in operator=.

在重载赋值运算符时一定要考虑自我赋值，即a = a 或a[i] = a[j]（i = j）这种情况。一般的类对象可能不考虑该情况也没什么影响，但是有些类对象，比如说在heap上有数据的类对象就必须得考虑：

```c++
class Bitmap{
//...
};
class Widget{
private:
    Bitmap* pb;//指向heap的指针
};
Widget& Widget::operator=(const Widget& rhs) {
	delete pb;
    pb = new Bitmap(*rhs.pb);
    return *this;
}

```

如果此时*this和rhs是同一个对象，那么delete pb就是销毁了this(rhs)的bitmap，这将造成错误。

**预防方法**

- 在最前面加一个”证同测试（identity test）“来检验：

  ```c++
  Widget& Widget::operator=(const Widget& rhs) {
  	if (this == &rhs) return *this;//证同测试
  	delete pb;
      pb = new Bitmap(*rhs.pb);
      return *this;
  }
  ```

- 使用所谓的copy and swap 技术：

  ```c++
  Widget& Widget::operator=(Widget rhs) {//rhs是被传对象的一个复件（副本）
      swap(rhs);			//将*this的数据和复件（副本）的数据互换
      return *this;
  }
  ```



### 条款12：复制对象时勿忘其每一个成分

> 复制对象时勿忘记其每一个成分
>
> Copy all parts of an object.

Copying函数应该确保复制“对象内的所有成员变量”及“所有base class 成分”；不要尝试以某个coping函数实现另一个coping函数。而应该将共同机能放进第三个函数中，并由两个coping函数共同调用。



## 3. 资源管理

### 条款13：以对象管理资源

> 以对象管理资源
>
> Use objects to manage resources.

为防止资源泄漏，请使用RAII（Resource Acquisition Is Initialization）对象，它们在构造函数中获得资源并在析构函数中释放资源。

常用的两个RAII classes 分别是 tr1::shared_ptr 和 auto_ptr。前者通常是较佳选择。因为其copy行为比较直观，若选择auto_ptr，复制动作会使它指向NULL。



### 条款14：在资源管理类中小心coping行为

> 在资源管理类中小心coping行为
>
> Think carefully about coping behavior in resource-managing classes.

> - 复制RAII对象必须一并复制它所管理的资源，所以资源的coping行为决定RAII对象的coping行为。
> - 普遍而常见的RAII class coping行为是：抑制coping、施行引用计数法（reference counting）。不过其它行为也都可能被实现。



### 条款15：在资源管理类中提供对原始功能的访问

> 在资源管理类中提供对原始功能的访问
>
> Provide access to raw resources in resource-managing classes.

> - APIs往往要求访问原始资源（raw sources），所以每一个RAII class 应该提供一个“取得其所管理之资源”的办法。
> - 对原始资源的访问可能经由显示转换或隐式转换。一般而言显示转换比较安全，但隐式转换对客户比较方便。



### 条款16：成对使用new和delete时要采取相同形式

> 成对使用new和delete时要采取相同形式
>
> Use the same form in corresponding uses of new and delete.

如果new出来的是一个数组，即有 [] 运算符，那么delete时也要是数组形式，即delete[]。这是因为单一对象和对象数组的内存分布是不一样的。数组的内存中通常会有专门保存数组大小的记录，例如：

![image-20200522110516320](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2020/05/20200522110518.png)

```c++
std::string* stringPtr1 = new std::string;
std::string* stringPtr2 = new std::string[100];
...
delete stringPtr1;			//删除一个对象
delete [] stringPtr2;		//删除一个由对象组成的数组
```



### 条款17：以独立语句将newed对象置入智能指针

> 以独立语句将newed对象置入智能指针
>
> Stored newed objects in smart pointers in standalone statements.

> 以独立语句将newed对象存储于智能指针内。如果不这样做，一旦异常被抛出，有可能导致难以察觉的资源泄漏。



## 4. 设计与声明

### 条款18：让接口容易被正确使用，不易被误用

> 让接口容易被正确使用，不易被误用
>
> Make interfaces easy to use correctly and hard to use incorrectly.

如题，自己慢慢体会。



### 条款19：设计class犹如设计type

> 设计class犹如设计type
>
> Treat class design as type design.

C++和其它OOP语言一样，当你定义了一个class，也就定义了一个新的type。如何设计一个高效的class呢？我们可以尝试问自己以下几个问题：

- 新type的对象应该如何被创建以及如何被销毁？这关系到class的构造函数和析构函数以及内存分配和释放函数。
- 对象的初始化和赋值该有什么样的差别？这决定了构造函数和赋值操作符的行为。
- 新type的对象如果被passed by value（以值传递），意味着什么？
- 什么是新type的合法值？
- 你的新type需要配合某个继承图系（inheritance graph）吗？
- 你的新type需要什么样的转换？
- 什么样的操作符和函数对此新type而言是合理的？
- 什么样的标准函数应该驳回？
- 谁该取用新type的成员？
- 什么是新type的“未声明接口”（undefined interface）？
- 你的新type有多么一般化？
- 你真的需要一个新type吗？

“这些问题都不容易回答，所以定义出高效的classes是一种挑战。然而如果能够设计出至少向C++内置类型一样好的用户自定义（user-defined）classes，一切汗水便都值得。”



### 条款20：宁以pass-by-reference-to-const替换pass-by-value

> 宁以pass-by-reference-to-const替换pass-by-value
>
> Prefer pass-by-reference-to-const to pass-by-value.

C++中默认情况下参数是以传值方式进入函数，因此函数中的形参是实参（外面传入时的参数）的一个**拷贝**。如果函数有返回值，那么调用者所获得的也是不是返回值，而是返回值的一个**拷贝**。这些拷贝都是由对象的copy构造函数产出，因此可能会耗费大量时间。

而使用传引用的方式的效率的则高得多，因为没有任何对象被创建，从而没有调用任何构造函数和析构函数。从C++编译器的底层（下次再看）我们可以发现，传引用往往以指针实现，也就是说传引用本质上是在传指针。因此，对于占用内存小的内置类型，传值的方式比传引用效率更高。

一般情况下，内置类型、以及STL的迭代器和函数对象使用传值比较妥当。



### 条款21：必须返回对象时，别妄想返回其reference

> 必须返回对象时，别妄想返回其reference
>
> Don't try to return a reference when you must return a object.

当函数要返回的对象在函数调用前不存在，仅存在与函数调用后（stack上或者是heap上或者是static），这时我们不能妄想返回引用，因为我们返回时引用指向的对象不是已经销毁了就是多次调用时返回的对象指向同一对象。

因此我们考虑还是直接返回其拷贝。



### 条款22：将成员变量声明为private

> 将成员变量声明为private
>
> Declare data members private.

一旦将一个成员变量声明为public或protected而客户开始使用它，就很难改变那个成员变量所涉及的一切。太多代码需要重写、重新测试、重新编写文档、重新编译。

从封装的角度来看，只有两种访问权限：private（提供封装）和其它（不提供封装）。

总之：**尽量将成员变量声明为private，同时protected并不比public更具有封装性。**



### 条款23：宁以non-member、non-friend、替换member函数

> 宁以non-member、non-friend、替换member函数
>
> Prefer non-member non-friend functions to member functions.

宁可使用non-member non-friend函数替换member函数。这样做可以增加封装性、包裹弹性和机能扩充性。因为member函数增加了 “能够访问class内private成分” 的函数数量。



### 条款24：若所有参数皆需类型转换，请为此采用non-member函数

> 若所有参数皆需类型转换，请为此采用non-member函数
>
> Declare non-member functions when type conversions should apply to all parameters.

> 如果你需要为某个函数的所有参数（包括被this指针所指的那个隐喻参数）进行类型转换，那么这个函数必须是个non-member。



### 条款25：考虑写出一个不抛异常的swap函数

> 考虑写出一个不抛异常的swap函数
>
> Consider support for a non-throwing swap.

> - 当std::swap对你的类型效率不高时，提供一个swap成员函数，并确定这个函数不抛出异常。
> - 如果你提供一个member swap，也该提供一个non-member swap来调用前者。对于classes（而非templates），也请特化std::swap。
> - 调用swap时应针对std::swap使用using声明式，然后调用swap并且不带任何”命名空间资格修饰“。
> - 为”用户定义类型“进行std templates全特化是好的，但千万不要尝试在std内加入某些对std而言全新的东西。

## 5. 实现

### 条款26：尽可能延后变量定义式的出现时间

> 尽可能延后变量定义式的出现时间
>
> Postpone variable definitions as long as possible.

只要你定义了一个变量并且其类型带有一个构造函数和一个析构函数，那么当程序的控制流到达这个变量时，你就得承受构造成本，离开这个程序得作用域时，你又得承受析构成本。而如果我们定义的这个变量自始至终都没有被使用过，那么我们就拜拜耗费了这些成本。因此我们必须尽可能避免这种情形。

比如：

```c++
std::string encryptPassword(const std::string& password) {
	using namespace std;
	string encrypted;
	if (password.length() < MinimumPasswordLength) {
		thorw logic_error("password is too short");
	}
	...
	return encrypted;//如果有异常抛出，那么encrypted就没有使用过
}
```

延后定义：

```c++
std::string encryptPassword(const std::string& password) {
	using namespace std;
	if (password.length() < MinimumPasswordLength) {
		thorw logic_error("password is too short");
	}
	string encrypted;
	...
	return encrypted;//如果有异常抛出，那么encrypted就没有使用过
}
```

对于循环内使用变量的定义有两种方式：

```c++
//方式一：定义于循环之前
Object o;
for (int i = 0; i < n; ++i) {
	o = 某个值;
    ...
}

//方式二：定义于循环之中
for (int i = 0; i < n; ++i) {
    Object o(某个值);
    ...
}
```

对于以上两种定义方式，成本分别如下：

- 方式一：1个构造函数+1个析构函数+n个赋值操作
- 方式二：n个构造函数+n个析构函数

除非一个赋值成本低于一组构造+析构成本，这时候方式一比较高效（尤其使n比较大的时候），否则方法二比较好。



### 条款27：尽量少做转型动作

> 尽量少做转型动作
>
> Minimize casting.

> - 如果可以，尽量避免转型，特别是在注重效率的代码中避免dynamic_casts。如果有个设计需要转型动作，试着发展无需转型的替代设计。
> - 如果转型是必要的，试着将它隐藏于某个函数背后。客户随后可以调用该函数，而不需将转型放进他们自己的代码内。
> - 宁可使用C++-style(新式)转型，不要使用旧式转型。前者很容易辨识出来，而且也比较有着分门别类的执掌。



### 条款28：避免返回handles指向对象内部成分

> 避免返回handles指向对象内部成分
>
> Avoid returning "handles" to object internals.

> 避免返回handles（包括references、指针、迭代器）指向对象内部。遵守这个条约可增加封装性，帮助const成员函数的行为像个const，并将发生“虚吊号码牌”（dangling handles）的可能性降至最低。



### 条款29：为“异常安全”而努力是值得的

> 为“异常安全”而努力是值得的
>
> Strive for exception-safe code.

> - 异常安全函数（Exception-safe functions）即使发生异常也不会泄漏资源或允许任何数据结构败坏。这样的函数区分为三种可能的保证：基本型、强烈型、不抛异常型。
> - “强烈保证”往往能够以copy-and-swap 实现出来，但“强烈保证”并非对所有函数都可实现或具备现实意义。
> - 函数提供的“异常安全保证”通常最高只等于其所调用之各个函数的 “异常安全保证” 中的最弱者。



### 条款30：透彻了解inlining的里里外外

> 透彻了解inlining的里里外外
>
> Understand the ins and outs of inlining.

> - 将大多数inlining 限制在小型、被频繁调用的函数身上。这可使日后的调试过程和二进制升级（binary upgradability）更容易，也可使潜在的代码膨胀问题最小化，使程序的速度提升机会最大化。
> - 不要只因为 function templates 出现在头文件，就将它们声明为inline



### 条款31：将文件间的编译依存关系降至最低

> 将文件间的编译依存关系降至最低
>
> Minimize compilation dependencies between files.

> - 支持 ”编译依存性最小化“ 的一般构想是：相依于声明式，不要相依于定义式。基于此构想的两个手段是 Handle classes 和 Interface classes。
> - 程序库头文件应该以 ”完全且仅有声明式“ （full and declaration-only forms）的形式存在。这种做法不论是否涉及templates 都适用。



## 6. 继承与面向对象设计

### 条款32：确定你的public继承塑模出is-a关系

> 确定你的public继承塑模出is-a关系(is-a，是一种)
>
> Make sure public inheritance models "is-a".

> ”public 继承“ 意味着 is-a。适用于 base classes 身上的每一件事情一定也适用于 derived classes 身上，因为每一个derived class 对象也都是一个 base class 对象。



### 条款33：避免遮掩继承而来的名称

> 避免遮掩继承而来的名称
>
> Avoid hiding inherited names.

> - derived classes 内的名称会遮掩base classes 内的名称。在 public 继承下从来没有人希望如此。
> - 为了让被遮掩的名称再见天日，可使用 using 声明式或转交函数（forwarding functions）。



### 条款34：区分接口继承和实现继承

> 区分接口继承和实现继承
>
> Differentiate between inheritance of interface and inheritance of implementation.

> - 接口继承和实现继承不同。在 public 继承之下，derived classes 总是继承base class的接口。
> - pure virtual 函数只具体指定接口继承。
> - 简朴的（非纯）impure virtual 函数具体指定接口继承及缺省实现继承。
> - non-virtual 函数具体指定接口继承以及强制性实现继承。



### 条款35：考虑virtual函数以外的其他选择

> 考虑virtual函数以外的其他选择
>
> Consider alternatives to virtual functions.

> - virtual 函数的替代方案包括NVI 手法及 Strategy 设计模式的多种形式。NVI 手法自身是一个特殊形式的 Template Method 设计模式。
> - 将机能从成员函数移到class 外部函数，带来的一个缺点是，非成员函数无法访问class 的non-public 成员。
> - tr1::function 对象的行为就像一般函数指针。这样的对象可接纳 ” 与给定之目标签名式（target signature）兼容“ 的所有可调用物（callable entities）。



### 条款36：绝不重新定义继承而来的non-virtual 函数

> 绝不重新定义继承而来的non-virtual 函数
>
> Never redefine an inherited non-virtual function.

> 绝对不要重新定义继承而来的 non-virtual 函数。



### 条款37：绝不重新定义继承而来的缺省参数值

> 绝不重新定义继承而来的缺省参数值
>
> Never redefine a function's inherited default parameter value.

> 绝对不要重新定义一个继承而来的缺省参数值，因为缺省参数值都是静态绑定，而virtual 函数——你唯一应该覆写的东西——却是动态绑定。



### 条款38：通过符合塑模出 has-a 或”根据某物实现出“

> 通过符合塑模出 has-a 或”根据某物实现出“
>
> Model ”has-a“ or ”is-implemented-in-terms-of“ through composition.

> - 复合（composition）的意义和public 继承完全不同。
> - 在应用域（application domain），复合意味 **has-a**（有一个）。在实现域（implementation domain），复合意味 is-implemented-in-terms-of（根据某物实现出）。



### 条款39：明智而审慎地使用private 继承

> 明智而审慎地使用private 继承
>
> Use private inheritance judiciously.

> - Private 继承意味着 is-implemented-terms of（根据某物实现出）。它通常比复合（composition）的级别低。但是当 derived class 需要访问 protected base class 的成员，或需要重新定义继承而来的 virtual 函数时，这么设计是合理的。
> - 和复合（composition）不同，private 继承可以造成 empty base 最优化。这对致力于 ”对象尺寸最小化“ 的程序库开发者而言，可能很重要。



### 条款40：明智而审慎地使用多重继承

> 明智而审慎地使用多重继承
>
> Use multiple inheritance judiciously.

> - 多重继承比单一继承复杂。它可能导致新的歧义性，以及对 virtual 继承的需要。
> - virtual 继承会增加大小、速度、初始化（及赋值）复杂度等等成本。如果 virtual base classes 不带任何数据，将是最具使用价值的情况。
> - 多重继承的确有正当用途。其中一个情节涉及 ”public 继承某个 Interface class“ 和 ”private 继承某个协助实现的class“ 的两相组合。



## 7. 模板与泛型编程

### 条款41：了解隐式接口和编译器多态

> 了解隐式接口和编译器多态
>
> Understand implicit interfaces and compile-time polymorphism.

> - classes 和 templates 都支持接口（interfaces）和多态（polymorphism）。
> - 对 classes 而言接口是显示的（explicit），以函数签名为中心。多态则是通过 virtual 函数发生于运行期。
> - 对 template 参数而言，接口是隐式的（implicit），奠基于有效表达式。多态则是通过 template 具现化和函数重载解析（function overloading resolution）发生于编译器。



### 条款42：了解typename 的双重意义

> 了解typename 的双重意义
>
> Understand the two meanings of typename.

> - 声明 template 参数时，前缀关键字 class 和 typename 可互换。
> - 请使用关键字 typename 标识嵌套从属类型名称；但不得在 base class lists（基类列）或 member initialization list（成员初值列）内以它作为 base class 修饰符。



### 条款43：学习处理模板化基类内的名称

> 学习处理模板化基类内的名称
>
> Know how to access names in templatized base classes.

> - 可在 derived class templates 内通过 ”this->“ 指涉 base class templates 内的成员名称，或藉由一个明白写出的 ”base class 资格修饰符“ 完成。



### 条款44：将与参数无关的代码抽离 templates

> 将与参数无关的代码抽离 templates
>
> Factor parameter-independent code out of templates.

> - Templates 生成多个 classes 和多个函数，所以任何 template 代码都不该与某个造成膨胀的 template 参数产生相依关系。
> - 因非类型模板参数（non-type template parameters）而造成的代码膨胀，往往可消除，做法是以函数参数或 class 成员变量替换 template 参数。
> - 因类型参数（type parameters）而造成的代码膨胀，往往可降低，做法是让带有完全相同二进制表述（binary representations）的具现类型（instantiation types）共享实现码。



### 条款45：运用成员函数模板接受所有兼容类型

> 运用成员函数模板接受所有兼容类型
>
> Use member function templates to accept "all compatible types."

> - 请使用 member function templates（成员函数模板）生成 ”可接受所有兼容类型“ 的函数。
> - 如果你声明 member templates 用于 ”泛化 copy 构造“ 或 ”泛化 assignment 操作“，你还是需要声明正常的 copy 构造函数和 copy assignment 操作符。



### 条款46：需要类型转换时请为模板定义非成员函数

> 需要类型转换时请为模板定义非成员函数
>
> Define non-member functions inside templates when type conversions are desired.

> - 当我们编写一个 class template，而它所提供之 ”与此 template 相关的“ 函数支持 ”所有参数之隐式类型转换“ 时，请将那些函数定义为 ”class template 内部的 friend 函数“。



### 条款47：请使用traits classes 表现类型信息

> 请使用traits classes 表现类型信息
>
> Use traits classes for information about types.

> - Traits classes 使得 ”类型相关信息“ 在编译期可用。它们以 templates 和 ”templates 特化” 完成实现。
> - 整合重载技术（overloading）后，traits classes 有可能在编译期对类型执行if...else 测试。



### 条款48：认识 template 元编程

> 认识 template 元编程
>
> Be aware of template metaprogramming.

> - Template metaprogramming（TMP，模板元编程）可将工作由运行期移往编译器，因而得以实现早期错误侦测和更高的执行效率。
> - TMP 可被用来生成 “基于政策选择组合” （based on combinations of policy choices）的客户定制代码，也可用来避免生成对某些特殊类型并不适合的代码。





## 8. 定制new 和 delete

### 条款49：了解 new-handler 的行为

> 了解 new-handler 的行为
>
> Understand the behavior of the new-handler.

> - set_new_handler 允许客户指定一个函数，在内存分配无法获得满足时被调用。
> - Nothrow new 是一个颇为局限的工具，因为它只适用于内存分配；后继的构造函数调用还是可能抛出异常。



### 条款50：了解 new 和delete 的合理替换时机

> 了解 new 和delete 的合理替换时机
>
> Understand when it makes sense to replace new and delete.

需要替换缺省的 new 和 delete 的理由如下：

1. 为了检测运用错误
2. 为了收集动态分配内存之使用统计信息
3. 为了增加分配和归还的速度
4. 为了降低缺省内存管理器带来的空间额外开销
5. 为了弥补缺省分配器中的非最佳齐位（suboptimal alignment）
6. 为了将相关对象成簇集中
7. 为了获得非传统的行为



> - 有许多理由需要写个自定义的 new 和 delete，包括改善效能、对heap 运用错误进行调试、收集 heap 使用信息。



### 条款51：编写 new 和 delete 时需固守常规

> 编写 new 和 delete 时需固守常规
>
> Adhere to convention when writing new and delete.

> - operator new 应该内含一个无穷循环，并在其中尝试分配内存，如果它无法满足内存需求，就应该调用 new-handler。它也应该有能力处理 0 bytes 申请。Class 专属版本则还应该处理 “比正确大小更大的（错误）申请。
> - operator delete 应该在收到 null 指针时不做任何事。Class 专属版本则还应该处理 ”比正确大小更大的（错误）申请 ”。



### 条款52：写了 placement new 也要写 placement delete

> 写了 placement new 也要写 placement delete
>
> Write placement delete if you write placement new.

> - 当你写一个 placement operator new，请确定也写出了对应的 placement operator delete。如果没有这样做，你的程序可能会发生隐微而时断时续的内存泄漏。
> - 当你声明了 placement new 和 placement delete，请确定不要无意识（非故意）地遮掩了它们地正常版本。





## 9. 杂项讨论

### 条款53：不要轻忽编译器地警告

> 不要轻忽编译器地警告
>
> Pay attention to compiler warnings.

> - 严肃对待编译器发出的警告信息。努力在你的编译器的最高（最严苛）警告级别下争取 “无任何警告” 的荣誉。
> - 不要过度倚赖编译器的报警能力，因为不同的编译器对待事情的态度并不相同。一旦移植到另一个编译器上，你原本倚赖的警告信息有可能消失。



### 条款54：让自己熟悉包括 TR1 在内的标准程序库

> 让自己熟悉包括 TR1 在内的标准程序库
>
> Familiarize yourself with the standard library, including TR1.

> - C++ 标准程序库的主要机能由 STL、iostreams、locales 组成。并包含 C99 标准程序库。
> - TR1 添加了智能指针（例如tr1：：shared_ptr）、一般化函数指针（tr1::function）、hash-based 容器、正则表达式（regular expressions）以及另外 10 个组件的支持。
> - TR1 自身只是一份规范。为获得 TR1 提供的好处，你需要一份实物。一个好的实物来源是 Boost。



### 条款55：让自己熟悉 Boost

> 让自己熟悉 Boost
>
> Familiarize yourself with Boost.

> - Boost 是一个社群，也是一个网站。致力于免费、源码开放、同僚复审的 C++ 程序库开发。Boost 在 C++ 标准化过程中扮演深具影响力的角色。
> - Boost 提供许多 TR1 组件实现品，以及其他许多程序库。

