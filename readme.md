### JPush

运营部同学的需求,导出极光推送历史表格.
需要先登录[极光](https://www.jiguang.cn/accounts/login/form)成功后,在stroge里找到`Jtoken`

### 使用
>#### 新建js文件
```javascript
var jpush = require('jpush')
var export = new jpush(20191001000000,20191031000000,Jtoken)
```
>#### 导出
```javascript
node js
```