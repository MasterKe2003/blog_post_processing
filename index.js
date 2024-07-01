const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const { Buffer } = require("buffer");
const axios = require("axios");

app.use(bodyParser.text());

app.post("/process-text", async (req, res) => {
  const text = req.body;
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
  if (date.length === 8) {
    // 仅日期部分
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    const hour = "08";
    const minute = "00";
    const second = "00";
    formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  } else if (date.length === 14) {
    // 日期和时间部分
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    const hour = date.slice(8, 10);
    const minute = date.slice(10, 12);
    const second = date.slice(12, 14);
    formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  } else {
    return res.status(400).send("Invalid date format");
  }

  try {
    // 调用翻译API
    const response = await axios.post(
      'https://api.ac.cx332.cn/translate?token=666',
      {
        text: title,
        source_lang: "ZH",
        target_lang: "EN"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
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
date: ${formattedDate}
author: ${author}
header-style: text
tags:
${tagsArray.map((tag) => `    - ${tag}`).join("\n")}
---

${content}
    `.trim();

    // 将格式化的文本进行Base64编码
    const base64Content = Buffer.from(formattedText).toString("base64");

    res.json({
      title: `${title}`,
      tags: tagsArray,
      date: formattedDate,
      author: author,
      content: base64Content,
      filename: filename,
      full_filename: fullFilename
    });
  } catch (error) {
    console.error("Error translating title:", error);
    res.status(500).send("Error translating title");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});