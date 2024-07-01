const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const { Buffer } = require('buffer');

app.use(bodyParser.text());

app.post('/process-text', (req, res) => {
    const text = req.body;
    if (!text || typeof text !== 'string') {
        return res.status(400).send('Invalid input');
    }

    // 分割输入文本
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        return res.status(400).send('Invalid input format');
    }

    // 第一行为参数行
    const [params, ...contentLines] = lines;
    const [title, tags, date, author] = params.split('|').map(param => param.trim());
    const tagsArray = tags.split(' ').map(tag => tag.trim());
    const firstTag = tagsArray[0];
    const content = contentLines.join('\n');
    const base64Content = Buffer.from(content).toString('base64');

    const formattedText = `
---
layout: post
title: "「${firstTag}」${title}"
date: ${date}
author: ${author}
header-style: text
tags:
${tagsArray.map(tag => `    - ${tag}`).join('\n')}
---

${content}
    `.trim();

    res.json({
        title: `「${firstTag}」${title}`,
        tags: tagsArray,
        date: date,
        author: author,
        content: base64Content
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});