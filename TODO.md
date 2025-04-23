- Implementing Tag for Underline and EnhancedImg
- Tag cannot pass Attributes as props to children (at least I can't figure this out rn)
- Working on Error Handling so Markdoc validation errors are propertly handled by Svelte
-- Judging by svelte-preprocess project, we can just use console.warn or console.error. We can both log it to console, and also throw an error to stop the build process. I think my conclustion here is that preprocessor actually is unable to throw a Rollup Error anyway.
-- And for now there is no hotreloading on the imported schemas anyway - for anotehr day.



- It doesn't look like Attributes can be used on Nodes that may be nested inside paragraph. E.g. links or images. So I don't think we can use Attributes to customise these Nodes. However, we can use Tags.
- Next step: implement decorated-link and enhanced-img tags for Link and Image. It's still readable afterall.
