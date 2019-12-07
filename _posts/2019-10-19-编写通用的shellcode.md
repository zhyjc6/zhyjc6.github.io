---
layout: mypost
title: 一段shellcode的分析调试解释API地址的动态定位
categories: [PWN]
---



## 一段shellcode

今天的主角是一段shellcode代码

```c
char evil[] = "\xeb\x54\x31\xf6\x64\x8b\x76\x30\x8b\x76\x0c\x8b\x76\x1c\x8b\x6e"
"\x08\x8b\x36\x8b\x5d\x3c\x8b\x5c\x1d\x78\x85\xdb\x74\xf0\x01\xeb"
"\x8b\x4b\x18\x67\xe3\xe8\x8b\x7b\x20\x01\xef\x8b\x7c\x8f\xfc\x01"
"\xef\x31\xc0\x99\x02\x17\xc1\xca\x04\xae\x75\xf8\x3b\x54\x24\x04"
"\xe0\xe4\x75\xca\x8b\x53\x24\x01\xea\x0f\xb7\x14\x4a\x8b\x7b\x1c"
"\x01\xef\x03\x2c\x97\xc3\x68\xe7\xc4\xcc\x69\xe8\xa2\xff\xff\xff"
"\x50\x68\x63\x61\x6c\x63\x8b\xd4\x40\x50\x52\xff\xd5\x68\x77\xa6"
"\x60\x2a\xe8\x8b\xff\xff\xff\x50\xff\xd5";
```

该shellcode的作用是调用系统中winexec函数，使之执行**WinExec("calc",1)**从而弹出计算器。





## 运行环境

操作系统：Windows XP SP3

调试工具：vc 6.0, ollyice



## shellcode原理

实际中使用的shellcode 为了能在不同的主机环境上正常运行，必须还要能动态地获得自身所需的 API 函数地址。 

Windows 的 API 是通过动态链接库中的导出函数来实现的。Win_32 平台下的 shellcode 广泛使用的方法是通过从进程环境块中找到动态链接库的导出表，并搜索出所需的 API 地址，然后逐一调用。

所有 win_32 程序都会加载 ntdll.dll 和 kernel32.dll 这两个基础的动态链接库。如果想要 在 win_32 平台下定位 kernel32.dll 中的 API 地址，可以采用如下方法：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122253.png)

1. 首先通过段选择字 FS 在内存中找到当前的线程环境块 TEB。 
2. 线程环境块偏移位置为 0x30 的地方存放着指向进程环境块 PEB 的指针。 
3. 进程环境块中偏移位置为 0x0C 的地方存放着指向 PEB_LDR_DATA 结构体的指针， 其中，存放着已经被进程装载的动态链接库的信息。 
4. PEB_LDR_DATA 结构体偏移位置为 0x1C 的地方存放着指向模块初始化链表的头指针 InInitializationOrderModuleList。 
5. 模块初始化链表 InInitializationOrderModuleList 中按顺序存放着 PE 装入运行时初始化模块的信息，第一个链表结点是 ntdll.dll，第二个链表结点就是 kernel32.dll。 
6. 找到属于 kernel32.dll 的结点后，在其基础上再偏移 0x08 就是 kernel32.dll 在内存中的 加载基地址。 
7. 从 kernel32.dll 的加载基址算起，偏移 0x3C 的地方就是其 PE 头。 
8. PE 头偏移 0x78 的地方存放着指向函数导出表的指针。 
9. 至此，我们可以按如下方式在函数导出表中算出所需函数的入口地址
   1. 导出表偏移0x1C处的指针指向存储导出函数偏移地址（RVA）的列表
   2. 导出表偏移0x20处的指针指向存储导出函数名的列表
   3. 函数的RVA地址和名字按照顺序存放在上述两个列表中，我们可以在名称列表中定位到所需的函数是第几个，然后在地址列表中找到对应的RVA
   4. 获得RVA后，再加上前边已经得到的动态链接库的基地址，就能算出API此时在内存中的绝对地址





### shellcode对应的汇编代码

```c
004273B0 > /EB 54           jmp     short 00427406

/*该函数查找winexec函数地址并赋值给ebp*/    
004273B2   |31F6            xor     esi, esi  //esi清零
004273B4   |64:8B76 30      mov     esi, dword ptr fs:[esi+30]  //esi值为指向PEB的指针
004273B8   |8B76 0C         mov     esi, dword ptr [esi+C]  //esi值为指向 PEB_LDR_DATA 结构体的指针
004273BB   |8B76 1C         mov     esi, dword ptr [esi+1C]  //esi值为指向模块初始化链表的指针 InInitializationOrderModuleList

004273BE   |8B6E 08         mov     ebp, dword ptr [esi+8]  //ebp值为模块初始化链表当前结点的基地址
004273C1   |8B36            mov     esi, dword ptr [esi]  //esi值为指向模块初始化链表下一个结点的指针
004273C3   |8B5D 3C         mov     ebx, dword ptr [ebp+3C]  //ebx值为指向当前节点的pe头的指针
004273C6   |8B5C1D 78       mov     ebx, dword ptr [ebp+ebx+78]  //ebx值为当前结点的pe头的导出表的相对地址
004273CA   |85DB            test    ebx, ebx  //若遍历完当前结点的导出表
004273CC  ^|74 F0           je      short 004273BE  //则跳转到下一结点遍历其导出表
004273CE   |01EB            add     ebx, ebp  //ebx加上ebp的基址后得到可直接访问的绝对地址
004273D0   |8B4B 18         mov     ecx, dword ptr [ebx+18]  //偏移18，得到导出表中的函数总数ecx
004273D3   |67:E3 E8        jcxz    short 004273BE  //ecx减为0则跳转，去下一个结点的导出表

    
004273D6   |8B7B 20         mov     edi, dword ptr [ebx+20]  //导出表偏移20处是函数名称列表
004273D9   |01EF            add     edi, ebp  //edi加上ebp的基址后得到可直接访问的绝对地址
004273DB   |8B7C8F FC       mov     edi, dword ptr [edi+ecx*4-4]  //把导出表最后一个函数名地址赋给edi
004273DF   |01EF            add     edi, ebp  //edi加上ebp的基址后得到可直接访问的绝对地址
004273E1   |31C0            xor     eax, eax  //把eax置零
004273E3   |99              cdq  //先把EDX的所有位都设成EAX最高位的值（0）,再把edx扩展为eax的高位，也就是说变为64位。
    
/*此处是对edi所指函数名做hash并与事先入栈的hash（[esp+4]）比较*/
004273E4   |0217            add     dl, byte ptr [edi]  //dl处加上edi所指的一个字节
004273E6   |C1CA 04         ror     edx, 4  //edx循环右移4位
004273E9   |AE              scas    byte ptr es:[edi]  // 将al中的值（0）与es:edi所指向的目的地址处的一个字节进行比较，如果相等，ZF=1（判断字符串是否结尾）
004273EA  ^|75 F8           jnz     short 004273E4  //zf=0则跳转
004273EC   |3B5424 04       cmp     edx, dword ptr [esp+4]  //比较edx和预先入栈的函数名的hash
004273F0  ^|E0 E4           loopdne short 004273D6  //CX-1，若CX!=0且ZX=0则跳转，查询上一个函数名的hash
004273F2  ^|75 CA           jnz     short 004273BE  //zx=0则跳转到下一个结点，遍历其导出表

004273F4   |8B53 24         mov     edx, dword ptr [ebx+24] //结点导出表偏移24为函数序号表
004273F7   |01EA            add     edx, ebp  //edx加上ebp的基址后得到可直接访问的绝对地址
004273F9   |0FB7144A        movzx   edx, word ptr [edx+ecx*2]  //得到函数在序号表中的序号
004273FD   |8B7B 1C         mov     edi, dword ptr [ebx+1C]  //导出表偏移1c指向函数地址表
00427400   |01EF            add     edi, ebp  //edi加上ebp的基址后得到可直接访问的绝对地址
00427402   |032C97          add     ebp, dword ptr [edi+edx*4]  //根据序号得到相对地址，加上基址得到函数的绝对地址
00427405   |C3              retn


/*调用kernel.winexec("calc",1)弹出计算器*/
00427406   \68 E7C4CC69     push    69CCC4E7  //待查找的函数名hash入栈
0042740B    E8 A2FFFFFF     call    004273B2  //调用查找函数查找winexec函数并赋值给ebp
00427410    50              push    eax  
00427411    68 63616C63     push    636C6163  //"calc"
00427416    8BD4            mov     edx, esp  //把栈顶（calc）赋值给edx
00427418    40              inc     eax  //eax加一，为1
00427419    50              push    eax  //参数1入栈
0042741A    52              push    edx  //参数“calc”入栈
0042741B    FFD5            call    ebp  //调用kernel.winexec("calc",1)弹出计算器


/*收尾阶段，完美退出*/
0042741D    68 77A6602A     push    2A60A677  //ExitProcess的hash
00427422    E8 8BFFFFFF     call    004273B2  //找到ExitProcess函数的地址并赋值给ebp
00427427    50              push    eax  //参数0入栈
00427428    FFD5            call    ebp  //ExitProcess(0) 结束调用的进程及其所有的线程

```

### shellcode对应的执行流程

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122324.png)







## 编写程序调试shellcode



```c
#include<stdio.h>

char evil[] = "\xeb\x54\x31\xf6\x64\x8b\x76\x30\x8b\x76\x0c\x8b\x76\x1c\x8b\x6e"
"\x08\x8b\x36\x8b\x5d\x3c\x8b\x5c\x1d\x78\x85\xdb\x74\xf0\x01\xeb"
"\x8b\x4b\x18\x67\xe3\xe8\x8b\x7b\x20\x01\xef\x8b\x7c\x8f\xfc\x01"
"\xef\x31\xc0\x99\x02\x17\xc1\xca\x04\xae\x75\xf8\x3b\x54\x24\x04"
"\xe0\xe4\x75\xca\x8b\x53\x24\x01\xea\x0f\xb7\x14\x4a\x8b\x7b\x1c"
"\x01\xef\x03\x2c\x97\xc3\x68\xe7\xc4\xcc\x69\xe8\xa2\xff\xff\xff"
"\x50\x68\x63\x61\x6c\x63\x8b\xd4\x40\x50\x52\xff\xd5\x68\x77\xa6"
"\x60\x2a\xe8\x8b\xff\xff\xff\x50\xff\xd5";
 
int main(int argc, char **argv)
{
int (*shellcode)();
shellcode = (int (*)()) evil;
(int)(*shellcode)();
}
```

保存代码为sc1.c并拖入vc6.0,编译，运行，弹出计算器。为了使代码更加简洁，我们进入工程-->设置-->C/C++-->工程选项 中删除 /GZ参数。

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122344.png)



把debug模式下的sc1.exe文件拖入ollyice中，定位到main函数：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122425.png)



进入evil函数：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122441.png)

在调用winexec函数处下断点，按F9运行至此处：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122503.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122552.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122605.png)

可以看到将要执行winexec("calc",1)调出计算器窗口。F8单步执行成功调出计算器窗口

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122626.png)



收尾阶段。此时鼠标手动关闭计算器窗口，在CALL EBP 处按F2下断点，F9直接运行至此处

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122643.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122709.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122746.png)

可以看出将要执行WinExec(0)函数用于退出，F8单步运行，系统自动关闭cmd窗口并终止进程。

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207122810.png)



