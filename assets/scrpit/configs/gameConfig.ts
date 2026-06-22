import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameConfig')
export class gameConfig extends Component {
    // 单次扭蛋的成本，默认为 500
    static choujiang1: number = 500
    // 10次扭蛋的成本，默认为 500
    static choujiang10: number = 4500
    // 球的组数，默认为 3
    static ballFenzu: number = 3
    // 猫的组数，默认为 0
    static catFenzu: number = 0
    // 配对组数，默认为 0
    static peiduiFenzu: number = 0
    // 每个关卡的时间限制，单位为秒，默认为 30 秒
    static levelTime: number = 30
    //球的缩放比例，默认为 1
    static ballScale: number = 1
    // 球缩小的比例，默认为 0.025
    static ballMorenScale = 0.03
    // 球的最小缩放比例，默认为 0.6
    static minBallScale: number = 0.65
    // 整个屏幕所能容纳的最大组数，默认为 20
    static maxZushu: number = 20
    // 槽位数量，默认为 7s
    static chacaoNum: number = 5
    // 冻结时间，单位为秒，默认为 30 秒
    static dongjieTime: number = 30
    static levelAddMaobiNum: number = 10
    // 解锁壁纸金币
    static homeJiesuoJinbi: number = 999
    static tiaozhanJinbi: number = 1000
    // 连击有效窗口：上次消除后多少秒内再次消除算作连击，单位秒，默认 5 秒
    static comboWindowTime: number = 5
    // 每提升一级连击额外奖励的金币数（从 2 连开始计），默认每级 +2
    static comboJinbi: number = 2
}


