# PiXO Life Demo

PiXO 一期交互 Demo：不做打卡、不做拍照、不做地图，先验证“PiXO 本身有没有生命感”。

![PiXO concept board](assets/pixo-concept.jpg)

## 核心闭环

- 首页观察 PiXO 自主生活状态
- 选择旅行用品
- 装备不同 Halo
- PiXO 自主出发并产生途中消息
- 回家后生成新的 Memory 和纪念品
- 所有结果写入本地 `localStorage`

## 直接运行

这是纯静态 Demo，不需要安装依赖。

```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## Demo 操作

1. 进入「旅行」
2. 选择 1～2 件旅行用品
3. 可在「PiXO」页切换 Halo
4. 点击「让 NOA 出发」
5. 观察途中信号
6. 点击「Demo：快速让它回来」
7. 查看新的 Memory 与收藏

## 视觉

- `assets/pixo-concept.jpg`：通过 ImageGen 生成的一期视觉方向图
- 运行时角色、场景、Halo 与纪念品使用同一方向下的轻量原创 SVG，确保 Demo 本地可跑、加载快
