import last from 'lodash.last'
import isObjectLike from 'lodash.isobjectlike'

import { getDeep } from './objectHelpers'
import { set as reactiveSet, unref, computed, isReactive } from 'vue-demi'

// based on toRef from https://github.com/vuejs/composition-api/blob/v1.1.1/src/reactivity/ref.ts#L131
//
//   const myObj = reactive({ forms: null })
//   const myRef = toReadonlyRefDeep(myObj, ['forms', 0, 'field'])
//   myObj.forms = [{ field: 1 }]
//   console.assert(myRef.value === this.forms[0].field)

export function toReadonlyRefDeep(source, path) {
  if (!isObjectLike(source)) {
    throw new Error('source should be an object or an array!')
  }

  if (!Array.isArray(path)) {
    throw new Error('path is expected to be an array')
  }

  return computed(() => {
    return getDeep(source, path, unref)
  })
}

// a Vue.set that creates missing links just like _.set does
//
//   const myObj = reactive({})
//   reactiveSetDeep(myObj, ['forms', 0, 'field'], 1)
//   console.assert(myObj.forms[0].field === 1)

const INDEX_LIKE_RE = /^\d+$/

export function reactiveSetDeep(source, path, val) {
  if (!isReactive(source)) {
    throw new Error('source should be reactive!')
  }

  if (!Array.isArray(path)) {
    throw new Error('path is expected to be an array')
  }

  let parent = source

  for (let index = 0, lastParentIndex = path.length - 2; index <= lastParentIndex; index++) {
    const currKey = path[index]
    const nextKey = path[index + 1]

    if (!isObjectLike(parent[currKey])) {
      if (INDEX_LIKE_RE.test(nextKey)) {
        reactiveSet(parent, currKey, [])
      } else {
        reactiveSet(parent, currKey, {})
      }
    }

    parent = parent[currKey]

    if (!isReactive(parent)) {
      throw new Error(`a [link=${currKey}] in the [chain=${path}] is not reactive!`)
    }
  }

  const targetKey = last(path)
  reactiveSet(parent, targetKey, val)

  return source
}
