import { ref, reactive } from 'vue'
import { toReadonlyRefDeep } from '../src/reactivityHelpers'

it('rejects an source of unexpected type', () => {
  expect(() => toReadonlyRefDeep(null, [])).toThrow('source should be an object or an array')
})

it('rejects a path of unexpected type', () => {
  expect(() => toReadonlyRefDeep({}, null)).toThrow('path is expected to be an array')
})

it('works with an empty object', () => {
  const source = {}
  const deepRef = toReadonlyRefDeep(source, ['a'])
  expect(deepRef.value).toBe(undefined)
})

it('works with an empty array', () => {
  const source = []
  const deepRef = toReadonlyRefDeep(source, [0])
  expect(deepRef.value).toBe(undefined)
})

it('works with a shallow object', () => {
  const source = { a: 1 }
  const deepRef = toReadonlyRefDeep(source, ['a'])
  expect(deepRef.value).toBe(1)
})

it('works with a shallow array', () => {
  const source = [1]
  const deepRef = toReadonlyRefDeep(source, [0])
  expect(deepRef.value).toBe(1)
})

it('works with a nested object', () => {
  const source = [{ a: 1 }]
  const deepRef = toReadonlyRefDeep(source, [0, 'a'])
  expect(deepRef.value).toBe(1)
})

it('works with a reactive object', () => {
  const source = reactive({ a: [1] })
  const deepRef = toReadonlyRefDeep(source, ['a', 0])
  expect(deepRef.value).toBe(1)
  source.a = [2]
  expect(deepRef.value).toBe(2)
})

it('works with a ref nested into an object', () => {
  const nested = ref(1)
  const source = [nested]
  const deepRef = toReadonlyRefDeep(source, [0])
  expect(deepRef.value).toBe(1)
  nested.value = 2
  expect(deepRef.value).toBe(2)
})

it('works with an object nested into a ref', () => {
  const source = ref({ a: 1 })
  const deepRef = toReadonlyRefDeep(source, ['a'])
  expect(deepRef.value).toBe(1)
  source.value = { a: 2 }
  expect(deepRef.value).toBe(2)
})
