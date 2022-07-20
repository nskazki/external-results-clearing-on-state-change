import { ref, unref } from 'vue-demi'
import { getDeep } from '../src/objectHelpers'

it('throws an error when the path is of an unexpected type', () => {
  expect(() => getDeep([], '1')).toThrow('path is expected to be an array')
  expect(() => getDeep({}, null)).toThrow('path is expected to be an array')
})

it('always returns undefined when the path is empty', () => {
  expect(getDeep(null, [])).toBe(undefined)
  expect(getDeep({}, [])).toBe(undefined)
  expect(getDeep([], [])).toBe(undefined)
  expect(getDeep([1], [])).toBe(undefined)
})

it('does not mind values different from objects', () => {
  expect(getDeep('1', [0])).toBe(undefined)
  expect(getDeep(null, ['a'])).toBe(undefined)
})

it('extracts a value from a shallow object', () => {
  expect(getDeep({}, ['a'])).toBe(undefined)
  expect(getDeep({ a: 1 }, ['a'])).toBe(1)
})

it('extracts a value from a shallow object', () => {
  expect(getDeep({}, ['a'])).toBe(undefined)
  expect(getDeep({ a: 1 }, ['a'])).toBe(1)
})

it('extracts a value from a nested object', () => {
  expect(getDeep({ a: {} }, ['a', 'b'])).toBe(undefined)
  expect(getDeep({ a: { b: 1 } }, ['a', 'b'])).toBe(1)
})

it('extracts a value from a shallow array', () => {
  expect(getDeep([], [0])).toBe(undefined)
  expect(getDeep([1], [0])).toBe(1)
})

it('extracts a value from a nested array', () => {
  expect(getDeep([[]], [0, 0])).toBe(undefined)
  expect(getDeep([[1]], [0, 0])).toBe(1)
})

it('extracts a value from an array containing objects', () => {
  expect(getDeep([{}], [0, 'a'])).toBe(undefined)
  expect(getDeep([{ a: 1 }], [0, 'a'])).toBe(1)
})

it('extracts a value from an object containing arrays', () => {
  expect(getDeep({ a: [] }, ['a', 0])).toBe(undefined)
  expect(getDeep({ a: [1] }, ['a', 0])).toBe(1)
})

it('applies the given customizer', () => {
  expect(getDeep(ref([1]), [0], unref)).toBe(1)
  expect(getDeep([ref(1)], [0], unref)).toBe(1)
  expect(getDeep({ a: ref(1) }, ['a'], unref)).toBe(1)
  expect(getDeep({ a: ref([{ b: ref(1) }]) }, ['a', 0, 'b'], unref)).toBe(1)
})
