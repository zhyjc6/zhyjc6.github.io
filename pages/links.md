---
layout: page
title: 友情链接
---
<ul>
  {% for link in site.links %}
  <li>
    <p><a href="{{ link.url }}" title="{{ link.desc }}" target="_blank" >{{ link.title }}</a>
    <br><br>
    </p>
  </li>
  {% endfor %}
</ul>

