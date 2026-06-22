import { _decorator, Button, Color, Component, director, game, Graphics, Input, input, isValid, KeyCode, Label, macro, math, Node, profiler, Tween, tween, UIOpacity, UITransform, v3, Vec3 } from 'cc';
import { gameData } from '../../configs/gameData';
import { gameMoshi } from '../../configs/gameMoshi';
import { putongLevelConfig, tiaozhanLevelConfig } from '../../configs/guanqiaConfig';
import { gameConfig } from '../../configs/gameConfig';
import { ballDto } from '../../dto/ballDto';
import { ballUtil } from '../../utils/ballUtil';
import { daluanArr, deleteMultIndex, deleteXiangtong, suijiYuansu } from '../../utils/arrUtil';
import { ballType, eventType } from '../../configs/pathName';
import { poolMgr } from '../../managers/poolMgr';
import { gameUtil } from '../../utils/gameUtil';
import { ballTs } from './ballTs';
import { chacaoTs } from './chacaoTs';
import { chacaoBallPreTs } from './chacaoBallPreTs';
import { feiBallPreTs } from './feiBallPreTs';
import { musicMgr } from '../../managers/musicMgr';
import { tishiMgr } from '../../managers/tishiMgr';
import { bendiUtil } from '../../utils/bendiUtil';
import { ballConfig } from '../../configs/ballConfig';
import { tujiMgr } from '../../managers/tujiMgr';
import { PREVIEW } from 'cc/env';
import { apiMgr } from '../../adWxDy/apiMgr';
import { adMgr } from '../../adWxDy/adMgr';
import { maobiMgr } from '../../managers/maobiMgr';
const { ccclass, property } = _decorator;
let log = 'gameScene'
@ccclass('gameScene')
export class gameScene extends Component {
    @property(Node)
    kuangjia: Node = null
    // 关卡数字
    @property(Label)
    level: Label = null
    // 关卡及倒计时显示
    @property(Node)
    guanqia: Node = null
    // 顶部UI
    @property(Node)
    topUI: Node = null
    // 剩余球
    @property(Label)
    shengyu: Label = null
    // 插槽球父节点
    @property(Node)
    chacaoBallMain: Node = null
    // 插槽盒子节点
    @property(Node)
    chacaoBox: Node = null
    // 插槽的脚本数组
    private chacaoTsArr: chacaoTs[] = []
    // 生成的每一关的球的数据
    allBallData: ballDto[] = []
    // 优先生成的球列表
    youxianCreateBalls: ballDto[] = []
    // 球的父节点
    @property(Node)
    ballMain: Node = null
    // 私有的UI变换组件
    private uiTrans: UITransform = null
    // 广告插槽
    @property(Node)
    chacaoAd: Node[] = []
    // 当前连击数
    private comboCount: number = 0
    // 上一次消除的时间戳(毫秒)，用于判定是否在连击窗口内
    private lastMergeTime: number = 0
    // 连击超时重置定时器
    private comboResetId: number | null = null
    // 常驻连击 HUD 节点（复用 comboPiao 预制体，不回收）
    private comboHud: Node = null
    // 连击消失进度条的 Graphics 组件
    private comboBar: Graphics = null
    // 震屏目标（渲染相机节点）及其原始位置（首次震屏时缓存，每次震屏后复位，避免漂移）
    private shakeTarget: Node = null
    private shakeBasePos: Vec3 = null
    start() {
        this.init()
        this.initLevelConfig()
        this.initBallData(gameConfig.ballFenzu, gameConfig.catFenzu, gameConfig.peiduiFenzu)
        this.initBall()
        // wx
        apiMgr.topFenXiang()
    }
    protected onDestroy(): void {
        // 注册选择球事件的监听器
        director.off(eventType.selectBall, this.onSelectBall, this)
        // 注册冰冻技能
        director.off(eventType.useDongjie, this.onDongjie, this)
        // 注册消除技能
        director.off(eventType.useCouqi, this.onCouqi, this)
        // 注册移出技能
        director.off(eventType.useYichu, this.onYichu, this)
        // 注册晃动技能
        director.off(eventType.huangdong, this.huangdong, this)
        // 倒计时结束事件
        director.off(eventType.timeJieshu, this.timeJieshu, this)
        // 下一关
        director.off(eventType.nextLevel, this.nextLevel, this)
        // 注册复活事件
        director.off(eventType.fuhuo, this.fuhuo, this)
        // 清理连击重置定时器，避免场景销毁后回调泄漏
        if (this.comboResetId !== null) {
            clearTimeout(this.comboResetId)
            this.comboResetId = null
        }
        this.unscheduleAllCallbacks()
    }
    init() {
        profiler.hideStats();
        gameData.zanting = false
        musicMgr.ins.playMusic('游戏内音乐')
        gameData.game = this.node
        // 获取当前节点的 UITransform 组件
        this.uiTrans = this.node.getComponent(UITransform)
        // 获取7个插槽的脚本
        this.chacaoTsArr = this.chacaoBox.getComponentsInChildren(chacaoTs)
        // 插槽球主节点
        gameData.chacaoBox = this.chacaoBox
        // 清空查插槽球节点下的所有节点，清空元素数组
        this.chacaoBallMain.removeAllChildren()
        this.allBallData = []
        this.youxianCreateBalls = []
        gameData.selectBallIdArr = []
        // 每关开局把临时解锁的 6/7 槽还原为永久基础槽位（场景重载不会自动还原 static）
        gameConfig.chacaoNum = gameConfig.baseChacaoNum
        // 插槽节点解锁状况
        this.jianchaChacao()
        // 注册选择球事件的监听器
        director.on(eventType.selectBall, this.onSelectBall, this)
        // 注册冰冻技能
        director.on(eventType.useDongjie, this.onDongjie, this)
        // 注册消除技能
        director.on(eventType.useCouqi, this.onCouqi, this)
        // 注册移出技能
        director.on(eventType.useYichu, this.onYichu, this)
        // 注册晃动技能
        director.on(eventType.huangdong, this.huangdong, this)
        // 倒计时结束事件
        director.on(eventType.timeJieshu, this.timeJieshu, this)
        // 下一关
        director.on(eventType.nextLevel, this.nextLevel, this)
        // 注册复活事件
        director.on(eventType.fuhuo, this.fuhuo, this)
        this.testNext()
        director.preloadScene("main", function () {
            console.log('main场景加载完成');
        });
    }

    testNext() {
        // PREVIEW 是一个布尔变量，通常用于判断是否处于预览模式
        if (PREVIEW) {
            // 注册键盘按下事件的监听器
            input.on(Input.EventType.KEY_DOWN, (e) => {
                // 检查按下的键是否为空格键
                if (e.keyCode === KeyCode.SPACE) {
                    // 根据游戏模式处理胜利逻辑
                    switch (gameData.moshi) {
                        // 处理正常模式胜利
                        case gameMoshi.putong:
                            this.putongWin()
                            break
                        // 处理超级模式胜利
                        case gameMoshi.tiaozhan:
                            this.tiaozhanWin()
                            break
                    }
                }
            }, this)
        }
    }
    /**
     * 初始化游戏的关卡配置
     * 该方法会根据当前游戏模式和关卡级别设置全局变量，包括球的缩放比例、最大分组数、关卡时间等
     */
    initLevelConfig() {
        // 初始化关卡数据索引
        let levelIndex: number = 0
        // 初始化关卡数据
        let levelData = null
        // 根据游戏模式设置关卡索引和关卡数据
        switch (gameData.moshi) {
            // 普通模式下，如果当前关卡级别大于 70，则随机选择一个关卡索引在 50 到 70 之间
            case gameMoshi.putong:
                levelIndex = gameData.putongLevel > 70 ? math.randomRangeInt(50, 70) : gameData.putongLevel - 1
                // 获取普通关卡配置数据
                levelData = putongLevelConfig[levelIndex]
                // 设置全局变量，包括球的分组数、猫的分组数、配对的分组数和关卡时间
                gameConfig.ballFenzu = levelData.fenzu
                gameConfig.catFenzu = levelData.catFenzu
                gameConfig.peiduiFenzu = levelData.peiduiFenzu
                gameConfig.levelTime = levelData.time
                // 球的缩放比例根据关卡级别动态调整
                if (gameData.putongLevel == 2) {
                    gameConfig.ballScale = 0.65
                } else {
                    gameConfig.ballScale = Math.max(1 - levelIndex * gameConfig.ballMorenScale, gameConfig.minBallScale)
                }

                // 最大分组数根据球的缩放比例设置
                gameConfig.maxZushu = gameConfig.ballScale <= 0.65 ? 40 : Math.min(20 + levelIndex, 40)
                break;
            case gameMoshi.tiaozhan:
                // 超级模式下，关卡索引为超级关卡级别减一
                levelIndex = gameData.tiaozhanLevel - 1
                // 超级模式下，关卡索引为超级关卡级别减一
                levelData = tiaozhanLevelConfig[levelIndex]
                // 设置全局变量，包括球的分组数、猫的分组数、配对的分组数和关卡时间
                gameConfig.ballFenzu = levelData.fenzu
                gameConfig.catFenzu = 0
                gameConfig.peiduiFenzu = levelData.peiduiFenzu
                gameConfig.levelTime = levelData.time
                // 球的缩放比例根据关卡级别设置为 1 或最小缩放比例
                gameConfig.ballScale = [1, gameConfig.minBallScale][levelIndex]
                // 最大分组数根据关卡级别设置为 20 或 40
                gameConfig.maxZushu = [20, 40][levelIndex]
                break;
        }
    }
    /**
     * 生成游戏中的球数据
     */
    initBallData(fenzu: number, catFenzu: number, peiduiFenzu: number) {
        // 初始化一个空数组，用于存储生成的球数据
        let balls: ballDto[] = []
        // 根据当前游戏模式进行不同的处理
        switch (gameData.moshi) {
            // 如果是普通模式
            case gameMoshi.putong:
                // 如果当前关卡是第一关
                if (gameData.putongLevel == 1) {
                    // 获取普通球数据(不包含猫的数据)
                    balls = ballUtil.getPutongBall()
                    // 计算普通组的数量
                    const putongZu: number = fenzu - catFenzu
                    //先将创建普通组
                    for (let i = 0; i < putongZu; i++) {
                        // 从球数据中随机选择一个球
                        const data: ballDto = suijiYuansu(balls)
                        // 将选中的球数据添加到球数据数组中，重复三次
                        this.allBallData.push(data, data, data)
                    }
                    //筛选出可创建的猫
                    let catBalls: ballDto[] = ballUtil.getTypeBall(ballType.cat)
                    // 只取第一个猫球
                    catBalls = catBalls.splice(0, 1)
                    // 从猫球数据中随机选择一个球
                    const catBall: ballDto = suijiYuansu(catBalls)
                    //再创建猫组
                    this.allBallData.push(catBall, catBall, catBall)
                    // 打乱球数据数组的顺序
                    daluanArr(this.allBallData)
                    // 打印球数据
                    this.dayinBallData()
                }
                // 如果当前关卡是困难级别
                else if (this.isZhuamaoLevel) {
                    // 生成带有猫的关卡的球数据
                    this.creatCatLevel(fenzu, catFenzu, peiduiFenzu)
                    // 如果当前关卡不是困难级别
                } else {
                    // 生成不带有猫的关卡的球数据
                    this.creatNocatLevel(fenzu, catFenzu, peiduiFenzu)
                }
                break;
            case gameMoshi.tiaozhan:
                // 生成不带有猫的关卡的球数据
                this.creatCatLevel(fenzu, catFenzu, peiduiFenzu)
                break;
        }
        // 打印总球数
        console.log(log, `当前关卡共${fenzu}组球`);
    }
    /**
     * 生成不带有猫的关卡的球数据
     */
    creatNocatLevel(fenzu: number, catFenzu: number, peiduiFenzu: number) {
        // 获取普通球数据
        const balls: ballDto[] = ballUtil.getPutongBall()
        // 计算普通组的数量
        const putongFenzu: number = fenzu - catFenzu
        // 初始化两个临时数组，用于存储配对球和混乱球
        const hunluanBallArr: ballDto[] = []
        const peiduiBallArr: ballDto[] = []
        //先将创建普通组
        for (let i = 0; i < putongFenzu; i++) {
            // 从球数据中随机选择一个球
            const data: ballDto = suijiYuansu(balls)
            // 如果当前组是配对组，则将球数据添加到配对球数组中
            if (i < peiduiFenzu) {
                peiduiBallArr.push(data, data, data)
            } else {
                hunluanBallArr.push(data, data, data)
            }
        }
        //筛选出可创建的猫
        let catBalls: ballDto[] = ballUtil.getTypeBall(ballType.cat)
        // 根据当前关卡级别计算可创建的猫球数量范围
        const fanwei: number = 1 + Math.floor(gameData.putongLevel / 5)
        // 从猫球数据中截取指定数量的猫球
        catBalls = catBalls.splice(0, fanwei)
        //再创建猫组
        for (let i = 0; i < catFenzu; i++) {
            // 从猫球数据中随机选择一个猫球
            const catBall: ballDto = suijiYuansu(catBalls)
            // 将选中的猫球数据添加到混乱球数组中
            hunluanBallArr.push(catBall, catBall, catBall)
        }
        // 打乱混乱球数组的顺序
        daluanArr(hunluanBallArr)
        //合并两个临时组
        for (let i = 0; i < fenzu; i++) {
            // 如果当前组索引为偶数
            if (i % 2 === 0) {
                // 如果配对球数组还有球，则从配对球数组中取出三个球
                if (peiduiBallArr.length > 0) {
                    const arr: ballDto[] = peiduiBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                    // 否则，如果混乱球数组还有球，则从混乱球数组中取出三个球
                } else if (hunluanBallArr.length > 0) {
                    const arr: ballDto[] = hunluanBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                }
                // 如果当前组索引为奇数
            } else {
                // 如果混乱球数组还有球，则从混乱球数组中取出三个球
                if (hunluanBallArr.length > 0) {
                    const arr: ballDto[] = hunluanBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                    // 否则，如果配对球数组还有球，则从配对球数组中取出三个球
                } else if (peiduiBallArr.length > 0) {
                    const arr: ballDto[] = peiduiBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                }
            }
        }
        // 打印球数据
        this.dayinBallData()
    }
    /**
     * 生成带有猫的关卡的球数据
     */
    creatCatLevel(fenzu: number, catFenzu: number, peiduiFenzu: number) {
        // 定义一个包含三种颜色球类型的数组
        const typeArr = [ballType.one, ballType.two, ballType.three]
        // 从数组中随机选择一个球类型
        const type = suijiYuansu(typeArr)
        // 根据类型从ballConfig中筛选出所有该类型的球
        const balls: ballDto[] = ballUtil.getTypeBall(type)
        // 计算普通组的数量
        const putongFenzu: number = fenzu - catFenzu
        // 初始化两个临时数组，用于存储配对球和混乱球
        const hunluanBallArr: ballDto[] = []
        const peiduiBallArr: ballDto[] = []
        //先将创建普通组
        for (let i = 0; i < putongFenzu; i++) {
            // 从球数据中随机选择一个球
            const data: ballDto = suijiYuansu(balls)
            // 如果当前组是配对组，则将球数据添加到配对球数组中
            if (i < peiduiFenzu) {
                peiduiBallArr.push(data, data, data)
            } else {
                hunluanBallArr.push(data, data, data)
            }
        }
        //筛选出可创建的猫
        let catBalls: ballDto[] = ballUtil.getTypeBall(ballType.cat)
        // 根据当前关卡级别计算可创建的猫球数量范围
        const fanwei: number = 1 + Math.floor(gameData.putongLevel / 5)
        // 从猫球数据中截取指定数量的猫球
        catBalls = catBalls.splice(0, fanwei)
        //再创建猫组
        for (let i = 0; i < catFenzu; i++) {
            // 从猫球数据中随机选择一个猫球
            const catBall: ballDto = suijiYuansu(catBalls)
            // 将选中的猫球数据添加到混乱球数组中
            hunluanBallArr.push(catBall, catBall, catBall)
        }
        // 打乱混乱球数组的顺序
        daluanArr(hunluanBallArr)
        //合并两个临时组
        for (let i = 0; i < fenzu; i++) {
            // 如果当前组索引为偶数
            if (i % 2 === 0) {
                // 如果配对球数组还有球，则从配对球数组中取出三个球
                if (peiduiBallArr.length > 0) {
                    const arr: ballDto[] = peiduiBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                    // 否则，如果混乱球数组还有球，则从混乱球数组中取出三个球
                } else if (hunluanBallArr.length > 0) {
                    const arr: ballDto[] = hunluanBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                }
                // 如果当前组索引为奇数
            } else {
                // 如果混乱球数组还有球，则从混乱球数组中取出三个球
                if (hunluanBallArr.length > 0) {
                    const arr: ballDto[] = hunluanBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                    // 否则，如果配对球数组还有球，则从配对球数组中取出三个球
                } else if (peiduiBallArr.length > 0) {
                    const arr: ballDto[] = peiduiBallArr.splice(0, 3)
                    // 将取出的三个球添加到球数据数组中
                    this.allBallData.push(...arr)
                }
            }
        }
        // 打印球数据
        this.dayinBallData()
    }
    /**
      * 打印球数据
      */
    dayinBallData() {
        // 创建一个 Map 用于存储球的名称和数量
        const map: Map<string, number> = new Map<string, number>()
        // 遍历球数据数组
        for (let i = 0; i < this.allBallData.length; i++) {
            // 获取当前球的数据
            const ballData: ballDto = this.allBallData[i]
            // 获取球的名称
            const ballName: string = ballData.name
            // 如果 Map 中不存在该球的名称，则将其添加到 Map 中，并设置数量为 0
            if (!map.has(ballName)) map.set(ballName, 0)
            // 获取当前球名称的数量
            const curCnt: number = map.get(ballName)
            // 将当前球名称的数量加 1，并更新到 Map 中
            map.set(ballName, curCnt + 1)
        }
        // 打印总球数
        console.log(log, `总共${this.allBallData.length}个球`, map);
    }
    /**
     * 判断当前游戏的关卡是否为抓猫关卡
     */
    public get isZhuamaoLevel(): boolean {
        return gameData.putongLevel > 1 && gameData.putongLevel % 5 === 0
    }
    /**
     * ---------------------------------------------------------------------------------------------------------------------------------------------------------
     */
    /**
     * 生成关卡小球
     */
    async initBall() {
        // 过渡动画
        poolMgr.ins.getPoolNode('guoduDonghua', this.node, v3(740, 0, 0))
        // 计算最大组数，取全局变量 Ball_Group 和 Max_Group 中的较小值
        const maxFenzu: number = Math.min(gameConfig.ballFenzu, gameConfig.maxZushu)
        // 计算球的数量，最大组数乘以 3
        const ballNum: number = maxFenzu * 3
        // 等待1秒
        await gameUtil.ins.yanchi(1)
        if (gameData.putongLevel == 2 && gameData.moshi == gameMoshi.putong) {
            // 打开难度提升提示界面
            tishiMgr.nanduTips(gameData.game, '难度飙升')
        }
        if (gameData.putongLevel == 3 && gameData.moshi == gameMoshi.putong) {
            // 打开难度提升提示界面
            tishiMgr.nanduTips(gameData.game, '难度骤降')
        }
        // 请求创建球，数量为 ballNum
        this.zbCreatBall(ballNum)
        // 每 0.05 秒执行一次 tryCreateBall 方法，并且重复执行
        this.schedule(this.creatBall, 0.1, macro.REPEAT_FOREVER)
        // 检测游戏是否胜利
        this.schedule(this.jianchaWin, 0.5, macro.REPEAT_FOREVER)
        await gameUtil.ins.yanchi(2)
        this.showTopUi()
        if (gameData.putongLevel == 1) {
            // 打开新手指引界面
            poolMgr.ins.getPoolNode('gameJiaoxue', gameData.game)
        }
    }
    /**
     * 处理请求创建球的事件
     */
    zbCreatBall(num: number = 1) {
        // 如果游戏管理器中的球数据列表为空，则打印警告并返回
        if (this.allBallData.length <= 0) {
            console.log(log, '已经没有球需要创建了');
            return
        }
        // 确保创建的球的数量不超过游戏管理器中球数据的总数
        num = Math.min(this.allBallData.length, num)
        // 遍历要创建的球的数量
        for (let i = 0; i < num; i++) {
            // 如果游戏管理器中的球数据列表为空，则停止创建球
            if (this.allBallData.length <= 0) break
            // 从游戏管理器的球数据列表中取出并删除一个球的数据
            const ball: ballDto = this.allBallData.shift()
            // 如果取出的球数据为空，则打印警告并继续循环
            if (!ball) {
                console.log(log, '创建消除元素时发生错误');
                continue
            }
            // 将取出的球数据添加到优先生成的球列表中
            this.youxianCreateBalls.push(ball)
        }
        // 打印日志，记录剩余的球的数量
        console.log(log, `剩余${this.allBallData.length}个球`, this.allBallData);
        console.log(log, `优先创建${this.youxianCreateBalls.length}个球`, this.youxianCreateBalls);

    }
    /**
   * 尝试创建一个球
   */
    creatBall() {
        // 如果优先列表中没有球的数据，则直接返回
        if (this.youxianCreateBalls.length <= 0) {
            // 显示剩余球量
            this.jianchaShengyu()
            return
        }
        // 从优先列表中取出并删除一个球的数据
        const ballData: ballDto = this.youxianCreateBalls.shift()
        // 从对象池中获取球的预制体
        const ball = poolMgr.ins.getPoolNode(ballData.name)
        // 设置球节点的位置，使其在场景中的随机位置出现
        if (ball) {
            ball.setPosition(math.randomRangeInt(-250, 250), math.randomRangeInt(950, 1550), 0)
            // 设置球节点的缩放比例
            ball.setScale(gameConfig.ballScale, gameConfig.ballScale, 1)
            // 父节点
            ball.parent = this.ballMain
            // 从球节点中获取球的组件
            const ballts = ball.getComponent(ballTs)
            // 将球的数据赋值给球的组件
            ballts.ballData = ballData
        } else {
            console.log(log, '球的预制体为空');
        }
        // 生成过程中也实时刷新剩余球量，避免大关卡(如第2关)开局十几秒内数字一直空白
        this.jianchaShengyu()
    }
    /**
     * 点击屏幕操作
     */
    onSelectBall(worldPos: Vec3, angle: number, data: ballDto) {
        // 点击元素出现特效
        const nodePos: Vec3 = this.uiTrans.convertToNodeSpaceAR(worldPos)
        poolMgr.ins.getPoolNode('select', gameData.game, v3(nodePos.x, nodePos.y, 0))
        // 获取球的ID
        const ballId: number = data.id
        // 获取当前ID在当前槽位ID数组中的最后一个索引
        const lastIdx: number = gameData.selectBallIdArr.lastIndexOf(ballId)
        // 如果当前ID不在当前槽位ID数组中，则将其添加到数组末尾
        if (lastIdx === -1) {
            gameData.selectBallIdArr.push(ballId)
        } else {
            // 如果当前ID已经在当前槽位ID数组中，则将其移动到数组末尾
            gameData.selectBallIdArr = [...gameData.selectBallIdArr.slice(0, lastIdx), ballId, ...gameData.selectBallIdArr.slice(lastIdx)]
        }
        // 获取当前ID在当前槽位ID数组中的索引
        const curIdx: number = gameData.selectBallIdArr.lastIndexOf(ballId)
        // 根据球的世界坐标、角度和数据创建一个飞球节点
        const feiBall: Node = this.creatFeiBall(worldPos, angle, data)
        // 获取当前索引对应的插槽组件
        const chacaoTs: chacaoTs = this.chacaoTsArr[curIdx]
        // 获取插槽的原始世界坐标
        const chacaoWorldPos: Vec3 = chacaoTs.yuanWorldPos
        // 计算飞球节点到插槽的距离
        const juli = Vec3.distance(feiBall.worldPosition, chacaoWorldPos)
        // 根据距离计算飞球移动到插槽的持续时间
        const feiTime: number = math.clamp(juli / 2000, 0.1, 0.2)
        // 在插槽位置创建一个插槽球节点
        const chacaoBall = this.createChacaoBall(curIdx, chacaoWorldPos, data)
        // 为插槽球节点添加一个UI透明度组件
        const chacaoBallopac = chacaoBall.addComponent(UIOpacity)
        // 设置插槽球节点的初始透明度为0
        chacaoBallopac.opacity = 0
        // 让飞球节点移动到插槽位置，并在完成后执行合并操作
        this.toChacao(feiBall, feiTime, chacaoWorldPos).then(() => {
            // 如果插槽球节点仍然有效
            if (isValid(chacaoBall)) {
                // 将插槽球节点的透明度设置为255
                chacaoBallopac.opacity = 255
                // 延迟一段时间后执行合并操作
                this.mergeBall()
                // 消除结束后
                this.mergeEnd()
            } else {
                // 如果插槽球节点无效，则忽略合并操作
                console.log(log, '忽略合并');

            }
        })

    }
    /**
      * 让飞球节点移动到插槽位置
      */
    toChacao(feiBall, feiTime, worldPos) {
        return new Promise<void>((resolve, reject) => {
            // 让飞球节点在 duration 时间内移动到 worldPos 位置，并且角度变为 0，缩放比例变为 0.5
            tween(feiBall).by(0.1, { position: v3(0, 180, 0) }).delay(0.1).to(feiTime, { worldPosition: worldPos, angle: 0, scale: v3(0.5, 0.5, 1.0) })
                // 让飞球节点在 0.1 秒内向上移动 10 个单位
                .by(0.1, { position: v3(0, -10, 0) })
                // 让飞球节点在 0.1 秒内向上移动 10 个单位
                .by(0.1, { position: v3(0, 10, 0) })
                // 让飞球节点在 0.1 秒内向上移动 10 个单位
                .call(() => {
                    this.scheduleOnce(() => {
                        // 销毁飞球节点
                        feiBall.destroy()
                    })
                    resolve()
                })
                .start()
        })
    }
    /**
   * 在指定位置创建一个插槽球
   */
    createChacaoBall(curIdx: number, worldPos: Vec3, data: ballDto) {
        // 实例化插槽球预制体
        const chacaoBall = poolMgr.ins.getPoolNode('chacaoBallPre', this.chacaoBallMain)
        // 设置插槽球节点的兄弟索引为当前索引
        chacaoBall.setSiblingIndex(curIdx)
        // 设置插槽球节点的世界位置为指定的世界坐标
        chacaoBall.setWorldPosition(worldPos)
        // 获取插槽球节点上的插槽球组件
        const chacaoBallTs: chacaoBallPreTs = chacaoBall.getComponent(chacaoBallPreTs)
        // 设置插槽球组件的数据
        chacaoBallTs.setChacaoBall(data)
        // 如果球的类型是猫，则给插槽球节点添加一个震动组件
        // --------------------
        return chacaoBall
    }
    /**
     * 创建一个飞行球
     */
    creatFeiBall(worldPos: Vec3, angle: number, data: ballDto): Node {
        // 实例化飞球预制体
        const feiBall: Node = poolMgr.ins.getPoolNode('feiBallPre', this.node)
        // 将世界坐标转换为节点坐标
        const nodePos: Vec3 = this.uiTrans.convertToNodeSpaceAR(worldPos)
        // 设置飞球节点的位置
        feiBall.setPosition(nodePos)
        // 设置飞球节点的缩放比例
        feiBall.setScale(gameConfig.ballScale, gameConfig.ballScale, 1)
        // 设置飞球节点的角度
        feiBall.angle = angle
        // 获取飞球节点上的飞球组件
        const feiBallTs = feiBall.getComponent(feiBallPreTs)
        // 设置飞球组件的数据
        feiBallTs.setFeiBallSpr(data)
        // // 返回创建的飞球节点
        return feiBall
    }
    /**
     * 合并球
     */
    mergeBall() {
        // 使用 ArrayUtil.removeSame 方法从curIdArr 中移除连续的三个相同 ID 的球，并获取移除的索引数组和新的数组
        const deleteThree = deleteXiangtong(gameData.selectBallIdArr, 3)
        // 获取移除的索引的数组
        const deleteIndexArr: number[][] = deleteThree.deleteIndexArr
        // 更新 gameData.curIdArr 为移除后的新数组
        gameData.selectBallIdArr = deleteThree.arr
        // 获取移除的索引数组的长度
        const deleteCnt: number = deleteIndexArr.length
        // 如果没有移除任何球，则直接返回
        if (deleteCnt <= 0) return
        // 本次投球确实发生了消除，触发连击逻辑
        this.onCombo()
        // juice：合并瞬间微震屏，强度随连击递增
        this.shakeScreen(this.comboCount)
        // 遍历移除的索引数组
        for (let i = 0; i < deleteIndexArr.length; i++) {
            // 获取当前遍历到的索引数组
            const indexArr: number[] = deleteIndexArr[i];
            // 获取目标世界坐标，即第一个被移除的球的世界坐标
            const mubiaoWorldPos: Vec3 = this.chacaoBallMain.children[indexArr[1]].getWorldPosition()
            // 初始化 ID 为 0
            let id: number = 0
            // 用于存储需要移除的插槽球节点
            const deleteSlotBallArr: Node[] = []
            // 遍历当前索引数组中的每个索引
            for (let j = 0; j < indexArr.length; j++) {
                // 获取当前遍历到的索引
                const idIndex: number = indexArr[j];
                // 获取当前索引对应的插槽球节点
                const chacaoBallNode: Node = this.chacaoBallMain.children[idIndex]
                // 获取插槽球节点上的插槽球组件
                const chacaoBallTs: chacaoBallPreTs = chacaoBallNode.getComponent(chacaoBallPreTs)
                // 获取插槽球节点的世界坐标
                const chacaoBallWorldPos: Vec3 = chacaoBallNode.getWorldPosition()
                // 获取插槽球节点的角度
                const chacaoBallJiaodu: number = chacaoBallNode.angle
                // 将当前插槽球节点添加到待移除的数组中
                deleteSlotBallArr.push(chacaoBallNode)
                // 更新 ID 为当前插槽球的 ID
                id = chacaoBallTs.itemData.id
                // 创建一个飞球节点，模拟插槽球的飞行过程
                const feiBallItem: Node = this.creatFeiBall(chacaoBallWorldPos, chacaoBallJiaodu, chacaoBallTs.itemData)
                // 设置飞球节点的缩放比例为 0.5
                feiBallItem.scale = v3(0.5, 0.5, 1)
                // 将目标世界坐标转换为当前节点的本地坐标
                const bendiPos: Vec3 = this.uiTrans.convertToNodeSpaceAR(mubiaoWorldPos)
                // 创建一个补间动画，让飞球节点移动到目标世界坐标
                tween(feiBallItem)
                    // 让飞球节点在 0.3 秒内移动到目标本地坐标，使用 sineOut 缓动函数
                    .to(0.2, { position: bendiPos }, { easing: 'sineOut' })
                    // 当飞球节点移动完成后，调用回调函数销毁飞球节点
                    .call(() => {
                        feiBallItem.destroy()
                    })
                    .start()
            }
            // 遍历待移除的插槽球节点数组，销毁每个节点
            deleteSlotBallArr.forEach((val) => {
                val.destroy()
            })
            // 判断当前合并的球是否是猫类型
            const isPig: boolean = ballUtil.isBallType(id, ballType.cat)
            // 如果是猫类型，则增加收集数量，并播放抓猫的音效
            if (isPig) {
                // 图鉴的ID是从4开始，所以要保证ID，也就是猫球的id减去一个数值最小要等于4
                const maoId: number = id - 56
                tujiMgr.addTuji(maoId)
                musicMgr.ins.playSound('抓到猫音效')
            }
            // 延迟 0.28 秒后，播放合并音效并创建合并特效
            this.scheduleOnce(() => {
                // 合并音效（连击越高音量越大，营造爽感，上限 2 倍）
                const comboVol: number = Math.min(1 + Math.max(this.comboCount - 1, 0) * 0.15, 2)
                musicMgr.ins.playSound('a合并', comboVol)
                // 创建合并特效
                gameUtil.mergeTexiao('mergeTexiao', this.node, mubiaoWorldPos)
                // juice：连击鼓励飘字（2 连起，按阈值取词），在消除汇聚点弹出
                const word: string = this.getJuiceWord(this.comboCount)
                if (word) {
                    gameUtil.piaoZi(word, this.node, mubiaoWorldPos, { fontSize: 56 })
                }
            }, 0.28)
            // 触发请求创建新球的事件
            this.zbCreatBall(3)
            this.jianchaShengyu()
            this.ballBugXiufu()
        }
    }
    /**
     * 连击处理：在连击窗口内连续消除则累加连击数，
     * 2 连及以上叠加震动 + 飘字 + 额外金币奖励，超时未消除则归零。
     */
    onCombo() {
        const now: number = Date.now()
        // 在连击窗口内则累加，否则重新从 1 开始计数
        if (now - this.lastMergeTime <= gameConfig.comboWindowTime * 1000) {
            this.comboCount++
        } else {
            this.comboCount = 1
        }
        this.lastMergeTime = now
        // 重置连击超时定时器：窗口时间内没有新的消除则连击归零
        if (this.comboResetId !== null) {
            clearTimeout(this.comboResetId)
        }
        this.comboResetId = setTimeout(() => {
            this.comboCount = 0
            this.comboResetId = null
            // 连击窗口超时，隐藏常驻 HUD
            this.hideComboHud()
        }, gameConfig.comboWindowTime * 1000)
        // 2 连及以上才有连击表现与奖励
        if (this.comboCount < 2) return
        // 额外奖励金币（金币道具 id 为 0），静默累加，结算 / 主界面体现
        const bonus: number = (this.comboCount - 1) * gameConfig.comboJinbi
        maobiMgr.updateMaobi(bonus)
        // juice：金币奖励飘字，屏幕上方（连击 HUD 下方）弹出 "+N"
        if (bonus > 0) {
            const coinWorld: Vec3 = this.uiTrans.convertToWorldSpaceAR(v3(0, 250, 0))
            gameUtil.piaoZi(`+${bonus}`, this.node, coinWorld, { fontSize: 72 })
        }
        // 手机轻微震动
        apiMgr.zhenDong()
        // 更新常驻连击 HUD
        this.updateComboHud(this.comboCount)
    }
    /**
     * 更新常驻连击 HUD：屏幕上方常驻显示 "连击 ×N"，每次连击跳动强调，
     * 停顿期间保持显示，直到连击窗口超时才隐藏。
     */
    updateComboHud(combo: number) {
        // 懒创建常驻连击节点（复用 comboPiao 预制体，全程不回收）
        if (!this.comboHud || !isValid(this.comboHud)) {
            this.comboHud = poolMgr.ins.getPoolNode('comboPiao', this.node)
            if (!this.comboHud) return
            // 固定显示在屏幕上方
            this.comboHud.setPosition(0, 350, 0)
            // 缓存进度条 Graphics
            const barNode: Node = this.comboHud.getChildByName('bar')
            this.comboBar = barNode ? barNode.getComponent(Graphics) : null
        }
        this.comboHud.active = true
        // 透明度复位
        let opac: UIOpacity = this.comboHud.getComponent(UIOpacity)
        if (!opac) opac = this.comboHud.addComponent(UIOpacity)
        opac.opacity = 255
        // 更新连击文字
        const labelNode: Node = this.comboHud.getChildByName('label')
        if (labelNode) {
            labelNode.getComponent(Label).string = `连击 ×${combo}`
        }
        // 每次连击跳动强调
        Tween.stopAllByTarget(this.comboHud)
        this.comboHud.setScale(1, 1, 1)
        tween(this.comboHud)
            .to(0.1, { scale: v3(1.3, 1.3, 1) }, { easing: 'backOut' })
            .to(0.12, { scale: v3(1, 1, 1) })
            .start()
    }
    /**
     * 隐藏常驻连击 HUD（连击窗口超时归零时调用）。
     */
    hideComboHud() {
        if (this.comboHud && isValid(this.comboHud)) {
            Tween.stopAllByTarget(this.comboHud)
            this.comboHud.active = false
        }
    }
    /**
     * 按连击数取鼓励飘字文案（取满足 combo 阈值的最高一档），不足 2 连返回空串。
     */
    getJuiceWord(combo: number): string {
        let word: string = ''
        const list = gameConfig.juiceWords
        for (let i = 0; i < list.length; i++) {
            if (combo >= list[i].combo) word = list[i].text
        }
        return word
    }
    /**
     * 微震屏（juice）：抖动渲染相机，整屏统一位移，强度随连击递增。
     * 注意：根节点 Canvas 带 Widget 会每帧把位置拉回（抖不动），故改抖 Canvas 下
     * 无 Widget 的 Camera 节点。首次缓存相机原位，每次抖动结束强制复位，避免漂移。
     */
    shakeScreen(combo: number) {
        if (!this.shakeTarget || !isValid(this.shakeTarget)) {
            this.shakeTarget = this.node.getChildByName('Camera')
            if (!this.shakeTarget) return
            this.shakeBasePos = this.shakeTarget.position.clone()
        }
        const target: Node = this.shakeTarget
        const amp: number = Math.min(
            gameConfig.shakeBase + Math.max(combo - 1, 0) * gameConfig.shakeStep,
            gameConfig.shakeMax
        )
        const base: Vec3 = this.shakeBasePos
        Tween.stopAllByTarget(target)
        // 衰减式多段抖动：左右 + 上下交替，振幅逐段递减，结束强制复位（保留相机 z）
        const offs: number[][] = [
            [1, 0.6], [-0.9, -0.5], [0.7, 0.45], [-0.55, -0.35], [0.4, 0.25], [-0.25, -0.15],
        ]
        let tw = tween(target)
        for (let i = 0; i < offs.length; i++) {
            const dx: number = base.x + amp * offs[i][0]
            const dy: number = base.y + amp * offs[i][1]
            tw = tw.to(0.035, { position: v3(dx, dy, base.z) })
        }
        tw.to(0.035, { position: base.clone() })
            .call(() => { target.setPosition(base) })
            .start()
    }
    /**
     * 清场庆祝（juice 降级方案）：复用现有合并特效在中心多点炸开 + "Perfect!" 大字，
     * 播完后回调打开结算页。无新美术资源。
     */
    qingChangCele(onDone: () => void) {
        const centerWorld: Vec3 = this.uiTrans.convertToWorldSpaceAR(v3(0, 60, 0))
        // 中心 + 四周随机点位炸开合并特效，模拟撒花
        for (let i = 0; i < 6; i++) {
            const ox: number = (Math.random() - 0.5) * 360
            const oy: number = (Math.random() - 0.5) * 360
            const pos: Vec3 = v3(centerWorld.x + ox, centerWorld.y + oy, 0)
            this.scheduleOnce(() => {
                gameUtil.mergeTexiao('mergeTexiao', this.node, pos)
            }, i * 0.08)
        }
        // "Perfect!" 大字
        gameUtil.piaoZi('Perfect!', this.node, centerWorld, {
            fontSize: 96,
            color: new Color(255, 120, 60, 255),
            rise: 40,
            hold: 1.0,
        })
        musicMgr.ins.playSound('a合并', 2)
        // 庆祝动画后再开结算页
        this.scheduleOnce(() => { onDone() }, 1.5)
    }
    /**
     * 每帧刷新连击消失进度条
     */
    update(dt: number) {
        if (gameData.zanting) return
        if (!this.comboHud || !this.comboHud.active || !this.comboBar) return
        const windowMs: number = gameConfig.comboWindowTime * 1000
        const ratio: number = math.clamp(1 - (Date.now() - this.lastMergeTime) / windowMs, 0, 1)
        this.drawComboBar(ratio)
    }
    /**
     * 绘制连击消失进度条：底槽 + 随剩余比例收缩的填充条（绿 → 红渐变制造紧张感）
     */
    drawComboBar(ratio: number) {
        const g: Graphics = this.comboBar
        const W: number = 200
        const H: number = 16
        const x: number = -W / 2
        const r: number = H / 2
        g.clear()
        // 底槽
        g.fillColor = new Color(0, 0, 0, 120)
        g.roundRect(x, -H / 2, W, H, r)
        g.fill()
        // 进度填充：剩余越少越偏红，制造紧张感
        if (ratio > 0) {
            const fillW: number = Math.max(W * ratio, H)
            const cr: number = Math.round(230 - 170 * ratio)
            const cg: number = Math.round(60 + 160 * ratio)
            const cb: number = Math.round(60 + 20 * ratio)
            g.fillColor = new Color(cr, cg, cb, 255)
            g.roundRect(x, -H / 2, fillW, H, r)
            g.fill()
        }
    }
    // 定义一个定时器ID变量
    private checkBallTimeoutId: number | null = null;
    ballBugXiufu() {
        if (gameData.putongLevel == 1 && gameData.moshi == gameMoshi.putong) {
            return
        }
        // 延迟到下一帧再判定：合并掉的插槽球执行的是 node.destroy()，要到帧末才真正从
        // children 中移除。若此刻立即统计，会把正在销毁的球也算进剩余数，导致读数偏高、
        // 在最后一次合并清到 ≤3 个球时漏判卡死、不触发兜底清场。
        this.scheduleOnce(() => {
            // 如果之前设置过定时器，先清除它
            if (this.checkBallTimeoutId !== null) {
                clearTimeout(this.checkBallTimeoutId);
                this.checkBallTimeoutId = null;
            }
            // 剩余球 ≤3（不足以再凑成一个三连消除组）时，3 秒后兜底清场，避免卡死
            const shengyu: number = this.jianchaShengyu()
            if (shengyu < 4 && shengyu > 0) {
                // 设置一个3秒的定时器
                this.checkBallTimeoutId = setTimeout(() => {
                    // 清除所有剩下的球
                    this.clearAllRemainingBalls();
                    this.checkBallTimeoutId = null;
                }, 3000) as unknown as number;
            }
        })
    }
    /**
     * 清除所有剩下的球
     */
    clearAllRemainingBalls() {
        // 清空候补球数据数组
        this.allBallData = [];
        // 销毁球父节点下的所有子节点
        this.ballMain.destroyAllChildren();
        // 清空优先生成的球列表
        this.youxianCreateBalls = [];
        // 销毁插槽球盒子节点的所有子节点
        this.chacaoBallMain.destroyAllChildren()
        // 重新检查剩余球数
        this.jianchaShengyu();
        // 检查游戏是否获胜
        this.jianchaWin();
    }
    /**
* 合并后的处理逻辑
*/
    mergeEnd() {
        // 获取当前槽位ID数组的长度
        const nowIdArrLength: number = gameData.selectBallIdArr.length
        // 根据当前槽位ID数组的长度进行不同的处理
        switch (nowIdArrLength) {
            // 如果槽位ID数组长度为6，则显示一个提示信息
            case gameConfig.chacaoNum - 1:
                console.log(log, '还剩一个槽位');
                break;
            // 如果槽位ID数组长度为7，则打开复活界面
            case gameConfig.chacaoNum:
                //如果游戏已经暂停，不再继续
                if (gameData.zanting) return
                // 失败类型为2插槽满了
                gameData.shibaiType = 2
                // 游戏失败
                poolMgr.ins.getPoolNode('fuhuoPop', gameData.game)
                break;
        }
    }
    /**
     * 检查还剩余多少个球
     */
    jianchaShengyu() {
        // 统计所有尚未被真正消除的球：
        // allBallData(后备队列) + youxianCreateBalls(待生成缓冲) + ballMain(场上) + chacaoBallMain(插槽内)
        // 四个集合之间会互相搬运，必须全部计入，否则显示值会随搬运来回跳动
        const ball = this.allBallData.length
            + this.youxianCreateBalls.length
            + this.ballMain.children.length
            + this.chacaoBallMain.children.length
        this.shengyu.string = `${ball}`
        return ball
    }
    /**
* 检查是否获胜
* 该方法会检查游戏是否处于暂停状态，如果是，则直接返回
* 如果球盒子为空，则取消调度检查获胜的方法，并根据当前游戏模式触发相应的获胜事件
*/
    async jianchaWin() {
        // 如果游戏处于暂停状态，则直接返回
        if (gameData.zanting) return
        // 如果球盒子为空
        if (this.ballMain.children.length <= 0) {
            // 取消调度检查获胜的方法
            this.unschedule(this.jianchaWin)
            // 根据当前游戏模式触发相应的获胜事件
            switch (gameData.moshi) {
                case gameMoshi.putong:
                    // 触发普通模式获胜事件
                    await gameUtil.ins.yanchi(0.5)
                    this.putongWin()
                    break
                case gameMoshi.tiaozhan:
                    // 触发超级模式获胜事件
                    await gameUtil.ins.yanchi(0.5)
                    this.tiaozhanWin()
                    break
            }
        }
    }
    /**
     * 倒计时结束
     */
    timeJieshu() {
        // 如果球盒子为空
        if (this.ballMain.children.length <= 0) return
        // 失败类型为1
        gameData.shibaiType = 1
        // 打开复活界面
        poolMgr.ins.getPoolNode('fuhuoPop', gameData.game)
    }
    /**
    * 超级模式获胜后的处理逻辑
    */
    tiaozhanWin() {
        // 暂停游戏
        gameData.zanting = true
        // 触发超级模式获胜事件
        // 根据当前超级模式的等级打开相应的界面
        switch (gameData.tiaozhanLevel) {
            // 如果超级模式等级为 1
            case 1:
                // 打开难度提升提示界面
                tishiMgr.nanduTips(gameData.game, '难度飙升')
                // 在 2 秒后增加超级模式等级并重新开始游戏
                this.scheduleOnce(() => {
                    gameData.tiaozhanLevel++
                    director.loadScene('game')
                }, 2)
                break;
            // 如果超级模式等级为 2
            case 2:
                // juice：先播清场庆祝，再打开超级模式胜利界面
                this.qingChangCele(() => {
                    poolMgr.ins.getPoolNode('tiaozhanShengliPop', gameData.game)
                })
                break;
        }
    }
    /**
  * 普通模式获胜后的处理逻辑
  */
    putongWin() {
        // 暂停游戏
        gameData.zanting = true
        // juice：先播清场庆祝，再打开结算页
        this.qingChangCele(() => {
            poolMgr.ins.getPoolNode('shengliPop', gameData.game)
        })
        console.log('游戏普通模式胜利');
    }
    /**
    *开始下一关游戏
    */
    async nextLevel() {
        // 增加当前游戏关卡数
        gameData.putongLevel++
        // 关卡数到本地存储
        bendiUtil.setItem('level', gameData.putongLevel)
        // 加载游戏场景
        director.loadScene("game")
    }
    /**
     * -----------------------------------------------------------------------------------------------------------------------------------------------------
     */
    /**
     * 复活操作
     */
    fuhuo(type: number) {
        // 如果失败类型是插槽已满
        if (type == 2) {
            // 触发移动事件
            this.onYichu()
        }
    }
    /**
        * 重置按钮
        */
    onShuaxinBtn() {
        poolMgr.ins.getPoolNode('shuaxinPop', gameData.game)
        console.log('重置');
    }
    /**
        * 暂停按钮
        */
    onZantingBtn() {
        poolMgr.ins.getPoolNode('zantingPop', gameData.game)
        console.log('暂停');
    }
    /**
     * 显示顶部UI
     */
    showTopUi() {
        // 显示顶部UI
        this.topUI.active = true
        // 根据全局变量 Global.Level_Time 的值来决定是否显示时间和关卡节点
        this.guanqia.active = gameConfig.levelTime > 0
        // 根据游戏模式执行不同的操作
        switch (gameData.moshi) {
            // 如果是普通模式
            case gameMoshi.putong:
                // 更新关卡标签的文本
                this.gengxinLevel(gameData.putongLevel)
                break;
            // 如果是超级模式
            case gameMoshi.tiaozhan:
                // 隐藏关卡标签节点
                // this.level.node.active = false
                // 更新关卡标签的文本
                this.gengxinLevel(gameData.tiaozhanLevel)
                break;
        }
    }
    /**
     * 更新游戏关卡显示
     */
    gengxinLevel(val: number) {
        this.level.string = `第${val}关`
    }

    /**
     * 冻结
     */
    onDongjie() {
        // 如果冰冻效果节点存在则不再创建
        const dongjieBg = this.node.getChildByName('dongjieBg')
        if (!dongjieBg) {
            poolMgr.ins.getPoolNode('dongjieBg', this.node)
        }
    }

    /**
     * 凑齐
     */
    onCouqi() {
        // 获取当前槽位中的球的ID数组
        const selectBallIdArr: number[] = gameData.selectBallIdArr
        // 创建一个Map用于存储需要消除的球的ID和对应的槽位索引
        const map: Map<number, number[]> = new Map<number, number[]>()
        // 记录已经移除的球的数量
        let removeCnt: number = 0
        //从槽位中筛选出需要凑齐的消除物，最多两组
        for (let i = 0; i < selectBallIdArr.length; i++) {
            const id: number = selectBallIdArr[i];
            // 如果Map中不存在该ID，则将其添加到Map中，并记录槽位索引
            if (!map.has(id)) {
                if (map.size >= 2) break
                map.set(id, [i])
                removeCnt++
            } else {
                // 如果Map中已存在该ID，则将当前槽位索引添加到对应的数组中
                const idxArr: number[] = map.get(id)
                idxArr.push(i)
                map.set(id, idxArr)
                removeCnt++
            }
        }
        // 从当前槽位ID数组中移除已经筛选出的需要消除的球
        selectBallIdArr.splice(0, removeCnt)
        // 遍历Map，处理每个需要消除的球
        for (const [k, v] of map) {
            const idxArr: number[] = v
            const arr = []
            //先将筛选出来的消除物移除
            for (let i = 0; i < idxArr.length; i++) {
                const index: number = idxArr[i];
                // 获取对应的槽位球节点，并记录其世界坐标
                const chacaoBall: Node = this.chacaoBallMain.children[index]
                const worldPos: Vec3 = chacaoBall.getWorldPosition()
                // 将球的信息添加到数组中，并销毁该球节点
                arr.push({
                    id: k,
                    angle: 0,
                    worldPos: worldPos
                })
                chacaoBall.destroy()
            }
            //再从场上找到相同的消除物凑成3个
            const needCnt: number = 3 - idxArr.length
            const ballData: ballTs[] = this.getBallById(k, needCnt)
            //将场上筛选出来的消除物移除
            for (let i = 0; i < ballData.length; i++) {
                const ball: ballTs = ballData[i];
                const worldPos: Vec3 = ball.node.getWorldPosition()
                // 将球的信息添加到数组中，并销毁该球节点
                arr.push({
                    id: k,
                    angle: ball.node.angle,
                    worldPos: worldPos
                })
                ball.node.destroy()
            }
            //如果场上没找到相同的消除物凑成3个，那么就从候补数组中找
            if (ballData.length < needCnt) {
                let restNeedCnt: number = needCnt - ballData.length
                console.log(log, `从候补数组中找${restNeedCnt}个`);
                const restArr: number[] = []
                for (let i = 0; i < this.allBallData.length; i++) {
                    const ballData: ballDto = this.allBallData[i];
                    if (ballData.id !== k) continue
                    const worldPos: Vec3 = v3()
                    worldPos.x = this.node.worldPosition.x + math.randomRangeInt(-250, 250)
                    worldPos.y = this.node.worldPosition.y + 1200
                    // 将球的信息添加到数组中
                    arr.push({
                        id: k,
                        angle: 0,
                        worldPos: worldPos
                    })
                    restArr.push(i)
                    restNeedCnt--
                    if (restNeedCnt <= 0) break
                }
                for (let i = 0; i < restArr.length; i++) {
                    const idx: number = restArr[i];
                    const removedBall: ballDto = this.allBallData[idx]
                    console.log(log, `从候补中移除了`, removedBall.name);
                }
                // 从候补数组中移除已经使用的球
                this.allBallData = deleteMultIndex(this.allBallData, restArr)
            }
            const idArr: number[] = []
            for (let i = 0; i < arr.length; i++) {
                const data = arr[i];
                const id: number = data.id
                const worldPos: Vec3 = data.worldPos
                const angle: number = data.angle
                // 创建一个飞行球节点，并设置其初始位置和角度
                const flyBallNode: Node = this.creatFeiBall(worldPos, angle, ballConfig[id])
                flyBallNode.scale = v3(0.5, 0.5, 1)
                // 创建一个补间动画，让飞行球节点移动到目标位置
                const tw = tween(flyBallNode)
                const targetWorldPos: Vec3 = arr[0].worldPos
                const localPos: Vec3 = this.uiTrans.convertToNodeSpaceAR(targetWorldPos)
                if (!idArr.includes(id)) {
                    idArr.push(id)
                    const isCat: boolean = ballUtil.isBallType(id, ballType.cat)
                    if (isCat) {
                        const maoId: number = id - 56
                        tujiMgr.addTuji(maoId)
                        musicMgr.ins.playSound('抓到猫音效')
                    }
                }
                // 让飞行球节点移动到目标位置
                tw.to(0.15, { position: localPos })
                tw.call(() => {
                    // 飞行球节点移动完成后，销毁该节点并创建合并特效
                    flyBallNode.destroy()
                    // 创建合并特效
                    gameUtil.mergeTexiao('mergeTexiao', this.node, targetWorldPos)
                })
                tw.start()
            }
        }
        // 请求创建6个新球
        this.zbCreatBall(6)
        // 延迟 0.28 秒后，播放合并音效并创建合并特效
        this.scheduleOnce(() => {
            // 合并音效
            musicMgr.ins.playSound('a消除道具')
            this.mergeEnd()
        }, 0.2)
    }
    /**
     * 移出
     */
    onYichu() {
        // 播放音效
        musicMgr.ins.playSound('a移出道具')
        // 销毁插槽球盒子节点的所有子节点
        this.chacaoBallMain.destroyAllChildren()
        // 遍历当前游戏管理器中的球的 ID 数组
        for (let i = 0; i < gameData.selectBallIdArr.length; i++) {
            // 获取当前遍历到的球的 ID
            const id: number = gameData.selectBallIdArr[i];
            // 根据球的 ID 从配置文件中获取对应的球数据
            const ball: ballDto = ballConfig[id]
            // 将获取到的球数据添加到等待球列表中
            this.youxianCreateBalls.push(ball)
        }
        // 清空当前游戏管理器中的球的 ID 数组
        gameData.selectBallIdArr = []
    }
    /**
     * 晃动技能
     */
    huangdong() {
        tween(this.kuangjia).by(0.1, { position: v3(-40, 0, 0) }).by(0.1, { position: v3(40, 0, 0) }).union().repeat(4).call(() => {
            this.kuangjia.setPosition(v3(0, 0, 0))
        }).start()
        console.log('晃动技能');
    }
    /**
   * 根据指定的ID获取球组件
   * @param id 要查找的球的ID
   * @param cnt 要获取的球的数量，默认为1
   * @returns 返回包含指定ID的球组件的数组
   */
    getBallById(id: number, cnt: number = 1): ballTs[] {
        // 获取当前节点的所有子节点中的球组件
        const balls: ballTs[] = this.getComponentsInChildren(ballTs)
        // 获取球组件的数量
        const ballCnt: number = balls.length
        // 用于存储找到的球组件
        const res: ballTs[] = []
        // 当前已找到的球的数量
        let curCnt: number = 0
        // 遍历所有球组件
        for (let i = 0; i < ballCnt; i++) {
            // 获取当前遍历到的球组件
            const ball: ballTs = balls[i];
            // 如果已经找到了足够数量的球，则停止查找
            if (curCnt === cnt) break
            // 如果当前球的ID与指定的ID不匹配，则继续查找
            if (ball.ballData.id !== id) continue
            // 将匹配的球组件添加到结果数组中
            res.push(ball)
            // 增加已找到的球的数量
            curCnt++
        }
        return res
    }
    /**
     * 解锁插槽
     */
    // 检查插槽解锁
    jianchaChacao() {
        switch (gameConfig.chacaoNum) {
            case 5:
                this.chacaoAd[0].children[0].active = true
                this.chacaoAd[1].children[0].active = true
                break
            case 6:
                this.chacaoAd[0].children[0].active = false
                this.chacaoAd[1].children[0].active = true
                const button = this.chacaoAd[0].getComponent(Button);
                if (button) {
                    button.interactable = false;
                }
                break
            case 7:
                this.chacaoAd[0].children[0].active = false
                this.chacaoAd[1].children[0].active = false
                const button1 = this.chacaoAd[0].getComponent(Button);
                if (button1) {
                    button1.interactable = false;
                }
                const button2 = this.chacaoAd[1].getComponent(Button);
                if (button2) {
                    button2.interactable = false;
                }
                break
            default:
                break
        }
    }
    // 解锁插槽
    jisuoChacao() {
        if (gameConfig.chacaoNum >= 7) {
            return
        }
        switch (gameConfig.chacaoNum) {
            case 5:
                adMgr.showVideo(() => {
                    gameConfig.chacaoNum = 6
                    this.chacaoAd[0].children[0].active = false
                    // 临时解锁，仅本关有效，不写本地存档；过关重载后还原为基础槽位
                    tishiMgr.titleTips(gameData.game, '已解锁新插槽')
                    const button1 = this.chacaoAd[0].getComponent(Button);
                    if (button1) {
                        button1.interactable = false;
                    }
                })
                break
            case 6:
                adMgr.showVideo(() => {
                    gameConfig.chacaoNum = 7
                    this.chacaoAd[1].children[0].active = false
                    // 临时解锁，仅本关有效，不写本地存档；过关重载后还原为基础槽位
                    tishiMgr.titleTips(gameData.game, '已解锁新插槽')
                    const button2 = this.chacaoAd[1].getComponent(Button);
                    if (button2) {
                        button2.interactable = false;
                    }
                })
                break
            default:
                break
        }
    }
}


