const chainPromises = async <T>(p: (() => Promise<T>)[]): Promise<T> => {
  if (!p.length) {
    throw new Error('No promises to chain')
  }

  return p.slice(1).reduce(async (prev, curr) => {
    await prev
    return curr()
  }, p[0]())
}

const chainPromise = chainPromises

export {
  chainPromise,
  chainPromises
}
