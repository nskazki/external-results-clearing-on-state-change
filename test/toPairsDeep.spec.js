import Vue from 'vue'
import VueCompositionAPI, { ref, unref } from '@vue/composition-api'
import { toPairsDeep } from '../src/objectHelpers'

Vue.use(VueCompositionAPI)

it('does not mind values different from objects', () => {
  expect(toPairsDeep()).toEqual([])
  expect(toPairsDeep(0)).toEqual([])
  expect(toPairsDeep('')).toEqual([])
  expect(toPairsDeep(null)).toEqual([])
})

it('finds pairs in a shallow object', () => {
  expect(toPairsDeep({})).toEqual([])
  expect(toPairsDeep({ a: 1, b: 2 })).toEqual([[['a'], 1], [['b'], 2]])
})

it('finds pairs in a nested object', () => {
  expect(toPairsDeep({ a: {} })).toEqual([])
  expect(toPairsDeep({ a: { b: 1 }, c: 2 })).toEqual([[['a', 'b'], 1], [['c'], 2]])
})

it('finds pairs in a shallow array', () => {
  expect(toPairsDeep([])).toEqual([])
  expect(toPairsDeep([1, 2])).toEqual([[[0], 1], [[1], 2]])
})

it('finds pairs in a nested array', () => {
  expect(toPairsDeep([[]])).toEqual([])
  expect(toPairsDeep([[1], 2])).toEqual([[[0, 0], 1], [[1], 2]])
})

it('finds pairs in an array containing objects', () => {
  expect(toPairsDeep([{}])).toEqual([])
  expect(toPairsDeep([{ a: 1 }])).toEqual([[[0, 'a'], 1]])
})

it('finds pairs in an object containing arrays', () => {
  expect(toPairsDeep({ a: [] })).toEqual([])
  expect(toPairsDeep({ a: [1] })).toEqual([[['a', 0], 1]])
})

it('applies the given customizer', () => {
  expect(toPairsDeep(ref([1]), unref)).toEqual([[[0], 1]])
  expect(toPairsDeep([ref(1)], unref)).toEqual([[[0], 1]])
  expect(toPairsDeep({ a: ref(1) }, unref)).toEqual([[['a'], 1]])
  expect(toPairsDeep({ a: ref([{ b: ref(1) }]) }, unref)).toEqual([[['a', 0, 'b'], 1]])
})
