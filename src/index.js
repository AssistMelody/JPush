/*
 * @Description: 运营部同学的需求,导出极光推送历史表格
    需要先登录极光获取到权限后 https://www.jiguang.cn/accounts/login/form 复制到Authorization
 * @Author: shenyuan
 * @Date: 2019-08-23 15:43:39
 */
var Excel = require('exceljs');
var fs = require('fs')
var axios = require('axios')
var colors = require('colors')

module.exports = class JPush {
    receiverType = {
        0: '全部',
        2: '标签',
        3: '别名',
        4: '广播',
        5: 'Reg.id',
        6: 'segment',
    }
    params = {
        contentQuery: '',
        pageIndex: 1,
        pageSize: 1,
        start: '', // 开始时间 20191001000000
        end: '', // 结束时间 20191031000000
        msgType: 1,
        receiverType: 0,  // 类型
        receiverValue: '',
        sendSource: 1,
    }
    token = 'Bearer '
    /**
     * @param {number} start 开始时间 20191001000000
     * @param {number} end 结束时间 20191031000000
     * @param {string} token
     */
    constructor(start, end, token) {
        this.params.start = start
        this.params.end = end
        this.token += token
        this.init()
    }
    init() {
        fs.mkdir('./xlsx', () => {
            this.workbook = new Excel.stream.xlsx.WorkbookWriter({
                filename: './xlsx/jPush.xlsx'
            });
            this.worksheet = this.workbook.addWorksheet('Sheet');
            this.worksheet.columns = [
                { header: '发送时间', key: 'scheduledTime' },
                { header: '标题', key: 'title' },
                { header: '内容', key: 'content' },
                { header: '类型', key: 'receiverType' },
                { header: 'Andriod目标', key: 'androidTarget' },
                { header: 'Andriod在线', key: 'androidOnline' },
                { header: 'Andriod送达', key: 'androidRevice' },
                { header: 'Andriod点击', key: 'androidClick' },
                { header: 'Andriod自定义点击', key: 'androidCustomizeTarget' },
                { header: 'Andriod点击率', key: 'androidClickRate' },
                { header: 'IOS目标', key: 'iosTarget' },
                { header: 'IOS成功', key: 'iosSucess' },
                { header: 'IOS送达', key: 'iosSended' },
                { header: 'IOS点击', key: 'iosClick' },
                { header: 'IOS自定义点击', key: 'iosCustomizeTarget' },
                { header: 'IOS点击率', key: 'iosClickRate' },
            ];
            console.log('开始请求数据'.green);
            this.getData()
        })
    }
    getData() {
        let that = this
        axios.get('https://api.srv.jpush.cn/v1/push-portal/jpush/app/f32ad42ba4bfeb2a66859819/push/history/data', {
            params: this.params,
            headers: { 'Authorization': this.token }
        }).then(function (response) {
            // handle success
            if (that.params.pageSize == response.data.totalRecords) {
                let data = response.data.data;
                data = data.map(e => {
                    return {
                        'scheduledTime': that.fromDate(e.scheduledTime),
                        'title': e.title,
                        'content': e.content,
                        'receiverType': that.receiverType[e.receiverType],
                        'iosTarget': e.stats.ep,
                        'iosSucess': e.stats.es,
                        'iosSended': 0,
                        'iosClick': e.stats.ec,
                        'iosCustomizeTarget': 0,
                        'iosClickRate': e.stats.es > 0 ? ((e.stats.ec / e.stats.es * 100).toFixed(2) + '%') : 0,
                        'androidTarget': e.stats.at ? e.stats.at : 0,
                        'androidOnline': e.stats.ao ? e.stats.ao : 0,
                        'androidRevice': e.stats.ar ? e.stats.ar : 0,
                        'androidClick': e.stats.ac ? e.stats.ac : 0,
                        'androidCustomizeTarget': 0,
                        'androidClickRate': e.stats.ar ? ((e.stats.ac / e.stats.ar * 100).toFixed(2) + '%') : 0,
                    }
                })
                that.export(data)
            } else {
                that.params.pageSize = response.data.totalRecords;
                that.getData();
            }
        }).catch(function (error) {
            console.log(`${error.message}`.red);
        })
    }
    export(data) {
        console.log(`开始添加数据，长度为${data.length}`.green);
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                this.worksheet.addRow(data[key]).commit();
            }
        }
        console.log('完毕!!'.green);
        this.workbook.commit();
    }
    fromDate(time) {
        var DateTime = new Date(time);
        var year = DateTime.getFullYear()
        var month = DateTime.getMonth() + 1;
        var day = DateTime.getDate();
        var h = DateTime.getHours();
        var m = DateTime.getMinutes();
        var s = DateTime.getSeconds();
        return `${year}-${month}-${day} ${h}：${m}:${s}`;
    }
    /**
     * @description: 自定义导出
     * @param {string} name 文件名
     * @param {array} columns 表头 [{ header: '发送时间', key: 'scheduledTime' }]
     * @param {array|object} data 数据
     */
    static DataTranExcel(name, columns, data) {
        fs.mkdir('./xlsx', () => {
            try {
                let workbook = new Excel.stream.xlsx.WorkbookWriter({
                    filename: './xlsx/' + name + '.xlsx'
                });
                worksheet = workbook.addWorksheet('Sheet');
                worksheet.columns = columns;
                console.log(`开始添加数据，长度为${data.length}`.green);
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        worksheet.addRow(data[key]).commit();
                    }
                }
                console.log('完毕!!'.green);
                workbook.commit();
            } catch (error) {
                console.log(`${error.message}`.red);
            }
        })
    }
}