### 1. 读取文件生成模块信息
- 建立模块与模块信息的对应关系

### 2. 从入口文件开始收集依赖关系
- 生成一个图结构；可以使用队列表示

### 3. 代码生成
- 通过依赖图组装mudules
- 实现require函数，需要在require函数中创建module对象。(参数: 模块路径; 返回值: exports对象)
- 调用入口文件

### 参考网站
- ast 结构可视化: https://astexplorer.net
- babel: https://babeljs.io/