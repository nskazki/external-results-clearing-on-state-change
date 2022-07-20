import { ref, watch, nextTick, reactive } from 'vue-demi'
import { reactiveSetDeep } from '../src/reactivityHelpers'

it('rejects an source of unexpected type', () => {
  expect(() => reactiveSetDeep(null, [], null)).toThrow('source should be reactive')
  expect(() => reactiveSetDeep({}, [], null)).toThrow('source should be reactive')
  expect(() => reactiveSetDeep(ref({}), [], null)).toThrow('source should be reactive')
})

it('rejects a path of unexpected type', () => {
  expect(() => reactiveSetDeep(reactive({}), null, null)).toThrow('path is expected to be an array')
})

it('adds a field to an object', () => {
  const source = reactive({})
  reactiveSetDeep(source, ['a'], 1)
  expect(source.a).toBe(1)
})

it('adds an element to an array', () => {
  const source = reactive([])
  reactiveSetDeep(source, [0], 1)
  expect(source[0]).toBe(1)
})

it('updates a field in an object', () => {
  const source = reactive({ a: 1 })
  reactiveSetDeep(source, ['a'], 2)
  expect(source.a).toBe(2)
})

it('updates an element in an array', () => {
  const source = reactive([1])
  reactiveSetDeep(source, [0], 2)
  expect(source[0]).toBe(2)
})

it('fills in a missing object in another object', () => {
  const source = reactive({})
  reactiveSetDeep(source, ['a', 'b'], 1)
  expect(source.a.b).toBe(1)
})

it('fills in a missing array in an object', () => {
  const source = reactive({})
  reactiveSetDeep(source, ['a', 0], 1)
  expect(source.a[0]).toBe(1)
})

it('fills in a missing object in an array', () => {
  const source = reactive([])
  reactiveSetDeep(source, [0, 'a'], 1)
  expect(source[0].a).toBe(1)
})

it('fills in a missing array in another array', () => {
  const source = reactive([])
  reactiveSetDeep(source, [0, 0], 1)
  expect(source[0][0]).toBe(1)
})

it('makes added fields reactive', async () => {
  const source = reactive({})
  const callback = jest.fn()
  reactiveSetDeep(source, ['a'], 1)

  watch(() => source.a, callback)
  source.a = 2
  await nextTick()
  expect(callback).toHaveBeenCalled()
})
