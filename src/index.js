// https://github.com/vuelidate/vuelidate/issues/921 - Vuelidate has got a new feature clearing
// external results when the state gets updated indirectly via $model or when the state gets
// updated directly but the autoDirty option is set and it's a great feature but I can't use it.
// It's so because I have an idea of how to validate inputs which requires manual fiddling with
// $touch and $reset and so I can't use $model which calls $touch whenever it  gets set.
//
// This helper makes it possible to automatically clear external results without involving $model.
// For that purpose, it creates an object in which to put server errors and let you pass it to
// the Vuelidate instance. When you populate the object with an error, Vuelidate invalidates
// the corresponding field. When you change its model, the helper clears your error.
//
// To get a better understanding of how Vuelidate handles external results (server errors), read:
// https://vuelidate-next.netlify.app/advanced_usage.html#providing-external-validations-server-side-validation
//
// To use this helper in a component utilizing the Options API, follow this snippet:
//
//   export default {
//     setup: () => ({
//       v$: useVuelidate(), // they both will extract the state from $vm
//       vuelidateExternalResults: useExternalResultsClearingOnStateChange()
//     }),
//     data: () => ({
//       myField: null
//     }),
//     validations: () => ({
//       myField: [required]
//     }),
//     methods: {
//       onSubmit() {
//         this.vuelidateExternalResults = null
//
//         // You can also reset a specific field:
//         //
//         //   this.vuelidateExternalResults.myField = null
//
//         return callApi({ myField }).catch((invalidFields) => {
//           // Ensure that the value you're about to assign has
//           // fields for names and arrays/strings for values:
//           //
//           //   invalidFields = { myField: 'no can do' }
//           //   invalidFields = { myField: ['no can do', 'sorry about that'] }
//
//           this.vuelidateExternalResults = invalidFields
//
//           // You can also assign an error to a specific field:
//           //
//           //   this.vuelidateExternalResults.myField = ['oops']
//         })
//       }
//     }
//   }
//
// To use this helper in a common utilizing the Composition API, read the docs and follow this snippet:
//
//   1. https://v3.vuejs.org/guide/composition-api-introduction.html
//   2. https://github.com/vuejs/composition-api
//
//   export default {
//     setup() {
//       const myField = ref(null)
//
//       const rules = { myField: [required] }
//       const state = { myField }
//       const $externalResults = useExternalResultsClearingOnStateChange(state)
//       const v$ = useVuelidate(rules, state, { $externalResults })
//
//       return { v$, myField, onSubmit }
//
//       function onSubmit() {
//         $externalResults.value = null
//         return callApi({ myField }).catch((invalidFields) => {
//           $externalResults.value = invalidFields
//         })
//       }
//     }
//   }
//
// Important! If you need to show server errors for a field that doesn't have
// any validations, use validationDummy to force Vuelidate into processing your field:
//
//   import useExternalResultsClearingOnStateChange, { validationDummy } from 'external-results-clearing-on-state-change'
//
//   const state = reactive({ myField: null })
//   const rules = { myField: [validationDummy] }
//   const $externalResults = useExternalResultsClearingOnStateChange(state)
//   const v$ = useVuelidate(rules, state, { $externalResults })

import isNil from 'lodash.isnil'
import isObjectLike from 'lodash.isobjectlike'

import { hasDeep, toPathsDeep, toPairsDeep } from './objectHelpers'
import { reactiveSetDeep, toReadonlyRefDeep } from './reactivityHelpers'

import { unref, watch, reactive, customRef, onBeforeMount, getCurrentInstance } from '@vue/composition-api'

export function validationDummy() {
  // To be used when server-side errors are to be shown for a field without any client-side validations
  return true
}

const RESET = true

export default function useExternalResultsClearingOnStateChange(state) {
  // I use the reactive object within the ref to make it possible
  // to clear all errors at once by assining a null value to the ref
  // without losing the ability to partially update the reactive object.
  // So, these are equal considering that the myField is the only field:
  //
  //   this.vuelidateExternalResults = null
  //   this.vuelidateExternalResults.myField = null

  return customRef((track, trigger) => {
    const externalResults = reactive({})

    if (arguments.length !== 0) {
      // the Composition API is being used
      populateExternalResults(state, externalResults, RESET)
      clearExternalResultsOnStateChange(state, externalResults)
    } else {
      onBeforeMount(() => {
        // the Options API is being used
        state = getCurrentInstance().proxy.$data // can't extract leaves from $vm because it's a circular structure
        populateExternalResults(state, externalResults, RESET)
        clearExternalResultsOnStateChange(state, externalResults)
      })
    }

    return {
      get() {
        track()
        return externalResults
      },
      set(source) {
        if (isNil(source)) {
          populateExternalResults(state, externalResults, RESET)
        } else {
          populateExternalResults(source, externalResults)
        }

        trigger()
      }
    }
  })
}

function populateExternalResults(source, externalResults, resets = false) {
  // With this Vuelidate won't lose vuelidateExternalResults when the Options API is used
  // because intead of replacing the ref we updating the reactive object that is stored in it.
  // Vuelidate would lose vuelidateExternalResults because it extract the value from $vm intead of creating a ref
  // https://github.com/vuelidate/vuelidate/blob/64892a5ebcdee1ad8c728766d9e693f605e36477/packages/vuelidate/src/index.js#L153

  if (!isObjectLike(source)) {
    throw new Error('source is expected to be an object!')
  }

  for (const [path, val] of toPairsDeep(source, unref)) {
    if (resets) {
      reactiveSetDeep(externalResults, path, null)
    } else {
      reactiveSetDeep(externalResults, path, val)
    }
  }
}

function clearExternalResultsOnStateChange(state, externalResults) {
  // I can't watch over externalResults and and subscribe on models when
  // it changes because creating watchers inside other watchers isn't allowed.
  //
  // I can't rely on validation rules to filter out leaves because the way Vuelidate
  // collects them from components that utilize the Options API is hard to reproduce.
  //
  // So instead I'm observing all leaves present in the state at the time of creation and hoping for the best.

  if (!isObjectLike(state)) {
    throw new Error('state is expected to be an object!')
  }

  for (const path of toPathsDeep(state, unref)) {
    const modelRef = toReadonlyRefDeep(state, path)
    watch(modelRef, () => {
      if (hasDeep(externalResults, path)) {
        reactiveSetDeep(externalResults, path, null)
      }
    })
  }
}
