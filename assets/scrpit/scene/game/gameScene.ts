import {
    _decorator,
    BoxCollider2D,
    Button,
    CircleCollider2D,
    Color,
    Component,
    director,
    game,
    Graphics,
    Input,
    input,
    isValid,
    KeyCode,
    Label,
    macro,
    math,
    Node,
    PhysicsSystem2D,
    PolygonCollider2D,
    profiler,
    RigidBody2D,
    size,
    Tween,
    tween,
    UIOpacity,
    UITransform,
    v3,
    Vec3
} from 'cc';
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
import { performanceHudTs } from './performanceHudTs';
interface MatchingBallOrigin {
    id: number;
    angle: number;
    worldPos: Vec3;
}

const { ccclass, property } = _decorator;
let log = 'gameScene';
@ccclass('gameScene')
export class gameScene extends Component {
    @property(Node)
    kuangjia: Node = null;
    // 关卡数字
    @property(Label)
    level: Label = null;
    // 关卡及倒计时显示
    @property(Node)
    guanqia: Node = null;
    // 顶部UI
    @property(Node)
    topUI: Node = null;
    // 剩余球
    @property(Label)
    shengyu: Label = null;
    // 插槽球父节点
    @property(Node)
    chacaoBallMain: Node = null;
    // 插槽盒子节点
    @property(Node)
    chacaoBox: Node = null;
    // 插槽的脚本数组
    private chacaoTsArr: chacaoTs[] = [];
    // 生成的每一关的球的数据
    allBallData: ballDto[] = [];
    // 优先生成的球列表
    youxianCreateBalls: ballDto[] = [];
    // 球的父节点
    @property(Node)
    ballMain: Node = null;
    // 私有的UI变换组件
    private uiTrans: UITransform = null;
    // 广告插槽
    @property(Node)
    chacaoAd: Node[] = [];
    // 当前连击数
    private comboCount: number = 0;
    // 上一次消除的时间戳(毫秒)，用于判定是否在连击窗口内
    private lastMergeTime: number = 0;
    // 连击超时重置定时器
    private comboResetId: number | null = null;
    // 常驻连击 HUD 节点（复用 comboPiao 预制体，不回收）
    private comboHud: Node = null;
    // 连击消失进度条的 Graphics 组件
    private comboBar: Graphics = null;
    // 震屏目标（渲染相机节点）及其原始位置（首次震屏时缓存，每次震屏后复位，避免漂移）
    private shakeTarget: Node = null;
    private shakeBasePos: Vec3 = null;
    // 预览模式下的空格过关测试监听（保存引用以便 onDestroy 注销，避免每次场景重载叠加监听导致旧场景无法回收）
    private testKeyDownHandler: ((e: any) => void) | null = null;

    start() {
        // 临时真机诊断卡片：使用游戏 UI 图层，黄色 V2 标题也用于确认手机运行了新包。
        const performanceHud = this.getComponent(performanceHudTs) ?? this.addComponent(performanceHudTs);
        performanceHud.setBallRoot(this.ballMain);
        this.init();
        this.initLevelConfig();
        this.initBallData(gameConfig.ballFenzu, gameConfig.catFenzu, gameConfig.peiduiFenzu);
        this.initBall();
        // wx
        apiMgr.topFenXiang();
    }

    protected onDestroy(): void {
        this.unregisterGameEvents();
        // 清理连击重置定时器，避免场景销毁后回调泄漏
        if (this.comboResetId !== null) {
            clearTimeout(this.comboResetId);
            this.comboResetId = null;
        }
        // 注销预览模式的空格测试监听，否则每过一关都会在全局 input 上叠加一个监听，
        // 且其闭包持有旧场景的 this，导致旧场景无法被 GC，关数越多越卡
        if (this.testKeyDownHandler) {
            input.off(Input.EventType.KEY_DOWN, this.testKeyDownHandler, this);
            this.testKeyDownHandler = null;
        }
        // 清理兜底清场定时器，避免场景销毁后回调操作已失效的节点
        if (this.checkBallTimeoutId !== null) {
            clearTimeout(this.checkBallTimeoutId);
            this.checkBallTimeoutId = null;
        }
        this.unscheduleAllCallbacks();
    }

    init() {
        // 临时诊断改用普通 UI 卡片，关闭内置面板，避免重复采样和绘制。
        profiler.hideStats();
        // [优化] 降低 2D 物理求解迭代次数，缓解多球堆叠时真机 CPU 压力
        // 默认 10/10 在多球堆叠场景下消耗过大；小游戏端只需近似堆叠，4/2 更稳。
        PhysicsSystem2D.instance.velocityIterations = 4;
        PhysicsSystem2D.instance.positionIterations = 2;
        gameData.zanting = false;
        // 每关开局清零本关连击奖励金币（关内只累计，结算时统一入账）
        gameData.benguanComboJinbi = 0;
        musicMgr.ins.playMusic('游戏内音乐');
        gameData.game = this.node;
        this.uiTrans = this.node.getComponent(UITransform);
        this.chacaoTsArr = this.chacaoBox.getComponentsInChildren(chacaoTs);
        // 插槽球主节点
        gameData.chacaoBox = this.chacaoBox;
        // 清空查插槽球节点下的所有节点，清空元素数组
        this.chacaoBallMain.removeAllChildren();
        this.allBallData = [];
        this.youxianCreateBalls = [];
        gameData.selectBallIdArr = [];
        // 每关开局把临时解锁的 6/7 槽还原为永久基础槽位（场景重载不会自动还原 static）
        gameConfig.chacaoNum = gameConfig.baseChacaoNum;
        // 插槽节点解锁状况
        this.jianchaChacao();
        this.registerGameEvents();
        this.testNext();
        director.preloadScene('main', function () {
            console.log('main场景加载完成');
        });
    }

    /** 注册关内事件；与销毁时的注销一一对应。 */
    private registerGameEvents() {
        director.on(eventType.selectBall, this.onSelectBall, this);
        director.on(eventType.useDongjie, this.onDongjie, this);
        director.on(eventType.useCouqi, this.onCouqi, this);
        director.on(eventType.useYichu, this.onYichu, this);
        director.on(eventType.huangdong, this.huangdong, this);
        director.on(eventType.timeJieshu, this.timeJieshu, this);
        director.on(eventType.nextLevel, this.nextLevel, this);
        director.on(eventType.fuhuo, this.fuhuo, this);
    }

    /** 注销关内事件，释放全局事件持有的场景引用。 */
    private unregisterGameEvents() {
        director.off(eventType.selectBall, this.onSelectBall, this);
        director.off(eventType.useDongjie, this.onDongjie, this);
        director.off(eventType.useCouqi, this.onCouqi, this);
        director.off(eventType.useYichu, this.onYichu, this);
        director.off(eventType.huangdong, this.huangdong, this);
        director.off(eventType.timeJieshu, this.timeJieshu, this);
        director.off(eventType.nextLevel, this.nextLevel, this);
        director.off(eventType.fuhuo, this.fuhuo, this);
    }

    testNext() {
        // PREVIEW 是一个布尔变量，通常用于判断是否处于预览模式
        if (PREVIEW) {
            // 注册键盘按下事件的监听器（保存引用，onDestroy 时注销）
            this.testKeyDownHandler = (e) => {
                // 检查按下的键是否为空格键
                if (e.keyCode === KeyCode.SPACE) {
                    switch (gameData.moshi) {
                        // 处理正常模式胜利
                        case gameMoshi.putong:
                            this.putongWin();
                            break;
                        // 处理超级模式胜利
                        case gameMoshi.tiaozhan:
                            this.tiaozhanWin();
                            break;
                    }
                }
            };
            input.on(Input.EventType.KEY_DOWN, this.testKeyDownHandler, this);
        }
    }

    /**
     * 初始化游戏的关卡配置
     * 该方法会根据当前游戏模式和关卡级别设置全局变量，包括球的缩放比例、最大分组数、关卡时间等
     */
    initLevelConfig() {
        let levelIndex: number = 0;
        let levelData = null;
        switch (gameData.moshi) {
            // 普通模式下，如果当前关卡级别大于 70，则随机选择一个关卡索引在 50 到 70 之间
            case gameMoshi.putong:
                levelIndex =
                    gameData.putongLevel > 70
                        ? math.randomRangeInt(50, 70)
                        : gameData.putongLevel - 1;
                levelData = putongLevelConfig[levelIndex];
                gameConfig.ballFenzu = levelData.fenzu;
                gameConfig.catFenzu = levelData.catFenzu;
                gameConfig.peiduiFenzu = levelData.peiduiFenzu;
                gameConfig.levelTime = levelData.time;
                // 球的缩放比例根据关卡级别动态调整
                if (gameData.putongLevel == 2) {
                    gameConfig.ballScale = 0.65;
                } else {
                    gameConfig.ballScale = Math.max(
                        1 - levelIndex * gameConfig.ballMorenScale,
                        gameConfig.minBallScale
                    );
                }

                // 最大同屏组数按球大小收紧，避免早期大球多边形刚体一次性堆叠导致微信真机物理求解爆掉
                gameConfig.maxZushu = this.getSafeMaxZushu(levelIndex);
                break;
            case gameMoshi.tiaozhan:
                // 超级模式下，关卡索引为超级关卡级别减一
                levelIndex = gameData.tiaozhanLevel - 1;
                levelData = tiaozhanLevelConfig[levelIndex];
                gameConfig.ballFenzu = levelData.fenzu;
                gameConfig.catFenzu = 0;
                gameConfig.peiduiFenzu = levelData.peiduiFenzu;
                gameConfig.levelTime = levelData.time;
                // 球的缩放比例根据关卡级别设置为 1 或最小缩放比例
                gameConfig.ballScale = [1, gameConfig.minBallScale][levelIndex];
                // 最大分组数根据关卡级别设置为 20 或 40
                gameConfig.maxZushu = [20, 40][levelIndex];
                break;
        }
    }

    /**
     * 按当前球缩放限制同屏组数。
     * 第3关原先会生成 66 个接近原尺寸的动态多边形刚体，微信小游戏端物理成本会陡增。
     */
    private getSafeMaxZushu(levelIndex: number): number {
        const baseMax: number =
            gameConfig.ballScale <= gameConfig.minBallScale ? 40 : Math.min(20 + levelIndex, 40);
        if (gameConfig.ballScale > 0.85) return Math.min(baseMax, 14);
        if (gameConfig.ballScale > 0.75) return Math.min(baseMax, 18);
        if (gameConfig.ballScale > gameConfig.minBallScale) return Math.min(baseMax, 24);
        return baseMax;
    }

    /**
     * 生成游戏中的球数据
     */
    initBallData(groupCount: number, catGroupCount: number, pairedGroupCount: number) {
        let balls: ballDto[] = [];
        switch (gameData.moshi) {
            case gameMoshi.putong:
                if (gameData.putongLevel == 1) {
                    balls = ballUtil.getPutongBall();
                    // 计算普通组的数量
                    const normalGroupCount: number = groupCount - catGroupCount;
                    //先将创建普通组
                    for (let i = 0; i < normalGroupCount; i++) {
                        const data: ballDto = suijiYuansu(balls);
                        this.allBallData.push(data, data, data);
                    }
                    //筛选出可创建的猫
                    let catBalls: ballDto[] = ballUtil.getTypeBall(ballType.cat);
                    // 只取第一个猫球
                    catBalls = catBalls.splice(0, 1);
                    const catBall: ballDto = suijiYuansu(catBalls);
                    //再创建猫组
                    this.allBallData.push(catBall, catBall, catBall);
                    // 打乱球数据数组的顺序
                    daluanArr(this.allBallData);
                    // 打印球数据
                    this.dayinBallData();
                } else if (this.isZhuamaoLevel) {
                    this.creatCatLevel(groupCount, catGroupCount, pairedGroupCount);
                } else {
                    this.creatNocatLevel(groupCount, catGroupCount, pairedGroupCount);
                }
                break;
            case gameMoshi.tiaozhan:
                this.creatCatLevel(groupCount, catGroupCount, pairedGroupCount);
                break;
        }
        // 打印总球数
        console.log(log, `当前关卡共${groupCount}组球`);
    }

    /**
     * 普通关卡：从全部非猫球中取样，猫组按配置追加。
     */
    creatNocatLevel(groupCount: number, catGroupCount: number, pairedGroupCount: number) {
        const balls = ballUtil.getPutongBall();
        this.createGroupedBallData(balls, groupCount, catGroupCount, pairedGroupCount);
    }

    /**
     * 抓猫和挑战关卡：先选一种普通球类型，再生成各分组。
     */
    creatCatLevel(groupCount: number, catGroupCount: number, pairedGroupCount: number) {
        const typeArr = [ballType.one, ballType.two, ballType.three];
        const type = suijiYuansu(typeArr);
        const balls = ballUtil.getTypeBall(type);
        this.createGroupedBallData(balls, groupCount, catGroupCount, pairedGroupCount);
    }

    /**
     * 先生成三球一组的数据，再交替取配对组和打乱组。
     * 保留选球、选猫、洗牌的先后顺序，避免改变随机结果。
     */
    private createGroupedBallData(
        balls: ballDto[],
        groupCount: number,
        catGroupCount: number,
        pairedGroupCount: number
    ) {
        const normalGroupCount = groupCount - catGroupCount;
        const shuffledBalls: ballDto[] = [];
        const pairedBalls: ballDto[] = [];

        for (let i = 0; i < normalGroupCount; i++) {
            const ball: ballDto = suijiYuansu(balls);
            if (i < pairedGroupCount) {
                pairedBalls.push(ball, ball, ball);
            } else {
                shuffledBalls.push(ball, ball, ball);
            }
        }

        let availableCats = ballUtil.getTypeBall(ballType.cat);
        const availableCatCount = 1 + Math.floor(gameData.putongLevel / 5);
        availableCats = availableCats.splice(0, availableCatCount);
        for (let i = 0; i < catGroupCount; i++) {
            const cat: ballDto = suijiYuansu(availableCats);
            shuffledBalls.push(cat, cat, cat);
        }
        daluanArr(shuffledBalls);

        for (let i = 0; i < groupCount; i++) {
            const preferred = i % 2 === 0 ? pairedBalls : shuffledBalls;
            const fallback = i % 2 === 0 ? shuffledBalls : pairedBalls;
            const source = preferred.length > 0 ? preferred : fallback;
            if (source.length > 0) {
                this.allBallData.push(...source.splice(0, 3));
            }
        }
        this.dayinBallData();
    }

    /**
     * 打印球数据
     */
    dayinBallData() {
        const map: Map<string, number> = new Map<string, number>();
        for (let i = 0; i < this.allBallData.length; i++) {
            const ballData: ballDto = this.allBallData[i];
            const ballName: string = ballData.name;
            if (!map.has(ballName)) map.set(ballName, 0);
            const curCnt: number = map.get(ballName);
            map.set(ballName, curCnt + 1);
        }
        // 打印总球数
        console.log(log, `总共${this.allBallData.length}个球`, map);
    }

    /**
     * 判断当前游戏的关卡是否为抓猫关卡
     */
    public get isZhuamaoLevel(): boolean {
        return gameData.putongLevel > 1 && gameData.putongLevel % 5 === 0;
    }

    /**
     * 生成关卡小球
     */
    async initBall() {
        // 过渡动画
        poolMgr.ins.getPoolNode('guoduDonghua', this.node, v3(740, 0, 0));
        // 计算最大组数，取全局变量 Ball_Group 和 Max_Group 中的较小值
        const maxFenzu: number = Math.min(gameConfig.ballFenzu, gameConfig.maxZushu);
        // 计算球的数量，最大组数乘以 3
        const ballNum: number = maxFenzu * 3;
        // 等待1秒
        await gameUtil.ins.yanchi(1);
        if (gameData.putongLevel == 2 && gameData.moshi == gameMoshi.putong) {
            // 打开难度提升提示界面
            tishiMgr.nanduTips(gameData.game, '难度飙升');
        }
        if (gameData.putongLevel == 3 && gameData.moshi == gameMoshi.putong) {
            // 打开难度提升提示界面
            tishiMgr.nanduTips(gameData.game, '难度骤降');
        }
        // 请求创建球，数量为 ballNum
        this.zbCreatBall(ballNum);
        // 每 0.1 秒生成一个球，避免同一帧集中创建。
        this.schedule(this.creatBall, 0.1, macro.REPEAT_FOREVER);
        // 检测游戏是否胜利
        this.schedule(this.jianchaWin, 0.5, macro.REPEAT_FOREVER);
        await gameUtil.ins.yanchi(2);
        this.showTopUi();
        if (gameData.putongLevel == 1) {
            // 打开新手指引界面
            poolMgr.ins.getPoolNode('gameJiaoxue', gameData.game);
        }
    }

    /**
     * 处理请求创建球的事件
     */
    zbCreatBall(num: number = 1) {
        if (this.allBallData.length <= 0) {
            console.log(log, '已经没有球需要创建了');
            return;
        }
        // 确保创建的球的数量不超过游戏管理器中球数据的总数
        num = Math.min(this.allBallData.length, num);
        for (let i = 0; i < num; i++) {
            if (this.allBallData.length <= 0) break;
            const ball: ballDto = this.allBallData.shift();
            if (!ball) {
                console.log(log, '创建消除元素时发生错误');
                continue;
            }
            this.youxianCreateBalls.push(ball);
        }
        // 打印日志，记录剩余的球的数量
        console.log(log, `剩余${this.allBallData.length}个球`, this.allBallData);
        console.log(log, `优先创建${this.youxianCreateBalls.length}个球`, this.youxianCreateBalls);
    }

    /**
     * 尝试创建一个球
     */
    creatBall() {
        if (this.youxianCreateBalls.length <= 0) {
            // 显示剩余球量
            this.jianchaShengyu();
            return;
        }
        const ballData: ballDto = this.youxianCreateBalls.shift();
        const ball = poolMgr.ins.getPoolNode(ballData.name);
        if (ball) {
            ball.setPosition(math.randomRangeInt(-250, 250), math.randomRangeInt(950, 1550), 0);
            ball.setScale(gameConfig.ballScale, gameConfig.ballScale, 1);
            // 父节点
            ball.parent = this.ballMain;
            const ballts = ball.getComponent(ballTs);
            ballts.ballData = ballData;
            this.optimizeBallPhysics(ball);
        } else {
            console.log(log, '球的预制体为空');
        }
        // 生成过程中也实时刷新剩余球量，避免大关卡(如第2关)开局十几秒内数字一直空白
        this.jianchaShengyu();
    }

    /**
     * 微信端物理优化：球美术仍显示原图，碰撞体换成圆/盒两种低成本形状。
     * 原 prefab 多为 10~25 顶点 PolygonCollider2D，同屏几十个动态多边形在 Box2D 下成本很高。
     */
    private optimizeBallPhysics(ball: Node) {
        const polygons: PolygonCollider2D[] = ball.getComponents(PolygonCollider2D);
        for (let i = 0; i < polygons.length; i++) {
            polygons[i].enabled = false;
        }
        const ui = ball.getComponent(UITransform);
        const width: number = ui ? ui.contentSize.width : 160;
        const height: number = ui ? ui.contentSize.height : 160;
        const minSide: number = Math.min(width, height);
        const maxSide: number = Math.max(width, height);
        const ratio: number = maxSide / Math.max(minSide, 1);

        let circle: CircleCollider2D = ball.getComponent(CircleCollider2D);
        let box: BoxCollider2D = ball.getComponent(BoxCollider2D);
        if (ratio > 1.25) {
            if (circle) circle.enabled = false;
            if (!box) box = ball.addComponent(BoxCollider2D);
            box.size = size(Math.max(70, width * 0.82), Math.max(70, height * 0.82));
            box.friction = 0.1;
            box.restitution = 0;
            box.enabled = true;
            box.apply();
        } else {
            if (box) box.enabled = false;
            if (!circle) circle = ball.addComponent(CircleCollider2D);
            circle.radius = Math.max(45, maxSide * 0.48);
            circle.friction = 0.1;
            circle.restitution = 0;
            circle.enabled = true;
            circle.apply();
        }

        const rb = ball.getComponent(RigidBody2D);
        if (rb) {
            rb.fixedRotation = true;
            rb.linearDamping = 1.0;
            rb.angularDamping = 2.0;
        }
    }

    /**
     * 点击屏幕操作
     */
    onSelectBall(worldPos: Vec3, angle: number, data: ballDto) {
        // 点击元素出现特效
        const nodePos: Vec3 = this.uiTrans.convertToNodeSpaceAR(worldPos);
        poolMgr.ins.getPoolNode('select', gameData.game, v3(nodePos.x, nodePos.y, 0));
        const ballId: number = data.id;
        const lastIdx: number = gameData.selectBallIdArr.lastIndexOf(ballId);
        if (lastIdx === -1) {
            gameData.selectBallIdArr.push(ballId);
        } else {
            gameData.selectBallIdArr = [
                ...gameData.selectBallIdArr.slice(0, lastIdx),
                ballId,
                ...gameData.selectBallIdArr.slice(lastIdx)
            ];
        }
        const curIdx: number = gameData.selectBallIdArr.lastIndexOf(ballId);
        const feiBall: Node = this.creatFeiBall(worldPos, angle, data);
        const slot: chacaoTs = this.chacaoTsArr[curIdx];
        const chacaoWorldPos: Vec3 = slot.yuanWorldPos;
        // 计算飞球节点到插槽的距离
        const distance = Vec3.distance(feiBall.worldPosition, chacaoWorldPos);
        const feiTime: number = math.clamp(distance / 2000, 0.1, 0.2);
        // 在插槽位置创建一个插槽球节点
        const chacaoBall = this.createChacaoBall(curIdx, chacaoWorldPos, data);
        // 为插槽球节点添加一个UI透明度组件
        const slotOpacity = chacaoBall.addComponent(UIOpacity);
        slotOpacity.opacity = 0;
        // 让飞球节点移动到插槽位置，并在完成后执行合并操作
        this.toChacao(feiBall, feiTime, chacaoWorldPos).then(() => {
            if (isValid(chacaoBall)) {
                slotOpacity.opacity = 255;
                // 延迟一段时间后执行合并操作
                this.mergeBall();
                // 消除结束后
                this.mergeEnd();
            } else {
                console.log(log, '忽略合并');
            }
        });
    }

    /**
     * 让飞球节点移动到插槽位置
     */
    toChacao(feiBall: Node, feiTime: number, worldPos: Vec3): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // 让飞球节点在 duration 时间内移动到 worldPos 位置，并且角度变为 0，缩放比例变为 0.5
            tween(feiBall)
                .by(0.1, { position: v3(0, 180, 0) })
                .delay(0.1)
                .to(feiTime, { worldPosition: worldPos, angle: 0, scale: v3(0.5, 0.5, 1.0) })
                // 让飞球节点在 0.1 秒内向上移动 10 个单位
                .by(0.1, { position: v3(0, -10, 0) })
                // 让飞球节点在 0.1 秒内向上移动 10 个单位
                .by(0.1, { position: v3(0, 10, 0) })
                // 让飞球节点在 0.1 秒内向上移动 10 个单位
                .call(() => {
                    this.scheduleOnce(() => {
                        // 销毁飞球节点
                        feiBall.destroy();
                    });
                    resolve();
                })
                .start();
        });
    }

    /**
     * 在指定位置创建一个插槽球
     */
    createChacaoBall(curIdx: number, worldPos: Vec3, data: ballDto) {
        // 实例化插槽球预制体
        const chacaoBall = poolMgr.ins.getPoolNode('chacaoBallPre', this.chacaoBallMain);
        chacaoBall.setSiblingIndex(curIdx);
        chacaoBall.setWorldPosition(worldPos);
        const chacaoBallTs: chacaoBallPreTs = chacaoBall.getComponent(chacaoBallPreTs);
        chacaoBallTs.setChacaoBall(data);
        // --------------------
        return chacaoBall;
    }

    /**
     * 创建一个飞行球
     */
    creatFeiBall(worldPos: Vec3, angle: number, data: ballDto): Node {
        // 实例化飞球预制体
        const feiBall: Node = poolMgr.ins.getPoolNode('feiBallPre', this.node);
        const nodePos: Vec3 = this.uiTrans.convertToNodeSpaceAR(worldPos);
        feiBall.setPosition(nodePos);
        feiBall.setScale(gameConfig.ballScale, gameConfig.ballScale, 1);
        feiBall.angle = angle;
        const feiBallTs = feiBall.getComponent(feiBallPreTs);
        feiBallTs.setFeiBallSpr(data);
        // // 返回创建的飞球节点
        return feiBall;
    }

    /**
     * 合并球
     */
    mergeBall() {
        // 先记录三连消除的插槽索引，再更新逻辑 ID 数组。
        const deleteThree = deleteXiangtong(gameData.selectBallIdArr, 3);
        const deleteIndexArr: number[][] = deleteThree.deleteIndexArr;
        gameData.selectBallIdArr = deleteThree.arr;
        const deleteCnt: number = deleteIndexArr.length;
        if (deleteCnt <= 0) return;
        // 本次投球确实发生了消除，触发连击逻辑
        this.onCombo();
        // juice：合并瞬间微震屏，强度随连击递增
        this.shakeScreen(this.comboCount);
        for (let i = 0; i < deleteIndexArr.length; i++) {
            const indexArr: number[] = deleteIndexArr[i];
            const mubiaoWorldPos: Vec3 =
                this.chacaoBallMain.children[indexArr[1]].getWorldPosition();
            let id: number = 0;
            // 用于存储需要移除的插槽球节点
            const deleteSlotBallArr: Node[] = [];
            for (let j = 0; j < indexArr.length; j++) {
                const idIndex: number = indexArr[j];
                const chacaoBallNode: Node = this.chacaoBallMain.children[idIndex];
                const chacaoBallTs: chacaoBallPreTs = chacaoBallNode.getComponent(chacaoBallPreTs);
                const chacaoBallWorldPos: Vec3 = chacaoBallNode.getWorldPosition();
                const chacaoBallJiaodu: number = chacaoBallNode.angle;
                deleteSlotBallArr.push(chacaoBallNode);
                id = chacaoBallTs.itemData.id;
                const feiBallItem: Node = this.creatFeiBall(
                    chacaoBallWorldPos,
                    chacaoBallJiaodu,
                    chacaoBallTs.itemData
                );
                feiBallItem.scale = v3(0.5, 0.5, 1);
                const bendiPos: Vec3 = this.uiTrans.convertToNodeSpaceAR(mubiaoWorldPos);
                tween(feiBallItem)
                    // 让飞球节点在 0.3 秒内移动到目标本地坐标，使用 sineOut 缓动函数
                    .to(0.2, { position: bendiPos }, { easing: 'sineOut' })
                    // 当飞球节点移动完成后，调用回调函数销毁飞球节点
                    .call(() => {
                        feiBallItem.destroy();
                    })
                    .start();
            }
            deleteSlotBallArr.forEach((val) => {
                val.destroy();
            });
            // 判断当前合并的球是否是猫类型
            const isCat: boolean = ballUtil.isBallType(id, ballType.cat);
            if (isCat) {
                // 图鉴的ID是从4开始，所以要保证ID，也就是猫球的id减去一个数值最小要等于4
                const maoId: number = id - 56;
                tujiMgr.addTuji(maoId);
                musicMgr.ins.playSound('抓到猫音效');
            }
            // 延迟 0.28 秒后，播放合并音效并创建合并特效
            this.scheduleOnce(() => {
                // 合并音效（连击越高音量越大，营造爽感，上限 2 倍）
                const comboVol: number = Math.min(1 + Math.max(this.comboCount - 1, 0) * 0.15, 2);
                musicMgr.ins.playSound('a合并', comboVol);
                // 创建合并特效
                gameUtil.mergeTexiao('mergeTexiao', this.node, mubiaoWorldPos);
                // juice：连击鼓励飘字（2 连起，按阈值取词），在消除汇聚点弹出
                const word: string = this.getJuiceWord(this.comboCount);
                if (word) {
                    gameUtil.piaoZi(word, this.node, mubiaoWorldPos, { fontSize: 56 });
                }
            }, 0.28);
            // 触发请求创建新球的事件
            this.zbCreatBall(3);
            this.jianchaShengyu();
            this.ballBugXiufu();
        }
    }

    /**
     * 连击处理：在连击窗口内连续消除则累加连击数，
     * 2 连及以上叠加震动 + 飘字 + 额外金币奖励，超时未消除则归零。
     */
    onCombo() {
        const now: number = Date.now();
        // 在连击窗口内则累加，否则重新从 1 开始计数
        if (now - this.lastMergeTime <= gameConfig.comboWindowTime * 1000) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        this.lastMergeTime = now;
        // 重置连击超时定时器：窗口时间内没有新的消除则连击归零
        if (this.comboResetId !== null) {
            clearTimeout(this.comboResetId);
        }
        this.comboResetId = setTimeout(() => {
            this.comboCount = 0;
            this.comboResetId = null;
            // 连击窗口超时，隐藏常驻 HUD
            this.hideComboHud();
        }, gameConfig.comboWindowTime * 1000);
        // 2 连及以上才有连击表现与奖励
        if (this.comboCount < 2) return;
        // 额外奖励金币（金币道具 id 为 0）：关内只累计到本关连击奖励，不立即入账，
        // 结算页与基础金币分两行展示并统一入账
        const bonus: number = (this.comboCount - 1) * gameConfig.comboJinbi;
        gameData.benguanComboJinbi += bonus;
        // juice：金币奖励飘字，屏幕上方（连击 HUD 下方）弹出 "+N"
        if (bonus > 0) {
            const coinWorld: Vec3 = this.uiTrans.convertToWorldSpaceAR(v3(0, 250, 0));
            gameUtil.piaoZi(`+${bonus}`, this.node, coinWorld, { fontSize: 72 });
        }
        // 手机轻微震动
        apiMgr.zhenDong();
        this.updateComboHud(this.comboCount);
    }

    /**
     * 更新常驻连击 HUD：屏幕上方常驻显示 "连击 ×N"，每次连击跳动强调，
     * 停顿期间保持显示，直到连击窗口超时才隐藏。
     */
    updateComboHud(combo: number) {
        // 懒创建常驻连击节点（复用 comboPiao 预制体，全程不回收）
        if (!this.comboHud || !isValid(this.comboHud)) {
            this.comboHud = poolMgr.ins.getPoolNode('comboPiao', this.node);
            if (!this.comboHud) return;
            // 固定显示在屏幕上方
            this.comboHud.setPosition(0, 350, 0);
            // 缓存进度条 Graphics
            const barNode: Node = this.comboHud.getChildByName('bar');
            this.comboBar = barNode ? barNode.getComponent(Graphics) : null;
        }
        this.comboHud.active = true;
        // 透明度复位
        let opac: UIOpacity = this.comboHud.getComponent(UIOpacity);
        if (!opac) opac = this.comboHud.addComponent(UIOpacity);
        opac.opacity = 255;
        const labelNode: Node = this.comboHud.getChildByName('label');
        if (labelNode) {
            labelNode.getComponent(Label).string = `连击 ×${combo}`;
        }
        // 每次连击跳动强调
        Tween.stopAllByTarget(this.comboHud);
        this.comboHud.setScale(1, 1, 1);
        tween(this.comboHud)
            .to(0.1, { scale: v3(1.3, 1.3, 1) }, { easing: 'backOut' })
            .to(0.12, { scale: v3(1, 1, 1) })
            .start();
    }

    /**
     * 隐藏常驻连击 HUD（连击窗口超时归零时调用）。
     */
    hideComboHud() {
        if (this.comboHud && isValid(this.comboHud)) {
            Tween.stopAllByTarget(this.comboHud);
            this.comboHud.active = false;
        }
    }

    /**
     * 按连击数取鼓励飘字文案（取满足 combo 阈值的最高一档），不足 2 连返回空串。
     */
    getJuiceWord(combo: number): string {
        let word: string = '';
        const list = gameConfig.juiceWords;
        for (let i = 0; i < list.length; i++) {
            if (combo >= list[i].combo) word = list[i].text;
        }
        return word;
    }

    /**
     * 微震屏（juice）：抖动渲染相机，整屏统一位移，强度随连击递增。
     * 注意：根节点 Canvas 带 Widget 会每帧把位置拉回（抖不动），故改抖 Canvas 下
     * 无 Widget 的 Camera 节点。首次缓存相机原位，每次抖动结束强制复位，避免漂移。
     */
    shakeScreen(combo: number) {
        if (!this.shakeTarget || !isValid(this.shakeTarget)) {
            this.shakeTarget = this.node.getChildByName('Camera');
            if (!this.shakeTarget) return;
            this.shakeBasePos = this.shakeTarget.position.clone();
        }
        const target: Node = this.shakeTarget;
        const amp: number = Math.min(
            gameConfig.shakeBase + Math.max(combo - 1, 0) * gameConfig.shakeStep,
            gameConfig.shakeMax
        );
        const base: Vec3 = this.shakeBasePos;
        Tween.stopAllByTarget(target);
        // 衰减式多段抖动：左右 + 上下交替，振幅逐段递减，结束强制复位（保留相机 z）
        const offs: number[][] = [
            [1, 0.6],
            [-0.9, -0.5],
            [0.7, 0.45],
            [-0.55, -0.35],
            [0.4, 0.25],
            [-0.25, -0.15]
        ];
        let tw = tween(target);
        for (let i = 0; i < offs.length; i++) {
            const dx: number = base.x + amp * offs[i][0];
            const dy: number = base.y + amp * offs[i][1];
            tw = tw.to(0.035, { position: v3(dx, dy, base.z) });
        }
        tw.to(0.035, { position: base.clone() })
            .call(() => {
                target.setPosition(base);
            })
            .start();
    }

    /**
     * 清场庆祝（juice 降级方案）：复用现有合并特效在中心多点炸开 + "Perfect!" 大字，
     * 播完后回调打开结算页。无新美术资源。
     */
    qingChangCele(onDone: () => void) {
        const centerWorld: Vec3 = this.uiTrans.convertToWorldSpaceAR(v3(0, 60, 0));
        // 中心 + 四周随机点位炸开合并特效，模拟撒花
        for (let i = 0; i < 6; i++) {
            const ox: number = (Math.random() - 0.5) * 360;
            const oy: number = (Math.random() - 0.5) * 360;
            const pos: Vec3 = v3(centerWorld.x + ox, centerWorld.y + oy, 0);
            this.scheduleOnce(() => {
                gameUtil.mergeTexiao('mergeTexiao', this.node, pos);
            }, i * 0.08);
        }
        // "Perfect!" 大字
        gameUtil.piaoZi('Perfect!', this.node, centerWorld, {
            fontSize: 96,
            color: new Color(255, 120, 60, 255),
            rise: 40,
            hold: 1.0
        });
        musicMgr.ins.playSound('a合并', 2);
        // 庆祝动画后再开结算页
        this.scheduleOnce(() => {
            onDone();
        }, 1.5);
    }

    /**
     * 每帧刷新连击消失进度条
     */
    update(dt: number) {
        if (gameData.zanting) return;
        if (!this.comboHud || !this.comboHud.active || !this.comboBar) return;
        const windowMs: number = gameConfig.comboWindowTime * 1000;
        const ratio: number = math.clamp(1 - (Date.now() - this.lastMergeTime) / windowMs, 0, 1);
        this.drawComboBar(ratio);
    }

    /**
     * 绘制连击消失进度条：底槽 + 随剩余比例收缩的填充条（绿 → 红渐变制造紧张感）
     */
    drawComboBar(ratio: number) {
        const graphics: Graphics = this.comboBar;
        const width: number = 200;
        const height: number = 16;
        const x: number = -width / 2;
        const radius: number = height / 2;
        graphics.clear();
        // 底槽
        graphics.fillColor = new Color(0, 0, 0, 120);
        graphics.roundRect(x, -height / 2, width, height, radius);
        graphics.fill();
        // 进度填充：剩余越少越偏红，制造紧张感
        if (ratio > 0) {
            const fillWidth: number = Math.max(width * ratio, height);
            const red: number = Math.round(230 - 170 * ratio);
            const green: number = Math.round(60 + 160 * ratio);
            const blue: number = Math.round(60 + 20 * ratio);
            graphics.fillColor = new Color(red, green, blue, 255);
            graphics.roundRect(x, -height / 2, fillWidth, height, radius);
            graphics.fill();
        }
    }
    // 定义一个定时器ID变量
    private checkBallTimeoutId: number | null = null;

    ballBugXiufu() {
        if (gameData.putongLevel == 1 && gameData.moshi == gameMoshi.putong) {
            return;
        }
        // 延迟到下一帧再判定：合并掉的插槽球执行的是 node.destroy()，要到帧末才真正从
        // children 中移除。若此刻立即统计，会把正在销毁的球也算进剩余数，导致读数偏高、
        // 在最后一次合并清到 ≤3 个球时漏判卡死、不触发兜底清场。
        this.scheduleOnce(() => {
            if (this.checkBallTimeoutId !== null) {
                clearTimeout(this.checkBallTimeoutId);
                this.checkBallTimeoutId = null;
            }
            // 剩余球 ≤3（不足以再凑成一个三连消除组）时，3 秒后兜底清场，避免卡死
            const shengyu: number = this.jianchaShengyu();
            if (shengyu < 4 && shengyu > 0) {
                this.checkBallTimeoutId = setTimeout(() => {
                    // 清除所有剩下的球
                    this.clearAllRemainingBalls();
                    this.checkBallTimeoutId = null;
                }, 3000) as unknown as number;
            }
        });
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
        this.chacaoBallMain.destroyAllChildren();
        // 重新检查剩余球数
        this.jianchaShengyu();
        // 检查游戏是否获胜
        this.jianchaWin();
    }

    /**
     * 合并后的处理逻辑
     */
    mergeEnd() {
        const nowIdArrLength: number = gameData.selectBallIdArr.length;
        switch (nowIdArrLength) {
            case gameConfig.chacaoNum - 1:
                console.log(log, '还剩一个槽位');
                break;
            case gameConfig.chacaoNum:
                //如果游戏已经暂停，不再继续
                if (gameData.zanting) return;
                // 失败类型为2插槽满了
                gameData.shibaiType = 2;
                // 游戏失败
                poolMgr.ins.getPoolNode('fuhuoPop', gameData.game);
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
        const ball =
            this.allBallData.length +
            this.youxianCreateBalls.length +
            this.ballMain.children.length +
            this.chacaoBallMain.children.length;
        this.shengyu.string = `${ball}`;
        return ball;
    }

    /**
     * 检查是否获胜
     * 该方法会检查游戏是否处于暂停状态，如果是，则直接返回
     * 如果球盒子为空，则取消调度检查获胜的方法，并根据当前游戏模式触发相应的获胜事件
     */
    async jianchaWin() {
        if (gameData.zanting) return;
        if (this.ballMain.children.length <= 0) {
            // 取消调度检查获胜的方法
            this.unschedule(this.jianchaWin);
            switch (gameData.moshi) {
                case gameMoshi.putong:
                    // 触发普通模式获胜事件
                    await gameUtil.ins.yanchi(0.5);
                    this.putongWin();
                    break;
                case gameMoshi.tiaozhan:
                    // 触发超级模式获胜事件
                    await gameUtil.ins.yanchi(0.5);
                    this.tiaozhanWin();
                    break;
            }
        }
    }

    /**
     * 倒计时结束
     */
    timeJieshu() {
        if (this.ballMain.children.length <= 0) return;
        // 失败类型为1
        gameData.shibaiType = 1;
        // 打开复活界面
        poolMgr.ins.getPoolNode('fuhuoPop', gameData.game);
    }

    /**
     * 超级模式获胜后的处理逻辑
     */
    tiaozhanWin() {
        // 暂停游戏
        gameData.zanting = true;
        // 触发超级模式获胜事件
        switch (gameData.tiaozhanLevel) {
            case 1:
                // 打开难度提升提示界面
                tishiMgr.nanduTips(gameData.game, '难度飙升');
                // 在 2 秒后增加超级模式等级并重新开始游戏
                this.scheduleOnce(() => {
                    gameData.tiaozhanLevel++;
                    director.loadScene('game');
                }, 2);
                break;
            case 2:
                // juice：先播清场庆祝，再打开超级模式胜利界面
                this.qingChangCele(() => {
                    poolMgr.ins.getPoolNode('tiaozhanShengliPop', gameData.game);
                });
                break;
        }
    }

    /**
     * 普通模式获胜后的处理逻辑
     */
    putongWin() {
        // 暂停游戏
        gameData.zanting = true;
        // juice：先播清场庆祝，再打开结算页
        this.qingChangCele(() => {
            poolMgr.ins.getPoolNode('shengliPop', gameData.game);
        });
        console.log('游戏普通模式胜利');
    }

    /**
     *开始下一关游戏
     */
    async nextLevel() {
        // 增加当前游戏关卡数
        gameData.putongLevel++;
        // 关卡数到本地存储
        bendiUtil.setItem('level', gameData.putongLevel);
        // 加载游戏场景
        director.loadScene('game');
    }

    /**
     * 复活操作
     */
    fuhuo(type: number) {
        if (type == 2) {
            // 触发移动事件
            this.onYichu();
        }
    }

    /**
     * 重置按钮
     */
    onShuaxinBtn() {
        poolMgr.ins.getPoolNode('shuaxinPop', gameData.game);
        console.log('重置');
    }

    /**
     * 暂停按钮
     */
    onZantingBtn() {
        poolMgr.ins.getPoolNode('zantingPop', gameData.game);
        console.log('暂停');
    }

    /**
     * 显示顶部UI
     */
    showTopUi() {
        // 显示顶部UI
        this.topUI.active = true;
        this.guanqia.active = gameConfig.levelTime > 0;
        switch (gameData.moshi) {
            case gameMoshi.putong:
                this.gengxinLevel(gameData.putongLevel);
                break;
            case gameMoshi.tiaozhan:
                // 隐藏关卡标签节点
                // this.level.node.active = false
                this.gengxinLevel(gameData.tiaozhanLevel);
                break;
        }
    }

    /**
     * 更新游戏关卡显示
     */
    gengxinLevel(val: number) {
        this.level.string = `第${val}关`;
    }

    /**
     * 冻结
     */
    onDongjie() {
        const dongjieBg = this.node.getChildByName('dongjieBg');
        if (!dongjieBg) {
            poolMgr.ins.getPoolNode('dongjieBg', this.node);
        }
    }

    /**
     * 凑齐
     */
    onCouqi() {
        const selectBallIdArr: number[] = gameData.selectBallIdArr;
        const groups: Map<number, number[]> = new Map<number, number[]>();
        // 记录已经移除的球的数量
        let removedCount: number = 0;
        //从槽位中筛选出需要凑齐的消除物，最多两组
        for (let i = 0; i < selectBallIdArr.length; i++) {
            const id: number = selectBallIdArr[i];
            if (!groups.has(id)) {
                if (groups.size >= 2) break;
                groups.set(id, [i]);
                removedCount++;
            } else {
                const idxArr: number[] = groups.get(id);
                idxArr.push(i);
                groups.set(id, idxArr);
                removedCount++;
            }
        }
        selectBallIdArr.splice(0, removedCount);
        for (const [ballId, slotIndices] of groups) {
            this.completeMatchingGroup(ballId, slotIndices);
        }
        // 请求创建6个新球
        this.zbCreatBall(6);
        // 延迟 0.28 秒后，播放合并音效并创建合并特效
        this.scheduleOnce(() => {
            // 合并音效
            musicMgr.ins.playSound('a消除道具');
            this.mergeEnd();
        }, 0.2);
    }

    /** 从插槽、场上、候补队列依次补齐同一 ID 的球。 */
    private completeMatchingGroup(ballId: number, slotIndices: number[]) {
        const indices: number[] = slotIndices;
        const origins: MatchingBallOrigin[] = [];
        //先将筛选出来的消除物移除
        for (let i = 0; i < indices.length; i++) {
            const index: number = indices[i];
            const chacaoBall: Node = this.chacaoBallMain.children[index];
            const worldPos: Vec3 = chacaoBall.getWorldPosition();
            origins.push({
                id: ballId,
                angle: 0,
                worldPos: worldPos
            });
            chacaoBall.destroy();
        }
        //再从场上找到相同的消除物凑成3个
        const neededCount: number = 3 - indices.length;
        const matchingBalls: ballTs[] = this.getBallById(ballId, neededCount);
        //将场上筛选出来的消除物移除
        for (let i = 0; i < matchingBalls.length; i++) {
            const ball: ballTs = matchingBalls[i];
            const worldPos: Vec3 = ball.node.getWorldPosition();
            origins.push({
                id: ballId,
                angle: ball.node.angle,
                worldPos: worldPos
            });
            ball.node.destroy();
        }
        //如果场上没找到相同的消除物凑成3个，那么就从候补数组中找
        if (matchingBalls.length < neededCount) {
            this.takeReserveBalls(ballId, neededCount - matchingBalls.length, origins);
        }
        this.animateMatchingGroup(origins);
    }

    /** 候补球保留原有随机出场位置和移除顺序。 */
    private takeReserveBalls(
        ballId: number,
        remainingCount: number,
        origins: MatchingBallOrigin[]
    ) {
        console.log(log, `从候补数组中找${remainingCount}个`);
        const removedIndices: number[] = [];
        for (let i = 0; i < this.allBallData.length; i++) {
            const ballData: ballDto = this.allBallData[i];
            if (ballData.id !== ballId) continue;
            const worldPos: Vec3 = v3();
            worldPos.x = this.node.worldPosition.x + math.randomRangeInt(-250, 250);
            worldPos.y = this.node.worldPosition.y + 1200;
            origins.push({
                id: ballId,
                angle: 0,
                worldPos: worldPos
            });
            removedIndices.push(i);
            remainingCount--;
            if (remainingCount <= 0) break;
        }
        for (let i = 0; i < removedIndices.length; i++) {
            const idx: number = removedIndices[i];
            const removedBall: ballDto = this.allBallData[idx];
            console.log(log, `从候补中移除了`, removedBall.name);
        }
        this.allBallData = deleteMultIndex(this.allBallData, removedIndices);
    }

    /** 每组只收集一次图鉴；每个飞球仍各自播放合并特效。 */
    private animateMatchingGroup(origins: MatchingBallOrigin[]) {
        const collectedIds: number[] = [];
        for (let i = 0; i < origins.length; i++) {
            const origin = origins[i];
            const id: number = origin.id;
            const worldPos: Vec3 = origin.worldPos;
            const angle: number = origin.angle;
            const flyBallNode: Node = this.creatFeiBall(worldPos, angle, ballConfig[id]);
            flyBallNode.scale = v3(0.5, 0.5, 1);
            const tw = tween(flyBallNode);
            const targetWorldPos: Vec3 = origins[0].worldPos;
            const localPos: Vec3 = this.uiTrans.convertToNodeSpaceAR(targetWorldPos);
            if (!collectedIds.includes(id)) {
                collectedIds.push(id);
                const isCat: boolean = ballUtil.isBallType(id, ballType.cat);
                if (isCat) {
                    const maoId: number = id - 56;
                    tujiMgr.addTuji(maoId);
                    musicMgr.ins.playSound('抓到猫音效');
                }
            }
            // 让飞行球节点移动到目标位置
            tw.to(0.15, { position: localPos });
            tw.call(() => {
                // 飞行球节点移动完成后，销毁该节点并创建合并特效
                flyBallNode.destroy();
                // 创建合并特效
                gameUtil.mergeTexiao('mergeTexiao', this.node, targetWorldPos);
            });
            tw.start();
        }
    }

    /**
     * 移出
     */
    onYichu() {
        // 播放音效
        musicMgr.ins.playSound('a移出道具');
        // 销毁插槽球盒子节点的所有子节点
        this.chacaoBallMain.destroyAllChildren();
        for (let i = 0; i < gameData.selectBallIdArr.length; i++) {
            const id: number = gameData.selectBallIdArr[i];
            const ball: ballDto = ballConfig[id];
            this.youxianCreateBalls.push(ball);
        }
        // 清空当前游戏管理器中的球的 ID 数组
        gameData.selectBallIdArr = [];
    }

    /**
     * 晃动技能
     */
    huangdong() {
        tween(this.kuangjia)
            .by(0.1, { position: v3(-40, 0, 0) })
            .by(0.1, { position: v3(40, 0, 0) })
            .union()
            .repeat(4)
            .call(() => {
                this.kuangjia.setPosition(v3(0, 0, 0));
            })
            .start();
        console.log('晃动技能');
    }

    /**
     * 根据指定的ID获取球组件
     * @param id 要查找的球的ID
     * @param cnt 要获取的球的数量，默认为1
     * @returns 返回包含指定ID的球组件的数组
     */
    getBallById(id: number, cnt: number = 1): ballTs[] {
        const balls: ballTs[] = this.getComponentsInChildren(ballTs);
        const ballCount: number = balls.length;
        // 用于存储找到的球组件
        const matchingBalls: ballTs[] = [];
        // 当前已找到的球的数量
        let matchedCount: number = 0;
        for (let i = 0; i < ballCount; i++) {
            const ball: ballTs = balls[i];
            if (matchedCount === cnt) break;
            if (ball.ballData.id !== id) continue;
            matchingBalls.push(ball);
            // 增加已找到的球的数量
            matchedCount++;
        }
        return matchingBalls;
    }

    /**
     * 解锁插槽
     */
    // 检查插槽解锁
    jianchaChacao() {
        switch (gameConfig.chacaoNum) {
            case 5:
                this.chacaoAd[0].children[0].active = true;
                this.chacaoAd[1].children[0].active = true;
                break;
            case 6:
                this.chacaoAd[0].children[0].active = false;
                this.chacaoAd[1].children[0].active = true;
                const button = this.chacaoAd[0].getComponent(Button);
                if (button) {
                    button.interactable = false;
                }
                break;
            case 7:
                this.chacaoAd[0].children[0].active = false;
                this.chacaoAd[1].children[0].active = false;
                const button1 = this.chacaoAd[0].getComponent(Button);
                if (button1) {
                    button1.interactable = false;
                }
                const button2 = this.chacaoAd[1].getComponent(Button);
                if (button2) {
                    button2.interactable = false;
                }
                break;
            default:
                break;
        }
    }

    // 解锁插槽
    jisuoChacao() {
        if (gameConfig.chacaoNum >= 7) {
            return;
        }
        switch (gameConfig.chacaoNum) {
            case 5:
                adMgr.showVideo(() => {
                    gameConfig.chacaoNum = 6;
                    this.chacaoAd[0].children[0].active = false;
                    // 临时解锁，仅本关有效，不写本地存档；过关重载后还原为基础槽位
                    tishiMgr.titleTips(gameData.game, '已解锁新插槽');
                    const button1 = this.chacaoAd[0].getComponent(Button);
                    if (button1) {
                        button1.interactable = false;
                    }
                });
                break;
            case 6:
                adMgr.showVideo(() => {
                    gameConfig.chacaoNum = 7;
                    this.chacaoAd[1].children[0].active = false;
                    // 临时解锁，仅本关有效，不写本地存档；过关重载后还原为基础槽位
                    tishiMgr.titleTips(gameData.game, '已解锁新插槽');
                    const button2 = this.chacaoAd[1].getComponent(Button);
                    if (button2) {
                        button2.interactable = false;
                    }
                });
                break;
            default:
                break;
        }
    }
}
