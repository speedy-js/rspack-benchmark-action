const zip = (...args: any[][]) => {
  return args.reduce((rootArr, arr, outerIdx) => {
    arr.forEach((value, idx) => {
      rootArr[idx] = rootArr[idx] || []
      rootArr[idx][outerIdx] = value
    })
    return rootArr
  }, [])
}

export { zip }
