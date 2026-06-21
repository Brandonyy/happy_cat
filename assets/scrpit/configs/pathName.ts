import { _decorator, AudioClip, Component, Node, Prefab, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 资源路径
 */
export const resPath = {
    audio: { type: AudioClip, path: '' },
    prefabs: { type: Prefab, path: '' },
    img: { type: SpriteFrame, path: '' },
};


/**
 * 元素球的类型
 */
export const ballType = {
    one: 'one',
    two: 'two',
    three: 'three',
    four: 'four',
    five: 'five',
    six: 'six',
    cat: 'cat'
}
/**
 * 所处平台
 */
export const pingtai = {
    wx: 'WECHAT_GAME',
    dy: 'BYTEDANCE_MINI_GAME',
    qq: 'qq',
    oth: 'oth',
};
/**
 * 自定义事件枚举
 */
export const eventType = {
    // 点击
    click: 'click',
    // 时间最后几秒
    jinggaoTime: 'jinggaoTime',
    // 选中球
    selectBall: 'selectBall',
    // 重置时间
    timeReset: 'timeReset',
    // 更新关卡
    updateLevel: 'updateLevel',
    // 使用冰冻技能
    useDongjie: 'useDongjie',
    // 使用消除技能
    useCouqi: 'useCouqi',
    // 使用移出技能
    useYichu: 'useYichu',
    // 使用移出技能
    huangdong: 'huangdong',
    // 倒计时结束
    timeJieshu: 'timeJieshu',
    // 普通模式结束
    normalEnd: 'normalEnd',
    // 超级模式结束
    superEnd: 'superEnd',
    // 下一关
    nextLevel: 'nextLevel',
    // 更新金币数量
    jinBiNum: 'jinBiNum',
    // 开始扭蛋
    kaishiChoujiang: 'kaishiChoujiang',
    // 结束扭蛋
    jieshuChoujiang: 'jieshuChoujiang',
    // 解锁家园部分
    jiesuoHome: 'jiesuoHome',
    // 游戏开始
    gameStart: 'gameStart',
    // 技能更新
    updateDaojuNum: 'updateDaojuNum',
    // 获取技能
    addDaoju: 'addDaoju',
    // 复活
    fuhuo: 'fuhuo',
    // 红点提示
    redTishi: 'redTishi',
    // 领取福利
    dayFLLingqu: 'dayFLLingqu',
    // 添加到我的小程序
    addToMini: 'addToMini',
};

