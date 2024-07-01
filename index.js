const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const { Buffer } = require("buffer");
const axios = require("axios");

app.use(bodyParser.text());

app.post("/process-text", async (req, res) => {
  const text = req.body;
  const githubToken = process.env.GITHUB_TOKEN;
  const githubApiUrl = process.env.GITHUB_API_URL;
  const translate_token = process.env.TRANSLATE_API_TOKEN;
  if (!text || typeof text !== "string") {
    return res.status(400).send("Invalid input");
  }

  // 分割输入文本
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) {
    return res.status(400).send("Invalid input format");
  }

  // 第一行为参数行
  const [params, ...contentLines] = lines;
  const [title, tags, date, author] = params
    .split("|")
    .map((param) => param.trim());
  const tagsArray = tags.split(" ").map((tag) => tag.trim());
  const firstTag = tagsArray[0];
  const content = contentLines.join("\n");

  // 处理日期和时间
  let formattedDate;
  let formattedTime;
  if (date.length === 8) {
    // 仅日期部分
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    const hour = "08";
    const minute = "00";
    const second = "00";
    formattedTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    formattedDate = `${year}-${month}-${day}`;
  } else if (date.length === 14) {
    // 日期和时间部分
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    const hour = date.slice(8, 10);
    const minute = date.slice(10, 12);
    const second = date.slice(12, 14);
    formattedTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    formattedDate = `${year}-${month}-${day}`;
  } else {
    return res.status(400).send("Invalid date format");
  }

  try {
    // 调用翻译API
    const response = await axios.post(
      "https://api.ac.cx332.cn/translate?token=" + translate_token,
      {
        text: title,
        source_lang: "ZH",
        target_lang: "EN",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const translatedTitle = response.data.data;
    const filename = translatedTitle
      .replace(/[^a-zA-Z0-9\s]/g, "") // 删除非字母和数字的内容
      .replace(/\s+/g, "_"); // 将单词和单词之间用下划线代替
    const fullFilename = `${formattedDate}-${filename}.md`;

    // 构建格式化的文本
    const formattedText = `
---
layout: post
title: "「${firstTag}」${title}"
date: ${formattedTime}
author: ${author}
header-style: text
tags:
${tagsArray.map((tag) => `    - ${tag}`).join("\n")}
---

${content}
    `.trim();

    // 将格式化的文本进行Base64编码
    const base64Content = Buffer.from(formattedText).toString("base64");
    // 添加到 Github 的代码
    const githubResponse = await axios.put(
      githubApiUrl + fullFilename,
      {
        message: "add a post",
        content: base64Content,
      },
      {
        headers: {
          Authorization: "Bearer " + githubToken,
        },
      }
    );

    if (githubResponse.status !== 201) {
      throw new Error("Github API 请求失败");
    }

    res.json({
      msg: "success",
      title: `${title}`,
      full_filename: fullFilename,
      tags: tagsArray,
      date: formattedTime,
      author: author,
      filename: filename,
    });
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
