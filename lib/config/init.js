import setLog from "./log.js"
import cfg from "./config.js"
import redisInit from "./redis.js"

if (!Promise.withResolvers) {
  const { deprecate } = await import("node:util")
  Promise.withResolvers = deprecate(() => {
    const r = {}
    r.promise = new Promise((resolve, reject) => {
      r.resolve = resolve
      r.reject = reject
    })
    return r
  }, "请更新 Node.js")
}

/** 设置标题 */
process.title = `TRSS Yunzai v${cfg.package.version} © 2023 - 2025 TimeRainStarSky`

/** 设置时区 */
process.env.TZ = "Asia/Shanghai"

for (const i of ["SIGHUP", "SIGTERM"]) process.on(i, (signal, code) => process.exit(code))

/** 日志设置 */
setLog()

/** 捕获未处理的错误 */
for (const i of ["uncaughtException", "unhandledRejection"])
  process.on(i, e => {
    try {
      Bot.makeLog("error", e, i)
    } catch (err) {
      console.error(i, e, err)
      process.exit()
    }
  })

logger.mark("----^_^----")
logger.mark(logger.yellow(`TRSS-Yunzai v${cfg.package.version} 启动中...`))
logger.mark(logger.cyan("https://github.com/TimeRainStarSky/Yunzai"))

let stack
export default async function init() {
  if (stack !== undefined) return
  stack = ""

  const redis = await redisInit()
  const exit = process.exit
  process.exit = code => {
    stack = Error().stack
    return exit(code)
  }

  /** 退出事件 */
  process.on("exit", code => {
    Bot.makeLog(
      "mark",
      logger.magenta(`TRSS-Yunzai 已停止运行，本次运行时长：${Bot.getTimeDiff()} (${code})`),
      "exit",
    )
    Bot.makeLog("trace", stack || Error().stack, "exit")
  })
}
