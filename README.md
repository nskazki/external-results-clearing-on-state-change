# external-results-clearing-on-state-change

An alternative way to clear Vuelidate's `$externalResults` on state change, the way that doesn't involve `$model`.
The package isn't published. https://github.com/vueuse/vue-demi is to be used for Vue@3 support. The Composition API for Vue@2 is powered by https://github.com/vuejs/composition-api.

```
npm --save git+https://github.com/nskazki/external-results-clearing-on-state-change#v0.0.1
```

## Key Difference

This is an alternative to Vuelidate's built-in feature, the built-in feature
that clears external results as the state gets updated via `$model`, such as this:

```js
const state = reactive({ myField: null })
const rules = { myField: [required] }
const $externalResults = reactive({})
const v$ = useVuelidate(rules, state, { $externalResults })

$externalResults.myField = 'Server is down'
console.assert($externalResults.myField === 'Server is down')

v$.value.myField.$model = 'new' // <- the key difference
console.assert($externalResults.myField === null)
```

For cases when the usage of `$model` is inappropriate, this helper creates an `$externalResults` object
that itself observes the given state and resets its own leaves as the corresponding models change in the state:

```js
const state = reactive({ myField: null })
const $externalResults = useExternalResultsClearingOnStateChange(state)

$externalResults.myField = 'Server is down'
console.assert($externalResults.myField === 'Server is down')

state.myField = 'new' // <- the key difference
await nextTick()
console.assert($externalResults.myField === null)
```

## How to use with Options API

```js
import useExternalResultsClearingOnStateChange from 'external-results-clearing-on-state-change'

export default {
  setup: () => ({
    v$: useVuelidate(), // they both will extract the state from $vm
    vuelidateExternalResults: useExternalResultsClearingOnStateChange()
  }),
  data: () => ({
    myField: null
  }),
  validations: () => ({
    myField: [required]
  }),
  methods: {
    onSubmit() {
      this.vuelidateExternalResults = null

      // You can also reset a specific field:
      //
      //   this.vuelidateExternalResults.myField = null

      return callApi({ myField }).catch((invalidFields) => {
        // Ensure that the value which you're about to assign
        // has fields for keys and arrays/strings for values:
        //
        //   invalidFields = { myField: 'no can do' }
        //   invalidFields = { myField: ['no can do', 'sorry about that'] }

        this.vuelidateExternalResults = invalidFields

        // You can also assign an error to a specific field:
        //
        //   this.vuelidateExternalResults.myField = ['oops']
      })
    }
  }
}
```

## How to use with Composition API

```js
import useExternalResultsClearingOnStateChange from 'external-results-clearing-on-state-change'

export default {
  setup() {
    const myField = ref(null)
    const rules = { myField: [required] }
    const state = { myField }
    const $externalResults = useExternalResultsClearingOnStateChange(state)
    const v$ = useVuelidate(rules, state, { $externalResults })

    return { v$, myField, onSubmit }

    function onSubmit() {
      $externalResults.value = null
      return callApi({ myField }).catch((invalidFields) => {
        $externalResults.value = invalidFields
      })
    }
  }
}
```

## Important Note

If you need to show server errors for a field that doesn't have any validations,
use `validationDummy` to force Vuelidate into processing your field.

```js
import useExternalResultsClearingOnStateChange, { validationDummy } from 'external-results-clearing-on-state-change'

const state = reactive({ myField: null })
const rules = { myField: [validationDummy] }
const $externalResults = useExternalResultsClearingOnStateChange(state)
const v$ = useVuelidate(rules, state, { $externalResults })
```

## Backstory

https://vuelidate-next.netlify.app/advanced_usage.html#clearing-externalresults - Vuelidate has great support for server errors,
you can set them per field, you can clear them manually and you can even expect Vuelidate to clear them automatically whenever you
update your fields via Vuelidate's `v$.myField.$model` setter. The only problem is that `v$.myField.$model = 'new'` would also mark
the field dirty which wasn't working for me because I tried to achieve the "Reward early, punish late" kind of UX
(https://medium.com/wdstack/inline-validation-in-forms-designing-the-experience-123fb34088ce) for a low price, doing this:

```vue
<input
  v-model="myField"
  @input="v$.myField.$reset()"
  @blur="myField && v$.myField.$touch()"
>
```

I created an issue requesting an option making Vuelidate observe the store itself instead of waiting for the `$model` to get set
(https://github.com/vuelidate/vuelidate/issues/921) but the author pointed out that he considers adding true support for the desired
UX pattern (https://github.com/vuelidate/vuelidate/issues/897), so I figured why not publishing a solution for my problem while the decision's being made.

Also, here's the demo showcasing the poor man's "Reward early, punish late" under the Hybrid heading:

https://user-images.githubusercontent.com/6743076/129810797-75e8d15f-0624-4075-801f-2c7b432b905c.mp4
