import { mount } from '@vue/test-utils'

import Vue from 'vue'
import useVuelidate from '@vuelidate/core'
import VueCompositionAPI, { ref, isRef, reactive } from '@vue/composition-api'
import useExternalResultsClearingOnStateChange, { validationDummy } from '../src'

Vue.use(VueCompositionAPI)

function MyFieldComponent() {
  return mount({
    setup() {
      return {
        vuelidateExternalResults: useExternalResultsClearingOnStateChange(),
        v$: useVuelidate()
      }
    },
    data() {
      return {
        myField: null
      }
    },
    validations() {
      return {
        myField: [validationDummy]
      }
    },
    template: '<div>sup</div>'
  })
}

describe('the service itself', () => {
  it('throws a error when the given state is not an object', () => {
    expect(() => useExternalResultsClearingOnStateChange(null)).toThrow('expected to be an object')
  })

  it('returns a reference when given a valid state', () => {
    const state = reactive({ myField: null })
    const externals = useExternalResultsClearingOnStateChange(state)
    expect(isRef(externals)).toBe(true)
  })

  it('does not reset the error by default', async () => {
    const state = reactive({ myField: null })
    const externals = useExternalResultsClearingOnStateChange(state)
    externals.value = { myField: ['oops'] }
    await Vue.nextTick()
    expect(externals.value).toEqual({ myField: ['oops'] })
  })

  it('resets the error when the given state is a reactive object', async () => {
    const state = reactive({ myField: null })
    const externals = useExternalResultsClearingOnStateChange(state)
    externals.value = { myField: ['oops'] }
    state.myField = 1
    await Vue.nextTick()
    expect(externals.value).toEqual({ myField: null })
  })

  it('resets the error when the given state is a nested reactive object', async () => {
    const state = reactive({ myForm: { myField: null } })
    const externals = useExternalResultsClearingOnStateChange(state)
    externals.value = { myForm: { myField: ['oops'] } }
    state.myForm.myField = 1
    await Vue.nextTick()
    expect(externals.value).toEqual({ myForm: { myField: null } })
  })

  it('resets the error when the given state is a ref', async () => {
    const state = ref({ myField: null })
    const externals = useExternalResultsClearingOnStateChange(state)
    externals.value = { myField: ['oops'] }
    state.value = { myField: 1 }
    await Vue.nextTick()
    expect(externals.value).toEqual({ myField: null })
  })

  it('resets the error when the given state is a nested object wrapped in a ref', async () => {
    const state = ref({ myForm: { myField: null } })
    const externals = useExternalResultsClearingOnStateChange(state)
    externals.value = { myForm: { myField: ['oops'] } }
    state.value = { myForm: { myField: 1 } }
    await Vue.nextTick()
    expect(externals.value).toEqual({ myForm: { myField: null } })
  })

  it('resets the error when the given state is a ref nested in a shallow object', async () => {
    const state = { myField: ref(null) }
    const externals = useExternalResultsClearingOnStateChange(state)
    externals.value = { myField: ['oops'] }
    state.myField.value = 1
    await Vue.nextTick()
    expect(externals.value).toEqual({ myField: null })
  })

  it('resets the error when the given state is a ref nested deep in an object', async () => {
    const state = { myForm: { myField: ref(null) } }
    const externals = useExternalResultsClearingOnStateChange(state)
    externals.value = { myForm: { myField: ['oops'] } }
    state.myForm.myField.value = 1
    await Vue.nextTick()
    expect(externals.value).toEqual({ myForm: { myField: null } })
  })
})

describe('the service integrating with Vuelidate', () => {
  it('does not make the form invalid unless a server error is set', async () => {
    const myField = ref(null)
    const state = { myField }
    const rules = { myField: [validationDummy] }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    expect(v$.value.$invalid).toBe(false)
  })

  it('makes the form invalid when a server error is set', async () => {
    const myField = ref(null)
    const state = { myField }
    const rules = { myField: [validationDummy] }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    $externalResults.value = { myField: ['oops'] }
    expect(v$.value.$invalid).toBe(true)
  })

  it('restores the validity state when the server error gets unset', async () => {
    const myField = ref(null)
    const state = { myField }
    const rules = { myField: [validationDummy] }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    $externalResults.value = { myField: ['oops'] }
    $externalResults.value = null
    expect(v$.value.$invalid).toBe(false)
  })

  it('restores the validity state when the model changes', async () => {
    const myField = ref(null)
    const state = { myField }
    const rules = { myField: [validationDummy] }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    $externalResults.value = { myField: ['oops'] }
    myField.value = 123
    await Vue.nextTick()
    expect(v$.value.$invalid).toBe(false)
  })

  it('does not flip the error flag unless the form is touched', async () => {
    const myField = ref(null)
    const state = { myField }
    const rules = { myField: [validationDummy] }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    $externalResults.value = { myField: ['oops'] }
    expect(v$.value.$error).toBe(false)
    expect(v$.value.$errors).toEqual([])
  })

  it('flips the error flag when the form gets touched', async () => {
    const myField = ref(null)
    const state = { myField }
    const rules = { myField: [validationDummy] }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    $externalResults.value = { myField: ['oops'] }
    v$.value.$touch()
    expect(v$.value.$error).toBe(true)
    expect(v$.value.$errors).toMatchObject([{ $message: 'oops' }])
  })

  it('kees working when the error is a string and not an array of strings', async () => {
    const myField = ref(null)
    const state = { myField }
    const rules = { myField: [validationDummy] }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    $externalResults.value = { myField: 'oops' }
    expect(v$.value.$invalid).toBe(true)
    v$.value.$touch()
    expect(v$.value.$error).toBe(true)
    expect(v$.value.$errors).toMatchObject([{ $message: 'oops' }])
  })
})

describe('the service working with a component utilizing the Options API', () => {
  it('does not make the form invalid by default', async () => {
    const wrapper = MyFieldComponent()
    expect(wrapper.vm.v$.$invalid).toBe(false)
  })

  it('makes the form invalid when the ref gets set', async () => {
    const wrapper = MyFieldComponent()
    wrapper.vm.vuelidateExternalResults = { myField: ['oops'] }
    expect(wrapper.vm.v$.$invalid).toBe(true)
  })

  it('restores the validity state when the ref gets unset', async () => {
    const wrapper = MyFieldComponent()
    wrapper.vm.vuelidateExternalResults = { myField: ['oops'] }
    wrapper.vm.vuelidateExternalResults = null
    expect(wrapper.vm.v$.$invalid).toBe(false)
  })

  it('makes the form invalid when an error gets assigned to the reactive object', async () => {
    const wrapper = MyFieldComponent()
    wrapper.vm.vuelidateExternalResults = { myField: ['oops'] }
    expect(wrapper.vm.v$.$invalid).toBe(true)
  })

  it('restores the validity state when the error gets deleted from the reactive object', async () => {
    const wrapper = MyFieldComponent()
    wrapper.vm.vuelidateExternalResults.myField = ['oops']
    wrapper.vm.vuelidateExternalResults.myField = null
    expect(wrapper.vm.v$.$invalid).toBe(false)
  })

  it('restores the validity state when the model gets changed after the ref has been set', async () => {
    const wrapper = MyFieldComponent()
    wrapper.vm.vuelidateExternalResults = { myField: ['oops'] }
    wrapper.vm.myField = 123
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.v$.$invalid).toBe(false)
  })

  it('restores the validity state when the model gets changed after the reactive object has been updated', async () => {
    const wrapper = MyFieldComponent()
    wrapper.vm.vuelidateExternalResults.myField = ['oops']
    wrapper.vm.myField = 123
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.v$.$invalid).toBe(false)
  })
})
