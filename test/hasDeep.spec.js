import { ref, unref } from 'vue'
import { hasDeep } from '../src/objectHelpers'

it('throws an error when the path is of an unexpected type', () => {
  expect(() => hasDeep([], '1')).toThrow('path is expected to be an array')
  expect(() => hasDeep({}, null)).toThrow('path is expected to be an array')
})

it('always returns false when the path is empty', () => {
  expect(hasDeep(null, [])).toBe(false)
  expect(hasDeep({}, [])).toBe(false)
  expect(hasDeep([], [])).toBe(false)
  expect(hasDeep([1], [])).toBe(false)
})

it('does not mind values different from objects', () => {
  expect(hasDeep('1', [0])).toBe(false)
  expect(hasDeep(null, ['a'])).toBe(false)
})

it('checks a shallow object', () => {
  expect(hasDeep({}, ['a'])).toBe(false)
  expect(hasDeep({ a: 1 }, ['a'])).toBe(true)
})

it('checks a shallow object', () => {
  expect(hasDeep({}, ['a'])).toBe(false)
  expect(hasDeep({ a: 1 }, ['a'])).toBe(true)
})

it('checks a nested object', () => {
  expect(hasDeep({ a: {} }, ['a', 'b'])).toBe(false)
  expect(hasDeep({ a: { b: 1 } }, ['a', 'b'])).toBe(true)
})

it('checks a shallow array', () => {
  expect(hasDeep([], [0])).toBe(false)
  expect(hasDeep([1], [0])).toBe(true)
})

it('checks a nested array', () => {
  expect(hasDeep([[]], [0, 0])).toBe(false)
  expect(hasDeep([[1]], [0, 0])).toBe(true)
})

it('checks an array containing objects', () => {
  expect(hasDeep([{}], [0, 'a'])).toBe(false)
  expect(hasDeep([{ a: 1 }], [0, 'a'])).toBe(true)
})

it('checks an object containing arrays', () => {
  expect(hasDeep({ a: [] }, ['a', 0])).toBe(false)
  expect(hasDeep({ a: [1] }, ['a', 0])).toBe(true)
})

it('applies the given customizer', () => {
  expect(hasDeep(ref([1]), [0], unref)).toBe(true)
  expect(hasDeep([ref(1)], [0], unref)).toBe(true)
  expect(hasDeep({ a: ref(1) }, ['a'], unref)).toBe(true)
  expect(hasDeep({ a: ref([{ b: ref(1) }]) }, ['a', 0, 'b'], unref)).toBe(true)
})
