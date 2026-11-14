import {
    _decorator,
    Component,
    director,
    Director,
    Graphics,
    Label,
    Node,
    RigidBody2D,
    UITransform,
    Widget,
    Color
} from 'cc';

const { ccclass } = _decorator;

/** 临时真机诊断：使用普通 UI 显示，不依赖内置 profiler 的节点、材质或图层。 */
@ccclass('performanceHudTs')
export class performanceHudTs extends Component {
    private panel: Node = null;
    private metrics: Label = null;
    private ballRoot: Node = null;
    private frameStart = 0;
    private previousFrameStart = 0;
    private physicsStart = 0;
    private renderStart = 0;
    private windowStart = 0;
    private frames = 0;
    private physicsTime = 0;
    private renderTime = 0;
    private frameTime = 0;
    private intervals: number[] = [];

    setBallRoot(root: Node): void {
        this.ballRoot = root;
    }

    protected onLoad(): void {
        this.createPanel();
    }

    protected onEnable(): void {
        this.windowStart = this.now();
        this.frameStart = 0;
        this.previousFrameStart = 0;
        this.frames = this.physicsTime = this.renderTime = this.frameTime = 0;
        this.intervals.length = 0;
        if (this.panel) this.panel.active = true;
        director.on(Director.EVENT_BEFORE_UPDATE, this.beforeFrame, this);
        director.on(Director.EVENT_BEFORE_PHYSICS, this.beforePhysics, this);
        director.on(Director.EVENT_AFTER_PHYSICS, this.afterPhysics, this);
        director.on(Director.EVENT_BEFORE_DRAW, this.beforeDraw, this);
        director.on(Director.EVENT_AFTER_RENDER, this.afterRender, this);
        director.on(Director.EVENT_AFTER_DRAW, this.afterFrame, this);
    }

    protected onDisable(): void {
        director.off(Director.EVENT_BEFORE_UPDATE, this.beforeFrame, this);
        director.off(Director.EVENT_BEFORE_PHYSICS, this.beforePhysics, this);
        director.off(Director.EVENT_AFTER_PHYSICS, this.afterPhysics, this);
        director.off(Director.EVENT_BEFORE_DRAW, this.beforeDraw, this);
        director.off(Director.EVENT_AFTER_RENDER, this.afterRender, this);
        director.off(Director.EVENT_AFTER_DRAW, this.afterFrame, this);
        if (this.panel) this.panel.active = false;
    }

    protected onDestroy(): void {
        if (this.panel?.isValid) this.panel.destroy();
    }

    protected lateUpdate(): void {
        // 后续创建的提示或弹窗也不会盖住诊断卡片；卡片不注册触摸事件。
        const lastIndex = this.node.children.length - 1;
        if (this.panel.getSiblingIndex() !== lastIndex) this.panel.setSiblingIndex(lastIndex);
    }

    private now(): number {
        return typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now();
    }

    private createPanel(): void {
        this.panel = new Node('PerformanceHudV2');
        this.panel.layer = this.node.layer;
        this.panel.parent = this.node;
        const transform = this.panel.addComponent(UITransform);
        transform.setContentSize(680, 148);
        transform.setAnchorPoint(0.5, 1);
        const widget = this.panel.addComponent(Widget);
        widget.isAlignTop = widget.isAlignLeft = widget.isAlignRight = true;
        widget.top = 200;
        widget.left = widget.right = 12;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        widget.updateAlignment();

        const width = transform.width;
        const background = this.panel.addComponent(Graphics);
        background.fillColor = new Color(12, 20, 28, 225);
        background.roundRect(-width / 2, -148, width, 148, 10);
        background.fill();

        const title = this.createLabel('Title', width, -8, 25);
        title.string = 'PERF HUD V2';
        title.color = new Color(255, 222, 80);
        this.metrics = this.createLabel('Metrics', width, -39, 100);
        this.metrics.string = 'FPS --   Frame -- ms   P95 -- ms\nPhysics -- ms   Render -- ms (CPU)\nBalls --   Awake --\nCollecting / 1 second';
    }

    private createLabel(name: string, width: number, y: number, height: number): Label {
        const labelNode = new Node(name);
        labelNode.layer = this.node.layer;
        labelNode.parent = this.panel;
        const transform = labelNode.addComponent(UITransform);
        transform.setContentSize(width - 24, height);
        transform.setAnchorPoint(0, 1);
        labelNode.setPosition(-width / 2 + 12, y);
        const label = labelNode.addComponent(Label);
        label.fontSize = name === 'Title' ? 23 : 20;
        label.lineHeight = 24;
        label.color = Color.WHITE;
        label.horizontalAlign = Label.HorizontalAlign.LEFT;
        label.verticalAlign = Label.VerticalAlign.TOP;
        label.overflow = Label.Overflow.SHRINK;
        return label;
    }

    private beforeFrame(): void {
        const now = this.now();
        if (this.previousFrameStart > 0) this.intervals.push(now - this.previousFrameStart);
        this.previousFrameStart = this.frameStart = now;
        this.physicsStart = this.renderStart = 0;
    }

    private beforePhysics(): void {
        this.physicsStart = this.now();
    }

    private afterPhysics(): void {
        if (this.physicsStart > 0) this.physicsTime += this.now() - this.physicsStart;
        this.physicsStart = 0;
    }

    private beforeDraw(): void {
        this.renderStart = this.now();
    }

    private afterRender(): void {
        if (this.renderStart > 0) this.renderTime += this.now() - this.renderStart;
        this.renderStart = 0;
    }

    private afterFrame(): void {
        // 动态挂载可能发生在本帧 BEFORE_UPDATE 之后，等下一完整帧再计时。
        if (this.frameStart <= 0) {
            this.physicsTime = this.renderTime = 0;
            return;
        }
        const now = this.now();
        this.frames++;
        this.frameTime += now - this.frameStart;
        const elapsed = now - this.windowStart;
        if (elapsed < 1000) return;

        this.intervals.sort((a, b) => a - b);
        const p95 = this.intervals[Math.min(this.intervals.length - 1, Math.floor(this.intervals.length * 0.95))] ?? 0;
        const bodies = this.ballRoot?.getComponentsInChildren(RigidBody2D) ?? [];
        const awake = bodies.filter(body => body.isAwake()).length;
        const fps = (this.frames * 1000 / elapsed).toFixed(1);
        this.metrics.string = `FPS ${fps}   Frame ${(this.frameTime / this.frames).toFixed(1)} ms   P95 ${p95.toFixed(1)} ms\n`
            + `Physics ${(this.physicsTime / this.frames).toFixed(1)} ms   Render ${(this.renderTime / this.frames).toFixed(1)} ms (CPU)\n`
            + `Balls ${bodies.length}   Awake ${awake}\n`
            + 'Frame = CPU work / P95 = frame interval';
        this.frames = this.physicsTime = this.renderTime = this.frameTime = 0;
        this.intervals.length = 0;
        this.windowStart = now;
    }
}
