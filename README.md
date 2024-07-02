# 项目名称：Markdown 文本处理服务

## 简介

这是一个基于 Express.js 构建的服务，用于处理 Markdown 文本。它可以自动将 Markdown 文本中的标题翻译成英文，然后将格式化的文本添加到 GitHub 仓库中。此服务特别适用于需要自动化处理 Markdown 文件并且希望将其存储在 GitHub 上的用户。

此服务还支持通过日期和时间格式化文本文件名，以及根据提供的标签、日期、作者等信息生成 YAML 头部信息。

## 如何使用

### 前提条件

- 拥有 GitHub 账号并且创建了一个仓库用于存储 Markdown 文件。
- 已在 [Vercel](https://vercel.com/) 上注册账号。
- 已获取 [DeepLX](https://github.com/OwO-Network/DeepLX) 翻译服务的 API 令牌。

### 步骤

1. **Fork 项目仓库**

2. **在 Vercel 上部署服务**

    使用您的 GitHub 账号登录 Vercel。通过 Vercel 的新项目创建向导，选择您 Fork 的仓库并进行部署。在部署过程中，Vercel 会要求您提供几个环境变量，您需要填入以下信息：
    - `GITHUB_TOKEN`: 您的 GitHub API 令牌，用于允许服务向您的仓库提交文件。
    - `GITHUB_API_URL`: 指向您的 GitHub 仓库的 API URL，通常形式为 `https://api.github.com/repos/用户名/仓库名/contents/`。
    - `TRANSLATE_API_TOKEN`: 您从 DeepLX 获取的翻译服务 API 令牌。

3. **使用服务**

    在 Vercel 成功部署您的服务后，您将获得一个服务的 URL。您可以使用安卓或苹果快捷指令来触发请求。

    快捷指令应配置为发送 POST 请求到您的服务 URL，并将 Markdown 文本作为请求体传入。