import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
/**
     * 时间格式化 时:分:秒
     * @param millisecond 毫秒
     * @returns 
     */
	 //源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html


export function timeHMS(m: number): string {
    // 将毫秒转换为秒
    let second = m / 1000
    // 计算小时数，并格式化为两位数字字符串
    let hour = (Array(2).join('0') + Math.floor(second / 3600)).slice(-2)
    // 计算分钟数，并格式化为两位数字字符串
    let min = (Array(2).join('0') + Math.floor((second % 3600) / 60)).slice(-2)
    // 计算秒数，并格式化为两位数字字符串
    let sec = (Array(2).join('0') + Math.floor(second) % 60).slice(-2)
    // 如果小时数为0，则返回 "分:秒" 格式
    if (hour == "00") {
        return min + ":" + sec
    } else {
        // 如果小时数为0，则返回 "分:秒" 格式
        return hour + ":" + min + ":" + sec
    }
}


