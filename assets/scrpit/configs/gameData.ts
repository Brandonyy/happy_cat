import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameData')
export class gameData {
    // 当前所处平台
    static pingtai = null
    // 领取奖品、扭蛋奖励，奖品数据(暂时存储，领取奖励弹窗使用)
    static jingpinArr: any[] = []
    // 弹窗节点
    static tcNode: Node = null
    // 当前图鉴详情
    static tujiXiangqing: any = null
    // 失败类型
    static shibaiType: number = 0
    // 普通模式游戏关卡
    static putongLevel: number = 1
    // 挑战模式游戏关卡
    static tiaozhanLevel: number = 1
    // 当前游戏模式
    static moshi: number = 0
    // 首页主节点
    static main: Node = null
    // 游戏主节点
    static game: Node = null
    //当前选中的球的ID数组
    static selectBallIdArr: number[] = []
    // 当前是否暂停状态
    static zanting: boolean = false
    // 插槽球主节点
    static chacaoBox: Node = null
    // 获取技能的类型
    static addDaojuType = null
    //默认物品数量
    static morenWupin: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 }
}


