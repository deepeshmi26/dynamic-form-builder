# Development Journal:

1. [X] Install shadcn form
2. [X] Install shadcn select, input, checkbox, radio, date.
3. [X] Build a small form which has all the above mentioned components.
4. [X] Add a submit button support. On submit, gather the information of the form and do console.log.
5. [X] Convert the form to a json mapping based generator
6. [X] Create a **FormWrapperComponent** that wraps each **Child form item**. The wrapper component will have reused props/structures.
    1. [X] A component should accept: value, onChange so that we can build any component with this strcture.
7. [X] Create a **FormRegistryContext**
    1. [X] The context should wrap the entire form, but it should be inside React hook form to enable access to React hook form apis.
    2. [X] In the FormWrapperComponent, have a state call. Expose the setState call of each FormWrapper component to registry.
8. [X] Add conditional support i.e. updating a field updates other field
    1. [X] Make a simple form validator and updater
    2. [X] Add support for validating nested fields and updatin nested fields.
9. [X] Add JSON editor support
1. [X] Handle performance
     1. [X] Make form fields to load dynamically
     2. [X] Make use of debounce to run conditional validations.
1. [X] Add validation support. Create classes to enable easy sitiching beteen validation libraries.
1. [X] Support layout - Vertcal & Horizontal
1. [X] Support semantic classNames
1. [X] Take care of typescript types
1. [X] Extendability
     1. [X] Make use of adapter pattern to extend the support for new form items at the form level
     2. [X] Enable extending label to support reactNode
     3. [X] Make use of semantic styling
