import isObjectLike from 'lodash.isobjectlike'

export function getDeep(val, path, customizer) {
  if (!Array.isArray(path)) {
    throw new Error('path is expected to be an array')
  }

  if (path.length === 0) {
    return undefined
  }

  for (const key of path) {
    const custom = customizer ? customizer(val) : val
    if (isObjectLike(custom) && custom.hasOwnProperty(key)) {
      val = custom[key]
    } else {
      return undefined
    }
  }

  return customizer ? customizer(val) : val
}

export function hasDeep(val, path, customizer) {
  if (!Array.isArray(path)) {
    throw new Error('path is expected to be an array')
  }

  if (path.length === 0) {
    return false
  }

  for (const key of path) {
    const custom = customizer ? customizer(val) : val
    if (isObjectLike(custom) && custom.hasOwnProperty(key)) {
      val = custom[key]
    } else {
      return false
    }
  }

  return true
}

export function toPathsDeep(input, customizer) {
  return mapDeep(input, customizer, (_val, path) => {
    return path
  })
}

export function toPairsDeep(input, customizer) {
  return mapDeep(input, customizer, (val, path) => {
    return [path, val]
  })
}

function mapDeep(input, customizer, iteratee, parent = []) {
  const custom = customizer ? customizer(input) : input

  if (!isObjectLike(custom)) {
    if (parent.length !== 0) {
      return [iteratee(custom, parent)]
    } else {
      return []
    }
  }

  return flatMap(custom, (val, key) => {
    const path = [...parent, key]
    return mapDeep(val, customizer, iteratee, path)
  })
}

function flatMap(input, iteratee) {
  if (Array.isArray(input)) {
    return input.flatMap(iteratee)
  } else {
    return Object.entries(input).flatMap(([key, val]) => {
      return iteratee(val, key, input)
    })
  }
}
