This is a [Next.js](https://nextjs.org) project.

Considering that its a single feature, I have made use of Shadcn.

Shadcn works well with Nextjs. Nextjs gives out of box support for shadcn and tailwind + theming. Thus, for this project it made sense to have a boilerplate of Next.js + Shadcn + Tailwind. Shadcn latest requires node js v22.0. Later on we will add a small installation step. Right now I have made use of nvmrc file + package.json engine configuration to configure node js for this project.

# Next steps (note keeping purpose, this will be moved to some place else later on):

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
8. [ ] Add conditional support i.e. updating a field updates other field
    1. [X] Make a simple form validator and updater
    2. [ ] Add support for validating nested fields and updatin nested fields.
9. [X] Add JSON editor support
    1. [ ] Support validation for valid json using zod or ajv.
1. [X] Handle performance
     1. [X] Make form fields to load dynamically
     2. [X] Make use of debounce to run conditional validations.
1. [X] Add validation support. Create classes to enable easy sitiching beteen validation libraries.
1. [X] Support layout - Vertcal & Horizontal
1. [X] Support semantic classNames
1. [ ] Add more validation support if using zod.
1. [ ] Take care of typescript types later on
1. [ ] Extendability
     1. [X] Make use of adapter pattern to extend the support for new form items at the form level
     2. [ ] Make use of adapter pattern at the top most level to enable making use of a set of patterns for the entire application
     3. [ ] Enable extending label to support reactNode

### Similarity between Antd form and React hook Form

```
<Form.Item>
<Some Component value={} onChange={} />
</Form.Item>
```

```
<Controller 
render = {({field}) => <SomeComponent value={field.value} onChange={field.conChange}}
/>
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
