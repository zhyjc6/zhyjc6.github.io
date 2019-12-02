/* MTA腾讯移动分析 */
var _mtac = {};
(function() {
    var mta = document.createElement("script");
    mta.src = "//pingjs.qq.com/h5/stats.js?v2.0.4";
    mta.setAttribute("name", "MTAH5");
    mta.setAttribute("sid", "500697048");
    mta.setAttribute("cid", "500697053");
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(mta, s);
})();

/* 预计阅读时间 */
var text = $('.post').text().length;
var text_num = read_time/400;
var read_time = Math.round(read_time);
alert(text);
if(read_time>1){
        $('#read-time').text('预计阅读时间'+read_time+'分钟');
}else{
        $('#read-time').text('预计阅读时间 1 分钟');
}

