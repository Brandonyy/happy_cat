'use strict';

// Cocos 3.8 构建插件配置：把构建钩子按平台挂载。
// 用 '*' 对所有平台注册，钩子内部再判断是否为微信小游戏。
exports.configs = {
    '*': {
        hooks: './hooks.js',
    },
};
