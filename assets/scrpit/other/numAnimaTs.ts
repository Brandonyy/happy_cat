import { _decorator, CCInteger, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('numAnimaTs')
export class numAnimaTs extends Component {
    // 标签文本
    @property(Label)
    label: Label = null
    //保留小数点后几位
    public decimalPlaces: number = 0
    // 前缀和后缀
    public qianzhui: string = ''
    public houzhui: string = ''
    // 当前数字
    private nowNum: number = 0
    // 最终要显示的数字
    private endNum: number = 0
    // 每次更新的间隔值
    private uodateJiange: number = 0
    /**
      * 初始化数字显示
      * @param n - 要显示的初始数字
      */
    init(val: number): void {
        // 设置当前数字
        this.nowNum = val
        // 更新Label显示的内容，包含前缀、当前数字（保留指定小数位）和后缀
        this.label.string = `${this.qianzhui}${this.nowNum.toFixed(this.decimalPlaces)}${this.houzhui}`
    }
    /**
     * 使标签文本从当前数字逐渐变化到指定的最终数字
     * @param finalNumber - 最终要显示的数字
     * @param duration - 变化持续的时间，默认为 0.5 秒
     */
    numAnima(endNumber: number, duration: number = 0.5) {
        // 如果当前数字已经等于最终数字
        if (this.nowNum === endNumber) {
            // 将当前数字和最终数字都设置为最终数字
            this.nowNum = endNumber
            this.endNum = endNumber
            // 更新标签文本，显示最终数字
            this.label.string = `${this.qianzhui}${this.endNum.toFixed(this.decimalPlaces)}${this.houzhui}`
        }
        // 如果当前数字不等于最终数字
        else {
            // 设置最终数字
            this.endNum = endNumber
            // 计算每次更新时数字的变化间隔
            this.uodateJiange = (endNumber - this.nowNum) / (duration * 33)
            // 取消之前的定时更新任务
            this.unschedule(this.updateNum)
            // 每 0.03 秒执行一次 updateForNumber 方法，实现数字的逐渐变化
            this.schedule(this.updateNum, 0.03)
            // 更新标签文本，显示当前数字
            this.label.string = `${this.qianzhui}${this.nowNum.toFixed(this.decimalPlaces)}${this.houzhui}`
        }
    }
    updateNum(dt) {
        // 根据每次更新的间隔值增加当前数字
        this.nowNum += this.uodateJiange
        // 判断当前数字是否已经超过目标值（考虑正负两种情况）
        if ((this.uodateJiange > 0 && this.nowNum > this.endNum)
            || (this.uodateJiange < 0 && this.nowNum < this.endNum)
        ) {
            // 将当前数字设置为最终目标值
            this.nowNum = this.endNum
            // 停止定时更新
            this.unschedule(this.updateNum)
        }
        // 更新Label显示的内容，包含前缀、当前数字（保留指定小数位）和后缀
        this.label.string = `${this.qianzhui}${this.nowNum.toFixed(this.decimalPlaces)}${this.houzhui}`
    }
}


