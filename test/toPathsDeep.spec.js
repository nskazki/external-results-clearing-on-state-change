import Vue from 'vue'
import VueCompositionAPI, { ref, unref } from '@vue/composition-api'
import { toPathsDeep } from '../src/objectHelpers'

Vue.use(VueCompositionAPI)

it('does not mind values different from objects', () => {
  expect(toPathsDeep()).toEqual([])
  expect(toPathsDeep(0)).toEqual([])
  expect(toPathsDeep('')).toEqual([])
  expect(toPathsDeep(null)).toEqual([])
})

it('finds leaves in a shallow object', () => {
  expect(toPathsDeep({})).toEqual([])
  expect(toPathsDeep({ a: 1, b: 2 })).toEqual([['a'], ['b']])
})

it('finds leaves in a nested object', () => {
  expect(toPathsDeep({ a: {} })).toEqual([])
  expect(toPathsDeep({ a: { b: 1 }, c: 2 })).toEqual([['a', 'b'], ['c']])
})

it('finds leaves in a shallow array', () => {
  expect(toPathsDeep([])).toEqual([])
  expect(toPathsDeep([1, 2])).toEqual([[0], [1]])
})

it('finds leaves in a nested array', () => {
  expect(toPathsDeep([[]])).toEqual([])
  expect(toPathsDeep([[1], 2])).toEqual([[0, 0], [1]])
})

it('finds leaves in an array containing objects', () => {
  expect(toPathsDeep([{}])).toEqual([])
  expect(toPathsDeep([{ a: 1 }])).toEqual([[0, 'a']])
})

it('finds leaves in an object containing arrays', () => {
  expect(toPathsDeep({ a: [] })).toEqual([])
  expect(toPathsDeep({ a: [1] })).toEqual([['a', 0]])
})

it('applies the given customizer', () => {
  expect(toPathsDeep(ref([1]), unref)).toEqual([[0]])
  expect(toPathsDeep([ref(1)], unref)).toEqual([[0]])
  expect(toPathsDeep({ a: ref(1) }, unref)).toEqual([['a']])
  expect(toPathsDeep({ a: ref([{ b: ref(1) }]) }, unref)).toEqual([['a', 0, 'b']])
})
