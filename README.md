This is a [Next.js](https://nextjs.org) project. 

Considering that its a single feature, I have made use of Shadcn.

Shadcn works well with Nextjs. Nextjs gives out of box support for shadcn and tailwind + theming. Thus, for this project it made sense to have a boilerplate of Next.js + Shadcn + Tailwind. Shadcn latest requires node js v22.0. Later on we will add a small installation step. Right now I have made use of nvmrc file + package.json engine configuration to configure node js for this project.

# Next steps (note keeping purpose, this will be moved to some place else later on):

1. Install shadcn form
2. Install shadcn select, input, checkbox, radio, date.
3. Build a small form which has all the above mentioned components.
4. Add a submit button support. On submit, gather the information of the form and do console.log.
5. Now add the support for ajv based validation. if ajv does not work smoothly with nextjs , move to zod.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
