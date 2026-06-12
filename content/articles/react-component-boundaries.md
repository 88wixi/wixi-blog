---
slug: react-component-boundaries
title: React 组件为什么需要边界感
date: 2026-04-22
category: tech
tags: [React, 工程]
readingMinutes: 8
excerpt: 从一个博客卡片开始，聊聊状态、布局和可维护性的分寸。
---

“组件应该多大”是个老问题，今天换个角度：从“边界”看。

一个组件的边界，由它对父级暴露的 props 和它私有的状态共同定义。

边界感不是越细越好，而是让每一处变化都落在它最自然的位置上。
