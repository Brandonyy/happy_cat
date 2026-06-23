'use strict';

const fs = require('fs');
const path = require('path');

// 希望写入的基础库版本。微信开发者工具不接受 "game" 作为 libVersion，
// 用 "latest" 让工具自动采用本机已安装的最新基础库。
const TARGET_LIB_VERSION = 'latest';

// 尝试用多种来源解析构建输出目录，兼容不同版本的 Cocos 构建 API。
function resolveDest(options, result) {
    const candidates = [];

    if (result) {
        if (typeof result.dest === 'string') candidates.push(result.dest);
        if (result.paths && typeof result.paths.dir === 'string') candidates.push(result.paths.dir);
    }

    if (options) {
        if (typeof options.dest === 'string') candidates.push(options.dest);
        if (typeof options.buildPath === 'string' && typeof options.outputName === 'string') {
            let bp = options.buildPath;
            if (bp.startsWith('project://')) {
                const projectPath = (typeof Editor !== 'undefined' && Editor.Project && Editor.Project.path) || process.cwd();
                bp = path.join(projectPath, bp.slice('project://'.length));
            }
            candidates.push(path.join(bp, options.outputName));
        }
    }

    // 优先返回确实存在 project.config.json 的目录
    for (const c of candidates) {
        if (c && fs.existsSync(path.join(c, 'project.config.json'))) return c;
    }
    return candidates[0];
}

exports.onAfterBuild = async function (options, result) {
    if (!options || options.platform !== 'wechatgame') return;

    try {
        const dest = resolveDest(options, result);
        if (!dest) {
            console.warn('[wechat-config-fix] 无法解析构建输出目录，跳过修正');
            return;
        }

        const cfgPath = path.join(dest, 'project.config.json');
        if (!fs.existsSync(cfgPath)) {
            console.warn('[wechat-config-fix] 未找到 project.config.json:', cfgPath);
            return;
        }

        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        if (cfg.libVersion === TARGET_LIB_VERSION) return;

        const old = cfg.libVersion;
        cfg.libVersion = TARGET_LIB_VERSION;
        fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
        console.log(`[wechat-config-fix] libVersion "${old}" -> "${TARGET_LIB_VERSION}"，已修正 ${cfgPath}`);
    } catch (e) {
        console.error('[wechat-config-fix] 修正 project.config.json 失败:', e);
    }
};
