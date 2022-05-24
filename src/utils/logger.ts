function logger (...args: any[]) {
  console.log(...args)
}

logger.json = (obj: any) => {
  logger('\n', JSON.stringify(obj, null, 2), '\n')
}

logger.error = (...args: any[]) => {
  console.error(...args)
}

logger.warn = (...args: any[]) => {
  console.warn(...args)
}

export { logger }
