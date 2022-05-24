import prettyBytes from 'pretty-bytes'
import prettyMs from 'pretty-ms'

const formatMetric = (value: any, format?: 'bytes' | 'ms') => {
  if (format) {
    return format === 'bytes' ? prettyBytes(value) : prettyMs(value)
  }

  return String(value)
}

export { formatMetric }
