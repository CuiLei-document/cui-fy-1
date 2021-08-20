#!/usr/bin/env node
import * as commander from 'commander'
import { translate } from './main'
const program = new commander.Command()

program
    .version('0.0.2') // 版本信息
    .name('fy') // 名称 翻译
    .usage('<English>') // 传递参数
    .arguments('<English>')
    .action((english) => {
        translate(english)
    })

program.parse(process.argv) // 对上面的代码进行解析