# 部署指南 (Deployment Guide)

本项目支持使用 Docker Compose 进行一键部署，非常适合在宝塔面板 (Baota Panel) 等环境中使用。

## 1. 准备工作

确保您的服务器已经安装了：

- Docker
- Docker Compose

## 2. 环境变量配置

在项目根目录下（`docker-compose.yml` 同级目录），有一个 `.env` 文件。请根据您的实际环境修改其中的配置：

```properties
# MongoDB 连接字符串
# 格式: mongodb://[username:password@]host:port/database
# 如果使用 docker-compose 内部网络，host 使用服务名 'mongo'
MONGO_URI=mongodb://mongo:27017/bookkeeping

# JWT 密钥 (请务必修改为复杂的随机字符串)
JWT_SECRET=your_super_secret_key_change_this
```

**注意：** 生产环境中请务必修改 `JWT_SECRET`，否则会有安全风险。

## 3. 宝塔面板部署步骤

1.  **上传代码**：
    将整个项目文件夹上传到服务器的指定目录（例如 `/www/wwwroot/vitesse-lite`）。

2.  **添加 Docker Compose 项目**：

    - 登录宝塔面板。
    - 进入 **Docker** -> **Docker Compose** 菜单。
    - 点击 **添加项目**。
    - **项目名称**：填写 `bookkeeping` (或您喜欢的名字)。
    - **路径**：选择您上传代码的目录（包含 `docker-compose.yml` 的目录）。
    - **Compose 模板**：会自动读取目录下的 `docker-compose.yml` 文件内容。您可以再次检查配置。
    - 点击 **添加** (或 **构建并启动**)。

3.  **等待构建与启动**：
    宝塔会自动拉取基础镜像、构建 Backend 和 Frontend 镜像，并启动服务。这可能需要几分钟时间，具体取决于服务器网络状况。

4.  **访问应用**：
    部署成功后，服务将在以下端口运行：

    - **前端**：`80` 端口 (宿主机端口，可在 `docker-compose.yml` 中修改)
    - **后端**：`34863` 端口 (宿主机端口，可在 `docker-compose.yml` 中修改)
    - **数据库**：`27017` 端口

    您可以在浏览器中访问 `http://服务器IP` 即可看到记账应用。

## 4. 常见问题

- **端口冲突**：如果服务器上 80 端口已被占用（例如安装了 Nginx），请修改 `docker-compose.yml` 中的前端端口映射，例如改为 `8080:80`，然后通过 `http://服务器IP:8080` 访问。
- **数据持久化**：MongoDB 的数据会保存在 Docker Volume `mongo_data` 中，重启容器不会丢失数据。
- **日志查看**：可以在宝塔面板的 Docker 页面查看各个容器的日志，排查启动错误。
- **构建报错 "no such file or directory"**：
  - 错误信息：`resolve : lstat .../deploy: no such file or directory`
  - 原因：这是因为您在宝塔中使用“添加项目”或“模板”方式时，宝塔可能在一个临时的、不包含源代码的目录中运行 `docker-compose.yml`。
  - 解决方法：
    1.  请不要直接在宝塔 Docker 界面粘贴 YAML 内容创建项目。
    2.  **推荐方法**：直接在宝塔的“文件”或“终端”中，进入您上传代码的目录（例如 `/www/wwwroot/vitesse-lite`）。
    3.  在该目录下打开终端，运行 `./deploy.sh` 或 `docker-compose up -d --build`。

## 5. 自动更新脚本 (Auto Update Script)

为了方便后续的代码更新和部署，项目提供了一个 `deploy.sh` 脚本，它会自动执行以下步骤：

1. 尝试拉取最新的 Git 代码 (如果这是一个 git 仓库)
2. 重新构建并重启 Docker 容器

**注意：** 如果您是直接上传的文件（而不是 `git clone`），脚本会自动跳过 git 更新步骤，直接重新部署容器。

使用方法：

```bash
# 添加执行权限 (首次运行)
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

如果您习惯使用命令行手动操作，也可以直接在项目根目录下执行：

```bash
# 后台启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动 (代码更新后)
docker-compose up -d --build
```
